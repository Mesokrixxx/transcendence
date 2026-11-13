import type { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import multer from 'multer';
import sharp from 'sharp';
import prisma from '../db/prisma.js';

export const avatarDirectory = '/app/uploads/avatars';

const avatarPrefix = '/api/avatars/';

const readAvatar = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
    files: 1,
    fields: 0,
  },
}).single('avatar');

export function receiveAvatar(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  readAvatar(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    const tooLarge =
      error instanceof multer.MulterError &&
      error.code === 'LIMIT_FILE_SIZE';

    res.status(tooLarge ? 413 : 400).json({
      error: tooLarge ? 'avatarTooLarge' : 'invalidAvatarUpload',
    });
  });
}

export async function uploadAvatar(req: Request, res: Response) {
  const userId = req.user?.id;

  if (userId === undefined) {
    return res.status(401).json({ error: 'authenticationRequired' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'avatarRequired' });
  }

  let image: Buffer;

  try {
    const source = sharp(req.file.buffer, {
      limitInputPixels: 25_000_000,
    });
    const metadata = await source.metadata();

    if (
      !['jpeg', 'png', 'webp'].includes(metadata.format ?? '') ||
      (metadata.pages ?? 1) > 1
    ) {
      return res.status(400).json({ error: 'invalidAvatarFormat' });
    }

    image = await source
      .rotate()
      .resize(256, 256, { fit: 'cover' })
      .webp({ quality: 85 })
      .toBuffer();
  } catch {
    return res.status(400).json({ error: 'invalidAvatarImage' });
  }

  const filename = `${randomUUID()}.webp`;
  const filepath = join(avatarDirectory, filename);
  const avatar = `${avatarPrefix}${filename}`;
  let previousAvatar: string | null = null;
  let fileWritten = false;

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { avatar: true },
    });

    previousAvatar = profile?.avatar ?? null;

    await mkdir(avatarDirectory, { recursive: true });
    await writeFile(filepath, image, { flag: 'wx' });
    fileWritten = true;

    await prisma.profile.upsert({
      where: { userId },
      create: { userId, avatar },
      update: { avatar },
    });
  } catch (error) {
    if (fileWritten) {
      await unlink(filepath).catch(() => undefined);
    }

    console.error('Avatar upload failed:', error);
    return res.status(500).json({ error: 'avatarUploadFailed' });
  }

  if (previousAvatar?.startsWith(avatarPrefix)) {
    const previousFilename = previousAvatar.slice(avatarPrefix.length);

    if (/^[0-9a-f-]{36}\.webp$/.test(previousFilename)) {
      await unlink(join(avatarDirectory, previousFilename)).catch(
        () => undefined,
      );
    }
  }

  return res.status(200).json({ avatar });
}
export async function removeAvatar(req: Request, res: Response) {
  const userId = req.user?.id;

  if (userId === undefined) {
    return res.status(401).json({ error: 'authenticationRequired' });
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { avatar: true },
    });

    const previousAvatar = profile?.avatar;

    if (!previousAvatar) {
      return res.status(204).send();
    }

    const { count } = await prisma.profile.updateMany({
      where: { userId, avatar: previousAvatar },
      data: { avatar: null },
    });

    if (count === 0) {
      return res.status(409).json({ error: 'avatarChanged' });
    }

    if (previousAvatar.startsWith(avatarPrefix)) {
      const filename = previousAvatar.slice(avatarPrefix.length);

      if (/^[0-9a-f-]{36}\.webp$/.test(filename)) {
        await unlink(join(avatarDirectory, filename)).catch((error) => {
          console.warn('Unable to remove previous avatar file:', error);
        });
      }
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Avatar removal failed:', error);
    return res.status(500).json({ error: 'avatarRemovalFailed' });
  }
}
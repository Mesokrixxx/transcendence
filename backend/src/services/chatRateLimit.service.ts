const MAX_MESSAGES = 5;
const WINDOW_MS = 10_000;

const messageTimestamps = new Map<number, number[]>();

export function checkMessageRateLimit(userId: number, now = Date.now()) {
	const timestamps = (messageTimestamps.get(userId) ?? [])
		.filter((timestamp) => now - timestamp < WINDOW_MS);

	if (timestamps.length >= MAX_MESSAGES) {
		const oldestTimestamp = timestamps.at(0);
		if (oldestTimestamp === undefined)
			throw new Error('rate limit window is inconsistent');

		const retryAfterSeconds = Math.ceil((oldestTimestamp + WINDOW_MS - now) / 1000);
		messageTimestamps.set(userId, timestamps);
		return { allowed: false, retryAfterSeconds };
	}

	timestamps.push(now);
	messageTimestamps.set(userId, timestamps);
	return { allowed: true, retryAfterSeconds: 0 };
}

export type AuthUser = {
  id: number;
  username: string;
  email: string;
  avatar?: string | null;
  firstName?: string | null;
  lastName?: string | null;
};

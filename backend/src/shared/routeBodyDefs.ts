
export type CreateGameBody = {
	whiteId: number;
	blackId: number;
};

export type CreateUserBody = {
	name: string;
	email: string;
	password: string;
};

export type AuthUserBody = {
	email: string;
	password: string;
};

export type UpdateUserBody = {
	username?: string;
	password?: string;
	currentPassword?: string;
};

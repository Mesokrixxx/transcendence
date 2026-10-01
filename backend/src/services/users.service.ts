type User = {
	id: number,
	name: string;
	createdAt: Date;
};

export function get(id: number): User | undefined {
	return undefined; // TODO
}

export function create(name: string) {
	const user = {
		id: 0,
		name: name,
		createAt: new Date()
	};

	// TODO insert in database and get id
	return user;
}

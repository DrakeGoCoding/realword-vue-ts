export interface User {
	bio: string;
	email: string;
	image: string;
	token: string;
	username: string;
}

export interface NewUser {
	username: string;
	email: string;
	password: string;
}

export type UpdateUser = Partial<NewUser> & { bio?: string; image?: string };

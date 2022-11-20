import type { Profile } from './Profile';

export interface Comment {
	id: number;
	createdAt: string;
	updatedAt: string;
	body: string;
	author: Profile;
}

export interface NewComment {
	body: string;
}

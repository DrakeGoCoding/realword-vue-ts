import type { Profile } from './Profile';

export interface Article {
	slug: string;
	title: string;
	description: string;
	body: string;
	tagList: string[];
	/**
	 * @format date-time
	 */
	createdAt: string;
	/**
	 * @format date-time
	 */
	updatedAt: string;
	favorited: boolean;
	favoritesCount: number;
	author: Profile;
}

export type NewArticle = Pick<
	Article,
	'title' | 'description' | 'body' | 'tagList'
>;

export type UpdateArticle = Partial<
	Pick<Article, 'title' | 'description' | 'body'>
>;

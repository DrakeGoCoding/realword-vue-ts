import {
	createRouter,
	createWebHistory,
	type RouteParams,
	type RouteRecordRaw
} from 'vue-router';

import Home from '@/pages/Home.vue';
import { isAuthorized } from '@/stores/user';

export const routes: RouteRecordRaw[] = [
	{
		name: 'global-feed' as const,
		path: '/',
		component: Home
	},
	{
		name: 'my-feed',
		path: '/my-feeds',
		component: Home
	},
	{
		name: 'tag',
		path: '/tag/:tag',
		component: Home
	},
	{
		name: 'login',
		path: '/login',
		component: () => import('@/pages/Login.vue'),
		beforeEnter: () => !isAuthorized()
	},
	{
		name: 'register',
		path: '/register',
		component: () => import('@/pages/Register.vue'),
		beforeEnter: () => !isAuthorized()
	},
	{
		name: 'article',
		path: '/article/:slug',
		component: () => import('@/pages/Article.vue')
	},
	{
		name: 'edit-article',
		path: '/article/:slug/edit',
		component: () => import('@/pages/EditArticle.vue')
	},
	{
		name: 'create-article',
		path: '/article/create',
		component: () => import('@/pages/EditArticle.vue')
	},
	{
		name: 'profile',
		path: '/profile/:username',
		component: () => import('@/pages/Profile.vue')
	},
	{
		name: 'profile-favorites',
		path: '/profile/:username/favorites',
		component: () => import('@/pages/Profile.vue')
	},
	{
		name: 'settings',
		path: '/settings',
		component: () => import('@/pages/Settings.vue')
	}
];

export type AppRouteNames =
	| 'global-feed'
	| 'my-feed'
	| 'tag'
	| 'article'
	| 'create-article'
	| 'edit-article'
	| 'login'
	| 'register'
	| 'profile'
	| 'profile-favorites'
	| 'settings';

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes
});

export const routerPush = (
	name: AppRouteNames,
	params?: RouteParams
): ReturnType<typeof router.push> => {
	if (params !== undefined) {
		return router.push({
			name,
			params
		});
	}
	return router.push({ name });
};

export default router;

<template>
	<div class="articles-toggle">
		<ul class="nav nav-pills outline-active">
			<li v-for="link in links" :key="link.name" class="nav-item">
				<AppLink
					class="nav-link"
					active-class="active"
					:name="link.routeName"
					:params="link.routeParams"
				>
					<i v-if="link.icon" :class="link.icon" /> {{ link.title }}
				</AppLink>
			</li>
		</ul>
	</div>
</template>

<script setup lang="ts">
import type { ArticlesType } from '@/composable/useArticles';
import type { AppRouteNames } from '@/router';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import type { RouteParams } from 'vue-router';
import AppLink from './AppLink.vue';

interface ArticleListNavLink {
	name: ArticlesType;
	routeName: AppRouteNames;
	routeParams?: Partial<RouteParams>;
	title: string;
	icon?: string;
}

interface Props {
	useGlobalFeed?: boolean;
	useMyFeed?: boolean;
	useTagFeed?: boolean;
	useUserFeed?: boolean;
	useUserFavorited?: boolean;
	tag: string;
	username: string;
}

const props = withDefaults(defineProps<Props>(), {
	useGlobalFeed: false,
	useMyFeed: false,
	useTagFeed: false,
	useUserFeed: false,
	useUserFavorited: false
});

const allLinks = computed<ArticleListNavLink[]>(() => [
	{
		name: 'global-feed',
		routeName: 'global-feed',
		title: 'Global Feed'
	},
	{
		name: 'my-feed',
		routeName: 'my-feed',
		title: 'Your Feed'
	},
	{
		name: 'tag-feed',
		routeName: 'tag',
		routeParams: { tag: props.tag },
		title: props.tag,
		icon: 'ion-pound'
	},
	{
		name: 'user-feed',
		routeName: 'profile',
		routeParams: { username: props.username },
		title: 'My articles'
	},
	{
		name: 'user-favorites-feed',
		routeName: 'profile-favorites',
		routeParams: { username: props.username },
		title: 'Favorited Articles'
	}
]);

const { isAuthorized } = storeToRefs(useUserStore());

const show = computed<Record<ArticlesType, boolean>>(() => ({
	'global-feed': props.useGlobalFeed,
	'my-feed': props.useMyFeed && isAuthorized.value,
	'tag-feed': props.useTagFeed && props.tag !== '',
	'user-feed': props.useUserFeed && props.username !== '',
	'user-favorites-feed': props.useUserFavorited && props.username !== ''
}));

const links = computed<ArticleListNavLink[]>(() =>
	allLinks.value.filter((link) => show.value[link.name])
);
</script>

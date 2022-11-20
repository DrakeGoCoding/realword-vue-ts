import type { Article } from '@/models/Article';
import type { AppRouteNames } from '@/router';
import { api, pageToOffset } from '@/services';
import type { MultipleArticlesResponse } from '@/services/api';
import { computed, ref, watch, type ComputedRef } from 'vue';
import { useRoute } from 'vue-router';
import useAsync from './useAsync';

const useArticles = () => {
	const { articlesType, tag, username, metaChanged } = useArticlesMeta();

	const articles = ref<Article[]>([]);
	const articlesCount = ref(0);
	const page = ref(1);

	const fetchArticles = async () => {
		articles.value = [];
		let promise: Promise<MultipleArticlesResponse> | null = null;

		if (articlesType.value === 'my-feed') {
			promise = api.articles
				.getArticlesFeed(pageToOffset(page.value))
				.then((res) => res.data);
		} else if (articlesType.value === 'tag-feed' && tag.value) {
			promise = api.articles
				.getArticles({
					tag: tag.value,
					...pageToOffset(page.value)
				})
				.then((res) => res.data);
		} else if (articlesType.value === 'user-feed' && username.value) {
			promise = api.articles
				.getArticles({
					author: username.value,
					...pageToOffset(page.value)
				})
				.then((res) => res.data);
		} else if (articlesType.value === 'user-favorites-feed' && username.value) {
			promise = api.articles
				.getArticles({
					favorited: username.value,
					...pageToOffset(page.value)
				})
				.then((res) => res.data);
		} else if (articlesType.value === 'global-feed') {
			promise = api.articles
				.getArticles(pageToOffset(page.value))
				.then((res) => res.data);
		}

		if (promise) {
			const res = await promise;
			articles.value = res.articles;
			articlesCount.value = res.articlesCount;
		} else {
			throw new Error(`Article type ${articlesType.value} is not supported`);
		}
	};

	const changePage = (value: number) => {
		page.value = value;
	};

	const updateArticle = (index: number, newArticle: Article) => {
		articles.value[index] = newArticle;
	};

	const { active: fetchingArticles, run: refetchArticles } =
		useAsync(fetchArticles);

	watch(metaChanged, async () => {
		if (page.value !== 1) {
			changePage(1);
		} else {
			await refetchArticles();
		}
	});

	watch(page, refetchArticles);

	return {
		fetchArticles: refetchArticles,
		fetchingArticles,
		articles,
		articlesCount,
		articlesType,
		page,
		changePage,
		updateArticle,
		tag,
		username
	};
};

export default useArticles;

interface UseArticlesMetaReturn {
	tag: ComputedRef<string>;
	username: ComputedRef<string>;
	articlesType: ComputedRef<ArticlesType>;
	metaChanged: ComputedRef<string>;
}

const useArticlesMeta = (): UseArticlesMetaReturn => {
	const route = useRoute();

	const tag = ref('');
	const username = ref('');
	const articlesType = ref<ArticlesType>('global-feed');

	watch(
		() => route.name,
		(routeName) => {
			const possibleArticlesType =
				routeNameToArticlesType[routeName as AppRouteNames];
			if (!isArticlesType(possibleArticlesType)) return;

			articlesType.value = possibleArticlesType;
		},
		{ immediate: true }
	);

	watch(
		() => route.params.username,
		(usernameParam) => {
			if (usernameParam !== username.value) {
				username.value = typeof usernameParam === 'string' ? usernameParam : '';
			}
		},
		{ immediate: true }
	);

	watch(
		() => route.params.tag,
		(tagParam) => {
			if (tagParam !== tag.value) {
				tag.value = typeof tagParam === 'string' ? tagParam : '';
			}
		},
		{ immediate: true }
	);

	return {
		tag: computed(() => tag.value),
		username: computed(() => username.value),
		articlesType: computed(() => articlesType.value),
		metaChanged: computed(
			() => `${articlesType.value}-${username.value}-${tag.value}`
		)
	};
};

export const articlesTypes = [
	'global-feed',
	'my-feed',
	'tag-feed',
	'user-feed',
	'user-favorites-feed'
] as const;
export type ArticlesType = typeof articlesTypes[number];
export const isArticlesType = (type: any): type is ArticlesType =>
	articlesTypes.includes(type);
const routeNameToArticlesType: Partial<Record<AppRouteNames, ArticlesType>> = {
	'global-feed': 'global-feed',
	'my-feed': 'my-feed',
	tag: 'tag-feed',
	profile: 'user-feed',
	'profile-favorites': 'user-favorites-feed'
};

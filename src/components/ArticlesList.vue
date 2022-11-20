<template>
	<ArticleListNavigation v-bind="$attrs" :tag="tag" :username="username" />

	<div v-if="fetchingArticles" class="article-preview">Loading articles...</div>

	<div v-else-if="articles.length === 0" class="article-preview">
		No articles are here... yet.
	</div>

	<template v-else>
		<ArticleListArticlePreview
			v-for="(article, index) in articles"
			:key="article.slug"
			:article="article"
			@update="(newArticle) => updateArticle(index, newArticle)"
		/>

		<AppPagination
			:count="articlesCount"
			:page="page"
			@page-change="changePage"
		/>
	</template>
</template>

<script setup lang="ts">
import useArticles from '@/composable/useArticles';
import AppPagination from './AppPagination.vue';
import ArticleListArticlePreview from './ArticleListArticlePreview.vue';
import ArticleListNavigation from './ArticleListNavigation.vue';

const {
	articles,
	articlesCount,
	fetchingArticles,
	page,
	tag,
	username,
	fetchArticles,
	updateArticle,
	changePage
} = useArticles();

await fetchArticles();
</script>

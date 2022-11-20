<template>
	<div class="banner">
		<div class="container">
			<h1>{{ article.title }}</h1>

			<ArticleDetailMeta
				v-if="article"
				:article="article"
				@update="updateArticle"
			/>
		</div>
	</div>

	<div class="container page">
		<div class="row article content">
			<div class="col-md-12" v-html="articleParsedBody" />
			<ul class="tag-list">
				<li
					v-for="tag in article.tagList"
					:key="tag"
					class="tag-default tag-pill tag-outline"
				>
					{{ tag }}
				</li>
			</ul>
		</div>

		<hr />

		<div class="article-actions">
			<ArticleDetailMeta
				v-if="article"
				:article="article"
				@update="updateArticle"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { Article } from '@/models/Article';
import marked from '@/plugins/marked';
import { api } from '@/services';
import { computed, reactive } from 'vue';
import { useRoute } from 'vue-router';
import ArticleDetailMeta from './ArticleDetailMeta.vue';

const route = useRoute();
const slug = route.params.slug as string;
const article: Article = reactive(
	await api.articles.getArticle(slug).then((res) => res.data.article)
);
const articleParsedBody = computed(() => marked(article.body));

const updateArticle = (newArticle: Article) => {
	Object.assign(article, newArticle);
};
</script>

<template>
	<div class="editor-page">
		<div class="container page">
			<div class="row">
				<div class="col-md-10 offset-md-1 col-xs-12">
					<form @submit.prevent="onSubmit">
						<fieldset class="form-group">
							<input
								v-model="form.title"
								type="text"
								class="form-control form-control-lg"
								placeholder="Article Title"
							/>
						</fieldset>
						<fieldset class="form-group">
							<input
								v-model="form.description"
								type="text"
								class="form-control form-control-lg"
								placeholder="What's this article about?"
							/>
						</fieldset>
						<fieldset class="form-group">
							<textarea
								v-model="form.body"
								class="form-control"
								rows="8"
								placeholder="Write your article (in markdown)"
							></textarea>
						</fieldset>
						<fieldset class="form-group">
							<input
								v-model="newTag"
								type="text"
								class="form-control"
								placeholder="Enter tags"
								@keypress.enter.prevent="addTag"
							/>
							<div class="tag-list">
								<span
									class="tag-default tag-pill"
									v-for="(tag, index) in form.tagList"
									:key="index"
								>
									<i class="ion-close-round" @click="removeTag(index)" />
									{{ tag }}
								</span>
							</div>
						</fieldset>
						<button
							class="btn btn-lg pull-xs-right btn-primary"
							type="submit"
							:disabled="!(form.title && form.description && form.body)"
						>
							Publish Article
						</button>
					</form>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { Article, NewArticle } from '@/models/Article';
import { routerPush } from '@/router';
import { api } from '@/services';
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

type FormState = NewArticle;

const route = useRoute();
const router = useRouter();
const slug = computed<string>(() => route.params.slug as string);

const form: FormState = reactive({
	title: '',
	description: '',
	body: '',
	tagList: []
});

const newTag = ref('');
const addTag = () => {
	const value = newTag.value.trim();
	if (value) {
		form.tagList.push(value);
		newTag.value = '';
	}
};
const removeTag = (index: number) => {
	form.tagList = form.tagList.filter((_, i) => i !== index);
};

const fetchArticle = async (slug: string) => {
	const article = await api.articles
		.getArticle(slug)
		.then((res) => res.data.article);

	Object.keys(form).forEach((key) => {
		// @ts-ignore
		form[key] = article[key];
	});
};

const onSubmit = async () => {
	let article: Article;
	if (slug.value) {
		article = await api.articles
			.updateArticle(slug.value, { article: form })
			.then((res) => res.data.article);
	} else {
		article = await api.articles
			.createArticle({ article: form })
			.then((res) => res.data.article);
	}
	return routerPush('article', { slug: article.slug });
};

onMounted(() => {
	if (slug.value) {
		fetchArticle(slug.value);
	}
});
</script>

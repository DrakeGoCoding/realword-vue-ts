<template>
	<div class="article-meta">
		<AppLink name="profile" :params="{ username: article.author.username }">
			<img :src="article.author.image" :alt="article.author.username" />
		</AppLink>

		<div class="info">
			<AppLink
				name="profile"
				:params="{ username: article.author.username }"
				class="author"
			>
				{{ article.author.username }}
			</AppLink>
			<span class="date">{{
				new Date(article.createdAt).toLocaleDateString()
			}}</span>
		</div>

		<button
			v-if="showFollowBtn"
			:aria-label="article.author.following ? 'Unfollow' : 'Follow'"
			class="btn btn-sm btn-outline-secondary space"
			:disabled="pendingFollow"
			@click="toggleFollow"
		>
			<i class="ion-plus-round"></i>
			{{ article.author.following ? 'Unfollow' : 'Follow' }}
			{{ article.author.username }}
		</button>

		<button
			:aria-label="
				article.favorited ? 'Unfavorite article' : 'Favorite article'
			"
			class="btn btn-sm space"
			:class="[article.favorited ? 'btn-primary' : 'btn-outline-primary']"
			:disabled="pendingFavorite"
			@click="favoriteArticle"
		>
			<i class="ion-heart"></i>
			{{ article.favorited ? 'Unfavorite' : 'Favorite' }} Article
			<span class="counter">{{ article.favoritesCount }}</span>
		</button>

		<AppLink
			v-if="showEditBtn"
			aria-label="Edit article"
			class="btn btn-outline-secondary btn-sm space"
			name="edit-article"
			:params="{ slug: article.slug }"
		>
			<i class="ion-edit space" /> Edit Article
		</AppLink>

		<button
			v-if="showEditBtn"
			aria-label="Delete article"
			class="btn btn-outline-danger btn-sm"
			@click="onDelete"
		>
			<i class="ion-trash-a" /> Delete Article
		</button>
	</div>
</template>

<script setup lang="ts">
import useFavorite from '@/composable/useFavoriteArticle';
import useFollow from '@/composable/useFollowProfile';
import type { Article } from '@/models/Article';
import type { Profile } from '@/models/Profile';
import router, { routerPush } from '@/router';
import { api } from '@/services';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import { computed, toRefs } from 'vue';
import AppLink from './AppLink.vue';

interface Props {
	article: Article;
}
interface Emits {
	(e: 'update', article: Article): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { article } = toRefs(props);
const { user, isAuthorized } = storeToRefs(useUserStore());
const showEditBtn = computed(
	() =>
		isAuthorized.value && user.value?.username === article.value.author.username
);
const showFollowBtn = computed(
	() =>
		isAuthorized.value && user.value?.username !== article.value.author.username
);

const { pendingFollow, toggleFollow } = useFollow({
	following: computed(() => article.value.author.following),
	username: computed(() => article.value.author.username),
	onUpdate: (author: Profile) => {
		const newArticle = { ...article.value, author };
		emit('update', newArticle);
	}
});

const { favoriteArticle, pendingFavorite } = useFavorite({
	isFavorited: computed(() => article.value.favorited),
	articleSlug: computed(() => article.value.slug),
	onUpdate: (newArticle) => emit('update', newArticle)
});

const onDelete = async () => {
	await api.articles.deleteArticle(article.value.slug);
	await routerPush('global-feed');
};
</script>

<style scoped>
.space {
	margin-right: 8px;
}
</style>

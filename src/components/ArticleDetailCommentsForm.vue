<template>
	<p v-if="!profile">
		<AppLink name="login">Sign in</AppLink> or
		<AppLink name="register">sign up</AppLink> to add comments on this article.
	</p>

	<form v-else class="card comment-form" @submit.prevent="onSubmit">
		<div class="card-block">
			<textarea
				v-model="comment"
				aria-label="Write comment"
				class="form-control"
				placeholder="Write a comment..."
				:rows="3"
			/>
		</div>
		<div class="card-footer">
			<img
				class="comment-author-img"
				:src="profile.image"
				:alt="profile.username"
			/>
			<button
				aria-label="Submit"
				type="submit"
				:disabled="comment === ''"
				class="btn btn-sm btn-primary"
			>
				Post Comment
			</button>
		</div>
	</form>
</template>

<script setup lang="ts">
import useProfile from '@/composable/useProfile';
import type { Comment } from '@/models/Comment';
import { api } from '@/services';
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';
import AppLink from './AppLink.vue';

interface Props {
	articleSlug: string;
}
interface Emits {
	(e: 'add-comment', comment: Comment): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { user } = storeToRefs(useUserStore());
const username = computed(() => user.value?.username ?? '');

const { profile } = useProfile({ username });

const comment = ref('');

const onSubmit = async () => {
	const newComment = await api.articles
		.createArticleComment(props.articleSlug, {
			comment: { body: comment.value }
		})
		.then((res) => res.data.comment);

	emit('add-comment', newComment);
	comment.value = '';
};
</script>

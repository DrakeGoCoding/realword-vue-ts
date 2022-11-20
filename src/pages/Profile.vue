<template>
	<div class="profile-page">
		<div class="user-info">
			<div class="container">
				<div class="row">
					<div class="col-xs-12 col-md-10 offset-md-1">
						<div v-if="!profile" class="align-left">Loading profile...</div>
						<template v-else>
							<img
								:src="profile.image"
								class="user-img"
								:alt="profile.username"
							/>

							<h4>{{ profile.username }}</h4>

							<p v-if="profile.bio">
								{{ profile.bio }}
							</p>

							<AppLink
								v-if="showEditBtn"
								class="btn btn-sm btn-outline-secondary action-btn"
								name="settings"
							>
								<i class="ion-gear-a space" />
								Edit profile settings
							</AppLink>

							<button
								v-if="showFollowBtn"
								class="btn btn-sm btn-outline-secondary action-btn"
								:disabled="pendingFollow"
								@click="toggleFollow"
							>
								<i class="ion-plus-round space" />
								{{ profile.following ? 'Unfollow' : 'Follow' }}
								{{ profile.username }}
							</button>
						</template>
					</div>
				</div>
			</div>
		</div>

		<div class="container">
			<div class="row">
				<div class="col-xs-12 col-md-10 offset-md-1">
					<Suspense>
						<ArticlesList use-user-feed use-user-favorited />
						<template #fallback> Loading articles... </template>
					</Suspense>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import AppLink from '@/components/AppLink.vue';
import ArticlesList from '@/components/ArticlesList.vue';
import useFollow from '@/composable/useFollowProfile';
import useProfile from '@/composable/useProfile';
import type { Profile } from '@/models/Profile';
import { isAuthorized, useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const username = computed(() => route.params.username as string);

const { profile, updateProfile } = useProfile({ username });

const { pendingFollow, toggleFollow } = useFollow({
	following: computed(() => profile.value?.following ?? false),
	username,
	onUpdate: (newProfile: Profile) => updateProfile(newProfile)
});

const { user } = storeToRefs(useUserStore());

const showEditBtn = computed(
	() => isAuthorized() && user.value?.username === username.value
);
const showFollowBtn = computed(() => user.value?.username !== username.value);
</script>

<style scoped>
.space {
	margin-right: 4px;
}
.align-left {
	text-align: left;
}
</style>

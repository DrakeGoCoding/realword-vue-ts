<template>
	<nav class="navbar navbar-light">
		<div class="container">
			<AppLink class="navbar-brand" name="global-feed">conduit</AppLink>

			<ul class="nav navbar-nav pull-xs-right">
				<li v-for="link in navLinks" :key="link.name" class="nav-item">
					<AppLink
						class="nav-link"
						active-class="active"
						:name="link.name"
						:params="link.params"
					>
						<i v-if="link.icon" :class="link.icon" />
						{{ link.title }}
					</AppLink>
				</li>
			</ul>
		</div>
	</nav>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import AppLink, { type AppLinkProps } from './AppLink.vue';

type NavLink = AppLinkProps & {
	title: string;
	icon?: string;
	display: 'all' | 'anonym' | 'authorized';
};

const { user } = storeToRefs(useUserStore());
const username = computed(() => user.value?.username);
const displayStatus = computed<NavLink['display']>(() =>
	username.value ? 'authorized' : 'anonym'
);

const allNavLinks = computed<NavLink[]>(() => [
	{ name: 'global-feed', title: 'Home', display: 'all' },
	{ name: 'login', title: 'Sign in', display: 'anonym' },
	{ name: 'register', title: 'Sign up', display: 'anonym' },
	{
		name: 'create-article',
		title: 'New Post',
		display: 'authorized',
		icon: 'ion-compose'
	},
	{
		name: 'settings',
		title: 'Settings',
		display: 'authorized',
		icon: 'ion-gear-a'
	},
	{
		name: 'profile',
		title: username.value || '',
		display: 'authorized',
		params: { username: username.value }
	}
]);
const navLinks = computed(() =>
	allNavLinks.value.filter(
		({ display }) => display === displayStatus.value || display === 'all'
	)
);
</script>

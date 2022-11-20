<template>
	<div class="auth-page">
		<div class="container page">
			<div class="row">
				<div class="col-md-6 offset-md-3 col-xs-12">
					<h1 class="text-xs-center">Sign in</h1>
					<p class="text-xs-center">
						<AppLink name="register"> Need an account? </AppLink>
					</p>

					<ul class="error-messages">
						<li v-for="(error, field) in errors" :key="field">
							{{ field }} {{ error?.[0] ?? '' }}
						</li>
					</ul>

					<form ref="formRef" @submit.prevent="login">
						<fieldset class="form-group" aria-required="true">
							<input
								class="form-control form-control-lg"
								v-model="form.email"
								type="email"
								required
								placeholder="Email"
							/>
						</fieldset>
						<fieldset class="form-group" aria-required="true">
							<input
								class="form-control form-control-lg"
								v-model="form.password"
								type="password"
								required
								placeholder="Password"
							/>
						</fieldset>
						<button
							class="btn btn-lg btn-primary pull-xs-right"
							:disable="!form.email || !form.password"
							type="submit"
						>
							Sign in
						</button>
					</form>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import AppLink from '@/components/AppLink.vue';
import { routerPush } from '@/router';
import { api } from '@/services';
import type { LoginUser } from '@/services/api';
import { useUserStore } from '@/stores/user';
import { reactive, ref } from 'vue';

const { updateUser } = useUserStore();

const formRef = ref<HTMLFormElement | null>(null);
const form: LoginUser = reactive({
	email: '',
	password: ''
});
const errors = ref();

const login = async () => {
	errors.value = {};
	if (!formRef.value?.checkValidity()) return;

	const res = await api.users.login({ user: form });
	if (res.ok) {
		updateUser(res.data.user);
		routerPush('global-feed');
	} else {
		errors.value = res.error;
	}
};
</script>

import type { User } from '@/models/User';
import { api } from '@/services';
import Storage from '@/utils/storage';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const userStorage = new Storage<User>('user');

export const isAuthorized = (): boolean => !!userStorage.get();

export const useUserStore = defineStore('user', () => {
	const user = ref(userStorage.get());
	const isAuthorized = computed(() => user.value !== null);

	const updateUser = (userData?: User | null) => {
		if (!userData) {
			userStorage.remove();
			api.setSecurityData(null);
			user.value = null;
		} else {
			userStorage.set(userData);
			api.setSecurityData(userData.token);
			user.value = userData;
		}
	};

	return {
		user,
		isAuthorized,
		updateUser
	};
});

import type { Profile } from '@/models/Profile';
import { api } from '@/services';
import { ref, watch, type ComputedRef } from 'vue';

interface UseProfile {
	username: ComputedRef<string>;
}

const useProfile = ({ username }: UseProfile) => {
	const profile = ref<Profile | null>(null);

	const fetchProfile = async () => {
		updateProfile(null);
		if (!username.value) return;
		const newProfile = await api.profiles
			.getProfileByUsername(username.value)
			.then((res) => res.data.profile);

		updateProfile(newProfile);
	};

	const updateProfile = async (newProfile: Profile | null) => {
		profile.value = newProfile;
	};

	watch(username, fetchProfile, { immediate: true });

	return { profile, fetchProfile, updateProfile };
};

export default useProfile;

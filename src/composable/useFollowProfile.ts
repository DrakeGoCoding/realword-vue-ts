import type { Profile } from '@/models/Profile';
import { api } from '@/services';
import type { ComputedRef } from 'vue';
import useAsync from './useAsync';

interface UseFollow {
	username: ComputedRef<string>;
	following: ComputedRef<boolean>;
	onUpdate: (profile: Profile) => void;
}

const useFollow = ({ username, following, onUpdate }: UseFollow) => {
	const toggleFollow = async () => {
		const requestor = following.value
			? api.profiles.unfollowUserByUsername
			: api.profiles.followUserByUsername;

		const profile = await requestor(username.value).then(
			(res) => res.data.profile
		);

		onUpdate(profile);
	};
	const { active, run } = useAsync(toggleFollow);

	return {
		pendingFollow: active,
		toggleFollow: run
	};
};

export default useFollow;

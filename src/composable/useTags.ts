import { api } from '@/services';
import { ref } from 'vue';

const useTags = () => {
	const tags = ref<string[]>([]);

	const fetchTags = async () => {
		tags.value = [];
		tags.value = await api.tags.getTags().then((res) => res.data.tags);
	};

	return { fetchTags, tags };
};

export default useTags;

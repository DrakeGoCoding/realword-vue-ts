import type { Article } from '@/models/Article';
import { api } from '@/services';
import type { ComputedRef } from 'vue';
import useAsync from './useAsync';

interface UseFavorite {
	isFavorited: ComputedRef<boolean>;
	articleSlug: ComputedRef<string>;
	onUpdate: (newArticle: Article) => void;
}

const useFavorite = ({ isFavorited, articleSlug, onUpdate }: UseFavorite) => {
	const favoriteArticle = async () => {
		const requestor = isFavorited.value
			? api.articles.deleteArticleFavorite
			: api.articles.createArticleFavorite;

		const article = await requestor(articleSlug.value).then(
			(res) => res.data.article
		);
		onUpdate(article);
	};

	const { active, run } = useAsync(favoriteArticle);

	return {
		pendingFavorite: active,
		favoriteArticle: run
	};
};

export default useFavorite;

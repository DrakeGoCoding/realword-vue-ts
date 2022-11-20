import { ref, type Ref } from 'vue';

interface UseAsync<T extends (...args: unknown[]) => unknown> {
	active: Ref<boolean>;
	run: (...args: Parameters<T>) => Promise<ReturnType<T>>;
}

const useAsync = <T extends (...args: unknown[]) => unknown>(
	fn: T
): UseAsync<T> => {
	const active: UseAsync<T>['active'] = ref(false);
	const run: UseAsync<T>['run'] = async (...args) => {
		active.value = true;
		const result = await fn(...args);
		active.value = false;
		return result as ReturnType<T>;
	};

	return { active, run };
};

export default useAsync;

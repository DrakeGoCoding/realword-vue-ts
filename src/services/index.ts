import { CONFIG } from '@/config';
import { Api } from './api';

export const LOCAL_LIMIT = 10;

export const api = new Api({
	baseUrl: `${CONFIG.API_HOST}/api`,
	securityWorker: (token) =>
		token ? { headers: { authorization: `Bearer ${token}` } } : {}
});

export const pageToOffset = (page = 1, limit = LOCAL_LIMIT) => {
	const offset = (page - 1) * limit;
	return { limit, offset };
};

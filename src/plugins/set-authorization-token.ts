import { api } from '@/services';
import { userStorage } from '@/stores/user';

export default function () {
	const token = userStorage.get()?.token;
	if (token) {
		api.setSecurityData(token);
	}
}

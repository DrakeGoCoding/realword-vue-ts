import type { Article, NewArticle, UpdateArticle } from '@/models/Article';
import type { Comment, NewComment } from '@/models/Comment';
import type { Profile } from '@/models/Profile';
import type { NewUser, UpdateUser, User } from '@/models/User';
import {
	ContentType,
	type ApiConfig,
	type CancelToken,
	type FullRequestParams,
	type GenericErrorModel,
	type HttpResponse,
	type QueryParamsType,
	type RequestParams
} from './type';

export class HttpClient<SecurityDataType = unknown> {
	public baseUrl: string = '/api';
	private securityData: SecurityDataType | null = null;
	private securityWorker?: ApiConfig<SecurityDataType>['securityWorker'];
	private abortControllers = new Map<CancelToken, AbortController>();
	private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
		fetch(...fetchParams);

	private baseApiParams: RequestParams = {
		credentials: 'same-origin',
		headers: {},
		redirect: 'follow',
		referrerPolicy: 'no-referrer'
	};

	constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
		Object.assign(this, apiConfig);
	}

	public setSecurityData(data: SecurityDataType | null) {
		this.securityData = data;
	}

	private encodeQueryParam(key: string, value: any) {
		const encodedKey = encodeURIComponent(key);
		return `${encodedKey}=${encodeURIComponent(
			typeof value === 'number' ? value : `${value}`
		)}`;
	}

	private addQueryParam(query: QueryParamsType, key: string) {
		return this.encodeQueryParam(key, query[key]);
	}

	private addArrayQueryParam(query: QueryParamsType, key: string) {
		const value: any[] = query[key];
		return value.map((v) => this.encodeQueryParam(key, v)).join('&');
	}

	protected toQueryString(rawQuery?: QueryParamsType) {
		const query = rawQuery || {};
		const keys = Object.keys(query).filter(
			(key) => typeof query[key] !== 'undefined'
		);
		return keys
			.map((key) =>
				Array.isArray(query[key])
					? this.addArrayQueryParam(query, key)
					: this.addQueryParam(query, key)
			)
			.join('&');
	}

	protected addQueryParams(rawQuery?: QueryParamsType) {
		const queryString = this.toQueryString(rawQuery);
		return queryString ? `?${queryString}` : '';
	}

	private contentFormatters: Record<ContentType, (input: any) => any> = {
		[ContentType.JSON]: (input: any) =>
			input !== null && (typeof input === 'object' || typeof input === 'string')
				? JSON.stringify(input)
				: input,
		[ContentType.FORM_DATA]: (input: any) =>
			Object.keys(input || {}).reduce((formData, key) => {
				const property = input[key];
				formData.append(
					key,
					property instanceof Blob
						? property
						: typeof property === 'object' && property !== null
						? JSON.stringify(property)
						: `${property}`
				);
				return formData;
			}, new FormData()),
		[ContentType.URL_ENCODED]: (input: any) => this.toQueryString(input)
	};

	private mergeRequestParams(
		params1: RequestParams,
		params2?: RequestParams
	): RequestParams {
		return {
			...this.baseApiParams,
			...params1,
			...(params2 || {}),
			headers: {
				...(this.baseApiParams.headers || {}),
				...(params1.headers || {}),
				...((params2 && params2.headers) || {})
			}
		};
	}

	private createAbortSignal(cancelToken: CancelToken) {
		if (this.abortControllers.has(cancelToken)) {
			return this.abortControllers.get(cancelToken)?.signal;
		}

		const abortController = new AbortController();
		this.abortControllers.set(cancelToken, abortController);
		return abortController.signal;
	}

	public abortRequest(cancelToken: CancelToken) {
		const abortController = this.abortControllers.get(cancelToken);
		if (abortController) {
			abortController.abort();
			this.abortControllers.delete(cancelToken);
		}
	}

	public async request<T = any, E = any>({
		baseUrl,
		body,
		cancelToken,
		format,
		path,
		query,
		secure,
		type,
		...params
	}: FullRequestParams): Promise<HttpResponse<T, E>> {
		const secureParams =
			((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
				this.securityWorker &&
				(await this.securityWorker(this.securityData))) ||
			{};
		const requestParams = this.mergeRequestParams(params, secureParams);
		const queryString = query && this.toQueryString(query);
		const payloadFormatter = this.contentFormatters[type || ContentType.JSON];
		const responseFormat = format || requestParams.format;

		return this.customFetch(
			`${baseUrl || this.baseUrl || ''}${path}${
				queryString ? `?${queryString}` : ''
			}`,
			{
				...requestParams,
				headers: {
					...(type && type !== ContentType.FORM_DATA
						? { 'Content-Type': type }
						: {}),
					...(requestParams.headers || {})
				},
				signal: cancelToken ? this.createAbortSignal(cancelToken) : void 0,
				body:
					body === undefined || body === null ? null : payloadFormatter(body)
			}
		).then(async (response) => {
			const r = response as HttpResponse<T, E>;
			r.data = null as unknown as T;
			r.error = null as unknown as E;

			const data = !responseFormat
				? r
				: await response[responseFormat]()
						.then((data) => {
							if (r.ok) {
								r.data = data;
							} else {
								r.error = data;
							}
							return r;
						})
						.catch((error) => {
							r.error = error;
							return r;
						});

			if (cancelToken) {
				this.abortControllers.delete(cancelToken);
			}

			if (!response.ok) {
				throw data;
			}

			return data;
		});
	}
}

export class Api<
	SecurityDataType extends unknown
> extends HttpClient<SecurityDataType> {
	users = {
		login: (data: LoginUserRequest, params: RequestParams = {}) => {
			return this.request<UserResponse, void | GenericErrorModel>({
				path: `/users/login`,
				method: 'POST',
				body: data,
				type: ContentType.JSON,
				format: 'json',
				...params
			});
		},
		createUser: (data: NewUserRequest, params: RequestParams = {}) => {
			return this.request<UserResponse, GenericErrorModel>({
				path: `/users`,
				method: 'POST',
				body: data,
				type: ContentType.JSON,
				format: 'json',
				...params
			});
		}
	};
	user = {
		getCurrentUser: (params: RequestParams = {}) => {
			return this.request<UserResponse, GenericErrorModel>({
				path: `/user`,
				method: 'GET',
				secure: true,
				format: 'json',
				...params
			});
		},
		updateCurrentUser: (
			data: UpdateUserRequest,
			params: RequestParams = {}
		) => {
			return this.request<UserResponse, GenericErrorModel>({
				path: `/user`,
				method: 'PUT',
				body: data,
				secure: true,
				type: ContentType.JSON,
				format: 'json',
				...params
			});
		}
	};
	profiles = {
		getProfileByUsername: (username: string, params: RequestParams = {}) => {
			return this.request<ProfileResponse, void | GenericErrorModel>({
				path: `/profiles/${username}`,
				method: 'GET',
				format: 'json',
				...params
			});
		},
		followUserByUsername: (username: string, params: RequestParams = {}) => {
			return this.request<ProfileResponse, GenericErrorModel>({
				path: `/profiles/${username}/follow`,
				method: 'POST',
				secure: true,
				format: 'json',
				...params
			});
		},
		unfollowUserByUsername: (username: string, params: RequestParams = {}) => {
			return this.request<ProfileResponse, GenericErrorModel>({
				path: `/profiles/${username}/follow`,
				method: 'DELETE',
				secure: true,
				format: 'json',
				...params
			});
		}
	};
	articles = {
		getArticlesFeed: (
			query?: { limit?: number; offset?: number },
			params: RequestParams = {}
		) => {
			return this.request<MultipleArticlesResponse, void | GenericErrorModel>({
				path: `/articles/feed`,
				method: 'GET',
				query,
				secure: true,
				format: 'json',
				...params
			});
		},
		getArticles: (
			query?: {
				tag?: string;
				author?: string;
				favorited?: string;
				limit?: number;
				offset?: number;
			},
			params: RequestParams = {}
		) => {
			return this.request<MultipleArticlesResponse, void | GenericErrorModel>({
				path: `/articles`,
				method: 'GET',
				query,
				format: 'json',
				...params
			});
		},
		createArticle: (data: NewArticleRequest, params: RequestParams = {}) => {
			return this.request<SingleArticleResponse, GenericErrorModel>({
				path: `/articles`,
				method: 'POST',
				body: data,
				secure: true,
				type: ContentType.JSON,
				format: 'json',
				...params
			});
		},
		getArticle: (slug: string, params: RequestParams = {}) => {
			return this.request<SingleArticleResponse, GenericErrorModel>({
				path: `/articles/${slug}`,
				method: 'GET',
				format: 'json',
				...params
			});
		},
		updateArticle: (
			slug: string,
			data: UpdateArticleRequest,
			params: RequestParams = {}
		) => {
			return this.request<SingleArticleResponse, GenericErrorModel>({
				path: `/articles/${slug}`,
				method: 'PUT',
				body: data,
				secure: true,
				type: ContentType.JSON,
				format: 'json',
				...params
			});
		},
		deleteArticle: (slug: string, params: RequestParams = {}) => {
			return this.request<void, GenericErrorModel>({
				path: `/articles/${slug}`,
				method: 'DELETE',
				secure: true,
				...params
			});
		},
		getArticleComments: (slug: string, params: RequestParams = {}) => {
			return this.request<MultipleCommentsResponse, GenericErrorModel>({
				path: `/articles/${slug}/comments`,
				method: 'GET',
				format: 'json',
				...params
			});
		},
		createArticleComment: (
			slug: string,
			data: NewCommentRequest,
			params: RequestParams = {}
		) => {
			return this.request<SingleCommentResponse, void | GenericErrorModel>({
				path: `/articles/${slug}/comments`,
				method: 'POST',
				body: data,
				secure: true,
				type: ContentType.JSON,
				format: 'json',
				...params
			});
		},
		deleteArticleComment: (
			slug: string,
			id: number,
			params: RequestParams = {}
		) => {
			return this.request<void, GenericErrorModel>({
				path: `/articles/${slug}/comments/${id}`,
				method: 'DELETE',
				secure: true,
				...params
			});
		},
		createArticleFavorite: (slug: string, params: RequestParams = {}) => {
			return this.request<SingleArticleResponse, GenericErrorModel>({
				path: `/articles/${slug}/favorite`,
				method: 'POST',
				secure: true,
				format: 'json',
				...params
			});
		},
		deleteArticleFavorite: (slug: string, params: RequestParams = {}) => {
			return this.request<SingleArticleResponse, GenericErrorModel>({
				path: `/articles/${slug}/favorite`,
				method: 'DELETE',
				secure: true,
				format: 'json',
				...params
			});
		}
	};
	tags = {
		getTags: (params: RequestParams = {}) => {
			return this.request<MultipleTagsResponse, void | GenericErrorModel>({
				path: `/tags`,
				method: 'GET',
				format: 'json',
				...params
			});
		}
	};
}

export interface LoginUser {
	email: string;
	password: string;
}
export interface LoginUserRequest {
	user: LoginUser;
}
export interface NewUserRequest {
	user: NewUser;
}
export interface UpdateUserRequest {
	user: UpdateUser;
}
export interface UserResponse {
	user: User;
}

export interface ProfileResponse {
	profile: Profile;
}

export interface NewArticleRequest {
	article: NewArticle;
}
export interface UpdateArticleRequest {
	article: UpdateArticle;
}
export interface SingleArticleResponse {
	article: Article;
}
export interface MultipleArticlesResponse {
	articles: Article[];
	articlesCount: number;
}

export interface NewCommentRequest {
	comment: NewComment;
}
export interface SingleCommentResponse {
	comment: Comment;
}
export interface MultipleCommentsResponse {
	comments: Comment[];
}

export interface MultipleTagsResponse {
	tags: string[];
}

export enum ContentType {
	JSON = 'application/json',
	FORM_DATA = 'multipart/form-data',
	URL_ENCODED = 'application/x-www-form-urlencoded'
}
export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>;
export type CancelToken = Symbol | string | number;

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
	secure?: boolean;
	path: string;
	type?: ContentType;
	query?: QueryParamsType;
	format?: ResponseFormat;
	body?: unknown;
	baseUrl?: string;
	cancelToken?: CancelToken;
}
export type RequestParams = Omit<
	FullRequestParams,
	'body' | 'method' | 'query' | 'path'
>;

export interface ApiConfig<SecurityDataType = unknown> {
	baseUrl?: string;
	baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>;
	securityWorker?: (
		securityData: SecurityDataType | null
	) => Promise<RequestParams | void> | RequestParams | void;
	customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
	extends Response {
	data: D;
	error: E;
}

export interface GenericErrorModel {
	errors: { body: string[] };
}

import axios, { AxiosError, AxiosResponse } from 'axios';

export const ENTITY = 'entity';
export const DRAWER = 'drawer';

export interface KialiError {
  detail: string;
  error: string;
}

export type ApiResponse<T> = Partial<AxiosResponse<T>> & {
  data: T;
};

export type ApiError = AxiosError<KialiError>;

export const isApiError = axios.isAxiosError;

import { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface Response<T = any> extends AxiosResponse<T> {
  config: Config;
}

export interface Config extends AxiosRequestConfig {
  __isRetrying: boolean;
  __isLoggingIn: boolean;
}

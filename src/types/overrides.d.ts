import { AxiosRequestConfig } from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    __isRetrying?: boolean;
    __isLoggingIn?: boolean;
  }
}

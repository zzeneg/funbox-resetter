import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import Logger from './logger';

export class Funbox {

  private client: AxiosInstance;
  private username: string;
  private password: string;

  private cookie: any;
  private contextId: string;

  constructor(url: string, username: string, password: string) {
    this.username = username;
    this.password = password;

    this.client = axios.create({
      baseURL: url,
    });

    this.client.interceptors.request.use(config => {
      Logger.trace({
        url: config.url,
        data: config.data,
        headers: config.headers,
        loggingIn: config.__isLoggingIn,
        retrying: config.__isRetrying,
      }, 'request {url}');

      if (config.__isLoggingIn === true) {
        return config;
      } else if (this.cookie && this.contextId) {
        config.headers.cookie = this.cookie;
        config.headers['X-Context'] = this.contextId;
        return config;
      } else {
        return this.login(config).then(() => {
          config.headers.cookie = this.cookie;
          config.headers['X-Context'] = this.contextId;
          return config;
        });
      }
    });

    this.client.interceptors.response.use(response => {
      Logger.trace({ url: response.config.url, status: response.status, data: response.data, headers: response.headers }, 'response {status} {url}');
      if (response.data && response.data.result && response.data.result.errors && response.data.result.errors.length) {
        if (response.config.__isRetrying) {
          return Promise.reject(response.data.result.errors);
        }

        return this.retryRequest(response.config);
      }
      return response;
    }, error => {
      Logger.error(error, 'response error');
      if (error.response && error.response.status === 401 && error.config && !error.config.__isLoggingIn) {
        if (error.config.__isRetrying) {
          return Promise.reject(error);
        }

        return this.retryRequest(error.config);
      }

      return Promise.reject(error);
    });
  }

  getInfo() {
    return this.client.post('/sysbus/Devices/Device/HGW:get')
      .then(x => x.data);
  }

  reboot() {
    return this.client.post('/sysbus/NMC:reboot', { parameters: {} });
  }

  resetConnection() {
    return this.client.post('/sysbus/NeMo/Intf/data:setFirstParameter', { parameters: { name: 'Enable', value: 0, flag: 'ppp', traverse: 'down' } })
      .then(() => this.client.post('/sysbus/NeMo/Intf/data:setFirstParameter', { parameters: { name: 'Enable', value: 1, flag: 'ppp', traverse: 'down' } }));
  }

  private retryRequest(config: AxiosRequestConfig) {
    Logger.warn('error - login & retry');
    config.__isRetrying = true;
    return this.login(config).then(() => this.client(config));
  }

  private login(config: AxiosRequestConfig) {
    Logger.info('logging in...');
    config.__isLoggingIn = true;
    return this.client.post(`/authenticate?username=${this.username}&password=${this.password}`, null, config).then(res => {
      Logger.info('logged in');
      this.cookie = res.headers['set-cookie'];
      this.contextId = res.data.data.contextID;
      config.__isLoggingIn = false;
      return res;
    });
  }
}

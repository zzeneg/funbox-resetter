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
      Logger.trace('REQUEST', config.url, config.data, config.headers);
      if (config.__isLoggingIn === true) {
        return config;
      } else if (this.cookie && this.contextId) {
        config.headers.cookie = this.cookie;
        config.headers['X-Context'] = this.contextId;
        return config;
      } else {
        return this.login(config).then(res => config);
      }
    });

    this.client.interceptors.response.use(response => {
      Logger.trace('RESPONSE', response.config.url, response.config.data, response.config.headers);
      if (response.data && response.data.result && response.data.result.errors && response.data.result.errors.length) {
        Logger.info('error - login & retry');
        if (response.config.__isRetrying) {
          return Promise.reject(response.data.result.errors[0]);
        }
        response.config.__isRetrying = true;
        return this.login(response.config).then(() => this.client(response.config));
      }
      return response;
    }, error => {
      Logger.error(error);
      if (error.response && error.response.status === 401) {
        Logger.info('401 - Autenticating...');

        if (error.config && error.config.__isLoggingIn) {
          return Promise.reject('LOGIN ERROR');
        }

        return this.client(error.config);
      }
      return Promise.reject(error.response || error.code || error.error || error);
    });
  }

  getInfo() {
    return this.client.post('/sysbus/Devices/Device/HGW:get');
  }

  resetConnection() {
    return this.client.post('/sysbus/NeMo/Intf/data:setFirstParameter', { parameters: { name: 'Enable', value: 0, flag: 'ppp', traverse: 'down' } })
      .then(() => this.client.post('/sysbus/NeMo/Intf/data:setFirstParameter', { parameters: { name: 'Enable', value: 1, flag: 'ppp', traverse: 'down' } }));
  }

  private login(config: AxiosRequestConfig) {
    Logger.info('logging in...');
    config.__isLoggingIn = true;
    return this.client.post(`/authenticate?username=${this.username}&password=${this.password}`, null, config).then(res => {
      Logger.info('logged in');
      this.cookie = res.headers['set-cookie'];
      this.contextId = res.data.data.contextID;
      return res;
    });
  }
}

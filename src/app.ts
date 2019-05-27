import dotenv from 'dotenv';
import schedule from 'node-schedule';

import { Funbox } from './funbox';
import Logger from './logger';

class App {

  static funbox: Funbox;

  static main() {
    Logger.info('starting funbox');

    let config = dotenv.config();
    if (config.error) {
      Logger.error(config.error, 'config error');
    } else {
      Logger.trace({ config: config.parsed }, 'config');
    }

    this.funbox = new Funbox(process.env.FUNBOX_URL, process.env.FUNBOX_USERNAME, process.env.FUNBOX_PASSWORD);

    schedule.scheduleJob('reboot', process.env.FUNBOX_RESET_CRON, () => this.reboot());
  }

  private static resetConnection() {
    Logger.info('resetting the connection');
    this.funbox.resetConnection()
      .then(() => Logger.info('reset connection completed'))
      .catch(error => Logger.error(error, 'reset connection failed'));
  }

  private static reboot() {
    Logger.info('rebooting');
    this.funbox.reboot()
      .then(() => Logger.info('restart completed'))
      .catch(error => Logger.error(error, 'reboot failed'));
  }
}

App.main();

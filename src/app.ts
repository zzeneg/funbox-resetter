import dotenv from 'dotenv';
import schedule from 'node-schedule';

import { Funbox } from './funbox';
import Logger from './logger';

class App {

  static funbox: Funbox;

  static main() {
    Logger.info('starting funbox');

    let config = dotenv.config();
    Logger.trace(config);

    this.funbox = new Funbox(process.env.FUNBOX_URL, process.env.FUNBOX_USERNAME, process.env.FUNBOX_PASSWORD);

    schedule.scheduleJob('reset connection', process.env.FUNBOX_RESET_CRON, () => this.resetConnection());
  }

  private static resetConnection() {
    Logger.info('resetting the connection');
    this.funbox.resetConnection().catch(err => Logger.error(err));
  }
}

App.main();

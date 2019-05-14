import bunyan from 'bunyan';
import seq from 'bunyan-seq';
import dotenv from 'dotenv';

let createLogger = () => {
  dotenv.config();
  return bunyan.createLogger({
    name: 'funbox',
    streams: [
      {
        stream: process.stdout,
        level: 'info',
      },
      seq.createStream({
        apiKey: process.env.SEQ_FUNBOX_APIKEY,
        level: process.env.SEQ_FUNBOX_LEVEL,
        serverUrl: process.env.SEQ_URL,
        onError: e => console.log(e),
      }),
    ],
  });
};

let Logger = createLogger();

export default Logger;

import bunyan from 'bunyan';
import seq from 'bunyan-seq';

let createLogger = () => {
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
      }),
    ],
  });
};

let Logger = createLogger();

export default Logger;

import { createServer } from 'app';

const start = async server => {
  try {
    await server.listen(3000, '0.0.0.0');
  } catch (err) {
    console.log(err);
    server.log.error(err);
    process.exit(1);
  }
};

process.on('uncaughtException', error => {
  console.error(error);
});
process.on('unhandledRejection', error => {
  console.error(error);
});

createServer().then(s => {
  start(s);
});

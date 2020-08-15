// const Koa = require('koa');

import Koa from 'koa';
const app = new Koa();

const PORT = process.env['PORT'] || 3000;

app.use(async (ctx) => {
  ctx.body = 'Hello World';
});

app.listen(PORT);
console.log(`Server is running on port ${PORT}`);

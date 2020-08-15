import Koa from 'koa';
import cors from '@koa/cors';

const PORT = process.env['PORT'] || 3000;

const app = new Koa();
app.use(cors());

app.use(async (ctx) => {
  ctx.body = 'Hello World';
});

app.listen(PORT);
console.log(`Server is running on port ${PORT}`);

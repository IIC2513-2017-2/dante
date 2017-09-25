const KoaRouter = require('koa-router');
const pkg = require('../../package.json');

const router = new KoaRouter();

router.use(async (ctx, next) => {
  Object.assign(ctx.state, {
    homePath: '/', // ctx.router.url('home'),
  });
  await next();
});

router.get('home', '/', async (ctx) => {
  await ctx.render('index', { appVersion: pkg.version });
});

module.exports = router;

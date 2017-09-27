const KoaRouter = require('koa-router');
const pkg = require('../../package.json');

const router = new KoaRouter();

// Path helpers and flashMessage
router.use(async (ctx, next) => {
  Object.assign(ctx.state, {
    homePath: '/', // ctx.router.url('index'),
    currentUser: ctx.session.userId && await ctx.orm.User.findById(ctx.session.userId),
    signOutPath: ctx.router.url('session.destroy'),
    signInPath: ctx.router.url('session.new'),
    signUpPath: ctx.router.url('users.new'),
    userShowPath: user => ctx.router.url('users.show', user.username),
    adminIndexPath: ctx.router.url('admin.index'),
    notice: ctx.flashMessage.notice,
    warning: ctx.flashMessage.warning,
  });
  return next();
});

router.get('index', '/', async (ctx) => {
  await ctx.render('index', { appVersion: pkg.version });
});

module.exports = router;

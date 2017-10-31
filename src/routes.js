const KoaRouter = require('koa-router');

const index = require('./routes/index');
const session = require('./routes/session');
const users = require('./routes/users');
const posts = require('./routes/posts');
const admin = require('./routes/admin');

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
    postIndexPath: ctx.router.url('posts.index'),
    postShowPath: post => ctx.router.url('posts.show', { slug: post.slug }),
    adminIndexPath: ctx.router.url('admin.index'),
    notice: ctx.flashMessage.notice,
    warning: ctx.flashMessage.warning,
  });
  await next();
});

router.use(async (ctx, next) => {
  let lastPath;
  if (ctx.request.method === 'GET') {
    lastPath = ctx.request.url;
  }
  ctx.session.latestPath = lastPath || ctx.session.latestPath || '/';
  await next();
});

router.use('/', index.routes());
router.use('/session', session.routes());
router.use('/admin', admin.routes());
router.use('/user', users.routes());
router.use('/posts', posts.routes());

router.redirect('/login', router.url('session.new'));

module.exports = router;

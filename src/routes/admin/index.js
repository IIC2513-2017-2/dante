const KoaRouter = require('koa-router');

const users = require('./users');

const router = new KoaRouter();

router.use(async (ctx, next) => {
  if (!(ctx.state.currentUser && ctx.state.currentUser.isAdmin())) {
    ctx.flashMessage.warning = 'No tienes permiso para acceder a la administración';
    return ctx.redirect('/');
  }

  Object.assign(ctx.state, {
    adminIndexPath: router.url('admin.index'),
    adminUsersPath: router.url('admin.users.index'),
    adminPostsPath: router.url('admin.posts.index'),
    adminTeamsPath: router.url('admin.teams.index'),
  });

  return next();
});

// Admin Root
router.get('admin.index', '/', async (ctx) => {
  await ctx.render('admin/index');
});

// Admin Users
router.use('/users', users.routes());

// router.post('hello', '/', (ctx) => {
//   console.log(ctx.request.body);
//   ctx.flashMessage.notice = 'Form successfully processed';
//   ctx.redirect(router.url('hello'));
// });
//
// router.get('hello.name', '/:name', (ctx) => {
//   ctx.body = { message: `Hello ${ctx.params.name}!` };
// });

module.exports = router;

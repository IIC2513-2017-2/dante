const KoaRouter = require('koa-router');
const router = new KoaRouter();

// Users Root
router.get('admin.users.index', '/', async (ctx,next) => {
  const users = await ctx.orm.User.findAll();
  await ctx.render('admin/users/index', { users });
});

module.exports = router;

const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('session.new', '/new',
  async (ctx, next) => {
    if (ctx.state.currentUser) {
      return ctx.redirect('/');
    }
    return next();
  },
  async (ctx) => {
    await ctx.render('session/new', {
      createSessionPath: ctx.router.url('session.create'),
      notice: ctx.flashMessage.notice,
      warning: ctx.flashMessage.warning,
    });
  },
);

router.put('session.create', '/', async (ctx) => {
  const { email, password } = ctx.request.body;
  const user = await ctx.orm.User.find({
    where: { email },
    attributes: ['id', 'username', 'password'],
  });
  const isPasswordCorrect = user && await user.checkPassword(password);

  if (isPasswordCorrect) {
    ctx.session.userId = user.id;
    ctx.flashMessage.notice = `Sesión iniciada como ${user.username}`;
    return ctx.redirect('/');
  }

  return ctx.render('session/new', {
    createSessionPath: ctx.router.url('session.create'),
    error: 'E-mail o contraseña incorrectos',
  });
});

router.del('session.destroy', '/', (ctx) => {
  ctx.session.userId = null;
  ctx.flashMessage.notice = 'Sesión cerrada correctamente';
  ctx.redirect('/');
});

module.exports = router;

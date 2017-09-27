const KoaRouter = require('koa-router');

const router = new KoaRouter();

// Already logged in filter
const checkLoggedIn = message => async (ctx, next) => {
  if (ctx.state.currentUser) {
    ctx.flashMessage.notice = message;
    return ctx.redirect('/');
  }

  return next();
};

// Already logged out filter
const checkLoggedOut = message => async (ctx, next) => {
  if (!ctx.state.currentUser) {
    ctx.flashMessage.notice = message;
    return ctx.redirect('/');
  }

  return next();
};

router.get('users.show', '/profile/:username',
  checkLoggedOut('Debes registrarte para ver los perfiles de usuario'),
  async (ctx) => {
    const { username } = ctx.params;
    const user = await ctx.orm.User.find({ where: { username } });
    if (!user) {
      ctx.flashMessage.warning = `No se econtró el usuario ${username}`;
      return ctx.redirect('/');
    }
    return ctx.render('users/show', { user });
  },
);

router.get('users.new', '/register',
  checkLoggedIn('Para registrar una cuenta debes cerrar sesión'),
  async (ctx) => {
    const user = await ctx.orm.User.build();
    await ctx.render('users/new', {
      user,
      submitUserPath: ctx.router.url('users.create'),
    });
  },
);

router.post('users.create', '/',
  checkLoggedIn('Para registrar una cuenta debes cerrar sesión'),
  async (ctx) => {
    try {
      const user = await ctx.orm.User.create(ctx.request.body);
      ctx.flashMessage.notice = `Usuario ${user.username} se ha creado correctamente`;
      ctx.session.userId = user.id;
      ctx.redirect(ctx.router.url('users.show', user.username));
    } catch (validationError) {
      await ctx.render('users/new', {
        user: ctx.orm.User.build(ctx.request.body),
        errors: validationError.errors,
        submitUserPath: ctx.router.url('users.create'),
      });
    }
  },
);

module.exports = router;

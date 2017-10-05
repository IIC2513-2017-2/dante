const KoaRouter = require('koa-router');

const router = new KoaRouter();

// Set User middleware

const setUser = async (ctx, next) => {
  const user = await ctx.orm.User.findById(ctx.params.id);
  if (user) {
    ctx.state.user = user;
    return next();
  }

  ctx.flashMessage.notice = `No se encontró el usuario con id ${ctx.params.id}`;
  return ctx.redirect(ctx.router.url('admin.users.index'));
};

// Users Index
router.get('admin.users.index', '/', async (ctx) => {
  const usersData = await ctx.orm.User.findAndCountAll();

  await ctx.render('admin/users/index', {
    users: usersData.rows,
    userCount: usersData.count,
    userNewPath: ctx.router.url('admin.users.new'),
    userEditPath: user => ctx.router.url('admin.users.edit', { id: user.id }),
  });
});

router.get('admin.users.new', '/new', async (ctx) => {
  const user = await ctx.orm.User.build();
  await ctx.render('admin/users/new', {
    user,
    submitUserPath: ctx.router.url('admin.users.create'),
  });
});

router.get('admin.users.edit', '/:id/edit', setUser, async (ctx) => {
  const { user } = ctx.state;
  await ctx.render('admin/users/edit', {
    user,
    submitUserPath: ctx.router.url('admin.users.update', { id: user.id }),
    deleteUserPath: ctx.router.url('admin.users.destroy', { id: user.id }),
  });
});

router.post('admin.users.create', '/', async (ctx) => {
  const user = await ctx.orm.User.build(ctx.request.body);
  try {
    await user.save({
      fields: ['firstName', 'lastName', 'password', 'email', 'username', 'role'],
    });
    ctx.flashMessage.notice = `Usuario ${user.username} se ha creado correctamente`;
    ctx.redirect(ctx.router.url('admin.users.index'));
  } catch (validationError) {
    await ctx.render('admin/users/new', {
      user,
      errors: validationError.errors,
      submitUserPath: ctx.router.url('admin.users.create'),
    });
  }
});

router.patch('admin.users.update', '/:id', setUser, async (ctx) => {
  const { user } = ctx.state;
  const passwordField = [];
  if (ctx.request.body.password.length) {
    passwordField.push('password');
  }

  try {
    await user.update(ctx.request.body, {
      fields: [...passwordField, 'firstName', 'lastName', 'email', 'username', 'role'],
    });
    ctx.flashMessage.notice = 'Usuario actualizado';
    ctx.redirect(ctx.router.url('admin.users.index'));
  } catch (validationError) {
    await ctx.render('admin/users/edit', {
      user,
      errors: validationError.errors,
      submitUserPath: ctx.router.url('admin.users.update', { id: user.id }),
      deleteUserPath: ctx.router.url('admin.users.destroy', { id: user.id }),
    });
  }
});

router.del('admin.users.destroy', '/:id', setUser, async (ctx) => {
  const { user } = ctx.state;
  try {
    await user.destroy();
    ctx.flashMessage.notice = 'Usuario eliminado';
    ctx.redirect(ctx.router.url('admin.users.index'));
  } catch (validationError) {
    await ctx.render('admin/users/edit', {
      user,
      errors: validationError.errors,
      submitUserPath: ctx.router.url('admin.users.update', { id: user.id }),
      deleteUserPath: ctx.router.url('admin.users.destroy', { id: user.id }),
    });
  }
});

module.exports = router;

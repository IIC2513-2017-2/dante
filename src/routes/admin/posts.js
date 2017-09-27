const KoaRouter = require('koa-router');
const moment = require('moment');

const router = new KoaRouter();

// Set authors middleware
const setAuthors = async (ctx, next) => {
  const authors = await ctx.orm.User.findAll({
    attributes: ['id', 'username', 'firstName', 'lastName'],
  });
  ctx.state.authors = authors;
  return next();
};

// Set post middleware
const setPost = async (ctx, next) => {
  const post = await ctx.orm.Post.findById(ctx.params.id);
  if (post) {
    ctx.state.post = post;
    return next();
  }

  ctx.flashMessage.notice = `No se encontró el post con id ${ctx.params.id}`;
  return ctx.redirect(ctx.router.url('admin.posts.index'));
};

// Posts Index
router.get('admin.posts.index', '/', async (ctx) => {
  const postsData = await ctx.orm.Post.findAndCountAll({
    include: ['author'],
    attributes: ['id', 'author.username', 'author.email', 'title', 'status', 'publishDate'],
    order: [['publishDate', 'DESC']],
  });

  await ctx.render('admin/posts/index', {
    posts: postsData.rows,
    postsCount: postsData.count,
    postNewPath: ctx.router.url('admin.posts.new'),
    postEditPath: post => ctx.router.url('admin.posts.edit', { id: post.id }),
  });
});

router.get('admin.posts.new', '/new', setAuthors, async (ctx) => {
  const post = await ctx.orm.Post.build();
  await ctx.render('admin/posts/new', {
    post,
    submitPostPath: ctx.router.url('admin.posts.create'),
  });
});

router.get('admin.posts.edit', '/:id/edit', setAuthors, setPost, async (ctx) => {
  const { post } = ctx.state;
  await ctx.render('admin/posts/edit', {
    post,
    submitPostPath: ctx.router.url('admin.posts.update', { id: post.id }),
    deletePostPath: ctx.router.url('admin.posts.destroy', { id: post.id }),
  });
});

router.post('admin.posts.create', '/', setAuthors, async (ctx) => {
  const { title, bodySource, authorId } = ctx.request.body;

  try {
    await ctx.orm.Post.create({ title, bodySource, authorId });
    ctx.flashMessage.notice = 'Post se ha creado correctamente';
    ctx.redirect(ctx.router.url('admin.posts.index'));
  } catch (validationError) {
    await ctx.render('admin/posts/new', {
      post: ctx.orm.Post.build(ctx.request.body),
      errors: validationError.errors,
      submitPostPath: ctx.router.url('admin.posts.create'),
    });
  }
});

router.patch('admin.posts.update', '/:id', setAuthors, setPost, async (ctx) => {
  const { post, authors } = ctx.state;
  const { title, authorId, publishDate, bodySource, status } = ctx.request.body;
  try {
    await post.update({
      title,
      authorId,
      bodySource,
      publishDate,
      status,
    });
    ctx.flashMessage.notice = 'Post actualizado';
    ctx.redirect(ctx.router.url('admin.posts.index'));
  } catch (validationError) {
    await ctx.render('admin/posts/edit', {
      post,
      authors,
      errors: validationError.errors,
      submitPostPath: ctx.router.url('admin.posts.update', { id: post.id }),
      deletePostPath: ctx.router.url('admin.posts.destroy', { id: post.id }),
    });
  }
});

router.del('admin.posts.destroy', '/:id', setPost, async (ctx) => {
  const { post } = ctx.state;
  try {
    await post.destroy();
    ctx.flashMessage.notice = 'Post eliminado';
    ctx.redirect(ctx.router.url('admin.posts.index'));
  } catch (validationError) {
    await ctx.render('admin/post/edit', {
      post,
      errors: validationError.errors,
      submitPostPath: ctx.router.url('admin.post.update', { id: post.id }),
      deletePostPath: ctx.router.url('admin.post.destroy', { id: post.id }),
    });
  }
});

module.exports = router;
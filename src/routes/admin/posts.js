const KoaRouter = require('koa-router');

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

// Set post with associations
const setPostWithAssociations = async (ctx, next) => {
  const post = await ctx.orm.Post.findById(ctx.params.id, {
    include: ['author', 'likes', 'likedByUsers'],
  });

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
    attributes: ['id', 'author.username', 'author.email', 'title', 'status', 'body', 'publishDate', 'slug'],
    order: [['publishDate', 'DESC']],
  });

  await ctx.render('admin/posts/index', {
    posts: postsData.rows,
    postsCount: postsData.count,
    postNewPath: ctx.router.url('admin.posts.new'),
    postEditPath: post => ctx.router.url('admin.posts.edit', { id: post.id }),
    previewPostPath: post => ctx.router.url('admin.posts.show', { id: post.id }),
    publishedPostPath: post => ctx.router.url('posts.show', { slug: post.slug }),
  });
});

router.get('admin.posts.new', '/new', setAuthors, async (ctx) => {
  const post = await ctx.orm.Post.build();
  const { authors } = ctx.state;
  await ctx.render('admin/posts/new', {
    post,
    authors,
    submitPostPath: ctx.router.url('admin.posts.create'),
  });
});

router.get('admin.posts.show', '/:id/preview', setPostWithAssociations, async (ctx) => {
  const { post, currentUser } = ctx.state;
  await ctx.render('admin/posts/preview', {
    post,
    notice: 'Recuerda que esta es una vista previa del contenido de este post',
    postEditPath: ctx.router.url('admin.posts.edit', { id: post.id }),
    publishedPostPath: () => ctx.router.url('posts.show', { slug: post.slug }),
    postLikesPath: () => {
      if (post.hasLikeFromUser(currentUser)) {
        return ctx.router.url('post.dislike', {
          slug: post.slug,
          userId: currentUser.id,
        });
      }
      return ctx.router.url('post.like', { slug: post.slug });
    },
  });
});

router.get('admin.posts.edit', '/:id/edit', setAuthors, setPost, async (ctx) => {
  const { post, authors } = ctx.state;
  await ctx.render('admin/posts/edit', {
    post,
    authors,
    submitPostPath: ctx.router.url('admin.posts.update', { id: post.id }),
    deletePostPath: ctx.router.url('admin.posts.destroy', { id: post.id }),
  });
});

router.post('admin.posts.create', '/', setAuthors, async (ctx) => {
  const { authors } = ctx.state;
  const { create, createPreview, ...postFields } = ctx.request.body;
  const post = await ctx.orm.Post.build(postFields);
  try {
    await post.save({ fields: ['title', 'bodySource', 'authorId', 'publishDate', 'slug', 'status'] });
    if (create) {
      ctx.flashMessage.notice = 'Post se ha creado correctamente';
      ctx.redirect(ctx.router.url('admin.posts.edit', { id: post.id }));
    } else if (createPreview) {
      ctx.redirect(ctx.router.url('admin.posts.show', { id: post.id }));
    }
  } catch (validationError) {
    await ctx.render('admin/posts/new', {
      post,
      authors,
      errors: validationError.errors,
      submitPostPath: ctx.router.url('admin.posts.create'),
    });
  }
});

router.patch('admin.posts.update', '/:id', setAuthors, setPost, async (ctx) => {
  const { post, authors } = ctx.state;
  const { update, updatePreview, ...postFields } = ctx.request.body;
  try {
    await post.update(postFields, {
      fields: ['title', 'authorId', 'bodySource', 'body', 'publishDate', 'status', 'slug'],
    });

    if (update) {
      ctx.flashMessage.notice = 'Post actualizado';
      ctx.redirect(ctx.router.url('admin.posts.edit', { id: post.id }));
    } else if (updatePreview) {
      ctx.redirect(ctx.router.url('admin.posts.show', { id: post.id }));
    }
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

router.del('admin.posts.destroy', '/:id', setAuthors, setPost, async (ctx) => {
  const { post, authors } = ctx.state;
  try {
    await post.destroy();
    ctx.flashMessage.notice = 'Post eliminado';
    ctx.redirect(ctx.router.url('admin.posts.index'));
  } catch (destroyError) {
    await ctx.render('admin/posts/edit', {
      post,
      authors,
      errors: [destroyError],
      submitPostPath: ctx.router.url('admin.post.update', { id: post.id }),
      deletePostPath: ctx.router.url('admin.post.destroy', { id: post.id }),
    });
  }
});

module.exports = router;

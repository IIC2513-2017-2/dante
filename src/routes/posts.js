const KoaRouter = require('koa-router');
const { URLSearchParams } = require('url');

const router = new KoaRouter();

const POSTS_PER_PAGE = 10;

const setPostsWithPagination = async (ctx, next) => {
  const page = Number(ctx.query.page) || 1;
  const limit = ctx.query.limit || POSTS_PER_PAGE;
  const data = await ctx.orm.Post.findPublishedPaginated(page, limit);
  Object.assign(ctx.state, {
    posts: data.rows,
    page,
    pages: Math.ceil(data.count / limit),
  });
  return next();
};

const setPostWithAssociations = async (ctx, next) => {
  const post = await ctx.orm.Post.findPublishedBySlug(ctx.params.slug, {
    include: ['author', 'likes', 'likedByUsers'],
  });
  if (post) {
    ctx.state.post = post;
    return next();
  }

  const postById = Number.isInteger(Number(ctx.params.slug))
    && await ctx.orm.Post.findById(ctx.params.slug, {
      where: { status: 'published' },
      include: ['author', 'likes', 'likedByUsers'],
    });
  if (postById) {
    return ctx.redirect(ctx.router.url('posts.show', { slug: postById.slug }));
  }

  ctx.flashMessage.notice = 'No se encontró el post';
  return ctx.redirect(ctx.router.url('posts.index'));
};

router.get('posts.index', '/', setPostsWithPagination, async (ctx) => {
  const {
    posts, page, pages, currentUser,
  } = ctx.state;

  if (pages > 1 && page > pages) {
    return ctx.redirect(ctx.router.url('posts.index'));
  }

  return ctx.render('posts/index', {
    posts,
    page,
    pages,
    postShowPath: post => ctx.router.url('posts.show', { slug: post.slug }),
    postLikesPath: (post) => {
      if (post.hasLikeFromUser(currentUser)) {
        return ctx.router.url('post.dislike', {
          slug: post.slug,
          userId: currentUser.id,
        });
      }
      return ctx.router.url('post.like', { slug: post.slug });
    },
    pagePath: (pageNumber) => {
      const searchParams = new URLSearchParams();
      if (pageNumber > 1) {
        searchParams.append('page', pageNumber);
      }
      if (ctx.query.limit) {
        searchParams.append('limit', ctx.query.limit);
      }
      const searchParamsString = searchParams.toString();
      return `${ctx.router.url('posts.index')}${searchParamsString.length ? `?${searchParamsString}` : ''}`;
    },
  });
});

router.get('posts.show', '/:slug', setPostWithAssociations, async (ctx) => {
  const { post } = ctx.state;
  await ctx.render('posts/show', { post });
});

router.post(
  'post.like', '/:slug/likes',
  async (ctx, next) => {
    const { currentUser } = ctx.state;
    const { userId } = ctx.request.body;
    if (!currentUser || (!currentUser.isAdmin() && currentUser.id !== userId)) {
      return ctx.redirect(ctx.session.latestPath);
    }
    Object.assign(ctx.state, { userId });
    return next();
  },
  setPostWithAssociations,
  async (ctx) => {
    const { post, userId } = ctx.state;
    try {
      await ctx.orm.Like.create({
        userId,
        likeable: 'post',
        likeableId: post.id,
      });
    } catch (validationError) {
      ctx.flashMessage.warning = 'Oops, ya te ha gustado esto';
    }

    return ctx.redirect(ctx.session.latestPath);
  },
);

router.del(
  'post.dislike', '/:slug/likes/:userId',
  async (ctx, next) => {
    const { currentUser } = ctx.state;
    const { userId } = ctx.params;
    if (!currentUser || (!currentUser.isAdmin() && currentUser.id !== userId)) {
      return ctx.redirect(ctx.session.latestPath);
    }
    Object.assign(ctx.state, { userId });
    return next();
  },
  setPostWithAssociations,
  async (ctx) => {
    const { post, userId } = ctx.state;
    try {
      await ctx.orm.Like.destroy({
        where: {
          userId,
          likeable: 'post',
          likeableId: post.id,
        },
      });
    } catch (destroyError) {
      ctx.flashMessage.warning = `Ooops, ${destroyError}`;
    }

    return ctx.redirect(ctx.session.latestPath);
  },
);

module.exports = router;

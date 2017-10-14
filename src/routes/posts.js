const KoaRouter = require('koa-router');

const router = new KoaRouter();

// const setPost = async (ctx, next) => {
//   const post = await ctx.orm.Post.findById(ctx.params.id);
//   if (post) {
//     ctx.state.post = post;
//     return next();
//   }
//
//   ctx.flashMessage.notice = `No se encontró el post con id ${ctx.params.id}`;
//   return ctx.redirect(ctx.router.url('admin.posts.index'));
// };

const setPostWithAssociations = async (ctx, next) => {
  const post = await ctx.orm.Post.findPublishedBySlug(ctx.params.slug, {
    include: ['author'],
  });
  if (post) {
    ctx.state.post = post;
    return next();
  }

  const postById = Number.isInteger(Number(ctx.params.slug))
    && await ctx.orm.Post.findById(ctx.params.slug, {
      where: { status: 'published' },
      include: ['author'],
    });
  if (postById) {
    return ctx.redirect(ctx.router.url('posts.show', { slug: postById.slug }));
  }

  ctx.flashMessage.notice = 'No se encontró el post';
  return ctx.redirect(ctx.router.url('posts.index'));
};

router.get('posts.index', '/', async (ctx) => {
  await ctx.render('posts/index', {});
});

router.get('posts.show', '/:slug', setPostWithAssociations, async (ctx) => {
  const { post } = ctx.state;
  await ctx.render('posts/show', { post });
});

module.exports = router;

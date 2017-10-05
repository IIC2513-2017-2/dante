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
  const post = await ctx.orm.Post.findById(ctx.params.id, { include: ['author'] });
  if (post) {
    ctx.state.post = post;
    return next();
  }

  ctx.flashMessage.notice = `No se encontró el post con id ${ctx.params.id}`;
  return ctx.redirect(ctx.router.url('admin.posts.index'));
};

router.get('posts.index', '/', async (ctx) => {
  await ctx.render('posts/index', {});
});

router.get('posts.show', '/:id', setPostWithAssociations, async (ctx) => {
  const { post } = ctx.state;
  await ctx.render('posts/show', { post });
});

module.exports = router;

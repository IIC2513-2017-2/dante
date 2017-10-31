const KoaRouter = require('koa-router');

const router = new KoaRouter();

router.get('index', '/', async (ctx) => {
  const { currentUser } = ctx.state;
  const [latestPost] = (await ctx.orm.Post.findPublishedPaginated(1, 1, {
    include: ['author'],
  })).rows;
  await ctx.render('index', {
    latestPost,
    postLikesPath: (post) => {
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

module.exports = router;

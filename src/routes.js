const KoaRouter = require('koa-router');

const index = require('./routes/index');
const session = require('./routes/session');
const users = require('./routes/users');
const posts = require('./routes/posts');
const admin = require('./routes/admin');

const router = new KoaRouter();

router.use('/', index.routes());
router.use('/session', session.routes());
router.use('/admin', admin.routes());
router.use('/user', users.routes());
router.use('/posts', posts.routes());

router.redirect('/login', router.url('session.new'));

module.exports = router;

const KoaRouter = require('koa-router');

const hello = require('./routes/hello');
const index = require('./routes/index');
const admin = require('./routes/admin');

const router = new KoaRouter();

router.use('/', index.routes());
router.use('/hello', hello.routes());
router.use('/admin', admin.routes());

module.exports = router;

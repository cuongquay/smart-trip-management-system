const koa = require('koa');
const serve = require('koa-static');
const bodyParser = require('koa-bodyparser');
const session = require('koa-session');

const oauthRouter = require('./routers/oauth-router');
const apiRouter = require('./routers/api-router');

const app = new koa();
app.use(serve('public'));

/* app.keys required for signed cookies */
app.keys = [ 'gW8Wgk6jpMUjWx7Q5TCRxaJUC9hcwjxJ' ]; 

app.use(bodyParser());
app.use(session(app));
app.use(async (ctx, next) => {
    ctx.request.session = ctx.session;
    await next();
});

app.use(oauthRouter(app, { 'prefix': '/oauth' }).routes());
app.use(apiRouter(app, { prefix: '/api' }).routes());

app.listen(3000, function(){
    console.log('oauth server listening on port 3000');
});

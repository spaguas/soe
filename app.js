var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
//var elasticClient = require('./backend/elastic-client');
var cors = require('cors')

var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');

var app = express();

// Base path configuration (use BASE_PATH env var, e.g. '/soe')
const rawBasePath = process.env.BASE_PATH || '';
let basePath = rawBasePath.trim();
if (basePath.length > 1) {
  basePath = basePath.replace(/^['"]+|['"]+$/g, '').trim();
}
if (!basePath || basePath === '/') {
  basePath = '/';
} else {
  if (!basePath.startsWith('/')) basePath = '/' + basePath;
  if (basePath.length > 1 && basePath.endsWith('/')) basePath = basePath.slice(0, -1);
}
const assetPrefix = basePath === '/' ? '' : basePath;
const assetPath = (pathname = '/') => {
  if (!pathname) pathname = '/';
  if (!pathname.startsWith('/')) pathname = '/' + pathname;
  return `${assetPrefix}${pathname}` || '/';
};

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.locals.assetPath = assetPath;
app.locals.basePath = assetPrefix;

app.use((req, res, next) => {
  res.locals.assetPath = assetPath;
  res.locals.basePath = assetPrefix;
  next();
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

const baseRouter = express.Router();
baseRouter.use('/', indexRouter);
baseRouter.use('/api', apiRouter);

app.use(basePath, express.static(path.join(__dirname, 'public')));
app.use(basePath, baseRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

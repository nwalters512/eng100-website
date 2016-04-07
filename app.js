var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exbars = require('exbars');
var routes = require('./routes/index');
var blog = require('./routes/blog');
var nunjucks = require('nunjucks');
var markdown = require('nunjucks-markdown');
var marked = require('marked');
var FetchPost = require('./fetch-post');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('connect-livereload')());

app.set('view engine', 'njk');

var env = new nunjucks.Environment(new nunjucks.FileSystemLoader(['markdown', 'templates'], {
  watch: true
}), {
  autoescape: true,
  trimBlocks: true
});

env.express(app);

env.addExtension('FetchPost', new FetchPost(env));

// Add support for rendering markdown
env.addFilter('render_markdown', function(filename) {
  return "It works!";
});

markdown.register(env, marked);

app.use('/', routes);
app.use('/blog', blog);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    var status = err.status || 500;
    res.status(status);
    if(err.status == 404) {
      res.render('404');
    } else {
      res.render('error', {
        message: err.message,
        error: {}
      });
    }
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  var status = err.status || 500;
  res.status(status);
  if(err.status == 404) {
    res.render('404');
  } else {
    res.render('error', {
      message: err.message,
      error: {}
    });
  }
});

module.exports = app;

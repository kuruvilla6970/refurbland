var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var _ = require('underscore');
var mongojs = require('mongojs');

var index = require('./routes/main/index');
var users = require('./routes/admin/users');
var pages = require('./routes/admin/pages');
var deals = require('./routes/admin/deals');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req,res,next){
  // Setup database url to connect to based on enviornment
  var connectionString = null;
  if (app.get("env") === "production") {
    connectionString = process.env.MONGOLAB_URI;
  } else {
    connectionString = "mongodb://localhost/refurbland_dev";
  }
  var db = mongojs(connectionString, ["sites", "pages", "deals", "users"]);

  req.db = db

  // Make base layout rendering available to router
  res.renderPage = function (template, options) {
    options.style = options.style || ("main/" + template);
    res.render("main/base", _.extend(options, {
      "template": template
    }));
  };
  res.renderAdminPage = function (template, options) {
    options.style = options.style || ("admin/" + template);
    res.render("admin/base", _.extend(options, {
      "template": template
    }));
  };

  next();
});

app.use('/', index);
app.use('/admin/users', users);
app.use('/admin/pages', pages);
app.use('/admin/deals', deals);

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
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

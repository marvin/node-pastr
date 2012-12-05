
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , mongo = require('mongoose')
  , http = require('http')
  , path = require('path');

var app = express();

var dburl = "mongodb://mia/pastr";

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser('NCXpUQPG1Ba6iN8jpQOdr8cejgZ5d30C'));
  app.use(express.session());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

mongo.connect(dburl);

var UserSchema = mongo.Schema({
  name: String,
  email: String
}),
  Users = mongo.model('Users', UserSchema);

var PostsSchema = mongo.Schema({
  title: String,
  data: String,
  lang: String
}),
  Post = mongo.model('posts', PostsSchema);

app.get('/', routes.index);

// user index
app.get('/users', function(req, res) {
  Users.find({}, function(err, docs) {
    res.render('users/index', {title: 'Userlist', users: docs });
  });
});

// user new
app.get('/users/new', function(req, res) {
  res.render('users/new', {title: 'New User'});
});

// user create
app.post('/users', function(req, res) {
  r = req.body;
  new Users({
    name: r.name,
    email: r.email
  }).save(function(err, docs) {
    if (err) res.json(err);
    res.redirect('/users/' + docs.name);
  });
});

app.param('name', function(req, res, next, name) {
  Users.find({ name: name}, function(err, docs) {
    req.user = docs[0];
    next();
  });
});

// user show
app.get('/users/:name', function(req, res) {
  res.render('users/show', { user: req.user, title: "Userpage" });
});

// new pastr
app.get('/new', function(req, res) {
  res.render('new', { title: 'New Pastr' });
});

// all pastr
app.get('/all', function(req, res) {
  Post.find({}, function(err, docs) {
    res.render('all', { title: 'All pastr', docs: docs });
  });
});

// pastr create
app.post('/new', function(req, res) {
  r = req.body;
  new Post({
    title: r.title,
    lang: r.lang,
    data: r.data
  }).save(function(err, docs) {
    if (err) res.json(err);
    res.redirect('/show/' + docs._id);
  });
});

http.createServer(app).listen(app.get('port'), function(){
  console.log("node server listening on port " + app.get('port'));
});

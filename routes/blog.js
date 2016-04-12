var blogs = require('./../blogs');

var express = require('express');
var router = express.Router();

var postsLoaded = false;
var posts = [];

/* GET home page. */
router.get('/', function(req, res, next) {
  loadPostsIfNeeded();
  res.render('blog', {posts: posts});
});

router.get('/:year/:month/:day/:title', function(req, res, next) {
  var filename = [req.params.year, req.params.month, req.params.day, req.params.title].join('-') + '.md';
  var post = blogs.loadPostByFilename(filename);
  res.render('post', {post: post});
});

var loadPostsIfNeeded = function() {
  if (postsLoaded) {
    return;
  }

  posts = blogs.loadAllPosts();
  postsLoaded = true;
};

blogs.watchPosts(function(event, fullname) {
  console.log("Posts changed! " + event + " " + fullname);
  postsLoaded = false;
});

module.exports = router;

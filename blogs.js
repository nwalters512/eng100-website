var marked = require('marked');
var fs = require('fs');
var path = require('path');
var fm = require('front-matter');
var nunjucks = require('nunjucks');
var moment = require('moment');
var chokidar = require('chokidar');

exports = module.exports;

var postsPath = __dirname + path.sep + 'markdown' + path.sep + 'blog' + path.sep;
var postFilenameRegexString = '([0-9]{4})-([0-9]{2})-([0-9]{2})-(.{1,})\.md';

var loadPostByFilename = function(filename) {
  return loadPost(postsPath + filename);
}

var loadPost = function(filePath) {
  var filename = path.basename(filePath);
  if (!isValidPostFilename(filename)) {
    throw new Error(filepath + ' is not a valid post file!');
  }

  // Load the post file into memory
  var file = fs.readFileSync(filePath, 'utf8');

  // Parse its contents with the 'front-matter' package
  var content = fm(file);

  // Extract information from the post's file name
  var filename = path.basename(filePath);
  var regex = new RegExp(postFilenameRegexString);
  var matches = regex.exec(filename);
  var year = matches[1];
  var month = matches[2];
  var day = matches[3];
  var name = matches[4];
  var date = [year, month, day].join('-');
  var dateString = moment(date, 'YYYY-MM-DD').format('D MMMM YYYY');

  // Construct the post pbject
  var post = {};
  post.body = new nunjucks.runtime.SafeString(marked(content.body));
  // Copy attributes parsed from the file's YAML into the post object
  for (var k in content.attributes) {
    post[k] = content.attributes[k];
  }
  post.date = date;
  post.dateString = dateString;
  post.url = '/' + ['blog', year, month, day, name].join('/');

  return post;
};

var isValidPostFilename = function(filename) {
  return new RegExp(postFilenameRegexString).test(filename);
};

var loadAllPosts = function() {
  var files = fs.readdirSync(postsPath);
  var posts = [];
  for (var i = 0; i < files.length; i++) {
    if (isValidPostFilename(files[i])) {
      posts.push(loadPostByFilename(files[i]));
    }
  }

  // Sort in reverse chronological order
  posts.reverse();

  return posts;
};

var watchPosts = function(callback) {
  var watcher = chokidar.watch(postsPath, {
    ignoreInitial: true
  });
  watcher.on('all', function(event, fullname) {
    callback(event, fullname);
  });
};

exports.loadPost = loadPost;
exports.loadPostByFilename = loadPostByFilename;
exports.loadAllPosts = loadAllPosts;
exports.watchPosts = watchPosts;

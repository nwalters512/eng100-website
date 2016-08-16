var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/about-site', function(req, res, next) {
  res.render('markdown', {file: 'about-site.md'});
});

router.get('/contact', function(req, res, next) {
  res.render('contact');
});

router.get('/projects', function(req, res, next) {
  res.render('projects');
});

router.get('/projects/:name', function(req, res, next) {
  res.render('projects/' + req.params.name);
})

module.exports = router;

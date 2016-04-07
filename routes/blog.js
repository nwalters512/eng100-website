var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.get('/:year/:month/:day/:title', function(req, res, next) {
  var filename = [req.params.year, req.params.month, req.params.day, req.params.title].join('-') + '.md';
  var file = '/markdown/blog/' + filename;
  res.render('post', {file: file});
});

module.exports = router;

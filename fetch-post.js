module.exports = FetchPost;

var marked = require('marked');
var fs = require('fs');
var path = require('path');
var fm = require('front-matter');
var nunjucks = require('nunjucks');
var moment = require('moment');

function FetchPost(env) {
    this.tags = ['post'];

    this.parse = function(parser, nodes) {
        // get the tag token
        var tok = parser.nextToken();

        // parse the args and move after the block end. passing true
        // as the second arg is required if there are no parentheses
        var args = parser.parseSignature(null, true);
        parser.advanceAfterBlockEnd(tok.value);

        return new nodes.CallExtension(this, 'run', args);
    };

    this.run = function(context, path) {
      try {
        var file = fs.readFileSync(__dirname + path, 'utf8');
        var content = fm(file);

        var pathSegs = path.split(path.sep);
        var filename = pathSegs[pathSegs.length - 1];

        var filenameSegs = filename.split('-');
        var dateString = moment(filenameSegs[0] + '-' + filenameSegs[1] + '-' + filenameSegs[2], 'YYYY-MM-DD').format('D MMMM YYYY');

        var post = {};
        post.body = new nunjucks.runtime.SafeString(marked(content.body));
        post.attrs = content.attributes;
        post.attrs.dateString = dateString;

        context.ctx['post'] = post;
      } catch (err) {
        console.log(err.stack);
      }
    };
};

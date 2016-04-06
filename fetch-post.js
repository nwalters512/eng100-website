module.exports = FetchPost;

var marked = require('marked');
var fs = require('fs');
var fm = require('front-matter');
var nunjucks = require('nunjucks');

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

    this.run = function(context, filename) {
      try {
        var file = fs.readFileSync(__dirname + filename, 'utf8');
        var content = fm(file);

        var post = {};
        post.body = new nunjucks.runtime.SafeString(marked(content.body));
        post.attrs = content.attributes;

        context.ctx['post'] = post;
      } catch (err) {
        console.log(err.stack);
      }
    };
};

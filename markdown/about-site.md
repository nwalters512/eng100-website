# About this site

This site is a node.js app running on Amazon Elastic Beanstalk. It uses the
express.js app framework for routing and some other stuff. Nunjucks is the view
engine of choice; its powerful template inheritance system and extensibility
make it both easy and fun to use.

The blog portion of this site is modelled after Jekyll: all posts are stored as
text files (I write them with markdown) and contain YAML "front matter". When a
blog page is requested, I use a nunjucks extension to load the appropriate
markdown source file, parse the YAML into an object, parse the markdown body
into HTML. All of that is then rendered into the page with nunjucks.

This sounds pretty much like a static site with a blog; why not just save
yourself the effort and use GitHub Pages, you might ask. Well, I wanted to gain
some experience with web development, and I wouldn't have gotten that if I had
used an out-of-the-box solution.

Here's a list of all the different things I used to build this site:

 - [AWS Elastic Beanstalk](https://aws.amazon.com/elasticbeanstalk/): for hosting
 - [node.js](https://nodejs.org): the website's runtime
 - [express.js](http://expressjs.com/): for the app framework
 - [nunjucks](https://mozilla.github.io/nunjucks/): for view templating
 - [nunjucks-markdown](https://github.com/zephraph/nunjucks-markdown): for using markdown in nunjucks
 - [marked](https://github.com/chjj/marked): for compiling and parsing markdown
 - [front-matter](https://github.com/jxson/front-matter): for parsing YAML front matter
 - [bootstrap-material-design](https://github.com/FezVrasta/bootstrap-material-design): for making everything pretty

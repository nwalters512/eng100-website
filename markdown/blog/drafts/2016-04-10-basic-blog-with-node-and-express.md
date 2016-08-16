---
title: Building a basic blog with node.js and express
description: How I built a basic blog for my site by cobbling together some open web technologies
---

I recently embarked on a journey to redesign my personal website. I could easily have used a tool like [Jekyll](https://jekyllrb.com/) to build my site: my site is mostly static, which is exactly what Jekyll is designed for. However, as I mention on the ["About this site" page](/about-site), I wanted to build the site from the ground up to gain more experience with web programming.

Eventually, I wanted to get my site set up with a blogging system. I could have gone the traditional CMS route, but it turns out that Jekyll provides a perfect model for me to build off of. In Jekyll, all blog posts are written as files that describe themselves, including titles, descriptions, tags, post date, and URL. Because posts are stored as simple text files, I don't have to go through the effort of setting up database and a full-fledged CMS system. Additionally, by borrowing ideas from Jekyll, it would be easy to switch to a Jekyll-powered site in the future if I ever get tired of hosting my own site.

There are four major components to the system I ended up building: storing posts, reading posts, rendering posts, and rendering a list of posts. I'll address each component in the following sections, and then talk about how I could still improve my work.

# Storing posts
Each individual blog post is stored as a text file with two components: a section of YAML metadata (called front matter) and a block of content formatted with Markdown that can also include arbitrary HTML content. The posts can have YAML-formatted "front matter" that acts as metadata about the post: a title, description, set of tags, and so on.

The names of the files are significant: they describe posts' date and url. For instance, a file named `2016-04-10-hello-world.md` could produce a link like `example.com/blog/2016/04/10/hello-world`.

Here is an example of a "hello world" post. It includes a title, description, and some content.

```html
---
title: Hello, world!
description: This is a Jekyll-style blog post
---

Here is some content! It can include **markdown** formatting.
```

Posts can be stored in an arbitrary directory, but they should all be located at the same level in the same directory to keep things simple. Here's what my directory structure looks like:

```
markdown/
├── about-site.md
├── other-markdown-files.md
└── blog
    ├── 2016-04-06-hello-world.md
    └── 2016-04-10-basic-blog-with-node-and-express.md

```

# Reading posts

To do anything useful with these files, we have to read them into memory and parse them into useful information we will eventually use to render blog posts when they are requested.

# Potential for enhancements
The system I designed works well for a relatively small number of blog posts. However, it probably won't scale well for very large numbers of posts. Recall that all the posts are held in memory.

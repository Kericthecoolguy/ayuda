'use strict';

/**
 * Module dependencies.
 */
var articlesPolicy = require('../policies/posts.server.policy'),
  posts = require('../controllers/posts.server.controller');

module.exports = function (app) {
  // Posts collection routes
  app.route('/api/posts').all(articlesPolicy.isAllowed)
    .get(posts.list)
    .post(posts.create);

  // Single post routes
  app.route('/api/posts/:articleId').all(articlesPolicy.isAllowed)
    .get(posts.read)
    .put(posts.update)
    .delete(posts.delete);

  // Finish by binding the post middleware
  app.param('articleId', posts.articleByID);
};

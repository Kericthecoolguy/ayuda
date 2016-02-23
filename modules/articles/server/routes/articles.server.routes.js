'use strict';

/**
 * Module dependencies.
 */
var articlesPolicy = require('../policies/articles.server.policy'),
  articles = require('../controllers/articles.server.controller');

module.exports = function (app) {
  // Articles collection routes
  app.route('/api/articles').all(articlesPolicy.isAllowed)
    .get(articles.list)
    .post(articles.create);

  // Single article routes
  app.route('/api/articles/:articleId').all(articlesPolicy.isAllowed)
    .get(articles.read)
    .put(articles.update)
    .delete(articles.delete);

  // Upvote route
  app.route('/api/articles/upvote')
    .put(articles.upvote);

  // Comment route
  app.route('/api/articles/comment')
    .post(articles.addComment);
  

  // Finish by binding the article middleware
  app.param('articleId', articles.articleByID);
};

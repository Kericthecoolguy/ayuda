'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Article = mongoose.model('Article'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Create a article
 */
exports.create = function (req, res) {
  var article = new Article(req.body);
  article.user = req.user;

  article.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};

/** 
  * Upvote a article
  */
exports.upvote = function(req, res, next) {
  req.article.upvote(function(err, article) {
    if (err) {return next(err); }

    res.json(article);
  });
};

/** 
  * Add a comment
  */
exports.addComment = function(req, res, next) {
  var comment = new Comment(req.body);
  comment.article = req.article;

  comment.save(function(err, comment) {
    if (err) { return next(err); }

    req.article.comments.push(comment);
    req.article.save(function(err, article) {
      if(err) { return next(err); }

      res.json(comment);
    });
  });
};

/**
 * Show the current article
 */
exports.read = function (req, res) {
  res.json(req.article);
};

/**
 * Update a article
 */
exports.update = function (req, res) {
  var article = req.article;

  article.title = req.body.title;
  article.content = req.body.content;
  article.upvotes = req.body.upvotes;
  article.comments = req.body.comments;

  article.save(function (err) {
    if (err) {
      console.log(errorHandler.getErrorMessage(err));
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};

/**
 * Delete an article
 */
exports.delete = function (req, res) {
  var article = req.article;

  article.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};

/**
 * List of Articles
 */
exports.list = function (req, res) {
  Article.find().sort('-created').populate('user', 'displayName').exec(function (err, articles) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(articles);
    }
  });
};

/**
 * Article middleware
 */
exports.articleByID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Article is invalid'
    });
  }

  Article.findById(id).populate('user', 'displayName').exec(function (err, article) {
    if (err) {
      return next(err);
    } else if (!article) {
      return res.status(404).send({
        message: 'No article with that identifier has been found'
      });
    }
    req.article = article;
    next();
  });
};

'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Article Schema
 */
var ArticleSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    default: '',
    trim: true,
    required: 'Title cannot be blank'
  },
  content: {
    type: String,
    default: '',
    trim: true
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  upvotes: {
    type: Number,
    default: 0 
  },
  comments: ['Comment']
  /*comments: [{
      //type: mongoose.Schema.Types.ObjectId,
      //type: Schema.Types.ObjectId,
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }]*/
});

ArticleSchema.methods.upvote = function(cb) {
  this.upvotes += 1;
  this.save(cb);
};

/**
  * Comment Schema
  */

var CommentSchema = new Schema({
  body: {
    String
  },
  author: {
    String
  },
  upvotes: {
    type: Number, 
    default: 0
  },
  article: { 
    //type: mongoose.Schema.Types.ObjectId,
    type: Schema.ObjectId,
    ref: 'Article'
  }
});

mongoose.model('Comment', CommentSchema);
mongoose.model('Article', ArticleSchema);


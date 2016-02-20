'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Post = mongoose.model('Post'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app, agent, credentials, user, post;

/**
 * Post routes tests
 */
describe('Post CRUD tests', function () {
  before(function (done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function (done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'password'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new post
    user.save(function () {
      post = {
        title: 'Post Title',
        content: 'Post Content'
      };

      done();
    });
  });

  it('should be able to save an post if logged in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new post
        agent.post('/api/posts')
          .send(post)
          .expect(200)
          .end(function (articleSaveErr, articleSaveRes) {
            // Handle post save error
            if (articleSaveErr) {
              return done(articleSaveErr);
            }

            // Get a list of posts
            agent.get('/api/posts')
              .end(function (articlesGetErr, articlesGetRes) {
                // Handle post save error
                if (articlesGetErr) {
                  return done(articlesGetErr);
                }

                // Get posts list
                var posts = articlesGetRes.body;

                // Set assertions
                (posts[0].user._id).should.equal(userId);
                (posts[0].title).should.match('Post Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an post if not logged in', function (done) {
    agent.post('/api/posts')
      .send(post)
      .expect(403)
      .end(function (articleSaveErr, articleSaveRes) {
        // Call the assertion callback
        done(articleSaveErr);
      });
  });

  it('should not be able to save an post if no title is provided', function (done) {
    // Invalidate title field
    post.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new post
        agent.post('/api/posts')
          .send(post)
          .expect(400)
          .end(function (articleSaveErr, articleSaveRes) {
            // Set message assertion
            (articleSaveRes.body.message).should.match('Title cannot be blank');

            // Handle post save error
            done(articleSaveErr);
          });
      });
  });

  it('should be able to update an post if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new post
        agent.post('/api/posts')
          .send(post)
          .expect(200)
          .end(function (articleSaveErr, articleSaveRes) {
            // Handle post save error
            if (articleSaveErr) {
              return done(articleSaveErr);
            }

            // Update post title
            post.title = 'WHY YOU GOTTA BE SO MEAN?';

            // Update an existing post
            agent.put('/api/posts/' + articleSaveRes.body._id)
              .send(post)
              .expect(200)
              .end(function (articleUpdateErr, articleUpdateRes) {
                // Handle post update error
                if (articleUpdateErr) {
                  return done(articleUpdateErr);
                }

                // Set assertions
                (articleUpdateRes.body._id).should.equal(articleSaveRes.body._id);
                (articleUpdateRes.body.title).should.match('WHY YOU GOTTA BE SO MEAN?');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should be able to get a list of posts if not signed in', function (done) {
    // Create new post model instance
    var articleObj = new Post(post);

    // Save the post
    articleObj.save(function () {
      // Request posts
      request(app).get('/api/posts')
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Array).and.have.lengthOf(1);

          // Call the assertion callback
          done();
        });

    });
  });

  it('should be able to get a single post if not signed in', function (done) {
    // Create new post model instance
    var articleObj = new Post(post);

    // Save the post
    articleObj.save(function () {
      request(app).get('/api/posts/' + articleObj._id)
        .end(function (req, res) {
          // Set assertion
          res.body.should.be.instanceof(Object).and.have.property('title', post.title);

          // Call the assertion callback
          done();
        });
    });
  });

  it('should return proper error for single post with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/posts/test')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Post is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single post which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent post
    request(app).get('/api/posts/559e9cd815f80b4c256a8f41')
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No post with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to delete an post if signed in', function (done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function (signinErr, signinRes) {
        // Handle signin error
        if (signinErr) {
          return done(signinErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new post
        agent.post('/api/posts')
          .send(post)
          .expect(200)
          .end(function (articleSaveErr, articleSaveRes) {
            // Handle post save error
            if (articleSaveErr) {
              return done(articleSaveErr);
            }

            // Delete an existing post
            agent.delete('/api/posts/' + articleSaveRes.body._id)
              .send(post)
              .expect(200)
              .end(function (articleDeleteErr, articleDeleteRes) {
                // Handle post error error
                if (articleDeleteErr) {
                  return done(articleDeleteErr);
                }

                // Set assertions
                (articleDeleteRes.body._id).should.equal(articleSaveRes.body._id);

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to delete an post if not signed in', function (done) {
    // Set post user
    post.user = user;

    // Create new post model instance
    var articleObj = new Post(post);

    // Save the post
    articleObj.save(function () {
      // Try deleting post
      request(app).delete('/api/posts/' + articleObj._id)
        .expect(403)
        .end(function (articleDeleteErr, articleDeleteRes) {
          // Set message assertion
          (articleDeleteRes.body.message).should.match('User is not authorized');

          // Handle post error error
          done(articleDeleteErr);
        });

    });
  });

  afterEach(function (done) {
    User.remove().exec(function () {
      Post.remove().exec(done);
    });
  });
});

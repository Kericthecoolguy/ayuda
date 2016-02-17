'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  config = require(path.resolve('./config/config')),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  mongoose = require('mongoose'),
  passport = require('passport'),
  //postmark = require('postmark'),
  nodemailer = require('nodemailer'),
  async = require('async'),
  User = mongoose.model('User');

// URLs for which user can't be redirected on signin
var noReturnUrls = [
	'/authentication/signin',
	'/authentication/signup'
];

// Postmark client
//var client = new postmark.Client('38979fc3-da62-41c7-964c-b5e2c1d96fb8');
// Nodemailer
var smtpTransport = nodemailer.createTransport('smtps://drexelayuda%40gmail.com:Ayuda2016@smtp.gmail.com');



/**
 * forgotUsername
 */

exports.forgotUsername = function(req, res) {

  if(req.body.email) {
    User.findOne({
      email: req.body.email
    }, function (err, user) {
      if(!user) {
        return res.status(400).send({
          message: 'No account with that email has been found'
        });
      } else {
        var mailOptions = {
          from: 'drexelayuda <drexelayuda@gmail.com>',
          to: user.email,
          subject: 'Username recovery',
          text: 'Hi ' + user.displayName + ', ' +
          'your username for your Ayuda account is: ' + user.username + '.'
        };

        smtpTransport.sendMail(mailOptions, function(error, info) {
          if(error){
            return res.status(400).send({
              message: 'Error sending email'
            });
          }
          res.send({
            message: 'Username sent to email'
          });
        });




      }
    });
  } else {
    return res.status(400).send({
      message: 'Please enter a valid drexel email address'
    });
  }


};

  /*var mailOptions = {
    from: 'drexelayuda <drexelayuda@gmail.com>',
    to: user.username,
    subject: 'Username recovery',
    text: 'This is where username will go'
  };
};*/

/*exports.forgotUsername = function(req, res, next) {
  async.waterfall([
    function (done) {
      if (req.body.email) {
        User.findOne({
          email: req.body.email
        }, function (err, user) {
          if (!user) {
            return res.status(400).send({
              message: 'No account with that email has been found'
            });
          }
        });
      } else {
        return res.status(400).send({
          message: 'Username field must not be blank'
        });
      }
    },
    function(user, done){
      res.render(path.resolve('modules/users/server/templates/forgotUsername.html'), {
        name: user.displayName,
        username: user.username,
        appName: config.app.title,
        url: 'http://drexel-ayuda.herokuapp.com/authentication/signin'
      }, function(err, emailHTML) {
        done(err, emailHTML, user);
      });
    },
    // If valid email, send username email using service
    function(emailHTML, user, done) {
      var mailOptions = {
        to: user.email,
        from: config.mailer.from,
        subject: 'Password Reset',
        html: emailHTML
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        if (!err) {
          res.send({
            message: 'An email has been sent to the provided email with your username.'
          });
        } else {
          return res.status(400).send({
            message: 'Failure sending email'
          });
        }

        done(err);
      });
    }
  ], function(err) {
    if (err) {
      return next(err);
    }
    });
};*/

  //res.json(user);

  /*client.sendEmail({
    'From': 'donotreply@ayuda.com',
    'To': user.email,
    'Subject': 'Username Recovery',
    'TextBody': 'username would go here!'
  }), function(error, success) {
    if (error) {
      console.error('Unable to send via postmark: ' + error.message);
      return res.status(400).send({
        message: error.message
      });
    } else {
      console.info('Sent to postmark for delivery');
    }
  };

  // BELOW HAS THE ERROR!
  /*user.findOne({email: user.email}, function(err, obj) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
    });
    } else {
      var username = obj.username;
      var email = obj.email;

      client.sendEmail({
        "From": "donotreply@ayuda.com",
        "To": email,
        "Subject": "Username Recovery",
        "TextBody": username
      });
    }
  });*/

/**
 * Signup
 */
exports.signup = function (req, res) {
  // For security measurement we remove the roles from the req.body object
  delete req.body.roles;

  // Init Variables
  var user = new User(req.body);
  var message = null;

  // Add missing user fields
  user.provider = 'local';
  user.displayName = user.firstName + ' ' + user.lastName;

  // Then save the user
  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;

      req.login(user, function (err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.json(user);
        }
      });
    }
  });
};

/**
 * Signin after passport authentication
 */
exports.signin = function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    if (err || !user) {
      res.status(400).send(info);
    } else {
      // Remove sensitive data before login
      user.password = undefined;
      user.salt = undefined;

      req.login(user, function (err) {
        if (err) {
          res.status(400).send(err);
        } else {
          res.json(user);
        }
      });
    }
  })(req, res, next);
};

/**
 * Signout
 */
exports.signout = function (req, res) {
  req.logout();
  res.redirect('/');
};



/**
 * OAuth provider call
 */
exports.oauthCall = function (strategy, scope) {
  return function (req, res, next) {
    // Set redirection path on session.
    // Do not redirect to a signin or signup page
    if (noReturnUrls.indexOf(req.query.redirect_to) === -1) {
      req.session.redirect_to = req.query.redirect_to;
    }
    // Authenticate
    passport.authenticate(strategy, scope)(req, res, next);
  };
};

/**
 * OAuth callback
 */
exports.oauthCallback = function (strategy) {
  return function (req, res, next) {
    // Pop redirect URL from session
    var sessionRedirectURL = req.session.redirect_to;
    delete req.session.redirect_to;

    passport.authenticate(strategy, function (err, user, redirectURL) {
      if (err) {
        return res.redirect('/authentication/signin?err=' + encodeURIComponent(errorHandler.getErrorMessage(err)));
      }
      if (!user) {
        return res.redirect('/authentication/signin');
      }
      req.login(user, function (err) {
        if (err) {
          return res.redirect('/authentication/signin');
        }

        return res.redirect(redirectURL || sessionRedirectURL || '/');
      });
    })(req, res, next);
  };
};

/**
 * Helper function to save or update a OAuth user profile
 */
exports.saveOAuthUserProfile = function (req, providerUserProfile, done) {
  if (!req.user) {
    // Define a search query fields
    var searchMainProviderIdentifierField = 'providerData.' + providerUserProfile.providerIdentifierField;
    var searchAdditionalProviderIdentifierField = 'additionalProvidersData.' + providerUserProfile.provider + '.' + providerUserProfile.providerIdentifierField;

    // Define main provider search query
    var mainProviderSearchQuery = {};
    mainProviderSearchQuery.provider = providerUserProfile.provider;
    mainProviderSearchQuery[searchMainProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define additional provider search query
    var additionalProviderSearchQuery = {};
    additionalProviderSearchQuery[searchAdditionalProviderIdentifierField] = providerUserProfile.providerData[providerUserProfile.providerIdentifierField];

    // Define a search query to find existing user with current provider profile
    var searchQuery = {
      $or: [mainProviderSearchQuery, additionalProviderSearchQuery]
    };

    User.findOne(searchQuery, function (err, user) {
      if (err) {
        return done(err);
      } else {
        if (!user) {
          var possibleUsername = providerUserProfile.username || ((providerUserProfile.email) ? providerUserProfile.email.split('@')[0] : '');

          User.findUniqueUsername(possibleUsername, null, function (availableUsername) {
            user = new User({
              firstName: providerUserProfile.firstName,
              lastName: providerUserProfile.lastName,
              username: availableUsername,
              displayName: providerUserProfile.displayName,
              email: providerUserProfile.email,
              profileImageURL: providerUserProfile.profileImageURL,
              provider: providerUserProfile.provider,
              providerData: providerUserProfile.providerData
            });

            // And save the user
            user.save(function (err) {
              return done(err, user);
            });
          });
        } else {
          return done(err, user);
        }
      }
    });
  } else {
    // User is already logged in, join the provider data to the existing user
    var user = req.user;

    // Check if user exists, is not signed in using this provider, and doesn't have that provider data already configured
    if (user.provider !== providerUserProfile.provider && (!user.additionalProvidersData || !user.additionalProvidersData[providerUserProfile.provider])) {
      // Add the provider data to the additional provider data field
      if (!user.additionalProvidersData) {
        user.additionalProvidersData = {};
      }

      user.additionalProvidersData[providerUserProfile.provider] = providerUserProfile.providerData;

      // Then tell mongoose that we've updated the additionalProvidersData field
      user.markModified('additionalProvidersData');

      // And save the user
      user.save(function (err) {
        return done(err, user, '/settings/accounts');
      });
    } else {
      return done(new Error('User is already connected using this provider'), user);
    }
  }
};

/**
 * Remove OAuth provider
 */
exports.removeOAuthProvider = function (req, res, next) {
  var user = req.user;
  var provider = req.query.provider;

  if (!user) {
    return res.status(401).json({
      message: 'User is not authenticated'
    });
  } else if (!provider) {
    return res.status(400).send();
  }

  // Delete the additional provider
  if (user.additionalProvidersData[provider]) {
    delete user.additionalProvidersData[provider];

    // Then tell mongoose that we've updated the additionalProvidersData field
    user.markModified('additionalProvidersData');
  }

  user.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      req.login(user, function (err) {
        if (err) {
          return res.status(400).send(err);
        } else {
          return res.json(user);
        }
      });
    }
  });
};

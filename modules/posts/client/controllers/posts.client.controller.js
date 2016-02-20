'use strict';

// Posts controller
angular.module('posts').controller('ArticlesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Posts',
  function ($scope, $stateParams, $location, Authentication, Posts) {
    $scope.authentication = Authentication;

    // Create new Post
    $scope.create = function () {
      // Create new Post object
      var post = new Posts({
        title: this.title,
        content: this.content
      });

      // Redirect after save
      post.$save(function (response) {
        $location.path('posts/' + response._id);

        // Clear form fields
        $scope.title = '';
        $scope.content = '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Post
    $scope.remove = function (post) {
      if (post) {
        post.$remove();

        for (var i in $scope.posts) {
          if ($scope.posts[i] === post) {
            $scope.posts.splice(i, 1);
          }
        }
      } else {
        $scope.post.$remove(function () {
          $location.path('posts');
        });
      }
    };

    // Update existing Post
    $scope.update = function () {
      var post = $scope.post;

      post.$update(function () {
        $location.path('posts/' + post._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Upvote
    $scope.upvote = function(post) {
      post.upvotes += 1;
    };

    $scope.addComment = function() {
      if($scope.body === '') { return; }
      $scope.post.comments.push({
        body: $scope.body,
        author: 'user', 
        upvotes: 0
      });
      $scope.body = '';
    };

    // Find a list of Posts
    $scope.find = function () {
      $scope.posts = Posts.query();
    };

    // Find existing Post
    $scope.findOne = function () {
      $scope.post = Posts.get({
        articleId: $stateParams.articleId
      });
    };
  }
]);

'use strict';

// Setting up route
angular.module('posts').config(['$stateProvider',
  function ($stateProvider) {
    // Posts state routing
    $stateProvider
      .state('posts', {
        abstract: true,
        url: '/posts',
        template: '<ui-view/>',
        data: {
          roles: ['user', 'admin']
        }
      })
      .state('posts.list', {
        url: '',
        templateUrl: 'modules/posts/views/list-posts.client.view.html'
      })
      .state('posts.create', {
        url: '/create',
        templateUrl: 'modules/posts/views/create-post.client.view.html'
      })
      .state('posts.view', {
        url: '/:articleId',
        templateUrl: 'modules/posts/views/view-post.client.view.html'
      })
      .state('posts.edit', {
        url: '/:articleId/edit',
        templateUrl: 'modules/posts/views/edit-post.client.view.html'
      });
  }
]);

'use strict';

angular.module('core').controller('UserHomeController', ['$scope', '$state', 'Authentication', 'userResolve', 'Users',
  function ($scope, $state, Authentication, userResolve, Users) {
    $scope.authentication = Authentication;
    $scope.user = userResolve;

  }
]);
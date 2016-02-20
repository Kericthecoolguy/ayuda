'use strict';

angular.module('users').controller('DeleteAccountController', ['$scope', '$state', '$http', '$location', 'userResolve', 'Users', 'Authentication',
  function ($scope, $state, $http, $location, Users, Authentication, userResolve) {
    //$scope.user = Authentication.user;
    //$scope.authentication = Authentication;
    //$scope.user = userResolve;

    $scope.remove = function (user) {
      if (confirm('Are you sure you want to delete your account?')) {
        if (user) {
          user.$remove();
          $state.go('authentication.signup');
        } else {
          $scope.user.$remove(function () {
            $state.go('authentication.signup');
          });
        }
      }
    };


    //= Update a user profile
    /*$scope.updateUserProfile = function (isValid) {
      if (isValid) {
        $scope.success = $scope.error = null;
        var user = new Users($scope.user);

        user.$update(function (response) {
          $scope.success = true;
          Authentication.user = response;
        }, function (response) {
          $scope.error = response.data.message;
        });
      } else {
        $scope.submitted = true;
      }
    };*/
  }
]);

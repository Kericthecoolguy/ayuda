'use strict';

(function () {
  // Posts Controller Spec
  describe('Posts Controller Tests', function () {
    // Initialize global variables
    var ArticlesController,
      scope,
      $httpBackend,
      $stateParams,
      $location,
      Authentication,
      Posts,
      mockArticle;

    // The $resource service augments the response object with methods for updating and deleting the resource.
    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
    // the responses exactly. To solve the problem, we define a new toEqualData Jasmine matcher.
    // When the toEqualData matcher compares two objects, it takes only object properties into
    // account and ignores methods.
    beforeEach(function () {
      jasmine.addMatchers({
        toEqualData: function (util, customEqualityTesters) {
          return {
            compare: function (actual, expected) {
              return {
                pass: angular.equals(actual, expected)
              };
            }
          };
        }
      });
    });

    // Then we can start by loading the main application module
    beforeEach(module(ApplicationConfiguration.applicationModuleName));

    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
    // This allows us to inject a service but then attach it to a variable
    // with the same name as the service.
    beforeEach(inject(function ($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_, _Authentication_, _Articles_) {
      // Set a new global scope
      scope = $rootScope.$new();

      // Point global variables to injected services
      $stateParams = _$stateParams_;
      $httpBackend = _$httpBackend_;
      $location = _$location_;
      Authentication = _Authentication_;
      Posts = _Articles_;

      // create mock post
      mockArticle = new Posts({
        _id: '525a8422f6d0f87f0e407a33',
        title: 'An Post about MEAN',
        content: 'MEAN rocks!'
      });

      // Mock logged in user
      Authentication.user = {
        roles: ['user']
      };

      // Initialize the Posts controller.
      ArticlesController = $controller('ArticlesController', {
        $scope: scope
      });
    }));

    it('$scope.find() should create an array with at least one post object fetched from XHR', inject(function (Posts) {
      // Create a sample posts array that includes the new post
      var sampleArticles = [mockArticle];

      // Set GET response
      $httpBackend.expectGET('api/posts').respond(sampleArticles);

      // Run controller functionality
      scope.find();
      $httpBackend.flush();

      // Test scope value
      expect(scope.posts).toEqualData(sampleArticles);
    }));

    it('$scope.findOne() should create an array with one post object fetched from XHR using a articleId URL parameter', inject(function (Posts) {
      // Set the URL parameter
      $stateParams.articleId = mockArticle._id;

      // Set GET response
      $httpBackend.expectGET(/api\/posts\/([0-9a-fA-F]{24})$/).respond(mockArticle);

      // Run controller functionality
      scope.findOne();
      $httpBackend.flush();

      // Test scope value
      expect(scope.post).toEqualData(mockArticle);
    }));

    describe('$scope.craete()', function () {
      var sampleArticlePostData;

      beforeEach(function () {
        // Create a sample post object
        sampleArticlePostData = new Posts({
          title: 'An Post about MEAN',
          content: 'MEAN rocks!'
        });

        // Fixture mock form input values
        scope.title = 'An Post about MEAN';
        scope.content = 'MEAN rocks!';

        spyOn($location, 'path');
      });

      it('should send a POST request with the form input values and then locate to new object URL', inject(function (Posts) {
        // Set POST response
        $httpBackend.expectPOST('api/posts', sampleArticlePostData).respond(mockArticle);

        // Run controller functionality
        scope.create();
        $httpBackend.flush();

        // Test form inputs are reset
        expect(scope.title).toEqual('');
        expect(scope.content).toEqual('');

        // Test URL redirection after the post was created
        expect($location.path.calls.mostRecent().args[0]).toBe('posts/' + mockArticle._id);
      }));

      it('should set scope.error if save error', function () {
        var errorMessage = 'this is an error message';
        $httpBackend.expectPOST('api/posts', sampleArticlePostData).respond(400, {
          message: errorMessage
        });

        scope.create();
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      });
    });

    describe('$scope.update()', function () {
      beforeEach(function () {
        // Mock post in scope
        scope.post = mockArticle;
      });

      it('should update a valid post', inject(function (Posts) {
        // Set PUT response
        $httpBackend.expectPUT(/api\/posts\/([0-9a-fA-F]{24})$/).respond();

        // Run controller functionality
        scope.update();
        $httpBackend.flush();

        // Test URL location to new object
        expect($location.path()).toBe('/posts/' + mockArticle._id);
      }));

      it('should set scope.error to error response message', inject(function (Posts) {
        var errorMessage = 'error';
        $httpBackend.expectPUT(/api\/posts\/([0-9a-fA-F]{24})$/).respond(400, {
          message: errorMessage
        });

        scope.update();
        $httpBackend.flush();

        expect(scope.error).toBe(errorMessage);
      }));
    });

    describe('$scope.remove(post)', function () {
      beforeEach(function () {
        // Create new posts array and include the post
        scope.posts = [mockArticle, {}];

        // Set expected DELETE response
        $httpBackend.expectDELETE(/api\/posts\/([0-9a-fA-F]{24})$/).respond(204);

        // Run controller functionality
        scope.remove(mockArticle);
      });

      it('should send a DELETE request with a valid articleId and remove the post from the scope', inject(function (Posts) {
        expect(scope.posts.length).toBe(1);
      }));
    });

    describe('scope.remove()', function () {
      beforeEach(function () {
        spyOn($location, 'path');
        scope.post = mockArticle;

        $httpBackend.expectDELETE(/api\/posts\/([0-9a-fA-F]{24})$/).respond(204);

        scope.remove();
        $httpBackend.flush();
      });

      it('should redirect to posts', function () {
        expect($location.path).toHaveBeenCalledWith('posts');
      });
    });
  });
}());

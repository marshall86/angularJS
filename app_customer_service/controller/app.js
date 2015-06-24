'use strict';

var app = angular.module('app', [
  	'ngRoute',
  	'app.faqCtrl',	
  	'app.directives',
    'app.factory'
]);

app.config(['$locationProvider','$routeProvider', function($locationProvider, $routeProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider.
        when('/:sez?/:qid?', {
            templateUrl: baseUrl + '/js/app_customer_service/partials/faq.html',
            controller: 'mainCtrl'
        }).
        otherwise({
            redirectTo: '/'
        });
    $locationProvider.html5Mode(true);
}])
.run(['$rootScope', '$window', '$location', '$route', function($root, $window, $location, $route) {

    var originalPath = $location.path;

    $location.path = function (path, preventDefault) {
      if (preventDefault) {
        var lastRoute = $route.current;
        var un = $root.$on('$locationChangeSuccess', function () {
          $route.current = lastRoute;
          un();
        });
      }

      return originalPath.apply($location, [path]);
    };

    $window.addEventListener('load', function() {
      FastClick.attach(document.body);
    }, false);

  }]);
'use strict';

		angular.module('app.factory', [])

    .factory('shopItemsLibrary', ['API', function (API) {
        return {

          get: function(page, show, tag, order) {
		          var url = adminUrl + "admin_devel/get_shop_items/";
		          return API.get(url, {
									"show"  :  show == 0 || show == 1 ? show : '',
									"tag"   :  tag,
									"start" :  page ? page : 1,
				          "order" :  order
		          }, true);
          },
          post: function(data){
          },
          del: function(id) {
          },
          save: function(movie) {
          }

        };
    }])

		.factory('getTags', ['API', function (API) {
				return {
						get: function(id) {
								return API.get(adminUrl + 'admin_devel/getTags/', {"id" : id}, true);
						}
				};
		}])

		.factory('APICache', ['$cacheFactory', function ($cacheFactory) {
				return $cacheFactory('myCache', {capacity:20});
		}])

		.factory('isJson', [function () {
				return {
						test: function (c) {
								if (typeof c == 'object')
										c = JSON.stringify(c);

								try {
										var p = JSON.parse(c);

										if (p && typeof p == 'object')
												return true;
								} catch (e) {
										// no json
								}

								return false;
						}
				}
		}])

		.factory('API', ['$http', 'APICache', function($http, APICache) {

				return {
						get: function(url, params, cache) {
								var promise = $http({
										method: 'GET',
										cache:  cache ? APICache : false,
										url:    url,
										params: params
								})
										.success(function(data) {
												return data;
										})
										.error(function() {
												return false;
										});
								return promise;
						},
						post: function(url, data) {
								var promise = $http({
										method:           'POST',
										url:              url,
										data:             data,
										withCredentials:  true
								})
										.success(function(data) {
												 if (data.s) {
												 return true;
												 } else {
												 return false;
												 }
												return data;
										})
										.error(function() {
												return false;
										});
								return promise;
						}
				};

		}])

		.service('tags', ['$q', '$http', 'APICache', 'isJson', function($q, $http, APICache, isJson) {

				this.load = function(term, type) {
						var deferred = $q.defer();

						$http({
								method: 'GET',
								url:    adminUrl + 'admin_devel/getTags/',
								cache:  APICache,
								params: {
										term: term
								}
						})
						.success(function (data) {
								if (!data || !isJson.test(data)) return;

								var arrTags = data.tags;
								var tags = arrTags.map(function(value, i) {
										return value;
								});
								deferred.resolve(tags);
						}).error(function () {
								deferred.reject('error');
						});

						return deferred.promise;
				};
		}]);
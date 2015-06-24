/**
 * Author marshall
 * Created on 26/01/15.
 */
'use strict';

var app = angular.module('app.shopItemsCtrl', ['ngRoute', 'ngSanitize']);

app.controller("mainCtrl" , ['$scope', 'shopItemsLibrary', function($scope, shopItemsLibrary){

		console.log("main");
		shopItemsLibrary.get().then(function(faq) {
				var data = faq.data;
		});

}]);
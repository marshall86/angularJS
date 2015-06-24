/**
 * Author marshall
 * Created on 26/01/15.
 */

	'use strict';

	var app = angular.module('app', [
		'ngDialog',
		'app.directives',
		'app.factory',
		'angularFileUpload',
		'ngTagsInput'
	])
	.controller("updateForm", ['$scope', '$http', 'ngDialog', 'tags', '$timeout', 'APICache', 'getTags', '$rootScope',
					function($scope, $http, ngDialog, tags, $timeout, APICache, getTags, $rootScope) {

				var shopItems = $rootScope.shopItems,
						shopItem =  $rootScope.shopItem,
						toAdd = $rootScope.toAdd;

				$scope.loadingTags = true;
				$scope.checkModify = {};

				$scope.productsType = [
						{label: 'Donation', value: 'donation'},
						{label: 'Gems', value: 'gems'},
						{label: 'Gift Card', value: 'gift_card'},
						{label: 'Sticker', value: 'sticker_set'},
						{label: 'Virtual item', value: 'virtual_item'}
				];
				$scope.currenciesType = [
						{label: 'USD', value: 'USD'},
						{label: 'BTC', value: 'BTC'},
						{label: 'GEM', value: 'GEM'}
				];

				if(!shopItem) {
						$scope.oldTags = false;
						$scope.loadingTags = false;
				}

				if(toAdd == "update") { //toAdd == "batch"
						getTags.get(shopItem.product_id).then(function(tags) {
								var data = tags.data;
								shopItem['tags'] = data["tags"];
								$scope.loadingTags = false;
						});
				}

				$scope.selectedRowsList = "";
				if(toAdd == "batch") {
						$scope.loadingTags = false;
						$scope.isBatch = true;
						var batchArray = {};
						$scope.batchArray = batchArray;
						$scope.selectedRowsList = typeof $rootScope.selectedRows != "undefined" ? $rootScope.selectedRows : '';
				}

				$scope.batchFormArray = function(validField,fieldName,changedFieldValue) {
						if(fieldName == "original_value" && $rootScope.type != 1) {
								shopItem['formatted_original_value'] = parseFloat($scope.shopItemsForm["original_value"].$modelValue).toFixed(4);
						}
						if($scope.selectedRowsList == "") {
								return; //if no items is selected it's not necessary to create the batchArray
						}else {
								if(validField) {
										var editedTags = shopItem.tags;
										$scope.checkModify[fieldName] = true;
										if(fieldName == "tags") {
												batchArray[fieldName] = editedTags;
										}else {
												batchArray[fieldName] = changedFieldValue;
										}
								}else {
										$scope.checkModify[fieldName] = false;
										delete batchArray[fieldName];
								}
								$scope.batchArray = batchArray;
						}
				};

				$scope.loadTags = function (term) {
						return tags.load(term, 'blog_post');
				};

				$scope.confirmAdd = function() {
						if($scope.shopItemsForm.$valid) {
								$scope.submit();
						} else {
								$scope.shopItemsForm.submitted = true;
						}
				};

				$scope.isInvalid = function(field){
						return $scope.shopItemsForm[field].$invalid && $scope.shopItemsForm[field].$dirty || $scope.shopItemsForm[field].$invalid && $scope.shopItemsForm.submitted;
				};

				$scope.submit = function() {

						var method = $rootScope.type,
								form = "";
						if(toAdd == "batch"){
								form = $scope.batchArray;
								form['selectedRowsList'] = $scope.selectedRowsList;
						}else {
								form = $scope.shopItem;
						}

						if(method == 1) {
								$rootScope.shopItem = $scope.shopItem;
						}

						form['method'] = method;

						$http({
								method: "POST",
								url:  adminUrl + "admin_devel/update_shop_items",
								data: form
						})
						.success(function(response)
						{
								if(response.s)
								{
										if(method == 1) {
												console.log("new shop item id: ", response.s);
												form['product_id'] = response.s;
												form['formatted_original_value'] = parseFloat(form['original_value']).toFixed(4);
												$scope.$emit('EVT_UPLOAD_START', response.s);
										}else {
												console.log("(batch) updated shop item(s) id: ", response.s);
												if(toAdd == "batch") {
														var ids = response.s.batch_id,
																batchIdsLength = ids.length,
																itemsLength = shopItems.length,
																id = '';
														for(var j=0; j<batchIdsLength; j++) {
																id = ids[j].batch_id;
																for(var field in form){
																		if(field != "selectedRowsList" || field != "method"){
																				for(var i=0; i<itemsLength; i++) {
																						if(shopItems[i].product_id == id) {
																								shopItems[i][field] = form[field];
																								if(field == "original_value") shopItems[i]["formatted_original_value"] = form[field];
																						}
																				}
																		}
																}
														}
												}
												APICache.removeAll();
												ngDialog.close();
										}
								}else{
										console.log(response.error);
								}
						})
						.error(function(err){
								console.log("err: ", err);
						});

				};

				$scope.closeForm = function() {
						ngDialog.close();
				}

	}]);
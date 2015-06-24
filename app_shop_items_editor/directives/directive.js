/**
 * Author marshall
 * Created on 26/01/15.
 */

'use strict';

var dir = angular.module('app.directives', []);

		dir.directive('grid', ['shopItemsLibrary', 'getTags', 'ngDialog', '$timeout', 'APICache', '$rootScope',
				function(shopItemsLibrary, getTags, ngDialog, $timeout, APICache, $rootScope) {

				return {
						restrict: "E",
						replace: true,
						scope: { },
						templateUrl:  adminUrl + "admin_devel/serve_view/grid",
						link: function(scope){
								if(typeof scope.onOfflineSelected == "undefined"){
										scope.loadingItems = true;
										var page = "", show = "", tag = "", order = "id";
										scope.getShopItems(page, show, tag, order);
								}
						},
						controller: function($scope, $http) {

								$(".shopItemsEditor").height($(window).height()-264);

								$scope.onOfflineMode = [
										{label: 'all', value: ""},
										{label: 'Online', value: 1},
										{label: 'Offline', value: 0}
								];

								$scope.orderContainer = [
										{label: 'Id latetest up', value: "id"},
										{label: 'Name', value: 'name'},
										{label: 'Original value', value: 'original'}
								];

								$timeout(function() {
										getTags.get().then(function(tags) {
												var data = tags.data;
												$scope.tagsContainer = data["tags"];
										});
								});

								$scope.getShopItems = function(page, show, tag, order) {
										shopItemsLibrary.get(page, show, tag, order).then(function(items) {
												var data = items.data,
														total = data["totalPages"],
														totPages = [],
														dataItems = data["shopItems"],
														selectedBatchRows = $scope.selectedRows,
														batchRowsLength = selectedBatchRows.length;

												for(var i=0; i<dataItems.length; i++) {
														dataItems[i]['decache'] = '';
														dataItems[i]['checked'] = false;
														for(var r=0; r<batchRowsLength; r++) {
																if(selectedBatchRows[r].product_id == dataItems[i]['product_id']) dataItems[i]['checked'] = true;
														}
														dataItems[i]['formatted_original_value'] = parseFloat(dataItems[i]['original_value']).toFixed(4);
												}

												$scope.shopItems = dataItems;
												$scope.total = total;
												$scope.imageUrl = imageUrl + "images/shop/";
												$rootScope.gridCtrl = true;
												$scope.loadingItems = false;

												if(total != 0 || total != 1) {
														for(var p=1; p<=total; p++) {
																totPages.push(p);
														}
														$scope.totPages = totPages;
														$scope.selPage = data["currentPage"];
														$rootScope.selPage = $scope.selPage;
												}
										});
								};

								$scope.nextPage = function(page) {
										var selectedTag = typeof $scope.selectedTag !="undefined" ?  $scope.selectedTag.tag : '',
												showSelected = typeof $scope.onOfflineSelected !="undefined" ? $scope.onOfflineSelected.value : '',
												selectedOrder = typeof $scope.selectedOrder !="undefined" ? $scope.selectedOrder.value : "id";

										$scope.loadingItems = true;
										$scope.getShopItems(page, showSelected, selectedTag, selectedOrder);
								};

								$scope.orderBy = function() {
										var selectedTag = typeof $scope.selectedTag !="undefined" ?  $scope.selectedTag.tag : '',
												showSelected = typeof $scope.onOfflineSelected !="undefined" ? $scope.onOfflineSelected.value : '',
												selectedOrder = typeof $scope.selectedOrder !="undefined" ? $scope.selectedOrder.value : "id";

										$scope.loadingItems = true;
										$scope.shopItems = "";
										$scope.getShopItems('', showSelected, selectedTag, selectedOrder);
								};

								$scope.filterTag = function() {
										var selectedTag = typeof $scope.selectedTag !="undefined" ? $scope.selectedTag.tag: '',
												showSelected = typeof $scope.onOfflineSelected !="undefined" ? $scope.onOfflineSelected.value : '',
												selectedOrder = typeof $scope.selectedOrder !="undefined" ? $scope.selectedOrder.value : "id";

										if(selectedTag == "") return;

										if(typeof $scope.selectedRows != "undefined") {
												selectedRows = [];
												list = [];
												$scope.list = list;
												$scope.selectedRows = selectedRows;
										}

										$scope.loadingItems = true;

										if(showSelected == 0 || showSelected == 1) {
												$scope.getShopItems('', showSelected, selectedTag, selectedOrder);
										}else {
												$scope.getShopItems('' , '', selectedTag, selectedOrder);
										}
								};

								$scope.filterItems = function() {
										var selectedTag = typeof $scope.selectedTag !="undefined" ?  $scope.selectedTag.tag : '',
												showSelected = $scope.onOfflineSelected.value,
												selectedOrder = typeof $scope.selectedOrder !="undefined" ? $scope.selectedOrder.value : "id";

										if(typeof $scope.selectedRows != "undefined") {
												selectedRows = [];
												list = [];
												$scope.list = list;
												$scope.selectedRows = selectedRows;
										}

										$scope.loadingItems = true;

										if(selectedTag != "") {
												$scope.getShopItems('', showSelected, selectedTag, selectedOrder);
										}else {
												$scope.getShopItems('', showSelected, '', selectedOrder);
										}
								};

								$scope.saveIn = function(checkbox, item_id) {
										if(checkbox==0) {
												$http({
														method: "POST",
														url:  adminUrl + 'admin_devel/shop_item_spotlight/',
														data: [{
																'product_id': item_id,
																'tag': "shop"
														}]
												})
												.success(function(response)
												{
														if(response.s) { console.log(response.s); APICache.removeAll(); }else{ console.log(response.error); }
												})
												.error(function(err){
														console.log("err: ", err);
												});
										}
								};

								$scope.duplicateItem = function(item) {
										var prodId = item.product_id;

										$("#loader_" + prodId).css("display", "block");

										$http({
												method: "POST",
												url:  adminUrl + 'admin_devel/shop_duplicate_item/',
												data: item
										})
										.success(function(response)
										{
												if(response.s) {
														console.log(response);
														$("#loader_" + prodId).css("display", "none");
														APICache.removeAll();
														var selectedTag = typeof $scope.selectedTag !="undefined" ?  $scope.selectedTag.tag : '',
																showSelected = typeof $scope.onOfflineSelected !="undefined" ? $scope.onOfflineSelected.value : '',
																selectedOrder = typeof $scope.selectedOrder !="undefined" ? $scope.selectedOrder.value : "id",
																selectedPage = $scope.selPage;

														$scope.loadingItems = true;
														$scope.shopItems = "";
														$scope.getShopItems(selectedPage, showSelected, selectedTag, selectedOrder);
												}else{
														console.log(response.error);
												}
										})
										.error(function(err){
												console.log("err: ", err);
										});
								};

								$scope.openForm = function(opType, shopItem) {
										var item = "";

										if(opType == "batch") {
												var selectedItems = typeof $scope.selectedRows !="undefined" ? $scope.selectedRows : '',
														list = typeof $scope.list !="undefined" ? $scope.list : '';
												if(selectedItems.length > 1) {
														var items = $scope.shopItems,
																itemsLenght = items.length;

														for(var x=0; x<itemsLenght; x++) {
																for(var id in list) {
																		if(items[x].product_id == id) item = items[x];
																}
														}

														if(item == "") {
																alert("No selected rows in the current page");
																return;
														}
														$scope.shopItem = item;
														$rootScope.selectedRows = selectedItems;
												}else {
														alert("Please select some rows for the batch modify");
														return;
												}
										}else if(opType == "update") {
												item = shopItem;
												$scope.shopItem = item;
										}

										$scope.loadingTags = true;

										if(item && item.product_type) {
												$scope.toUpdate = true;
												if(item.product_type != 'virtual_item' || item.product_type == ''){
														$scope.imageType = ".png";
												}else if(item.product_type == 'virtual_item'){
														$scope.imageType = ".svg";
												}

												$scope.imagePath = imageUrl + "images/shop/" + item.product_id + $scope.imageType + '?decache=' + Math.random();
												$scope.shopItem['image'] = $scope.imagePath;
												$scope.shopItem['imageType'] = $scope.imageType;
										}else {
												$scope.toUpdate = false;
												$scope.oldTags = false;
												$scope.loadingTags = false;
										}

										$rootScope.toAdd = opType;
										$rootScope.shopItem = item;
										$rootScope.shopItems = $scope.shopItems;
										$rootScope.type = item ? 0 : 1;

										ngDialog.open({
												template: adminUrl + "admin_devel/serve_view/form",
												className: 'ngdialog-theme-plain',
												closeByDocument: true
										});
								};

								$scope.confirmRemove = function(item) {
										if(confirm("Are you sure?"))
												$scope.deleteItem(item);
										return;
								};

								$scope.deleteItem = function(item) {
										$http({
												method: "POST",
												url:  adminUrl + "admin_devel/shop_items_delete",
												data: {
														product_id: item.product_id
												}
										})
										.success(function(response)
										{
												if(response.s)
												{
														console.log(response.s);
														APICache.removeAll();
														var selectedTag = typeof $scope.selectedTag !="undefined" ?  $scope.selectedTag.tag : '',
																showSelected = typeof $scope.onOfflineSelected !="undefined" ? $scope.onOfflineSelected.value : '',
																selectedOrder = typeof $scope.selectedOrder !="undefined" ? $scope.selectedOrder.value : "id",
																selectedPage = $scope.selPage;

														//the deleted item could be in selectedRows, we've to remove it
														var selRows = $scope.selectedRows,
																prevList = $scope.list,
																delID = response.s;

														for(var i=0; i<selRows.length; i++) {
																if(typeof selRows[i] !="undefined" && selRows[i].product_id == delID) {
																		selectedRows.splice(i, 1);
																		delete prevList[delID];
																}
														}
														$scope.loadingItems = true;
														$scope.shopItems = "";
														$scope.getShopItems(selectedPage, showSelected, selectedTag, selectedOrder);
												}else{
														console.log(response.error);
												}
										})
										.error(function(err){
												console.log("err: ", err);
										});
								};

								var selectedRows = [];
								$scope.selectedRows = selectedRows;

								var list = [], id;
								$scope.list = list;

								$scope.batchModify = function(field) {
										if( (field.checked == 0 && selectedRows.indexOf(field.product_id) == "-1") ||
												(field.checked == false && selectedRows.indexOf(field.product_id) == "-1"))
										{
												selectedRows.push({"product_id": field.product_id});
												id = field.product_id;
												list[id] = id;
										}

										if( (field.checked == 1 && selectedRows.indexOf(field.product_id) !== "-1") ||
												(field.checked == true && selectedRows.indexOf(field.product_id) !== "-1") )
										{
												for(var i=0; i<selectedRows.length; i++) {
														if(typeof selectedRows[i] !="undefined" && selectedRows[i].product_id == field.product_id) {
																selectedRows.splice(i, 1);
																id = field.product_id;
																delete list[id];
														}
												}
										}
										//console.log(selectedRows, list);
										$scope.selectedRows = selectedRows;
								};
						}
				}

		}]);

		dir.directive('uploader', ['$upload', '$timeout', 'APICache', '$rootScope',
				function($upload, $timeout, APICache, $rootScope) {
				return {
						restrict: 'E',
						replace: true,
						transclude: false,
						scope: {
								limit:          '@',
								label:          '=',
								evented:        '@?',
								contentid:      '@',
								producttype:    '@',
								toupdate:       '@',
								type:           '@',
								maxSize:        '@?',
								maxWidth:       '@?',
								autoupload:     '@?',
								files:          '=?',
								oldFiles:       '=?',
								noConfirm:      '@?'
						},
						templateUrl: adminUrl + "admin_devel/serve_act_page_partial/upload_shop_images",
						link: function (scope, element) {

								var cfg = {
										url:          false,
										fileSize:     scope.maxSize ? scope.maxSize : 16777216,
										width:        scope.maxWidth ? scope.maxWidth : 800,
										height:       0,
										quality:      80,
										allowed:      false,
										allowedLabel: false,
										batchSize:    3
								};

								var inputEl = element.find('input[type=file]');

								switch(scope.type) {
										case 'shop':
												cfg.allowed       = ['jpg','jpeg','png', 'svg'];
												cfg.url           = adminUrl + 'admin_devel/uploadShopImage';
												cfg.allowedLabel  = 'Images';
												break;
								}

								scope.uploadErr = false;
								scope.dropClass       = '';
								scope.uploading       = false;
								scope.upload          = [];

								if (!scope.files) scope.files = [];
								if (!scope.oldFiles) scope.oldFiles = [];

								if (scope.limit == 1) inputEl.removeAttr('multiple');

								scope.$on('EVT_DRAG_START', function() {
										$timeout(function() {
												scope.dropClass = 'draggable-enabled'
										});
								});

								scope.$on('EVT_DRAG_STOP', function() {
										$timeout(function() {
												scope.dropClass = 'drop-area';
										});
								});

								scope.resetInputFile = function() {
										console.log(inputEl);
										inputEl.replaceWith(inputEl.val('').clone(true));
								};

								scope.onFileSelect = function(selectedFiles) {

										if (scope.uploading) {
												console.log('file selected during upload');
												return;
										}

										if (scope.limit > 1 && (selectedFiles.length + scope.files.length + scope.oldFiles.length) > scope.limit) {
												alert('Sorry you can only upload ' + scope.limit + ' images');
												return;
										}

										scope.dropClass = '';

										if (scope.upload && scope.upload.length > 0) {
										    for (var i = 0; i < scope.upload.length; i++) {
												    if (scope.upload[i] != null) {
																 scope.deleteFile(i);
																 console.log('abort', scope.upload[i]);
														 }
										    }
										 }

										for (var i = 0; i < selectedFiles.length; i++) {
												if (i > scope.limit)
														break;

												var file = selectedFiles[i];

												if (!checkExt(file.name)) {
														selectedFiles.splice(i, 1);
														alert('File type not supported, only ' + cfg.allowedLabel + ' with the following extensions are allowed: ' + cfg.allowed.join());
														continue;
												}

												if (file.size > cfg.fileSize) {
														selectedFiles.splice(i, 1);
														alert('Max file size accepted is ' + bytesToSize(cfg.fileSize));
														continue;
												}

												if (scope.files.length >= scope.limit) {
														if (!scope.confirmDelete(scope.limit-1)) return;
												}
												if (scope.oldFiles.length >= scope.limit) {
														if (!scope.confirmDelete(scope.oldFiles[scope.limit-1])) return;
												}

												scope.$emit('EVT_PREVIEW_LOAD', scope.contentid);
												var reader  = new FileReader(),
														URL     = window.URL || window.webkitURL;

												file.data = URL.createObjectURL(file);

												scope.files.push(file);

												previewLoaded(i);
										}

										inputEl.val('');
								};

								var previewLoaded = function (idx) {
										scope.$emit('EVT_PREVIEW_RENDER', scope.files[idx], scope.contentid);
										if (scope.autoupload && scope.autoupload !== 0) {
												scope.$emit('EVT_UPLOAD_START', scope.contentid);
												scope.startUpload(idx);
										}
								};

								var checkExt = function(fileName) {
										var ext = fileName.substr(fileName.lastIndexOf('.') + 1).toLowerCase();
										return ~cfg.allowed.indexOf(ext);
								};

								var bytesToSize = function(bytes) {
										var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
										if (bytes === 0) return '0 Bytes';
										var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
										return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
								};

								var isInt = function(n) {
										return n % 1 === 0;
								};

								scope.confirmDelete = function (id) {
										if (scope.noConfirm || confirm('Are you sure you want to delete this file?')) {
												if (isInt(id)) {
														scope.deleteFile(id);
												} else {
														scope.deleteOldFile(id);
												}
												return true;
										}
										return false;
								};

								scope.deleteOldFile = function(file) {

										var idx = scope.oldFiles.indexOf(file);

										//scope.oldFiles.splice(idx, 1);
										scope.oldFiles = [];

										//if (scope.type == 'gallery') galleryLibrary.delImage(file.id);
										scope.$emit('EVT_PREVIEW_DROP', idx, scope.contentid);

								};

								scope.deleteFile = function(id) {
										var tmp_file;

										if (typeof id == 'undefined') {
												scope.files       = [];
												scope.dropClass   = 'drop-area';
										} else {

												tmp_file = scope.files[id];
												//console.log('>', typeof scope.upload[id] !== 'undefined', scope.upload[id] !== null)
												if (typeof scope.upload[id] !== 'undefined' && scope.upload[id] !== null) {
														scope.abort(id);
												}

												scope.files.splice(id, 1);
										}

										scope.$emit('EVT_PREVIEW_DROP', id, scope.contentid, tmp_file);
								};

								var failedUpload = function(response) {

										alert('upload failed:' + response.status + ': ' + response.data);
										scope.$emit('EVT_UPLOAD_KO', scope.contentid);

								};

								scope.$on('EVT_REQUEST_RESET', function(evt, files) {
										console.log('resetting');
										scope.files     = [];
										scope.oldFiles  = [];
										scope.upload    = [];
								});

								scope.$on('EVT_REQUEST_UPLOAD_START', function() {
										scope.$emit('EVT_UPLOAD_START', scope.contentid);
										scope.startUpload(0);
								});

								scope.abort = function(idx) {
										if (typeof scope.upload[idx] !== 'undefined' && scope.upload[idx] !== null) {
												//console.log(scope.upload[idx]);
												scope.upload[idx].abort();
												scope.upload.splice(idx, 1);

												console.log(scope.upload.length);

												if (!scope.upload.length)
														scope.uploading = false;
										}
								};

								scope.startUpload = function (idx) {

										var proType = scope.producttype;
										if(proType) {
												if(proType != "virtual_item" || proType == ""){
														scope.imageType = ".png";
												}else if(proType == 'virtual_item'){
														scope.imageType = ".svg";
												}
										}else {
												scope.imageType = scope.files.imagetype;
										}

										scope.uploadErr = false;
										scope.uploading = true;
										scope.files[idx].progress = {
												percent: 0, detail: 'Initializing'
										};

										var startTime = (new Date()).getTime();
										console.log('init upload');

										scope.upload[idx] = $upload.upload({
												url:    cfg.url,
												method: 'POST',
												data:   {
														type: scope.type,
														id: scope.contentid
												},
												file:   scope.files[idx],
												withCredentials: true
										})
										.success(function (response) {
												var i, uploadOnGoing = false;

												if (!response)
														return;

												if(response.result == "error") alert("Please check the image size");

												scope.upload.splice(idx, 1);
												scope.files[idx].tmpID = (response.s) ? response.f_id : 'fail';

												for (i = 0; i < scope.files.length; i++) {
														if (i != idx && typeof scope.files[i].tmpID === 'undefined') {
																uploadOnGoing = true;
																break;
														}
												}

												scope.$emit('EVT_UPLOAD_TAIL_END', response, scope.contentid);

												if (!uploadOnGoing) {
														var oldItems = $rootScope.shopItems,
																form = $rootScope.shopItem;

														var found = jQuery.inArray(form, oldItems);
														if (found < 0 && $rootScope.selPage == 1) {
																oldItems.push(form);
																oldItems.sort();
														}

														scope.$emit('EVT_UPLOAD_END', response, scope.contentid);
														if(response.result) {
																var unCache = '?decache=' + Math.random();
																scope.imagePath = imageUrl + "images/shop/" + scope.contentid + scope.imageType + unCache;
																form.decache = unCache;
																scope.uploading = false;
																APICache.removeAll();
																console.log(response);
														}else if(response.error) {
																scope.uploadErr = response.error;
																console.log(response);
														}

												}
										})
										.progress(function (e) {

												if (typeof scope.files[idx] == 'undefined') return;

												scope.files[idx].progress.percent = Math.min(100, parseInt(100.0 * e.loaded / e.total));

												if (scope.type != 'vid')
														return;

												var pc    = parseInt(100 - (e.loaded / e.total * 100)),
														pci   = parseInt(e.loaded / e.total * 100),
														pcia  = e.loaded / 1024,
														pcia2 = e.total / 1024,
														now   = (new Date()).getTime(),
														elapsedtime = (now - startTime) / 1000,
														eta   = ((e.total / e.loaded) * elapsedtime) - elapsedtime;

												if (pcia2 > 1024) {
														pcia  = pcia / 1024
														pcia2 = pcia2 / 1024;
														eta   = Math.round(eta / 10);

														scope.files[idx].progress.detail = Math.ceil(pcia * 100)/100 + ' MB of ' + Math.ceil(pcia2 * 100)/100 + ' MB, ' + eta + ' minutes left';
												} else {
														eta = Math.round(eta);

														scope.files[idx].progress.detail = Math.ceil(pcia * 100)/100 + ' KB of ' + Math.ceil(pcia2 * 100)/100 + ' KB, ' + eta + ' seconds left';
												}
										})
										.error(function(err) {
												alert('error: ' + err);
										})
										.xhr(function(xhr) {
												xhr.upload.addEventListener('abort', function() {
														scope.upload.splice(idx, 1);
														scope.files.splice(idx, 1);
														scope.uploading = false;
												}, false);
										});
								};
						}
				};
		}]);

		/*dir.directive('onlyDigits', function () {

				return {
						restrict: 'A',
						require: '?ngModel',
						link: function (scope, element, attrs, ngModel) {
								var maxLength = "",
										checkIsDecimal = "";

								if(attrs.name == "discount") {
										maxLength = 6;
										checkIsDecimal = true;
								}else {
										checkIsDecimal = false;
										maxLength = 11;
								}

								if (!ngModel) return;

								if(attrs.name == "buzz_bonus"  || attrs.name == "buzz_bonus_duration") {
										ngModel.$parsers.unshift(function (inputValue) {
												var digits = inputValue.split('').filter(function (s) {
														return (typeof s !='number');
												}).join('');
												if(isNaN(digits) || digits<0 || digits.length > 11) {digits = '';}
												ngModel.$viewValue = digits;
												ngModel.$render();
												return digits;
										});
								}
								else {
										ngModel.$parsers.unshift(function (inputValue) {
												var digits = inputValue.split('').filter(function (s) {
														if(checkIsDecimal) {
																return (!parseInt(s) || !isNaN(s) && s != ' ');
														}else {
																return (typeof s !='number');
														}
												}).join('');
												if(checkIsDecimal) {
														if(digits>1 || digits.length > maxLength || isNaN(digits)) {digits = '';}
												}else {
														var digitsMod = digits%1;
														if(digits>999999.9999  || digits.length > maxLength || isNaN(digits)) {digits = '';}

														*//*if(digitsMod<1 && digitsMod > 0 && digits.length> 6  && digits.charAt(0) == 0
																|| digitsMod == 0 && digits.length> 11  && digits.charAt(0) != 0 && digits.charAt(1) != "."
																|| digitsMod <1 && digitsMod.length> 6  && digits.charAt(0) != 0 && digits.charAt(1) != "."
																) {
																digits = '';
														}*//*
												}
												ngModel.$viewValue = digits;
												ngModel.$render();
												return digits;
										});
								}
						}
				};
		});*/
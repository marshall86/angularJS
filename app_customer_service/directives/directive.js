'use strict';

var dir = angular.module('app.directives', ['ngDialog']);

    dir.directive('selectBox', ['$routeParams','faqLibrary', function($routeParams, faqLibrary) {

        return {
            restrict: "E",
            replace: true,
            scope: {
                cat: "=?",
                selectedCat: "="
            },
            templateUrl: baseUrl + "/js/app_customer_service/partials/selectBox.html",
            controller: function($scope, $routeParams, $location){

                $scope.openDiv = function() {
                    $scope.selectedCat = $scope.arrayIndex.cat ? $scope.arrayIndex.cat : $scope.arrayIndex;
                    var cat_url = $scope.selectedCat;
                        cat_url = cat_url.replace(/\s/gi,"_");
                    $location.path(cat_url, 1);
                };


                $scope.$watch(
                    function(){
                        return $scope.cat;
                    }, 
                    function(newVal, oldVal){

                        if(!newVal && newVal == oldVal) return;

                        var cat = newVal,
                            sez = $routeParams.sez ? $routeParams.sez.split('_').join(' ') : false;
                        if(sez && cat != undefined) {
                              var cat_length = cat.length;

                              for(var i=0; i<cat_length; i++)
                              {
                                 if(cat[i]["cat"] == sez)
                                 {
                                    //APRO IL DIV DELLE QUESTIONS
                                    $scope.selectedCat = sez;
                                     //SETTO IL NOME DELLA CATEGORIA NELLA SELECT
                                    break;
                                 }
                              }
                            $scope.arrayIndex = cat[i];
                        }
                    }
                );
                
            }
        }

    }]);

    dir.directive('question', ['keeper','$routeParams', '$location', '$window', '$timeout' , function(keeper, $routeParams, $location, $window, $timeout) {

        return{
            restrict: "E",
            replace: true,
            scope: {
                q: "=?"
            },
            templateUrl: baseUrl + "/js/app_customer_service/partials/question.html",
            link: function(scope, elem, attr) {

                var current_path = $location.path().split('/'),
                    hash_id = current_path[2];
                    
                scope.$on("evt_changecat", function(){
                    if (!$routeParams.qid )
                        scope.collapsed = false;
                });

                scope.$watch(
                    function(){
                        return keeper.selectedQuestion.get();
                    }, 
                    function(newVal, oldVal){
                        if(newVal != oldVal && keeper.selectedQuestion.get() != scope.q.id) scope.collapsed = false;
                    }
                );

                if (hash_id == attr.id) {
		                $timeout(function() {
                        //$window.scrollTo(0, elem[0].offsetTop);
				                var faqDivId = "div#"+hash_id;
				                $(faqDivId).get(0).scrollIntoView();
                    },1000);
                }

            },
		        controller: function($scope,$routeParams,$location){
							  var qid = $routeParams.qid,
                    sez = $routeParams.sez ? $routeParams.sez : $location.path();

                $scope.showAnswer = function (id)
                {
                    keeper.selectedQuestion.set(id || $scope.q.id);

                    if($scope.collapsed == true) {
                        $scope.collapsed = false;
                    }else {
                        $scope.collapsed = true;
                    }

                    if(sez && $scope.q.id){
                        var current_path = $location.path().split('/');
                        sez = current_path[1];
                        $location.path(sez + '/' + $scope.q.id, 1);                        
                    }

                };

                if (qid == $scope.q.id)
                    $scope.showAnswer(qid);    

                $scope.changeQuestionColor = function(){
                    if ($scope.collapsed) return "question_collapsed";
                    return $scope.changed = "question";
                };

                $scope.changeHeight = function(){
                    if($scope.collapsed) {
                        return{
                            'min-height': '150px',
                            'heigth': "200px" 
                        }
                    }
                    return;
                };

            }
        }

    }]);


    dir.directive('upDown', ['$http','ngDialog', function($http,ngDialog) {
        return{
            restrict: "E",
            scope: {
                questionId: "=?",
								questionName: "=?",
                count: "=?",
                value: "=?",
								userId: "=?"
            },
            templateUrl: baseUrl + "/js/app_customer_service/partials/up_down.html",
            controller: function($scope, $http){

								$scope.hideVote = false;
								//console.log(loggedIn);
								$scope.hideVoteContainer = function() {
									 if(loggedIn == "false") return "vote_container hide";
									 if($scope.$parent.collapsed){
										 	return "vote_container show";
									 }return "vote_container hide";
								};

								// Setting the default value of up/down button vote
								// If current user already vote +, i set the value of the related button to disable else if user just vote -
								// i set the value of related button to disable and the other button to enable

                if($scope.value !=undefined && $scope.userId !=undefined){
                    if($scope.value == 1){
                        $scope.disabledPlus = true;
                        $scope.disabledMinus = false;   
                    }else{
                        $scope.disabledPlus = false;
                        $scope.disabledMinus = true;
                    }
                }else{
                    $scope.disabledPlus = false;
                    $scope.disabledMinus = true;
                }

                $scope.vote_count = $scope.count ? $scope.count : 0;

								// method to send the request of vote - param 1 -> vote + else param -1 -> vote -
                $scope.sendVote = function(param)
                {

									$scope.hideVote = true;

									//console.log($scope.value !=undefined, $scope.value == param, $scope.userId);
									//If the current user just vote +/- -> return
									if($scope.value !=undefined && $scope.value == param && $scope.userId){
										$scope.hideVote = false;
										return;
									}

									/*if(param == "-1") {
											$scope.vote_count = $scope.vote_count-1;
									}*/

									var request = $http({
											method: "POST",
											url: tempBaseUrl + "set_vote",
											data: {
												question_id: $scope.questionId,
												method: param
											}
									})
									.success(function(response)
									{

										//console.log(response);
										$scope.hideVote = false;

										//if vote query return status ok
										if(response.status == "Ok")
										{
												var response_length = response["count"].length;

												//check the value of count
												if(response_length == 0) {
													// no vote
													$scope.vote_count = 0;
												}else{
														//update the value of count with the "count" field returned in json response and the $scope.value
														// with the param value so that user the enable/disable switch defined above works correctly
														if($scope.questionId == response["count"][0].question_id && param == "1") {
																$scope.vote_count = response["count"][0].count;
																$scope.value = param;
														}else if($scope.questionId == response["count"][0].question_id && param == "-1")  {
																$scope.vote_count = response["count"][0].count;
																$scope.value = param;
														}
												}

												//set the status enable/disable of the buttons +/-
												if(param == "1"){
														$scope.disabledPlus = true;
														$scope.disabledMinus = false;
												}else{
														$scope.disabledPlus = false;
														$scope.disabledMinus = true;

														ngDialog.open({
															template: baseUrl + 'js/app_customer_service/partials/email_support.html',
															className: 'ngdialog-theme-plain',
															scope: $scope,
															closeByDocument: true
														});
												}

										}
								  })
									.error(function(err){
										console.log("err: ", err);
									});

                };

            }
        }
    }]);

    dir.factory('keeper', [function() {

        var selQuestion = false;

        return {
            
          selectedQuestion: {
              get: function() {
                return selQuestion;
              },
              set: function(id) {
                //console.log("selectedQuestion id ", id);
                selQuestion = id;
              },
              reset: function() {
                selQuestion = false;
              }
          }

        };
    }]);

    dir.factory('API', ['$http', function($http) {

        return {
          get: function(url, params, cache) {
                var promise = $http({
                  method: 'GET',
                  //cache:  cache ? APICache : false,
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
             /* if (data.s) {
                return true;
              } else {
                return false;
              }*/
              return data;
            })
            .error(function() {
              return false;
            });
            return promise;
          }
        };

    }]);		
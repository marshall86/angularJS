'use strict';

var app = angular.module('app.faqCtrl', ['ngRoute', 'ngSanitize']);

    app.controller("mainCtrl" , ['$scope', '$http', '$routeParams' ,'faqLibrary', function($scope, $http, $routeParams, faqLibrary){

        var sez = $routeParams.sez;

        $scope.collapsed            = false;
        $scope.selectedCat          = false;
        $scope.loadingCats          = true;
        $scope.selectedQuestion     = false;
        $scope.selectedClas         = (sez) ? 'faq_container_moved animIntro' : 'faq_container_moved';

        $scope.initValueCat = !(typeof sez === 'undefined');

        $scope.selectedWatch = function() {
            if ($scope.selectedCat) {
                if($scope.initValueCat == false){
                    return "faq_container_moved animIntro";
                }else{
                    return "faq_container_moved";
                }
           }
        };

        $scope.marginTitle = function(){
            if($scope.selectedCat) return "faq_title_moved";
            return $scope.selected = "faq_title";
        };

        $scope.$watch('selectedCat', function(newVal, oldVal){
            if(newVal != oldVal) $scope.$broadcast('evt_changecat');
        });

        faqLibrary.get().then(function(faq) {
           var data = faq.data;
           $scope.categories = data["cats"];
           $scope.questions = data["res"];
           $scope.loadingCats = false;
        });

    }]);

		app.controller("supportEmail", ['$scope', '$http', function($scope, $http){

			$scope.sendEmail = function(){
				console.log("sendEmail");
				if(confirm("Are you sure?"))
					$scope.submit();
				return;
			};

			$scope.submit = function(){

					var request = $http({
						method: "POST",
						url: tempBaseUrl + "send_email",
						data: {
							subject: $scope.$parent.$parent.questionName,
							text:   $scope.email.text
						}
					})
					.success(function(response)
					{
						console.log(response);
					})
					.error(function(err){
						console.log("err: ", err);
					});

			}
		}]);
'use strict';

var fact = angular.module('app.factory', []);

    fact.factory('faqLibrary', ['API', function (API) {
        return {

          get: function() {
            return API.get(tempBaseUrl + 'get_questions', false, true); //+ id + append
          },
          post: function(data){
            //return API.post('http://192.168.1.209/filmannex/temp/set_vote', data);
          },
          del: function(id) {
            //return API.post('app/movie_admin/delete/', {movieID: id});
          },
          save: function(movie) {
            //return API.post(CONFIG.uploadURL + 'app/movie_admin/upsert/' + movie.movieID, movie);
          }

        };

    }]);
'use strict';

/* Services */

var services = angular.module('myApp.services', ['myApp.config']);

services.factory('ElasticSearch', ['$http', 'es_config',
    function ($http, es_config) {
        var requestUrl = es_config.baseUrl + '/' + es_config.searchIndex + '/_search';
        var factory    = {};

        // Generate the query JSON using terms and a nested path
        factory.generateQuery = function(terms, nestedPath) {
            var query =
            {
                "query": {
                    "filtered": {
                        "filter": {
                            "nested": {
                                "path": nestedPath,
                                "filter": {
                                    "bool": {
                                        "must": terms
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return query;
        }

        // Send the query to ElasticSearch
        factory.query = function(query) {
            return $http.post(requestUrl, query);
        };

        return factory;
    }
]);
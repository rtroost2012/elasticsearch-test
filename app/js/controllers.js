'use strict';

/* Controllers */

var controllers = angular.module('myApp.controllers', [])

controllers.controller('SearchController', ['$scope', 'ElasticSearch',
    function ($scope, ElasticSearch) {
        // Set the base URL and search index
        $scope.queryType    = "raw";
        $scope.nestedPath   = "skills";
        $scope.encodedTerms = [];

        $scope.termList = [
            {
            }
        ];

        $scope.isValidJson = function(str) {
            if (typeof str == "object") {
                str = JSON.stringify(str);
            }

            try {
                JSON.parse(str);
            } catch (e) {
                return false;
            }

            return true;
        }

        $scope.addTerm = function () {
            $scope.termList.push({})
        }

        $scope.removeTerm = function (index) {
            $scope.termList.splice(index, 1);
            $scope.generateTerms(true); // update terms
        }

        $scope.generateTerms = function (doQuery) {
            var terms = [];

            $scope.termList.forEach(function (entry) {
                if (entry.field != null && entry.value != null) {
                    // Convert 'true' and 'false' and integer strings to their actual types
                    if (/^(true|false|\d)$/i.test(entry.value)) {
                        entry.value = eval(entry.value);
                    } else {
                        // Trim the strings if none of the types match
                        entry.field = entry.field.trim();
                        entry.value = entry.value.trim();
                    }

                    var searchObject = {};
                    searchObject[entry.field] = entry.value;

                    terms.push({
                        term: searchObject
                    })
                }
            });

            // Set new encoded terms
            $scope.encodedTerms = terms;

            if (doQuery) {
                // Generate the query
                var queryData = ElasticSearch.generateQuery($scope.encodedTerms, $scope.nestedPath);

                // Do the query
                $scope.query(queryData);

                // Show generated query
                $scope.generatedQuery = queryData;
            }
        }

        $scope.query = function (queryData) {
            $scope.queryValid = $scope.isValidJson(queryData);

            if ($scope.queryValid) {
                // Do the query
                ElasticSearch.query(queryData).success(function (data) {
                    $scope.queryResult = data.hits;
                }).error(function (data) {
                    $scope.queryResult = data;
                });
            }
        }
    }
]);
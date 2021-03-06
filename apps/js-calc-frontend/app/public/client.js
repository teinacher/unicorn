﻿var apiUrl = 'api/';

function loopClick() {
    console.log(document.getElementById('triggerButton'));
    document.getElementById('triggerButton').click();
};

angular.module('CalculatorApp', [])
    .controller('CalculatorController',
        function ($scope, $http) {

            $scope.Init = function () {
                console.log("init");
                var getUrl = apiUrl + 'getappinsightskey';
                var config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                    }
                };
                if ($scope.id === undefined) {
                    $scope.id = 42;
                }

                if ($scope.errors === undefined) {
                    $scope.errors = [];
                }

                $http.get(getUrl, {}, config)
                    .success(function (response) {
                        $scope.appInsightsKey = response;
                        console.log(response);
                        initAppInsights($scope.appInsightsKey);
                    });
            };

            $scope.Calculate = function () {
                var postUrl = apiUrl + 'calculation';
                var config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;',
                        'number': $scope.id
                    }
                };
                window.appInsights.trackEvent("calculation-client-call-start", {
                    value: $scope.id
                });
                $http.post(postUrl, {
                    'number': $scope.id
                }, config)
                    .success(function (response, status) {
                        if (status == 503 || status == 502) {
                            $scope.errors.push({
                                status: status ? status : '502',
                                data: data,
                                date: new Date().toLocaleTimeString()
                            });
                        } else {
                            $scope.result = response;
                        }
                        console.log("received response:");
                        console.log(response);
                        if (window.appInsights) {
                            window.appInsights.trackEvent("calculation-client-call-end", {
                                value: $scope.result
                            });
                        }
                        if ($scope.loop) {
                            var randomNumber = Math.floor((Math.random() * 10000000) + 1);
                            console.log(randomNumber);
                            $scope.id = randomNumber;
                            if (!$scope.frequency) {
                                $scope.frequency = 500;
                            }
                            $scope.looping = false;
                            if (!$scope.looping) {
                                window.setTimeout(loopClick, $scope.frequency);
                            }
                            $scope.looping = true;
                        }
                    })
                    .error(function (data, status) {
                        console.log(data);
                        console.log(status);
                        $scope.errors.push({
                            status: status ? status : '502',
                            data: data,
                            date: new Date().toLocaleTimeString()
                        });
                        if ($scope.loop) {
                            var randomNumber = Math.floor((Math.random() * 10000000) + 1);
                            console.log(randomNumber);
                            $scope.id = randomNumber;
                            if (!$scope.frequency) {
                                $scope.frequency = 500;
                            }
                            $scope.looping = false;
                            if (!$scope.looping) {
                                window.setTimeout(loopClick, $scope.frequency);
                            }
                            $scope.looping = true;
                        }
                    });
            };

            $scope.ClearErrors = function () {
                $scope.errors = [];
            }

            $scope.Init();
        }
    );
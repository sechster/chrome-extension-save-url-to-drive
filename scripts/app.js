define(['angular'], function (angular) {
    var app = angular.module('gDriveApp', []);

    app.init = function () {
        angular.bootstrap(document, ['gDriveApp']);
    };

    return app;
});
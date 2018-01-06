requirejs.config({
    paths: {
        'angular': 'lib/angular',
        'gapi': 'lib/gapi.client'
    },
    shim: {
        'gapi': {
            'exports': 'gapi'
        },
        'angular': {
            'exports': 'angular'
        },
    },
    waitSeconds: 0
});


requirejs(["popup", "app", "angularApp"], function (popup, app, angularApp) {
    app.init();
    popup.start();
});
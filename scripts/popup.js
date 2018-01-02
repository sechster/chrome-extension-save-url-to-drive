console.log("popup");

define(["gapi", "angular"], function(gapi, angular) {

	return {
		start: start
	};

	function start() {
		gapi.load('client', gapiLoaded);
	}

	function gapiLoaded()
	{
		console.log("gapiLoaded");

		chrome.identity.getAuthToken({'interactive': false}, function (token) {
			gapi.client.setToken({access_token: token});
			
			console.log("token :", token);
			gapi.client.load('drive', 'v3', function () {
				angular.element(document.getElementById('gDriveAppViewBodyElementID')).scope().loadData('root', null);
			});
			
		});
	}

});





console.log("popup");

var gapiWrapper;

function start()
{

	// gapi.client.init({
	// 	'apiKey': 'AIzaSyDbxznxKkOqQ7MivqivZEq2FMm3uTI3Pc0',
	// 	'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/translate/v2/rest'],
	// 	'clientId': '784481866416-7fi2d8ho4qadl2pfclid2257ddqbh50v.apps.googleusercontent.com',
	// 	'scope': 'https://www.googleapis.com/auth/drive.file'
	// }).then(function() {
	// 	gapiWrapper = new GapiWrapper();
	// 	gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

	// 	// Handle the initial sign-in state.
	// 	updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
	// 	});

	gapiWrapper = new GapiWrapper();

	chrome.identity.getAuthToken({'interactive': false}, function (token) {
		gapi.client.setToken({access_token: token});
		
		console.log("token :", token);
		gapi.client.load('drive', 'v3', function () {
			angular.element(document.getElementById('gDriveAppViewBodyElementID')).scope().loadData('root', null);
		});
		
});
}

// function updateSigninStatus(isSignedIn) {
// 	// When signin status changes, this function is called.
// 	// If the signin status is changed to signedIn, we make an API call.
// 	if (isSignedIn) {
// 		angular.element(document.getElementById('gDriveAppViewBodyElementID')).scope().loadData('root', null);
// 	}
// }

window.gapi_onload = function() 
{	
	gapi.load('client', start);
	console.log('gapi_onload');
	
}



var app = angular.module('gDriveApp', []);
app.controller('FolderController', function($scope) {
	  
	  $scope.currentFolder = 'root';
	  
	  $scope.bindData = function(data)
	  { 
			$scope.folders = data;
			$scope.$apply();
			document.getElementById('saveButtonID').disabled = false;
	  };
	  
	  $scope.loadData = function(folderId, parentId)
	  {
			$scope.currentFolder = folderId;
			obj = this;
			gapiWrapper.getFolderListing(function(data) { obj.bindData(data);}, folderId, parentId);
	  };
	  
	  $scope.save = function()
	  {
		  var queryInfo = {
				active: true,
				currentWindow: true
		  };

		  chrome.tabs.query(queryInfo, function(tabs) {
				var tab = tabs[0];
				var pageInfo = new PageInfo(tab.title, tab.url);
				gapiWrapper.saveShortcutToGDrive(pageInfo, $scope.currentFolder, window.close);
		  });
	  }
});
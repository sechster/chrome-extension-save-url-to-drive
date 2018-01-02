define(["app", "gapiWrapper"], function(app, gapiWrapper) {
		
	app.controller('FolderController', ['$scope', function ($scope) { 
		console.log("scope");
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
					gapiWrapper.saveShortcutToGDrive(tab.title, tab.url, $scope.currentFolder, window.close);
			});
		}
	}]);
});
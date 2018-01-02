console.log("GapiWrapper");

function GapiWrapper()
{
	this.authorize = function()
	{
		console.log('authorize');

		auth2 = gapi.auth2.init({
			client_id: '784481866416-7fi2d8ho4qadl2pfclid2257ddqbh50v.apps.googleusercontent.com',
			scope: 'https://www.googleapis.com/auth/drive.file'
		})

		auth2.then(function () {gapi.client.load('drive', 'v2', window.gapiAuthorized)}, function(){});

		// gapi.auth2.authorize(
		// 	{
		// 		client_id: '784481866416-7fi2d8ho4qadl2pfclid2257ddqbh50v.apps.googleusercontent.com',
		// 		scope: 'https://www.googleapis.com/auth/drive.file',
		// 		response_type: 'id_token permission'
		// 	},
		// 	function() { gapi.client.load('drive', 'v2', window.gapiAuthorized) });
	}
	
	this.saveShortcutToGDrive = function(pageInfo, folderId, callback) 
	{
		var fileData = 
		{
			'fileName': '#' + pageInfo.title + '.url',
			'data': '[InternetShortcut]\r\nURL=' + pageInfo.url
		};
		this.insertFileData(fileData, folderId, callback);
	};
	
	this.insertFileData = function(fileData, folderId, callback) 
	{
		const boundary = '-------314159265358979323846';
		const delimiter = "\r\n--" + boundary + "\r\n";
		const close_delim = "\r\n--" + boundary + "--";

		var contentType = fileData.type || 'application/octect-stream';
		var metadata = 
		{
			'title': fileData.fileName,
			'mimeType': contentType,
			'thumbnail': 
			{
				'image': icon.replace(/\+/g, '-').replace(/\//g, '_'),
				'mimeType': 'image/png'
			},
			'parents': [ {'id': folderId} ]
		};

		var multipartRequestBody =
			delimiter +
			'Content-Type: application/json\r\n\r\n' +
			JSON.stringify(metadata) +
			delimiter +
			'Content-Type: ' + contentType + '\r\n' +
			'\r\n' +
			fileData.data +
			close_delim;

		var request = gapi.client.request(
			{
				'path': '/upload/drive/v2/files',
				'method': 'POST',
				'params': {'uploadType': 'multipart'},
				'headers': {'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'},
				'body': multipartRequestBody
			});
		
		request.then(function(response) { console.log("File saved succesfully."); callback(); }, function(reason) { console.log("Error: " + reason.body); });
	};
	
	this.getFolderListing = function(callback, folderId, parentId)
	{	
		var q = 'mimeType = \'application/vnd.google-apps.folder\' and trashed != true and \'' + folderId + '\' in parents'
		var retrievePageOfFiles = function(request, result) 
		{
			request.execute(
				function(resp) 
				{
					result = result.concat(resp.items);
					var nextPageToken = resp.nextPageToken;
					
					if (nextPageToken) 
					{
						
						request = gapi.client.drive.files.list({'pageToken': nextPageToken, 'q': q});
						retrievePageOfFiles(request, result);
					} 
					else 
					{
						var output = [];
						
						if (parentId !== null)
						{
							output.push({ 'name': '..', 'id': parentId, 'parentId': null});
						}
						
						for(var i = 0; i < result.length; i++)
						{
							output.push({ 'name': result[i].title, 'id': result[i].id, 'parentId': folderId});
						}
						
						callback(output);
						return;
					}
				});
		}
		
		var initialRequest = gapi.client.drive.files.list({'q': q, 'orderBy': 'title'});
		retrievePageOfFiles(initialRequest, []);
	};
};



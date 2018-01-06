console.log("GapiWrapper");

define(["gapi", "icon"], function (gapi, icon) {

	return {
		authorize: authorize,
		saveShortcutToGDrive: saveShortcutToGDrive,
		getFolderListing: getFolderListing,
	}

	function authorize() {
		console.log('authorize');

		auth2 = gapi.auth2.init({
			client_id: '784481866416-7fi2d8ho4qadl2pfclid2257ddqbh50v.apps.googleusercontent.com',
			scope: 'https://www.googleapis.com/auth/drive'
		})

		auth2.then(function () { gapi.client.load('drive', 'v3', window.gapiAuthorized) }, function () { });
	}

	function saveShortcutToGDrive(title, url, folderId, callback) {
		var fileData =
			{
				'fileName': '#' + title + '.url',
				'data': '[InternetShortcut]\r\nURL=' + url
			};

		insertFileData(fileData, folderId, callback);
	};

	function insertFileData(fileData, folderId, callback) {
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
				'parents': [{ 'id': folderId }]
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
				'params': { 'uploadType': 'multipart' },
				'headers': { 'Content-Type': 'multipart/mixed; boundary="' + boundary + '"' },
				'body': multipartRequestBody
			});

		request.then(function (response) { console.log("File saved succesfully."); callback(); }, function (reason) { console.log("Error: " + reason.body); });
	};

	function getFolderListing(callback, folderId, parentId) {
		var q = `mimeType = 'application/vnd.google-apps.folder' and trashed != true and '${folderId}' in parents`;
		var retrievePageOfFiles = function (request, result, paramName) {
			request.execute(function (resp) {
				result = result.concat(resp.files);
				console.log(resp);
				var nextPageToken = resp.nextPageToken;
				if (nextPageToken) {
					request = gapi.client.drive.files.list({
						paramName: nextPageToken,
						'q': q,
						orderBy: 'name'
					});
					retrievePageOfFiles(request, result, 'nextPageToken');
				} else {
					var output = [];
					console.log(result);

					if (parentId !== null) {
						output.push({ 'name': '..', 'id': parentId, 'parentId': null });
					}

					for (var i = 0; i < result.length; i++) {
						output.push({ 'name': result[i].name, 'id': result[i].id, 'parentId': folderId });
					}

					callback(output);
				}
			});
		}
		var initialRequest = gapi.client.drive.files.list({ 'q': q, orderBy: 'name' });
		retrievePageOfFiles(initialRequest, [], 'pageToken');
	}
});



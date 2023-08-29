/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/redirect', 'N/file', 'N/log', 'N/https'], function(redirect, file, log, https) {
    function onRequest(context) {
        if (context.request.method === 'GET') {
            var formFile = file.load({
                id: '14233'
            });

            var formHtml = formFile.getContents();

context.response.write({
   output: formHtml,
   headers: {
       'Content-Type': 'text/html'
   }
});
        } else if (context.request.method === 'POST') {

            var email = context.request.parameters.email;
            var request = context.request.parameters.request;
            var priority = context.request.parameters.selectedPriorities;
            var description = context.request.parameters.description;
            var department = context.request.parameters.department;

            log.debug('Priority Parameters', priority);


            // Get the uploaded file from the form
            var uploadedFile = context.request.files.attachment;

            log.debug('Files object', context.request.files);

            // Headers for initial POST request
            var headers = {
              'Authorization': 'Bearer f7p3GUEUTlu36DJlUuL18rNsQrkw7iRB6lbCu',
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            };

            var payload = JSON.stringify({
                toBottom: true,
                cells: [
                    { columnId: '4049849804607364', value: email },
                    { columnId: '8553449431977860', value: request },
                    { columnId: '390675107368836', value: description },
                    { columnId: '4894274734739332', value: department }, 
                    { columnId: '2642474921054084', value: priority }
                ],
            });

            function getContentType(fileName) {
                var extension = fileName.split('.').pop().toLowerCase();
                switch (extension) {
                    case 'pdf':
                        return 'application/pdf';
                    case 'doc':
                    case 'docx':
                        return 'application/msword';
                    case 'xls':
                    case 'xlsx':
                        return 'application/vnd.ms-excel';
                    case 'txt':
                        return 'text/plain';
                    default:
                        return 'application/octet-stream';  // Default MIME type
                }
            }

            try {
              // Initial POST request to create a new row
              var response = https.post({
                url: 'https://api.smartsheet.com/2.0/sheets/8099869281439620/rows',
                headers: headers,
                body: payload,
              });
              var responseBody = JSON.parse(response.body);
              log.debug('API Response', response.body);

              // Get the row ID
              var rowId = responseBody.result.id;

              // POST request to upload the file
              var fileUploadUrl = 'https://api.smartsheet.com/2.0/sheets/8099869281439620/rows/' + rowId + '/attachments';

              var boundary = 'someuniqueboundaryasciistring';

              var contentType = getContentType(uploadedFile.name);
            

              var fileHeaders = {
                'Content-Type': 'multipart/form-data; boundary=' + boundary,
                'Accept': 'application/json',
                'Authorization': 'Bearer f7p3GUEUTlu36DJlUuL18rNsQrkw7iRB6lbCu'
              };

              var body = [];
              body.push('--' + boundary);
              body.push('Content-Disposition: form-data; name="file"; filename="' + uploadedFile.name + '"');
              body.push('Content-Type: ' + contentType); 
              body.push('');
              body.push(uploadedFile.getContents());
              body.push('--' + boundary + '--');
              body.push('');

              var fileUploadResponse = https.post({
                url: fileUploadUrl,
                headers: fileHeaders,
                body: body.join('\r\n')
              });

              redirect.toSuitelet({
                scriptId: '1323',
                deploymentId: 'CUSTOMDEPLOY_SMARTSHEET_SUBMITTED_REDIRE'
            });

            } catch (error) {
              log.error('Smartsheet Error', error.message);
              context.response.write('Error submitting data: ' + error.message);
            }
        }
    }

    return {
        onRequest: onRequest
    };
});

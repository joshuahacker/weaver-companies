/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/file', 'N/log', 'N/https'], function(file, log, https) {
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
            var priority = context.request.parameters.priority;
            var description = context.request.parameters.description;
            var department = context.request.parameters.department;

            log.debug('Form Data', {
                email: email,
                request: request,
                priority: priority,
                description: description,
                department: department
            });

            var url = 'https://api.smartsheet.com/2.0/sheets/8099869281439620/rows';
            var headers = {
              Authorization: 'Bearer f7p3GUEUTlu36DJlUuL18rNsQrkw7iRB6lbCu',
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
                { columnId: '2642474921054084', value: priority },
              ],
            });

            try {
              var response = https.post({
                url: url,
                headers: headers,
                body: payload,
              });

              var responseBody = response.body;
              context.response.write('Data submitted to Smartsheet: ' + responseBody);
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

/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget'], function(serverWidget) {
    function onRequest(context) {
        if (context.request.method === 'GET') {
            // Create form
            var form = serverWidget.createForm({
                title: 'Submission Status'
            });

            // Add a message field to display the success message
            var messageField = form.addField({
                id: 'custpage_message',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Message'
            });

            messageField.defaultValue = '<h1>Form Submitted Successfully</h1>';

            // Write the form to the response
            context.response.writePage(form);
        }
    }

    return {
        onRequest: onRequest
    };
});

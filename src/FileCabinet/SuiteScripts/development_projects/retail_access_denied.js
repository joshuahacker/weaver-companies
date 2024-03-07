/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', 'N/ui/message'], function(serverWidget, message) {
    function onRequest(context) {

            var assistant = serverWidget.createAssistant({
            title: 'Access Denied'});

            var assignment = assistant.addStep({
                id: 'assignment',
                label: 'Select new'
            });

            var review = assistant.addStep({
                id: 'review',
                label: 'Review & submit'
            });

            assistant.setSplash({
                title: "Welcome Title!", 
                text1: "An explanation of what this assistant accomplishes.", 
                text2: "Some parting words."
            });

            var writeAssignment = function() {
                assistant.addField({
                    id: 'new',
                    type:'select',
                    options:'123',
                    label: 'New'
                }
            )}

            if (context.request.method === 'GET')
            {
                writeAssignment();
                assistant.currentStep = assignment;
                context.response.writePage(assistant)

            var page = serverWidget.createForm({
                title: 'Access Denied'
            });

            var errorMessage = message.create({
                title: 'Access Denied',
                message: 'You do not have permission to view this transaction.',
                type: message.Type.ERROR
            });

            // Add the error message to the page
            page.addPageInitMessage({
                message: errorMessage
            });

            var backButton = page.addButton({
                id: 'backbutton',
                label: 'Go Back',
            });

            // Output the page
            context.response.writePage(page);
            context.response.writePage(assistant);
        }
    }

    return {
        onRequest: onRequest
    };

});



/**
 *@NApiVersion 2.x
 *@NScriptType Portlet
 */
 define(['N/file'], function(file) {
    function render(params) {
        params.portlet.title = 'Request Form';

            // Load the HTML file from the file cabinet
            var formFile = file.load({
                id: '14233'
            });

            // Get the content of the HTML file
            var formHtml = formFile.getContents();

            // Display the form
            params.portlet.html = formHtml;
        
    }

    return {
        render: render
    };
});

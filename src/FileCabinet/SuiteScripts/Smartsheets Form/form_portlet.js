/**
 *@NApiVersion 2.x
 *@NScriptType Portlet
 */
 define(['N/file'], function(file) {
    function render(params) {
        params.portlet.title = 'My HTML Portlet';

        // Load the HTML file from the file cabinet
        var formFile = file.load({
            id: '14233'
        });

        // Get the content of the HTML file
        var formHtml = formFile.getContents();

        // Set the HTML content to the portlet
        params.portlet.html = formHtml;
    }

    return {
        render: render
    };
});

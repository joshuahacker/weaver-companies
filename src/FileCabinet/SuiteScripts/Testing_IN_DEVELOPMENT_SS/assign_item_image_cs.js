/**
 * @NApiVersion 2.x
 * @NScriptType Client
 */

define(['N/currentRecord', 'N/log'], function(currentRecord, log) {

    function pageInit(context) {
        var record = context.currentRecord;
        var imageUrlDiv = document.getElementById('hiddenImageUrl');
        if (imageUrlDiv) {
            var imageUrl = imageUrlDiv.innerText;
            // Now you can use this URL to display the image as needed
            // For example, appending it to a certain part of the form
            // This is a basic example; adjust as needed for your form
            var imageContainer = document.createElement('div');
            imageContainer.innerHTML = '<img src="' + imageUrl + '" alt="Item Image" style="max-width: 200px; max-height: 200px;">';
            document.body.appendChild(imageContainer);
        }
    }

    return {
        pageInit: pageInit
    };
});

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript    
 */

define(['N/currentRecord', 'N/log'], function(currentRecord, log) {

    function pageInit(context) {
        var record = context.currentRecord;
        var imageUrlDiv = document.getElementById('hiddenImageUrl');
        if (imageUrlDiv) {
            var imageUrl = imageUrlDiv.innerText;
            var imageContainer = document.createElement('div');
            imageContainer.innerHTML = '<img src="' + imageUrl + '" alt="Item Image" style="max-width: 250px; max-height: 250px; padding-top: 5px;">';
            document.body.appendChild(imageContainer);
        }
    }

    return {
        pageInit: pageInit
    };
});

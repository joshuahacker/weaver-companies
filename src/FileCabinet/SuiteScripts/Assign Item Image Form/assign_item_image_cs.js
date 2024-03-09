/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript    
 */

define(['N/currentRecord', 'N/log'], function(currentRecord, log) {
    function pageInit(context) {
      
        if (window.imageUrl) { // Access the imageUrl from the window object
  
            var imageContainer = document.getElementById('imageContainer');
            if (imageContainer) {
                imageContainer.innerHTML = '<img src="' + window.imageUrl + '" alt="Item Image" style="max-width: 250px; max-height: 250px; padding-top: 5px;">';
            } 
        }
       
    }

    return {
        pageInit: pageInit
    };
});

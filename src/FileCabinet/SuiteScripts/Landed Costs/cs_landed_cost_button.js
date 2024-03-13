/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/url'], function (url) {
    
    function showOverlay() {
        var overlayHtml = '<div id="customOverlay" style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);z-index:1000;">' +
                          '<p style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:white;">Processing your request. Please wait...</p>' +
                          '</div>';
      document.body.insertAdjacentHTML('beforeend', overlayHtml);
          console.log('Overlay should now be visible'); // Add this line for debugging

    }

    function removeOverlay() {
        var overlay = document.getElementById('customOverlay');
        if (overlay) {
            overlay.parentNode.removeChild(overlay);
        }
  }
  
    function saveRecord(context) {
        showOverlay(); 
        return true; 
    }


    function redirectToSuitelet() {
        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript_sl_applylandedcosts',
            deploymentId: 'customdeploy_sl_applylandedcosts',
            returnExternalUrl: false
        });

        window.location.href = suiteletUrl;
  }
  
   function goToPage(pageNumber) {
        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript_sl_applylandedcosts',
            deploymentId: 'customdeploy_sl_applylandedcosts',
            returnExternalUrl: false,
            params: {'pg': pageNumber}
        });
        

    window.location.href = suiteletUrl + '?pg=' + pageNum; // Update the URL with the new page number

    }
    
  return {
        goToPage: goToPage,
        saveRecord: saveRecord,
        redirectToSuitelet: redirectToSuitelet 
    };

});

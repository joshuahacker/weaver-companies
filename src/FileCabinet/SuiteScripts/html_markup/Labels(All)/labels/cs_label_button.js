/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/url', 'N/currentRecord'], function(url, currentRecord) {

    function pageInit(context) {
    }
    
    function openPDFLabels() {
        var recId = currentRecord.get().id; 
        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript_ss_pdf_item_label_js', 
            deploymentId: 'customdeploy_ss_pdf_item_label_js',
            params: {purchaseOrderId: recId}
        });
        window.open(suiteletUrl); 
    }

    return {
        pageInit: pageInit,
        openPDFLabels: openPDFLabels 
    };
});

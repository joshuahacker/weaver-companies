/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/url', 'N/record'], function(url, record) {

    function beforeLoad(context) {
        if (context.type === context.UserEventType.VIEW) {
            var form = context.form;
            var recordId = context.newRecord.id;
          
            var suiteletUrl = url.resolveScript({
                scriptId: 'customscript_ss_pdf_item_label_js', 
                deploymentId: 'customdeploy_ss_pdf_item_label_js',
                params: {purchaseOrderId: recordId}
            });

            form.addButton({
                id: 'custpage_generate_pdf',
                label: 'PDF Labels',
                functionName: 'window.open("' + suiteletUrl + '")'
            });
        }
    }

    return {
        beforeLoad: beforeLoad
    };
});

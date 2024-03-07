/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/url', 'N/log'], function(url, log) {

    function saveRecord(context) {
        var currentRecord = context.currentRecord;
        var dateFrom = currentRecord.getValue({fieldId: 'datefrom'});
        var dateTo = currentRecord.getValue({fieldId: 'dateto'});
        
        var suiteletUrl = url.resolveScript({
            scriptId: 'customscript_load_search_suitelet',
            deploymentId: 'customdeploy_load_search_suitelet',
            params: {
                datefrom: dateFrom,
                dateto: dateTo
            },
            returnExternalUrl: true
        });
log.debug(params)
        window.location.href = suiteletUrl;
        return false; // Prevent default form submission
    }

    return {
        saveRecord: saveRecord
    };
});

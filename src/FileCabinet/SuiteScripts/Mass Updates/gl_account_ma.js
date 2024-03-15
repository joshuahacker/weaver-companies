/**
 * @NApiVersion 2.x
 * @NScriptType MassUpdateScript
 */
define(['N/record', 'N/log'], function(record, log) {

    var subsidiaries = ['6']; // Replace with the internal IDs of the three subsidiaries
    var currentIndex = 0;

    function each(params) {
        var recordId = params.id;
        var newSubsidiaryId = subsidiaries[currentIndex]; // Rotate through the subsidiaries
    
        try {
            // Update the account's subsidiary
            record.submitFields({
                type: record.Type.ACCOUNT,
                id: recordId,
                values: {
                    subsidiary: newSubsidiaryId
                },
                options: {
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                }
            });
    
            log.audit({
                title: 'Account Updated',
                details: 'Account ID ' + recordId + ' updated to subsidiary ' + newSubsidiaryId
            });
    
            // Move to the next subsidiary
            currentIndex = (currentIndex + 1) % subsidiaries.length;
    
        } catch (e) {
            log.error({
                title: 'Error updating account',
                details: e
            });
        }
    }
    
    

    return {
        each: each
    };
});

/**
 * Client Script to handle COGS Update button click
 * 
 * @NApiVersion 2.x
 * @NModuleScope SameAccount
 */

define(['N/currentRecord', 'N/ui/dialog'], function(currentRecord, dialog) {

    function startUpdate() {
        var confirmUpdate = confirm("Are you sure you want to update COGS G/L account for all items?");
        if (confirmUpdate) {
            var currentRec = currentRecord.get();
            currentRec.save(); // This submits the form which will trigger the Suitelet POST logic
        }
    }

    return {
        startUpdate: startUpdate
    };
});

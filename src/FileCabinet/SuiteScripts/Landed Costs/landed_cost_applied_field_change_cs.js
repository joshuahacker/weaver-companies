/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/currentRecord'], function(currentRecord) {

    function fieldChanged(context) {
        var rec = context.currentRecord;
        var fieldName = context.fieldId;

        // Check if the changed field is one of the landed cost amount fields
        if (fieldName === 'landedcostamount7' || fieldName === 'landedcostamount8' || fieldName === 'landedcostamount9') {
            var landedCostValue = rec.getValue({fieldId: fieldName});

            // If any of these fields have data, update and disable the custbody_un_landed_cost_applied field
            if (landedCostValue) {
                rec.setValue({
                    fieldId: 'custbody_un_landed_cost_applied',
                    value: 'Applied',
                    ignoreFieldChange: true
                });
                rec.getField({
                    fieldId: 'custbody_un_landed_cost_applied'
                }).isDisabled = true;
            }
        }
    }

    return {
        fieldChanged: fieldChanged
    };
});

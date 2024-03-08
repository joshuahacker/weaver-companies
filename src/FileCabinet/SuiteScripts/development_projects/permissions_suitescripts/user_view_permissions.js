/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/runtime', 'N/ui/serverWidget', 'N/redirect'], 
function(runtime, serverWidget, redirect) {
    function beforeLoad(context) {
        if (context.type !== context.UserEventType.VIEW && context.type !== context.UserEventType.EDIT) {
            return;
        }

        // Get the department from the record being viewed
        var recordDepartment = context.newRecord.getValue({
            fieldId: 'department'  // Replace with the actual field ID
        });

        // Get the department of the current user
        var currentUser = runtime.getCurrentUser();
        var userDepartment = currentUser.department; 

        // Compare the departments
        if (recordDepartment !== userDepartment) {
            // Option 1: Redirect the user to another page
             redirect.toRecord({
                type: 'customrecord_some_other_record_type',
                id: 'some_other_record_id'
             });        
            
            // Option 2: Display a warning message and possibly make the form read-only
            var form = context.form;
            form.addField({
                id: 'custpage_warning',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Warning'
            }).defaultValue = '<div style="color: red;">You do not have permission to view this record.</div>';

            // Make the form read-only (Optional)
            form.clientScriptModulePath = './path/to/your/client/script.js';  // Replace with the actual path to your client script
        }
    }
    
    return {
        beforeLoad: beforeLoad
    };
});

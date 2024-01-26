/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */

define(['N/ui/serverWidget'], function(serverWidget) {

    function beforeLoad(context) {
        var form = context.form;

        // Check if the script is being executed in view or edit mode
        if (context.type === context.UserEventType.VIEW || context.type === context.UserEventType.EDIT) {
            // Assuming 'custpage_hr_tab' is the ID of your 'Human Resources' tab
            // Replace 'custpage_hr_tab' with the actual ID of your tab
            var hrTab = 'hrtxt';

            // Create a sublist under the 'Human Resources' tab
            var sublist = form.addSublist({
                id: 'custpage_my_sublist',
                type: serverWidget.SublistType.INLINEEDITOR,
                label: 'My Custom Sublist',
                tab: hrTab // Associate with the specified tab
            });

            // Add fields to the sublist
            addFieldsToSublist(sublist);
        }
    }

    function addFieldsToSublist(sublist) {
        // Add Field 1
        sublist.addField({
            id: 'custpage_field1',
            type: serverWidget.FieldType.TEXT,
            label: 'Field 1'
        });

        // Add Field 2
        sublist.addField({
            id: 'custpage_field2',
            type: serverWidget.FieldType.TEXT,
            label: 'Field 2'
        });

        // Add Field 3
        sublist.addField({
            id: 'custpage_field3',
            type: serverWidget.FieldType.TEXT,
            label: 'Field 3'
        });

        // Add Field 4
        sublist.addField({
            id: 'custpage_field4',
            type: serverWidget.FieldType.TEXT,
            label: 'Field 4'
        });
    }

    return {
        beforeLoad: beforeLoad
    };
});

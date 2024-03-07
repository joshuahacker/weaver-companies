/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/search', 'N/ui/serverWidget'], function(search, serverWidget) {

    function beforeLoad(context) {
        // Only run this in view mode
        if (context.type !== context.UserEventType.VIEW) return;

        var form = context.form;
        var record = context.newRecord;
        var eventId = record.id; // Assuming the event's internal ID is needed for filtering

        // Load the saved search
        var vendorBillSearch = search.load({
            id: 'customsearch_ngd_events_budgetvsspend' // ID of your saved search
        });

        var newFilters = vendorBillSearch.filters.concat(search.createFilter({
            name: 'custbody_events_transaction_field',
            operator: search.Operator.ANYOF,
            values: eventId 
        }));
        vendorBillSearch.filters = newFilters;

        // Execute the search and retrieve the first result
        var searchResult = vendorBillSearch.run().getRange({
            start: 0,
            end: 1
        });

        var actualTotalSpend = '0'; // Default value
        if (searchResult.length > 0) {
            actualTotalSpend = searchResult[0].getValue({
                name: 'amount',
                summary: search.Summary.SUM
            });
        }

        // Add a Free-Form Text field to display the Actual Total Spend
        var totalSpendField = form.addField({
            id: 'custpage_actual_total_spend',
            type: serverWidget.FieldType.TEXT,
            label: 'Actual Total Spend'
        });
        totalSpendField.defaultValue = actualTotalSpend;
        totalSpendField.updateDisplayType({
            displayType: serverWidget.FieldDisplayType.INLINE
        });
    }

    return {
        beforeLoad: beforeLoad
    };
});

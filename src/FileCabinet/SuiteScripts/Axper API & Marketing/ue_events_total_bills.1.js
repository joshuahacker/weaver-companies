/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/search', 'N/ui/serverWidget', 'N/log'], function(search, serverWidget, log) {
  
 function formatCurrency(amount) {
    return '$' + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
}

    function beforeLoad(context) {
        if (context.type !== context.UserEventType.VIEW && context.type !== context.UserEventType.EDIT) return;

        var form = context.form;
        var record = context.newRecord;
        var eventId = record.id;
        log.debug('Event ID', eventId);

        var vendorbillSearchObj = search.create({
            type: "vendorbill",
            filters: [
                ["mainline", "is", "T"], 
                "AND", 
                ["custbody_events_transaction_field", "noneof", "@NONE@"], 
                "AND", 
                ["custbody_events_transaction_field", "anyof", eventId], 
                "AND", 
                ["custbody_events_transaction_field.custrecord_events_subsidiary", "anyof", "5"], 
                "AND", 
                ["type", "anyof", "VendBill"]
            ],
            columns: [
                search.createColumn({name: "amount", summary: "SUM", label: "Total Amount"})
            ]
        });

        var searchResult = vendorbillSearchObj.run().getRange({start: 0, end: 1});
        var totalAmount = '0';
        if (searchResult.length > 0) {
            var amountValue = searchResult[0].getValue({name: "amount", summary: "SUM"});
            totalAmount = formatCurrency(parseFloat(amountValue || '0')); 
        } else {
            totalAmount = formatCurrency(parseFloat(totalAmount)); 
        }
        log.debug('Total Amount', totalAmount);

        var totalAmountField = form.addField({
            id: 'custpage_total_amount',
            type: serverWidget.FieldType.TEXT,
            label: 'Total Amount of Related Payables',
            align: serverWidget.AlignType.RIGHT,
        });
        totalAmountField.defaultValue = totalAmount;
        totalAmountField.updateDisplayType({displayType: serverWidget.FieldDisplayType.INLINE});
        totalAmountField.updateBreakType({breakType : serverWidget.FieldBreakType.STARTCOL});
    }

    return {
        beforeLoad: beforeLoad
    };
});
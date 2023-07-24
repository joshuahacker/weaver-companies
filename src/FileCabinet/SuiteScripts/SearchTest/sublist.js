define(['N/ui/serverWidget', 'N/log', './search.js'], function(serverWidget, log, searchByDay) {
    function createSublist(form, dateTo, dateFrom) {

        var summaryResults = searchByDay.runSalesSearch(dateTo, dateFrom);
        log.debug(dateTo, dateFrom);
        // SCIS Sales Sublist
        var sublist = form.addSublist({
            id: 'custpage_test_filters',
            type: serverWidget.SublistType.LIST,
            label: 'Test Filters'
        });

        sublist.addField({
            id: 'custpage_date',
            type: serverWidget.FieldType.DATE,
            label: 'Date'
        });

        sublist.addField({
            id: 'custpage_trans_count',
            type: serverWidget.FieldType.INTEGER,
            label: 'Transaction Count',
            align: serverWidget.LayoutJustification.CENTER
        });

        log.debug({ title: 'Test Sublist Created' });

        var line = 0;

        summaryResults.forEach(function(summary) {
            if (summary.date) {
            sublist.setSublistValue({
                id: 'custpage_date',
                line: line,
                value: summary.date 
              });
            }
            if (summary.trans) {
            sublist.setSublistValue({
                id: 'custpage_trans_count',
                line: line,
                value: summary.trans
            });
        }

            line++;
        });

        log.debug({ title: 'Test Field Values Created' });

    }

    return {
        createSublist: createSublist
    };
});

/**
 * @NScriptType Suitelet
 * 
 * @by Joshua Hacker
 * @Description Sublist View for All Transactions Search
 */

define(['N/ui/serverWidget', 'N/log', 'N/search'], function(serverWidget, log, search) {
    function createSublist(form) {

        function findTrans() {
            log.audit({ title: 'Finding Transactions...' });

            var transactionSearch = search.load({
                id: 'customsearch_ns_pos_transactions'
            });

            var searchResults = transactionSearch.run().getRange({ start: 0, end: 50 });

            log.debug({ title: 'Search Type:', details: transactionSearch.type });

            return searchResults;

        }

        // SCIS Sales Sublist
        var sublist = form.addSublist({
            id: 'custpage_sales_by_transactions',
            type: serverWidget.SublistType.LIST,
            label: 'All Transactions',
            tab: 'custpage_reports_transactions'
        });

        sublist.addField({
            id: 'custpage_date',
            type: serverWidget.FieldType.TEXT,
            label: 'Date',
            align: serverWidget.LayoutJustification.CENTER
        });

        sublist.addField({
            id: 'custpage_units_sold',
            type: serverWidget.FieldType.INTEGER,
            label: 'Units Sold',
            align: serverWidget.LayoutJustification.CENTER
        });

        sublist.addField({
            id: 'custpage_gross_sales',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Gross Sales',
            align: serverWidget.LayoutJustification.LEFT
        });

        sublist.addField({
            id: 'custpage_total_returns',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Total Returns',
            align: serverWidget.LayoutJustification.LEFT
        });

        sublist.addField({
            id: 'custpage_total_discounts',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Total Discounts',
            align: serverWidget.LayoutJustification.LEFT
        });

        sublist.addField({
            id: 'custpage_total_taxes',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Total Taxes',
            align: serverWidget.LayoutJustification.LEFT
        });

        sublist.addField({
            id: 'custpage_net_sales',
            type: serverWidget.FieldType.CURRENCY,
            label: 'Net Sales',
            align: serverWidget.LayoutJustification.LEFT
        });

        log.debug({ title: 'Sublist Created: All Transactions' });


        var resultIndex = 0;
        var resultsPerPage = 100; // Number of results to display per page
        var pageIndex = 0;
        var searchResults = findTrans(); // Calling the findTrans() function

        do {
            var startIndex = pageIndex * resultsPerPage;
            var endIndex = startIndex + resultsPerPage;

            for (var i = startIndex; i < endIndex; i++) {
                if (i >= searchResults.length) {
                    break;
                }

                var result = searchResults[i];

                sublist.setSublistValue({
                    id: 'custpage_date',
                    line: resultIndex,
                    value: result.getValue({ name: 'trandate', summary: 'GROUP' })
                });

                sublist.setSublistValue({
                    id: 'custpage_units_sold',
                    line: resultIndex,
                    value: result.getValue({ name: 'quantity', summary: 'SUM' })
                });

                sublist.setSublistValue({ id: 'custpage_gross_sales', 
                line: resultIndex, 
                value: result.getValue({ name: 'grossamount', summary: 'SUM' }) });

                sublist.setSublistValue({
                    id: 'custpage_total_returns',
                    line: resultIndex,
                    value: result.getValue({ name: 'returnamount', summary: 'SUM' })
                });

                sublist.setSublistValue({
                    id: 'custpage_total_discounts',
                    line: resultIndex,
                    value: result.getValue({ name: 'discountamount', summary: 'SUM' })
                });

                sublist.setSublistValue({
                    id: 'custpage_total_taxes',
                    line: resultIndex,
                    value: result.getValue({ name: 'taxamount', summary: 'SUM' })
                });

                sublist.setSublistValue({
                    id: 'custpage_net_sales',
                    line: resultIndex,
                    value: result.getValue({ name: 'netamount', summary: 'SUM' })
                });

                resultIndex++;
            }

        pageIndex++;
    } while (resultIndex < searchResults.length);

    log.debug({ title: 'Populated Sublist: All Transactions' });
}

    return {
        createSublist: CreateSublist
    };

});

T

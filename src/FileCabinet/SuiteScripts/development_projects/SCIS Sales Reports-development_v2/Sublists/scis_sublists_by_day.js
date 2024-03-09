define(['N/ui/serverWidget', 'N/log', '../Searches/scis_search_by_day.js'], function(serverWidget, log, searchByDay) {
    function createSublist(form) {

        var summaryResults = searchByDay.runSalesSearch();

 // SCIS Sales Sublist 
                var sublist = form.addSublist({
                    id: 'custpage_sales_by_day',
                    type: serverWidget.SublistType.LIST,
                    label: 'Sales By Day',
                    tab: 'custpage_reports_date_tab'
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

                sublist.addField({
                    id: 'custpage_units_sold',
                    type: serverWidget.FieldType.INTEGER,
                    label: 'Total Units Sold'
                });

                sublist.addField({
                    id: 'custpage_total_returns',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Total Returns'
                });

                sublist.addField({
                    id: 'custpage_total_discounts',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Total Discounts'
                });

                sublist.addField({
                    id: 'custpage_total_taxes',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Total Taxes'
                });

                sublist.addField({
                    id: 'custpage_net_sales',
                    type: serverWidget.FieldType.CURRENCY,
                    label: 'Net Sales'
                });

            log.debug({ title: 'Sublist Created: Sales By Day' });

        var line = 0;
        
        summaryResults.forEach(function(summary) {
            if (summary.date) {
                sublist.setSublistValue({
                    id: 'custpage_date',
                    line: line,
                    value: summary.date
                });
            }

            if (summary.transCount) {
                sublist.setSublistValue({
                    id: 'custpage_trans_count',
                    line: line,
                    value: summary.transCount
                });
            }


            if (summary.unitsSold) {
                sublist.setSublistValue({
                    id: 'custpage_units_sold',
                    line: line,
                    value: summary.unitsSold
                });
            }

            if (summary.totalReturns) {
                sublist.setSublistValue({
                    id: 'custpage_total_returns',
                    line: line,
                    value: summary.totalReturns
                });
            }

            if (summary.totalDiscounts) {
                sublist.setSublistValue({
                    id: 'custpage_total_discounts',
                    line: line,
                    value: summary.totalDiscounts
                });
            }

            if (summary.totalTaxes) {
                sublist.setSublistValue({
                    id: 'custpage_total_taxes',
                    line: line,
                    value: summary.totalTaxes
                });
            }

            if (summary.netSales) {
                sublist.setSublistValue({
                    id: 'custpage_net_sales',
                    line: line,
                    value: summary.netSales
                });
            }
         line++;
        });

    }

    return {
        createSublist: createSublist
    };

});
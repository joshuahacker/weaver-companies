define(['N/ui/serverWidget', 'N/log', '../Searches/scis_search_by_week.js'], function(serverWidget, log, searchByWeek) {
    function createSublist(form) {

        var summaryResults = searchByWeek.runSalesSearch();       
 
 // SCIS Sales Sublist 
                var sublist = form.addSublist({
                    id: 'custpage_sales_by_week',
                    type: serverWidget.SublistType.LIST,
                    label: 'Sales by Week',
                    tab:'custpage_reports_date_tab'
                    
                });

                sublist.addField({
                    id: 'custpage_date',
                    type: serverWidget.FieldType.TEXT,
                    label: 'Date',
                    align: serverWidget.LayoutJustification.CENTER
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

            log.debug({ title: 'Sublist Created: Sales by Month' });

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

            if (summary.grossSales) {
                sublist.setSublistValue({
                    id: 'custpage_gross_sales',
                    line: line,
                    value: summary.grossSales
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
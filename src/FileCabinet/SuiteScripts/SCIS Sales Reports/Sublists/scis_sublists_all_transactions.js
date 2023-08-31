/**
 * @NScriptType Suitelet
 * 
 * @by Joshua Hacker
 * @Description Sublist View for All Transactions Search
 */

define(['N/ui/serverWidget', 'N/log', '../Searches/scis_search_all_transactions.js'], function(serverWidget, log, searchByAllTransactions) {
    function createSublist(form) {
        
        var resultSet = searchByAllTransactions.runSalesSearch();
       
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
      
            do {
                var startIndex = pageIndex * resultsPerPage;
                var endIndex = startIndex + resultsPerPage;
      
                for (var i = startIndex; i < endIndex; i++) {
                    if (i >= resultSet.length) {
                        break;
                    }
      
                    var result = resultSet.get(i);
      
                    sublist.setSublistValue({
                        id: 'custpage_doc_number',
                        line: resultIndex,
                        value: result.getValue({ name: 'tranid', summary: 'GROUP' })
                    });
      
                    sublist.setSublistValue({
                        id: 'custpage_units_sold',
                        line: resultIndex,
                        value: result.getValue({ name: 'quantity', summary: 'SUM' })
                    });
      
                    sublist.setSublistValue({
                        id: 'custpage_gross_sales',
                        line: resultIndex,
                        value: result.getValue({ name: 'grossamount', summary: 'SUM' })
                    });
      
                    sublist.setSublistValue({
                        id: 'custpage_total_returns',
                        line: resultIndex,
                        value: result.getValue({ name: 'formulacurrency1', summary: 'SUM' })
                    });
      
                    sublist.setSublistValue({
                        id: 'custpage_total_discounts',
                        line: resultIndex,
                        value: result.getValue({ name: 'formulacurrency2', summary: 'SUM' })
                    });
      
                    sublist.setSublistValue({
                        id: 'custpage_total_taxes',
                        line: resultIndex,
                        value: result.getValue({ name: 'formulacurrency3', summary: 'SUM' })
                    });
      
                    sublist.setSublistValue({
                        id: 'custpage_net_sales',
                        line: resultIndex,
                        value: result.getValue({ name: 'netamount', summary: 'SUM' })
                    });
      
                    resultIndex++;
                }
            
      
                pageIndex++;
            } while (resultSet.isIndexAvailable(pageIndex * resultsPerPage));
      
            log.audit({ title: 'All Transactions Search: Results Provided' });
        }

    return {
        createSublist: createSublist
    };

});
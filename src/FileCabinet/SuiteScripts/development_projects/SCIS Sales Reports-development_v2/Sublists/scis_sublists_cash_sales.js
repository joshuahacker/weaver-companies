/**
 * @NScriptType Suitelet
 * 
 * @by Joshua Hacker
 * @Description Sublist View for Cash Sales Search
 */

define(['N/ui/serverWidget', 'N/log', '../Searches/scis_search_by_day.js'], function(serverWidget, log, searchByCashSales) {
    function createSublist(form) {

      //  var summaryResults = searchByCashSales.runSalesSearch();

 // SCIS Cash Sales Sublist 
                var sublist = form.addSublist({
                    id: 'custpage_sales_by_cash_sales',
                    type: serverWidget.SublistType.LIST,
                    label: 'Cash Sales',
                    tab: 'custpage_reports_transactions'
                });
            }

            return {
                createSublist: createSublist
            };
        
        });
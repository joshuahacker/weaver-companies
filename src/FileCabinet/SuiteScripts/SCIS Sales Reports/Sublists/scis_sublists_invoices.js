/**
 * @NScriptType Suitelet
 * 
 * @by Joshua Hacker
 * @Description Sublist View for Invoice Search
 */

define(['N/ui/serverWidget', 'N/log', '../../Searches/scis_search_by_cash_sales.js'], function(serverWidget, log, searchByInvoices) {
    function createSublist(form) {

        // var summaryResults = searchByInvoices.runSalesSearch();

 // SCIS Cash Sales Sublist 
                var sublist = form.addSublist({
                    id: 'custpage_sales_by_invoices',
                    type: serverWidget.SublistType.LIST,
                    label: 'Invoices',
                    tab: 'custpage_reports_transactions'
                });
            }

            return {
                createSublist: createSublist
            };
        
        });
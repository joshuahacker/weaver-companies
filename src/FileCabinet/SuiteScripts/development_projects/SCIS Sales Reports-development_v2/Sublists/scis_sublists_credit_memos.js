/**
 * @NScriptType Suitelet
 * 
 * @by Joshua Hacker
 * @Description Sublist View for Credit Memos Search
 */

define(['N/ui/serverWidget', 'N/log', '../../Searches/scis_search_by_cash_sales.js'], function(serverWidget, log, searchByCreditMemos) {
    function createSublist(form) {

       // var summaryResults = searchByCreditMemos.runSalesSearch();

 // SCIS Cash Sales Sublist 
                var sublist = form.addSublist({
                    id: 'custpage_sales_by_credit_memo',
                    type: serverWidget.SublistType.LIST,
                    label: 'Credit Memos',
                    tab: 'custpage_reports_transactions'
                });
            }

            return {
                createSublist: createSublist
            };
        
        });
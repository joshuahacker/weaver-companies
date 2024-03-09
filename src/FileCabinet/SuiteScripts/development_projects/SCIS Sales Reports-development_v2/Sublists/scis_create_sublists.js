/**
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * 
 * @by Joshua Hacker
 * @Description Create All Sublists
 */

/**  Transaction Sublists
    
    './Transaction Sublists/scis_sublists_cash_sales.js',
    './Transaction Sublists/scis_sublists_credit_memos.js',
    './Transaction Sublists/scis_sublists_invoices.js'
  */
   /** 
        ,
        sublistCashSales,
        sublistCreditMemos,
        sublistInvoices,
     */
define([
    'N/ui/serverWidget',
    'N/log', 
    './scis_sublists_by_day.js',
    './scis_sublists_by_week.js',
    './scis_sublists_by_month.js',
    './scis_sublists_items_sold.js'
    ], 
   
    function(
        serverWidget,
        log, 
        sublistByDay,
        sublistByWeek,
        sublistByMonth,
        sublistQuantitySoldByItem
        ){
            function createAllSublists(form) {
                try {
                    sublistByDay.createSublist(form);
                } catch (error) {
                    log.debug('Error creating sublist by day', error);
                }
        
                try {
                    sublistByWeek.createSublist(form);
                } catch (error) {
                    log.debug('Error creating sublist by week', error);
                }
        
                try {
                    sublistByMonth.createSublist(form);
                } catch (error) {
                    log.debug('Error creating sublist by month', error);
                }
                try {
                    sublistQuantitySoldByItem.createSublist(form);
                } catch (error) {
                    log.debug('Error creating sublist by quantity sold by item', error);
                }
            }
/**     
     sublistCashSales.createSublist(form);
     sublistCreditMemos.createSublist(form);
     sublistInvoices.createSublist(form);
*/   
    return {
      createAllSublists : createAllSublists
    };

  });
  
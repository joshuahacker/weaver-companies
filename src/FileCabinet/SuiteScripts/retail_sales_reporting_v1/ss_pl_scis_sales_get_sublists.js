/**
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * 
 * @by Joshua Hacker
 * @Description Create All Sublists
 */

define([
    'N/log', 
    './ss_pl_scis_sales_sublist.js',
    './ss_pl_scis_sales_sublist_day.js'
    ], 
   
    function(
        log, 
        plSalesSublist,
        plSalesSublistDay
        ){
            function createAllSublists(form, dateFilter) {        
                try {
                    plSalesSublist.createSublist(form, dateFilter);
                } catch (error) {
                    log.debug('Error creating sublists', error);
                }
                try {
                    plSalesSublistDay.createSublist(form, dateFilter);
                } catch (error) {
                    log.debug('Error creating sublists', error);
                }
            }
 
    return {
      createAllSublists : createAllSublists
    };

  });
  
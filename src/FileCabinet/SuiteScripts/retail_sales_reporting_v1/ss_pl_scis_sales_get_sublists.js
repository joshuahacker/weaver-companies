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
    ], 
   
    function(
        log, 
        plSalesSublist
        ){
            function createAllSublists(form, dateFilter) {        
                try {
                    plSalesSublist.createSublist(form, dateFilter);
                } catch (error) {
                    log.debug('Error creating sublists', error);
                }
            }
 
    return {
      createAllSublists : createAllSublists
    };

  });
  
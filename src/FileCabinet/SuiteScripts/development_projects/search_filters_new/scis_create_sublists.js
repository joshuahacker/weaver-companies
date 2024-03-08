/**
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * 
 * @by Joshua Hacker
 * @Description Create All Sublists
 */

define([
    'N/log', 
    './scis_sublists_by_week.js',
    ], 
   
    function(
        log, 
        sublistByWeek
        ){
            function createAllSublists(form, dateFilter) {        
                try {
                    sublistByWeek.createSublist(form, dateFilter);
                } catch (error) {
                    log.debug('Error creating sublist by week', error);
                }
            }
 
    return {
      createAllSublists : createAllSublists
    };

  });
  
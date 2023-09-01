/**
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * 
 * @by Joshua Hacker
 * @Description Create All Sublists
 */

        define([
            'N/ui/serverWidget',
            'N/log',
            './scis_sublists_by_week.js',
            './scis_sublists_by_month.js',
            ], 
           
            function(
                serverWidget,
                log, 
                sublistByWeek,
                sublistByMonth,
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

            return {
              createAllSublists : createAllSublists
            };
        
          });
          
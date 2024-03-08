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
    './scis_main_report.js'
], function (
    serverWidget,
    log,
    sublistMain
) {
    function createSublists(form) {
        try {
            sublistMain.createSublist(form);
        } catch (error) {
            log.debug('Error creating sublist Main', error);
        }
    }

    return {
        createSublists: createSublists
    };
});

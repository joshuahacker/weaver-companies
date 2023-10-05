/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
define(['N/https', 'N/log'], function(https, log) {
    function execute(context) {
        try {
            var createPoSuitelet = 'https://8025197-sb1.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=1430&deploy=1&compid=8025197_SB1&h=93ba0de026ef6e9f2538';
            
            var response = https.get({
                url: createPoSuitelet
            });

            log.debug('Response', response.body);

        } catch (e) {
            log.error('Error in Scheduled Script', e.toString());
        }
    }
    
    return {
        execute: execute
    };
});

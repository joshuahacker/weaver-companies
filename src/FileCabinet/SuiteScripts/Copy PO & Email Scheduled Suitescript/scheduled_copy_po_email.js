/**
 * @NApiVersion 2.x
 * @NScriptType ScheduledScript
 */
define(['N/https', 'N/log'], function(https, log) {
    function execute(context) {
        try {
            var createPoSuitelet = 'https://8025197.extforms.netsuite.com/app/site/hosting/scriptlet.nl?script=1426&deploy=2&compid=8025197&h=9501a8c3ef48970b642c';
            
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

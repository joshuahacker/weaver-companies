/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NScriptName campaign_permissions_cs.js
 * @NScriptAuthor jlh
 * @NDescription pageInit onEdit ClientScript to check users permissions
 *
 * redirects to campaign_permissions_ss.js Suitelet if access is denied on a campaign record. 
 * field: custevent_campaign_subsidiary
 * subsidiary 5 = NGD // role 1210 = NGD - Marketing Role
 * subsidary 6 = UN // role 1216 = UN - Marketing Role
 * check done based on marketing roles and record subsidiary
 */

define(['N/currentRecord', 'N/runtime', 'N/ui/dialog'],
    function(currentRecord, runtime, dialog) {

        function pageInit(context) {
            if (!checkPerms(context)) {


                var suiteletUrl = 'https://8025197.app.netsuite.com/app/site/hosting/scriptlet.nl?script=1530&deploy=1'

                dialog.alert({
                    title: 'Editing unavailable',
                    message: 'You are unable to edit this campaign.'
                }).then(function() {
                    window.location.href = suiteletUrl; 
                });
                return false;
            }
        }

        function checkPerms(context) {
            var record = currentRecord.get();
            var userRole = runtime.getCurrentUser().role;
            var recordSubsidiary = record.getValue({fieldId: 'custevent_campaign_subsidiary'});

            // define role & subsidiary access
            var hasPerms = false;
            switch (userRole) {
                case 1210:
                    hasPerms = (!recordSubsidiary || recordSubsidiary === '5');
                    break;
                case 1216: 
                hasPerms = (!recordSubsidiary || recordSubsidiary === '6');
                    break;
                default:
                    break;
            }
            return hasPerms;
        }

        return {
            pageInit: pageInit
        };
    });

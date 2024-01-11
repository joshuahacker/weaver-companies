/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NScriptName campaign_permissions_ue.js
 * @NScriptAuthor jlh
 * @NDescription beforeLoad UserEventScript to check users permissions 
 *
 * redirects to campaign_permissions_ss.js Suitelet if access is denied on a campaign record. 
 * field: custevent_campaign_subsidiary
 * subsidiary 5 = NGD
 * subsidary 6 = UN
 * check done based on marketing roles and record subsidiary
 */

define(['N/redirect', 'N/runtime', 'N/url', 'N/log'],
    function(redirect, runtime, url, log) {
        function beforeLoad(context) {
            if (context.type !== context.UserEventType.VIEW) {
                return;
            }

            var currentUser = runtime.getCurrentUser();
            var userRoleId = currentUser.role;
            var userName = currentUser.name
            var recordSubsidiary = context.newRecord.getValue({fieldId: 'custevent_campaign_subsidiary'});

            // role mapping for audit log
            function getRoleName(roleId) {
                var roleNames = {
                    1210: 'NGD',
                    1216: 'UN',
                };
            
                return roleNames[roleId] || 'Unknown Role';
            }
            
            // subsidiary mapping for audit log
            function getSubsidiaryName(subsidiaryId) {
                var subsidiaryNames = {
                    5: 'NGD',
                    6: 'UN',
                };
            
                return subsidiaryNames[subsidiaryId] || 'No Subsidiary';
            }

            var hasAccess = false;

            // access based on user's current role
            switch (userRoleId) {
                case 1210: // NGD - Marketing Role
                    hasAccess = (!recordSubsidiary || recordSubsidiary === '5');
                    break;
                case 1216: // UN - Marketing Role
                    hasAccess = (!recordSubsidiary || recordSubsidiary === '6');
                    break;
                default:
                    break;
            }

            var roleName = getRoleName(userRoleId);
            var subsidiaryName = getSubsidiaryName(recordSubsidiary);

            log.audit({
                title: 'Permissions Log:',
                details:
                    'Access Granted: ' + hasAccess + ', ' +
                    'Name: ' + userName + ', ' +
                    'Role: ' + roleName + ', ' +
                    'Campaign Subsidiary: ' + subsidiaryName
            });
            
            

            // Redirect to access denied SS
            if (!hasAccess) {
                var suiteletUrl = url.resolveScript({
                    scriptId: 'customscript_campaign_permissions_ss',
                    deploymentId: 'customdeploy_campaign_permissions_ss',
                    returnExternalUrl: false
                });

                redirect.redirect({
                    url: suiteletUrl
                });
            }
        }

        return {
            beforeLoad: beforeLoad
        };
    });

/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NScriptName campaign_permissions_ss.js
 * @NScriptAuthor jlh
 * @NDescription suitelet displaying access denied page and back button 
 *
 * campaign_permissions_ue.js & campaign_permissions_cs.js redirects here if access is denied on a campaign record. 
 * check done based on marketing roles and record subsidiary
 */

define(['N/ui/serverWidget', 'N/log', 'N/runtime', 'N/url'], 
function(serverWidget, log, runtime, url) {

    function onRequest(context) {
        var form = serverWidget.createForm({
            title: ' ',
        });

        var inlineHtmlField = form.addField({
            id: 'custpage_combined_html',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'Inline HTML'
        });

        var backButtonUrl = url.resolveTaskLink({
            id: 'CARD_-29'
        });
        inlineHtmlField.defaultValue = 
            '<div style="text-align: center; margin-top: 100px;">' + // Center
            '<p style="color: grey; font-size: 20px; font-weight: bold;">Campaign Unavailable.</p>' +
            '<p style="color: black; font-size: 16px; font-weight: bold;">This campaign is not associated with your current subsidiary.</p>' +
            '<p style="color: black; font-size: 14px;">Please switch roles to the proper subsidiary or<br>contact your administrator to view this campaign.</br>' +
            '<input type="button" value="Go Back" ' +
            'onclick="window.location.href=\'' + backButtonUrl + '\'" ' +
            'style="margin-top: 20px; padding: 10px 20px; font-size: 14px; font-weight: bold; color: white; background-color: #0070C0; border: none; border-radius: 5px; cursor: pointer;"/>' +
            '</div>';

    context.response.writePage(form);

    var currentUser = runtime.getCurrentUser()
    var userName = currentUser.name

        log.audit({
            title: 'Campaign Permissions Denied',
            details: 'Access Denied for ' + userName
        });
    }

    return {
        onRequest: onRequest
    };
});



/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define([
    'N/ui/serverWidget', 
    'N/log', 
    './create_sublists.js',
    ], 
    function(
        serverWidget, 
        log, 
        createAllSublists
        ){

     function onRequest(context) {
            // Create the Suitelet form

            var form = serverWidget.createForm({
                title: 'Nearest Green Distillery - Retail Sales'
            });

            // Form Tabs
            var reportsDateTab = form.addTab({
                id: 'custpage_reports_date_tab',
                label: 'Reports by Date'
            });

            var reportsAnalyticsTab = form.addTab({
                id: 'custpage_reports_analytics_tab',
                label: 'Report Analytics'
            });

            // Function to Create All Sublists 
            createAllSublists.createAllSublists(form);

            context.response.writePage(form);

    }

    return {
        onRequest: onRequest
    };
});

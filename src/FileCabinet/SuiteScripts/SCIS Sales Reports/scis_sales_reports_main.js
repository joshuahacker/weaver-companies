/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define([
    'N/ui/serverWidget', 
    'N/log', 
    './Sublists/scis_create_sublists.js',
    ], 
    function(
        serverWidget, 
        log, 
        createAllSublists
        ){

     function onRequest(context) {
        if (context.request.method === 'GET') {
            // Create the Suitelet form

            var fromDate = context.request.parameters.custpage_from_date;
            var toDate = context.request.parameters.custpage_to_date;

            var dateFilter = {
                fromDate: fromDate,
                toDate: toDate
            };

            log.debug(dateFilter)

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
            createAllSublists.createAllSublists(form, dateFilter);

            context.response.writePage(form);
        } else if (context.request.method === 'POST') {
            // Handle the POST request with the parameters
            var params = context.request.parameters;


            // Create the response
            var response = {
                message: 'Parameters received',
                params: params
            };

            // Send the response as JSON
            context.response.write(JSON.stringify(response));
        }
    }

    return {
        onRequest: onRequest
    };
});

/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define([
    'N/ui/serverWidget', 
    'N/log', 
    './ss_pl_scis_sales_get_sublists.js',
    ], 
    function(
        serverWidget, 
        log, 
        createAllSublists
        ){

     function onRequest(context) {
        if (context.request.method === 'GET') {
            // Create the Suitelet form

            var dateFrom = context.request.parameters.custpage_from_date;
            var dateTo = context.request.parameters.custpage_to_date;

            var dateFilter = {
                dateFrom: dateFrom,
                dateTo: dateTo
            };

            log.debug(dateFilter)

            var form = serverWidget.createForm({
                title: '160 - Retail Sales Profit & Loss'
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

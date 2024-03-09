/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

define(['N/url'], function(url) {

    function pageInit() {
        console.log('Page Initialized');
        document.getElementById('custpage_applyFilter').addEventListener('click', applyFilter);
    }

    function applyFilter() {
        var dateFrom = document.getElementById('custpage_date_from').value;
        var dateTo = document.getElementById('custpage_date_to').value;

        // Validate the selected date range
        if (dateFrom && dateTo && dateFrom !== '' && dateTo !== '') {
            // Perform your logic here with the selected dates
            console.log('From Date: ' + dateFrom);
            console.log('To Date: ' + dateTo);

            var params = {
                custpage_from_date: dateFrom,
                custpage_to_date: dateTo
            };

            var suiteletURL = url.resolveScript({
                scriptId: 'customscript_scis_sales_report_main_js',
                deploymentId: 'customdeploy_scis_sales_report_main_js'
            });

            suiteletURL += '&' + Object.keys(params).map(function(key) {
                return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
            }).join('&');

            window.location.href = suiteletURL;
        } else {
            alert('Please select a valid date range.');
        }
    }

    return {
        pageInit: pageInit
    };
});

/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */

define(['N/url', 'N/log'], function (url, log) {

    function pageInit() {
        console.log('Page Initialized');
        document.getElementById('custpage_applyFilters').addEventListener('click', applyFilters);
    }

    function applyFilters() {
        var dateFrom = document.getElementById('custpage_from_date').value;
     
        var dateTo = document.getElementById('custpage_to_date').value;
      
        // Validate the selected date range
        if (dateFrom && dateTo && dateFrom !== '' && dateTo !== '') {
            var params = {
                custpage_from_date: dateFrom, 
                custpage_to_date: dateTo
            };

            log.debug({params})

            console.log('Page Here');
            var suiteletURL = url.resolveScript({
                scriptId: 'customscript_filters_test',
                deploymentId: 'customdeploy_filters_test'
            });

            suiteletURL += '&' + Object.keys(params).map(function (key) {
                return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
            }).join('&');

            window.location.href = suiteletURL;
        } else {
            alert('Please select a valid date range.');
        }
    }

     return {
        pageInit: pageInit,
        
    };
});





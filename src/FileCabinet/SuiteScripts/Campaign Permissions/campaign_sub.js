/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 */
define(['N/url', 'N/log'], 
function(url, log) {

    function pageInit(context) {
        if (sessionStorage.getItem("subsidiaryMismatch") === "true") {
            sessionStorage.removeItem("subsidiaryMismatch"); // Clear the flag

            var suiteletUrl = url.resolveScript({
                scriptId: 'customscript_campaign_sub_ss',
                deploymentId: 'customdeploy_campaign_sub_ss',
                returnExternalUrl: true
            });

            window.location.href = suiteletUrl; // Redirect in the same window
        }
    }

    return {
        pageInit: pageInit
    };
});

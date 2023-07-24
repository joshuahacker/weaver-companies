/**
 *@NApiVersion 2.x
 *@NScriptType UserEventScript
 */
 define(['N/url'],
 function(url) {
     function beforeLoad(context) {
         var rec = context.newRecord;
         var department = rec.getValue('department');
         if (department !== 'retail')
         context.cancel = true; // Cancel the form loading
         {
             var suiteletUrl = url.resolveScript({
                 scriptId: 'customscript_retail_access_denied',
                 deploymentId: 'customdeploy_retail_access_denied'
             });
             var redirectScript = "<script>window.location.href = '" + suiteletUrl + "';</script>";
             context.form.addField({
                 id: 'custpage_redirect_script',
                 type: 'inlinehtml',
                 label: 'Redirect Script'
             }).defaultValue = redirectScript;

            
         }
     }

     return {
         beforeLoad: beforeLoad
     };
 });

/**
 *@NApiVersion 2.0
 *@NScriptType UserEventScript
*/
define(['N/ui/serverWidget', 'N/record', 'N/ui/message'],
    function(serverWidget, record, message) {
        function beforeLoad(context) {

          var rec = context.newRecord; {
            var department = rec.getValue('department');
            if (department !== 'retail') {
                var listUrl = '/app/site/hosting/scriptlet.nl?script=1247&deploy=1';
                var redirectScript = "<script>window.location.href = '" + listUrl + "';</script>";
              context.form.addField({
                id: 'custpage_redirect_script',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'Redirect Script'
              }).defaultValue = redirectScript;
            }
          }
        }

    return {
        beforeLoad: beforeLoad 
    };
});

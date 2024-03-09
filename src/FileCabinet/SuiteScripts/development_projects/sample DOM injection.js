
/**
 * @NApiVersion 2.0
 * @NScriptType UserEventScript
 * @NModuleScope Public
 */
define(['N/ui/serverWidget'],
 
function(serverWidget) {
     
    function beforeLoad(context) {
        context.form.addField({
            id: 'custpage_stickyheaders_script',
            label: 'Hidden',
            type: serverWidget.FieldType.INLINEHTML
        }).defaultValue = '<script>' +
            '(function($){' +
                '$(function($, undefined){' +
                 // Whatever is here will be executed after the page loads
                 // $('.uir-machine-table-container').css(...) comes here
                '});' +
            '})(jQuery);' +
        '</script>';
    }
     
    return {
        beforeLoad: beforeLoad
    };
});
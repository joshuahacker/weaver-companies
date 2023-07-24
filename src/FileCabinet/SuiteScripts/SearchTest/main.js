/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define([
    'N/ui/serverWidget',
    'N/log',
    'N/url',
    './sublist.js'
],
function(
    serverWidget,
    log,
    url,
    createSublist
) {

    function onRequest(context) {


        // Create form
        var form = serverWidget.createForm({
            title: 'Test Search Filters'
        });


        // Add the date filter fields to the form
        var dateFieldGroup = form.addFieldGroup({
            id: 'custpage_date_group',
            label: 'Filters',
        });

        var defaultFromDate = '';
        var defaultToDate = '';

        var fromDateField = form.addField({
            id: 'custpage_from_date',
            type: serverWidget.FieldType.DATE,
            label: 'From Date',
            container: 'custpage_date_group'
        });

        fromDateField.updateDisplaySize({
            height: 60,
            width: 60
        }).updateLayoutType({
            layoutType: serverWidget.FieldLayoutType.STARTROW
        }).defaultValue = defaultFromDate;

        var toDateField = form.addField({
            id: 'custpage_to_date',
            type: serverWidget.FieldType.DATE,
            label: 'To Date',
            container: 'custpage_date_group'
        });

        toDateField.updateDisplaySize({
            height: 60,
            width: 60
        }).updateLayoutType({
            layoutType: serverWidget.FieldLayoutType.MIDROW
        }).defaultValue = defaultToDate;

        var buttonField = form.addField({
            id: 'custpage_button_field',
            type: serverWidget.FieldType.INLINEHTML,
            label: 'button',
            container: 'custpage_date_group'
        });

            buttonField.defaultValue =
            '<input id="custpage_applyFilters" onclick="require([\'/SuiteScripts/SearchTest/button_click\'], function(client) { onclick.client.applyFilters(); });" type="button" name="applyFilters" value="Search" style="width:150px; height:30px; cursor: pointer; background-color:#378FFA;border:1px solid #9DBFF2; color:#FFFFFF; font-weight: bold;">';
        
        buttonField.updateLayoutType({
            layoutType: serverWidget.FieldLayoutType.ENDROW
        });

        form.clientScriptModulePath = './button_click.js';

        


        if (context.request.method === 'POST') {
            var dateFrom = context.request.parameters.custpage_from_date;
            var dateTo = context.request.parameters.custpage_to_date;

            createSublist.createSublist(form, dateTo, dateFrom)
        }
            else {
                createSublist.createSublist(form);
            }
            
        

        // Send the response
        context.response.writePage(form);
    }

    return {
        onRequest: onRequest
    };
});

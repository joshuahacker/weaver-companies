/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define([
    'N/ui/serverWidget/',
    'N/log'
], 

function(serverWidget, log) {
    function onRequest(context) {
        if (context.request.method === 'GET') {

// Create Form
            var form = serverWidget.createForm({
                title: 'Nearest Green Distillery - Retail Sales (NEW)'
            });
// Form Tabs
            var reportsDateTab = form.addTab({
                id: 'custpage_reports_date_tab',
                label: 'Reports by Date'
            });

// Add Date Filters

            var dateFieldGroup = form.addFieldGroup({
                id: 'custpage_date_group',
                label: 'Filters',
                tab: 'custpage_reports_date_tab',
            });

            var fromDateField = form.addField({
                id: 'custpage_date_from',
                type: serverWidget.FieldType.DATE,
                label: 'From Date',
                containter: 'custpage_date_group',
            });

// Add Button 

            var buttonField = form.addField({
                id: 'custpage_button_field',
                type: serverWidget.FieldType.INLINEHTML,
                label: 'button',
                container: 'custpage_date_group',
            });

            buttonField.defaultValue = 
            '<input id="custpage_applyFilter" onclick="applyFilter" type="button" name="applyFilter" value="Search" style="width:110px; height:30px; margin-top:5px; margin-left: 10px; cursor: pointer; background-color:#378FFA; border:1px solid #9DBFF2; color:#FFFFFF; font-weight: bold;">';

            buttonField.updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.MIDROW
            });

            form.clientScriptModulePath = './scis_cs_datefilter.js';

            context.response.writePage(form)

        } else if (context.request.method === 'POST') {
            // POST REQUEST
            var params = context.request.parameters;

            var response = {
                message: 'Parameters receivted',
                params: params
            };
            context.response.write*JSON.stringify(response);
        };


        return {
             onRequest: onRequest
        };
    }}
);
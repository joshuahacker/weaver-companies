/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 * @by Joshua Hacker
 * @Description SCIS Reporting Suitelet
 */

define(['N/ui/serverWidget', 'N/log', './sublist_all_transactions.js'], function(serverWidget, log, sublistAllTrans) {
    function onRequest(context) {
        if (context.request.method === 'GET') {
            // Create Form
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

            // Add the date filter fields to the form
            var dateFieldGroup = form.addFieldGroup({
                id: 'custpage_date_group',
                label: 'Filters',
                tab: 'custpage_reports_date_tab'
            });

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
            });

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
            });

            var hiddenField = form.addField({
                id: 'custpage_hidden_field',
                type: serverWidget.FieldType.TEXT,
                label: 'Hidden',
                container: 'custpage_date_group'
            });

            hiddenField.updateDisplayType({
                displayType: serverWidget.FieldDisplayType.HIDDEN
            }).updateDisplaySize({
                height: 100,
                width: 100
            }).updateLayoutType({
                layoutType: serverWidget.FieldLayoutType.MIDROW
            });

            createSublists(form);

            form.addSubmitButton({
                label: 'Submit'
            });
            
        } else if (context.request.method === 'POST') {
            var dateFrom = context.request.parameters.custpage_from_date;
            var dateTo = context.request.parameters.custpage_to_date;
        }
    }

    function createSublists(form) {
        try {
            sublistAllTrans.createSublist(form);
        } catch (error) {
            log.debug('Error creating sublist: all transactions', error);
        }
    }

    return {
        onRequest: onRequest
    };
});

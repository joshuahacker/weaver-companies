/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define(['N/search', 'N/ui/serverWidget'], function(search, serverWidget) {

    function onRequest(context) {
        var form = serverWidget.createForm({
            title: 'Multiple Search Results',
            clientScriptFileId: '14934'
        });

    // Add date filter fields
    form.addField({id: 'datefrom', type: serverWidget.FieldType.DATE, label: 'Date From'}).defaultValue = dateFrom || '';
    form.addField({id: 'dateto', type: serverWidget.FieldType.DATE, label: 'Date To'}).defaultValue = dateTo || '';

    form.addSubmitButton({label: 'Filter'});

        var searchConfigurations = [
            {
                id: 'customsearch_ns_pos_transactions',
                label: 'Transaction List',
                fields: [
                    { id: 'trandate', type: serverWidget.FieldType.DATE, label: 'Date' },
                    { id: 'tranid', type: serverWidget.FieldType.TEXT, label: 'Transaction #' },
                    {id: 'amount', type: serverWidget.FieldType.TEXT, label: 'Amount'}
                ]
            },
            {
                id: 'customsearch_ns_pos_transactions',
                label: 'Transaction List 2',
                fields: [
                    { id: 'trandate', type: serverWidget.FieldType.DATE, label: 'Date' },
                    { id: 'tranid', type: serverWidget.FieldType.TEXT, label: 'Transaction #' },
                    {id: 'amount', type: serverWidget.FieldType.TEXT, label: 'Amount'}
                ]
            }
        ];

        searchConfigurations.forEach(function(config) {
            addSublistToForm(form, config, dateFrom, dateTo);
        });

        context.response.writePage(form);
    }

    function addSublistToForm(form, config, dateFrom, dateTo) {
        var sublist = form.addSublist({
            id: config.label.replace(/\s+/g, '').toLowerCase(),
            type: serverWidget.SublistType.LIST,
            label: config.label
        });

        config.fields.forEach(function(fieldId) {
            sublist.addField({
                id: fieldId,
                type: serverWidget.FieldType.TEXT,
                label: fieldId
            });
        });

        var searchResults = findTrans(config.id, dateFrom, dateTo);
        for (var i = 0; i < searchResults.length; i++) {
            var result = searchResults[i];
            config.fields.forEach(function(fieldId) {
                sublist.setSublistValue({
                    id: fieldId,
                    line: i,
                    value: result.getValue({name: fieldId})
                });
            });
        }
    }

    function findTrans(searchId, dateFrom, dateTo) {
        var transactionSearch = search.load({
            id: searchId
        });

        if (dateFrom || dateTo) {
            var filters = [];

            if (dateFrom) {
                filters.push(['trandate', 'onorafter', dateFrom]);
            }

            if (dateTo) {
                filters.push('and', ['trandate', 'onorbefore', dateTo]);
            }

            transactionSearch.filterExpression = filters;
        }

        return transactionSearch.run().getRange({start: 0, end: 50});
    }

    return {
        onRequest: onRequest
    };
});
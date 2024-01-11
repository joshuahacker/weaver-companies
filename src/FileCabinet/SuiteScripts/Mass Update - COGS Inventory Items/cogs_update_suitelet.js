/**
 * Module to update COGS G/L account for all inventory items
 * 
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define(['N/record', 'N/search', 'N/ui/serverWidget'], function(record, search, serverWidget) {

    function onRequest(context) {
        if (context.request.method === 'GET') {
            var form = serverWidget.createForm({
                title: 'Update COGS G/L Account'
            });
            form.addButton({
                id: 'custpage_submit_button',
                label: 'Update COGS',
                functionName: 'startUpdate'
            });
            form.clientScriptModulePath = './cogs_update_client.js'; // Path to your client script
            context.response.writePage(form);
        } else {
            log.audit('COGS Update', 'Update process started.');
            updateCOGSAccount();
            log.audit('COGS Update', 'Update process completed.');
            context.response.write('COGS G/L account update completed.');
        }
    }

    function updateCOGSAccount() {
        var COGS_GL_ACCOUNT = '264'; //  desired COGS G/L account

    

        var inventoryItemSearch = search.create({
            type: search.Type.INVENTORY_ITEM,
            columns: ['internalid'],
            filters: [
                ['cogsaccount', 'anyof', '629']
            ]
        });

        var pagedData = inventoryItemSearch.runPaged({ pageSize: 1000 });
        pagedData.pageRanges.forEach(function(pageRange) {
            var myPage = pagedData.fetch({ index: pageRange.index });
            myPage.data.forEach(function(result) {
                var itemId = result.getValue({ name: 'internalid' });
                updateItem(itemId, COGS_GL_ACCOUNT);
            });
        });
    }

    function updateItem(itemId, COGS_GL_ACCOUNT) {
        var inventoryItemRecord = record.load({
            type: record.Type.INVENTORY_ITEM,
            id: itemId
        });

        inventoryItemRecord.setValue({
            fieldId: 'cogsaccount',
            value: COGS_GL_ACCOUNT
        });

        inventoryItemRecord.save();
    }

    return {
        onRequest: onRequest
    };
});

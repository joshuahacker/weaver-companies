/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */

define(['N/record', 'N/log', 'N/email', 'N/render'], 
    function(record, log, email, render) {
    function onRequest() {
        try {
            var newPO = record.copy({
                type: record.Type.PURCHASE_ORDER,
                id: 37323
            });

                log.audit('New PO Details:', newPO);

            var saveNewPO = newPO.save();

            var newPO_ID = saveNewPO

                log.audit('New PO ID:', newPO_ID);

            var emailPO = render.mergeEmail({
                templateId: 7,  
                entity: {
                type: record.Type.VENDOR, 
                id: 1297  
                },
                transactionId: newPO_ID
            });

            var exportPDF = render.transaction({
                entityId: newPO_ID,
                printMode: render.PrintMode.PDF
            });
        
            var sendEmailPO = email.send({
                author: 959,
                recipients: newPO.getValue({fieldId: 'email'}),  
                subject: emailPO.subject,
                body: emailPO.body,
                transactionId: newPO_ID,
                attachments: [exportPDF]
            });           
            
                log.audit('Email PO:', emailPO);

        } catch (e) {

                log.error('Error in Suitelet', e.toString());
        }
    }
    
    return {
        onRequest: onRequest
    };
});

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
                    id: 39488
                });

                var poDueDate = new Date();
                poDueDate.setDate(poDueDate.getDate() + 14);

                    log.audit('New PO Due Date:', poDueDate);

                newPO.setValue({
                    fieldId: 'duedate',
                    value: poDueDate
                });

                    log.audit('New PO Details:', newPO);

                var saveNewPO = newPO.save();
                var newPO_ID = saveNewPO

                    log.audit('New PO Internal ID:', newPO_ID);

              var loadNewPO = record.load({
                    type: record.Type.PURCHASE_ORDER,
                    id: newPO_ID
                });

                var tranId = loadNewPO.getValue('tranid');

                    log.audit('New PO #:', tranId);

                var vendorEmail = newPO.getValue({fieldId: 'email'});

                    log.audit('Vendor Email:', vendorEmail)

                var emailPO = render.mergeEmail({
                    templateId: 7,  
                    entity: {
                    type: record.Type.VENDOR, 
                    id: 413  
                    },
                    transactionId: newPO_ID
                });

                var exportPDF = render.transaction({
                    entityId: newPO_ID,
                    printMode: render.PrintMode.PDF
                });

                exportPDF.name = tranId + '.pdf';

                var sendEmailPO = email.send({
                    author: 217,
                    recipients: newPO.getValue({fieldId: 'email'}),
                    cc: ['rarrington@kimbrooil.com'],
                    bcc: ['susan.nogues@ng-d.com', 'netsuiteadmin@unclenearest.com'], 
                    subject: emailPO.subject,
                    body: emailPO.body,
                    relatedRecords: ({
                      transactionId: newPO_ID
                    }),
                    attachments: [exportPDF]
                });           
                
                    log.audit('Email PO:', emailPO);
                    log.audit('Email should have sent', 'Verify Email Sent List or Communication tab')

            } catch (e) {

                    log.error('Error in Suitelet', e.toString());
            }
        };

            return {
                    onRequest: onRequest
                };
    }
);

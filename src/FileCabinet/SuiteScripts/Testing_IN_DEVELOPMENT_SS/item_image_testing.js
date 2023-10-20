/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search'], function(record, search) {
    function beforeLoad(context) {
        if (context.type !== context.UserEventType.VIEW && context.type !== context.UserEventType.EDIT) {
            return;
        }

        var itemRecord = context.newRecord;
        var upcCode = itemRecord.getValue({ fieldId: 'upccode' }); 

        if (!upcCode) {
            return;
        }

        // Search for the image file based on the UPC code
        var imageSearch = search.create({
            type: search.Type.FILE,
            filters: [
                ['name', 'contains', upcCode]
            ]
        });

        var imageId;
        imageSearch.run().each(function(result) {
            imageId = result.id;
            return false; // stop after the first result
        });

        if (imageId) {
            itemRecord.setValue({
                fieldId: 'custitem_atlas_item_image', // Replace with your custom image field ID
                value: imageId
            });
        }
    }

    return {
        beforeLoad: beforeLoad
    };
});

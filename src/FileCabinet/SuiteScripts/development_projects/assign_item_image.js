/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/log'], function(record, search, log) {
    function beforeLoad(context) {
        if (context.type !== context.UserEventType.VIEW && context.type !== context.UserEventType.EDIT) {
            log.debug('Exiting Script', 'Context type is not VIEW or EDIT');
            return;
        }

        var itemRecord = context.newRecord;
        var upcCode = itemRecord.getValue({ fieldId: 'upccode' });
        var currentImage = itemRecord.getValue({ fieldId: 'custitem_item_image' });

        if (!upcCode || currentImage) {
            return;
        }

        // Search for the image file based on the UPC code
        var imageSearch = search.create({
            type: 'file',
            filters: [['name', 'contains', upcCode]],
            columns: [search.createColumn({ name: 'url' })]
        });

        var imageUrl;
        imageSearch.run().each(function(result) {
            imageUrl = result.getValue({ name: 'url' });
            log.debug('Image URL Found', imageUrl);
            return false;
        });

        if (imageUrl) {
            var imageField = context.form.getField({ id: 'custitem_item_image' }); 
            if (imageField) {
                imageField.defaultValue = '<img src="' + imageUrl + '" alt="Item Image" style="max-width: 100px; max-height: 200px;">';
            } else {
                log.debug('Field Not Found', 'The field custitem_image_assign was not found on the form.');
            }
        }
    }

    return {
        beforeLoad: beforeLoad
    };
});

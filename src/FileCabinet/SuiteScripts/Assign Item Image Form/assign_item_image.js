/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 */
define(['N/record', 'N/search', 'N/log', 'N/ui/serverWidget'], function(record, search, log, serverWidget) {
    function beforeLoad(context) {
        if (!(context.type === context.UserEventType.VIEW || context.type === context.UserEventType.EDIT)) {
            log.debug('Exiting Script', 'Context type is not VIEW or EDIT');
            return;
        }

        var itemRecord = context.newRecord;
        var upcCode = itemRecord.getValue({ fieldId: 'upccode' });
        var currentImage = itemRecord.getValue({ fieldId: 'custitem_item_image' });

        // Only proceed if there is a UPC code and no current image
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
            return false; // Stop after finding the first match
        });

        if (imageUrl) {
            var html = '<div id="imageContainer" style="display: flex; padding-top: 5px; margin-left: 5px; padding-bottom: 5px;"><img src="' + imageUrl + '" alt="Item Image" style="max-width: 200px; max-height: 200px;"></div>';
            
            var htmlField = context.form.getField({
                id: 'custitem_item_image',
                type: serverWidget.FieldType.INLINEHTML,
                label: ' ',
                container: '',
            });
            htmlField.defaultValue = html;
                  htmlField.updateDisplayType({
    displayType: serverWidget.FieldDisplayType.INLINE
        })
   
        }
    }
    return {
        beforeLoad: beforeLoad
    };
});

/**
 *@NApiVersion 2.1
 *@NScriptType MassUpdateScript
 */
 define(['N/record'], (record) => {

    function each(params) {
        // Load the inventory item record
        let recInventoryItem = record.load({
            type: params.type,
            id: params.id
        });
        
        // Update the COGS G/L account
        const COGS_GL_ACCOUNT = '264'; // desired COGS G/L account
        recInventoryItem.setValue('cogsaccount', COGS_GL_ACCOUNT);
        recInventoryItem.save();
    }
    
    return {
        each: each
    };
});

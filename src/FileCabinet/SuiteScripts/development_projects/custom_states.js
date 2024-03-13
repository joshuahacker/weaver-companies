/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([], 
    () => {
  const NsLabelColor = {
            BLUE:   '#d5e0ec',
            YELLOW: '#fcf9cf',
            GREEN:  '#d7fccf',
            RED:    '#fccfcf'
        }

        const beforeLoad = (scriptContext) => {
            try {
                let recordId = scriptContext.newRecord.id;
                let recordType = scriptContext.newRecord.type;

                // Assume you're determining landed cost applied by checking a field on the record
                // For example, if 'landedcostmethod' being set indicates landed cost applied, replace 'your_indicator_field' with 'landedcostmethod'
                // or use any other indicator field or logic suitable for your use case
                let landedCostApplied = scriptContext.newRecord.getValue({fieldId: 'your_indicator_field'});

                let stateTxt = 'Landed Cost Not Applied';
                let bgColor = NsLabelColor.YELLOW;

                if (landedCostApplied) {
                    stateTxt = 'Landed Cost Applied';
                    bgColor = NsLabelColor.GREEN;
                }

                scriptContext.form.addField({
                    id: 'custpage_nsi_status',
                    label: 'Custom State',
                    type: 'inlinehtml'
                }).defaultValue = `<script>jQuery(function($){
                    require([], function() {
                        $(".uir-page-title-secondline").append('<div class="uir-record-status" id="pri-amz-status" style="background-color: ${bgColor}">${stateTxt}</div>');
                    });
                })</script>`;

            } catch (e) {
                log.error('Error', `Suppressing error encountered while attempting to set the custom state: ${e}`)
            }
        }

        return {beforeLoad}
    });
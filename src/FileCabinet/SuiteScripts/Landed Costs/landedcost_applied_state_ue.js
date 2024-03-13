/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define([], 
    () => {
  const NsLabelColor = {
            BLUE:   '#d5e0ec',
            YELLOW: '#fcf9cf',
            GREEN:  '#90EE90',
            RED:    '#fccfcf'
        }

        const beforeLoad = (scriptContext) => {
            try {
                let recordId = scriptContext.newRecord.id;
                let recordType = scriptContext.newRecord.type;

                let landedCostApplied = scriptContext.newRecord.getValue({fieldId: 'landedcostmethod'});

                let stateTxt = 'Landed Cost Unapplied';
                let bgColor = NsLabelColor.YELLOW;

                if (landedCostApplied) {
                    stateTxt = 'Landed Cost Applied';
                    bgColor = NsLabelColor.GREEN;
                }
                
                var css = `font-size: 12px; text-align: center; font-weight: bold; border: .2px ; border-radius: 5px; background-color: ${bgColor};`;


                scriptContext.form.addField({
                    id: 'custpage_nsi_status',
                    label: 'Custom State',
                    type: 'inlinehtml'
                }).defaultValue = `<script>jQuery(function($){
                    require([], function() {
                        $(".uir-page-title-secondline").append('<div class="uir-record-status" id="pri-amz-status" style="${css}">${stateTxt}</div>');
                    });
                })</script>`;

            } catch (e) {
                log.error('Error', `Suppressing error encountered while attempting to set the custom state: ${e}`)
            }
        }

        return {beforeLoad}
    });
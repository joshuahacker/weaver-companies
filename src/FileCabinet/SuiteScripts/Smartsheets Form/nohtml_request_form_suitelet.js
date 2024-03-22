/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */

define([
  'N/ui/serverWidget',
  'N/https',
  'N/log'], 
  function(serverWidget, https, log) {

    function onRequest(context) {
      if (context.request.method === 'GET') {
        var form = serverWidget.createForm({
          title: 'Submit Data to Smartsheet',
        });

        var emailField = form.addField({
          id: 'email',
          type: serverWidget.FieldType.EMAIL,
          label: 'Email',
          align: serverWidget.LayoutJustification.CENTER
      });

      emailField.updateLayoutType({
        layoutType: serverWidget.FieldLayoutType.OUTSIDE
    });

    emailField.updateLayoutType({
      layoutType: serverWidget.FieldLayoutType.MIDROW
  });

      emailField.updateBreakType({
        breakType : serverWidget.FieldBreakType.STARTROW
    });

        var requestField = form.addField({
          id: 'request',
          type: serverWidget.FieldType.TEXT,
          label: 'request',
      });

      requestField.updateLayoutType({
        layoutType: serverWidget.FieldLayoutType.OUTSIDE
    });

      requestField.updateBreakType({
        breakType : serverWidget.FieldBreakType.STARTROW
    });

      var priorityField = form.addField({
          id: 'priority',
          type: serverWidget.FieldType.SELECT,
          label: 'Priority',
      });
      priorityField.addSelectOption({ value: 'Low', text: 'Low' });
      priorityField.addSelectOption({ value: 'Medium', text: 'Medium' });
      priorityField.addSelectOption({ value: 'High', text: 'High' });

      priorityField.updateLayoutType({
        layoutType: serverWidget.FieldLayoutType.OUTSIDE
    });

      priorityField.updateBreakType({
        breakType : serverWidget.FieldBreakType.STARTROW
    });

      var descriptionField = form.addField({
          id: 'description',
          type: serverWidget.FieldType.TEXTAREA,
          label: 'Description',
      });

      descriptionField.updateLayoutType({
        layoutType: serverWidget.FieldLayoutType.OUTSIDE
    });
      descriptionField.updateBreakType({
        breakType : serverWidget.FieldBreakType.STARTROW
    });

      var departmentField = form.addField({
          id: 'department',
          type: serverWidget.FieldType.SELECT,
          label: 'Department',
      });
      // Add placeholder options for now
      departmentField.addSelectOption({ value: 'HR', text: 'HR' });
      departmentField.addSelectOption({ value: 'Finance', text: 'Finance' });
      departmentField.addSelectOption({ value: 'Engineering', text: 'Engineering' });

      departmentField.updateLayoutType({
        layoutType: serverWidget.FieldLayoutType.OUTSIDE
    });

      departmentField.updateBreakType({
        breakType : serverWidget.FieldBreakType.STARTROW
    });

      var fileField = form.addField({
          id: 'file_upload',
          type: serverWidget.FieldType.FILE,
          label: 'Upload File',
      });

      fileField.updateLayoutType({
        layoutType: serverWidget.FieldLayoutType.OUTSIDE
    });

      fileField.updateBreakType({
        breakType : serverWidget.FieldBreakType.STARTROW
    });

    
    
      form.addSubmitButton({
          label: 'Submit',
      });

  context.response.writePage(form); 

      } else if (context.request.method === 'POST') {
        var email = context.request.parameters.email;
        var request = context.request.parameters.request;

        var url = 'https://api.smartsheet.com/2.0/sheets/8099869281439620/rows';
        var headers = {
          Authorization: 'Bearer f7p3GUEUTlu36DJlUuL18rNsQrkw7iRB6lbCu',
          'Content-Type': 'application/json',
          'Accept': 'application/json'  // Add this line
        };
        

        var payload = JSON.stringify({
          toBottom: true,
          cells: [
            { columnId: '4049849804607364', value: email },
            { columnId: '8553449431977860', value: request },
          ],
        });

        try {
          var response = https.post({
            url: url,
            headers: headers,
            body: payload,
          });
          var responseBody = response.body;
          context.response.write('Data submitted to Smartsheet: ' + responseBody);
        } catch (error) {
          log.error('Smartsheet Error', error.message);
          context.response.write('Error submitting data: ' + error.message);
        }
      }
    }

    return {
      onRequest: onRequest,
    };
});

/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(["N/ui/serverWidget", "N/file", "N/log", "N/https"], function (
  serverWidget,
  file,
  log,
  https
) {
  function onRequest(context) {
    if (context.request.method === "GET") {
      // Initialize the form
      var form = serverWidget.createForm({ title: "Request Form" });

      // Load the HTML file from the file cabinet
      var formFile = file.load({ id: "14233" });
      var formHtml = formFile.getContents();

      // Add the HTML to the form
      var htmlField = form.addField({
        id: "custpage_html",
        type: serverWidget.FieldType.INLINEHTML,
        label: "HTML Content",
      });
      htmlField.defaultValue = formHtml;

      context.response.writePage(form);

      // Form Post Submit
    } else if (context.request.method === "POST") {
      var email = context.request.parameters.email;
      var request = context.request.parameters.request;
      var priority = context.request.parameters.priority;
      var description = context.request.parameters.description;
      var department = context.request.parameters.department;

      // Get the uploaded file from the form
      var uploadedFile = context.request.files.attachment;

      // Headers for initial POST request
      var headers = {
        Authorization: "Bearer f7p3GUEUTlu36DJlUuL18rNsQrkw7iRB6lbCu",
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      // Form Values
      var formValues = JSON.stringify({
        toBottom: true,
        cells: [
          { columnId: "4049849804607364", value: email },
          { columnId: "8553449431977860", value: request },
          { columnId: "390675107368836", value: description },
          { columnId: "4894274734739332", value: department },
          { columnId: "2642474921054084", value: priority },
        ],
      });

      log.audit("Values", formValues);

      // File Types
      function getContentType(fileName) {
        var extension = fileName.split(".").pop().toLowerCase();
        switch (extension) {
          case "pdf":
            return "application/pdf";
          case "doc":
          case "docx":
            return "application/msword";
          case "xls":
          case "xlsx":
            return "application/vnd.ms-excel";
          case "txt":
            return "text/plain";
          default:
            return "application/octet-stream"; // Default MIME type
        }
      }
      try {
        // Initial POST request to create a new row
        var response = https.post({
          url: "https://api.smartsheet.com/2.0/sheets/8099869281439620/rows",
          headers: headers,
          body: formValues,
        });
        var responseBody = JSON.parse(response.body);

        // Get the row ID
        var rowId = responseBody.result.id;

        // POST request to upload the file
        var fileUploadUrl = "https://api.smartsheet.com/2.0/sheets/8099869281439620/rows/" + rowId + "/attachments";

        var boundary = "someuniqueboundaryasciistring";

        var contentType = getContentType(uploadedFile.name);

        var fileHeaders = {
          "Content-Type": "multipart/form-data; boundary=" + boundary,
          Accept: "application/json",
          Authorization: "Bearer f7p3GUEUTlu36DJlUuL18rNsQrkw7iRB6lbCu",
        };

        var body = [];
        body.push("--" + boundary);
        body.push('Content-Disposition: form-data; name="file"; filename="' + uploadedFile.name +'"');
        body.push("Content-Type: " + contentType);
        body.push("");
        body.push(uploadedFile.getContents());
        body.push("--" + boundary + "--");
        body.push("");

        var fileUploadResponse = https.post({
          url: fileUploadUrl,
          headers: fileHeaders,
          body: body.join("\r\n"),
        });

        // Successfully Submitted Alert and Redirect
        var html = "<html><body>";
        html += '<script type="text/javascript">';
        html += 'alert("Form submitted successfully with an uploaded file. If you have multiple files, please email files to netsuiteadmin@unclenearest.com");';
        html += 'window.location.href = "/app/center/card.nl?sc=-29&whence=";';
        html += "</script>";
        html += "</body></html>";

        context.response.write(html);

        log.audit("File uploaded to row ID " + rowId + ". Response: " + fileUploadResponse.body);

      } catch (error) {
        log.error("Smartsheet Error", error.message);

        // Error Submitted Alert and Redirect
        var html = "<html><body>";
        html += '<script type="text/javascript">';
        html += 'alert("Form submitted successfully without an uploaded file. If you have multiple files, please email files to netsuiteadmin@unclenearest.com");';
        html += 'window.location.href = "/app/center/card.nl?sc=-29&whence=";';
        html += "</script>";
        html += "</body></html>";
        
        context.response.write(html);
      }
    }
  }

  return {
    onRequest: onRequest,
  };
});

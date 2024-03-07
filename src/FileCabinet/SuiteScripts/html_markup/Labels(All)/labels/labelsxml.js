/**
* @NApiVersion 2.1
* @NScriptType UserEventScript
* @NModuleScope Public
*/

/* 

var log, serverWidget;

	
define( [ 'N/log', 'N/ui/serverWidget' ], main );


function main( logModule, serverWidgetModule ) {

	log = logModule;
	serverWidget = serverWidgetModule;
	
    return {    
    	beforeLoad: beforeLoad  			        
    }          

}


function beforeLoad( context ) {
	
	if ( context.type != context.UserEventType.PRINT ) { return; }
	
	var xml = generateXML( context );
	
	xml = cleanseXML( xml );
	 		
	var field = context.form.addField(
		{
			id : 'custpage_xml',
			label: 'XML',
			type : serverWidget.FieldType.INLINEHTML
		}
	);	
    
	field.defaultValue = xml;  

}


function generateXML( context ) {

	var transaction = JSON.parse( JSON.stringify( context.newRecord ) );
	
	var metatags = `
		<meta name="title" value="Purchase Order ${transaction.fields.tranid}" />
		<meta name="author" value="Ironforge Software" />
		<meta name="subject" value="Purchase Order ${transaction.fields.tranid}" />
		<meta name="keywords" value="purchase order, ${transaction.fields.tranid}" />
		<meta name="creator" value="NetSuite" />	
	`;	
	
	var stylesheet = `
	
		<style type="text/css">
		
			body {
				font-size: 12pt;
				font-family: sans-serif;
			}
			
			h1 {
				font-family: sans-serif;
				color: #000;
			}
			
			tr.columnHeaders {
				background: #cccccc; 
				color: #000000;						
			}
			
		</style>
		
	`;	
	
	if ( transaction.fields.status == "Pending Supervisor Approval" ) {	

		$watermark = `
			<macro id="watermark">
				<p rotate="-25" valign="middle" align="center" style="font-size: 48pt; color: red;">
				${transaction.fields.status}
				</p>
			</macro>
		`;
		
	} else {
		$watermark = '';
	}	
	
	var macrolist = `
	
		<macrolist>

			<macro id="footer">
				<p align="center" style="font-size: 9pt; margin-top: 24px; font-weight: bold;">
					- Page <pagenumber/> of <totalpages/> -
				</p>
			</macro>	
		
			${\}							
		
		</macrolist>	
		
	`;		
	
	var headerTable = `

		<table style="width: 100%;">
			<tr>	
				<td width="50%" align="left" valign="middle">
					<h1>Purchase Order </h1>
				</td>																		
				<td width="50%" align="right" valign="middle">	
					<img src="http://tstdrv2533109.shop.netsuite.com/core/media/media.nl?id=369793&c=TSTDRV2533109&h=mk4zbSgw9VQ-n6Prk0F0bAIPFUtPgtMl14xHRkHwXiRiRFgG" style="float: left; margin: 7px; width: 114px; height: 30px;" /><br />
				</td>
			</tr>	
		</table>
		
		<table style="width: 100%; margin-top: 18px;" cellpadding="3">
			<tr>
				<td valign="top">
					<span style="font-weight: bold;">Vendor:</span><br />
					${record.billaddress}						
				</td>
				<td valign="top">
					<span style="font-weight: bold;">Ordered By:</span><br />
					Ironforge Software, LLC<br />
					1000 William Hilton Pkwy<br />
					Hilton Head Island, SC 29928<br />
					United States<br />						
				</td>					
			</tr>
		</table>	
	
		<table style="width: 100%; margin-top: 18px; line-height: 150%;" cellpadding="3">
			<thead>
				<tr class="columnHeaders">
					<th align="center">PO Number</th>
					<th align="center">Status</th>
					<th align="center">Date Ordered</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td align="center">${transaction.fields.tranid}</td>
					<td align="center">${transaction.fields.status}</td>
					<td align="center">${transaction.fields.trandate}</td>
				</tr>
			</tbody>
		</table>	
		
	`;	
	
	var itemsTable = `
		<table style="width: 100%; margin-top: 18px; line-height: 150%;" cellpadding="3">
			<thead>
				<tr class="columnHeaders">
					<th align="center">Quantity</th>
					<th>Item</th>
					<th align="right">Unit Price</th>
					<th align="right">Ext. Price</th>
				</tr>
			</thead>
			<tbody>
				<#list record.item as item>
					<tr>
						<td align="center">${item.quantity}</td>
						<td>${item.item}</td>
						<td align="right">${item.rate}</td>
						<td align="right">${item.amount}</td>
					</tr>
				</#list>
				<tr>
					<td colspan="4">
						<hr style="width: 100%;" />
					</td>
				</tr>
				<tr>
					<td colspan="3" align="right" style="font-weight: bold;">
						Order Total:
					</td>
					<td align="right" style="font-weight: bold;">
						${record.total}
					</td>
				</tr>
			</tbody>
		</table>
	`;	

	return `
	
		<head>							
			${metatags}			
			${stylesheet}			
			${macrolist}							
		</head>
		
		<body 
			header="header" 
			header-height="12%" 
			footer="footer"
			footer-height="6%" 
			background-macro="watermark"
			padding="0.5in 0.5in 0.5in 0.5in" 
			size="Letter">
			
			${headerTable}
			
			${itemsTable}				
		
		</body>	
		
	`;   

}


function cleanseXML( xml ) {

	// For the XML spec, see: https://www.w3.org/TR/xml/

	// Resolve issues with ampersands and non-breaking spaces in field values.		
	xml = xml.replace( /&/g, 'XXXAMPXXX');
	xml = xml.replace( / /g, 'XXXNBSPXXX');
	xml = xml.replace( /&/g, "&");
	xml = xml.replace( /XXXAMPXXX/g, '&');
	xml = xml.replace( /XXXNBSPXXX/g, ' ');
	
	// Resolve issues where a referenced value does not exist.
	xml = xml.replace( /null/g, '');		
	xml = xml.replace( /undefined/g, '');	

	return xml;

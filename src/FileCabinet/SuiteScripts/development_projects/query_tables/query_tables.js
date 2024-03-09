


function generateSearchForm() {
	return `
	
		<!-- Bootstrap -->		
		<!-- https://getbootstrap.com -->		
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
		<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>	
		
		<!-- DataTables -->
		<!-- https://datatables.net -->
		<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.25/css/jquery.dataTables.css">
		<script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.10.25/js/jquery.dataTables.js"></script>			
		
		<style type = "text/css"> 

			input[type="text"], input[type="search"], textarea, button {
				outline: none;
				box-shadow:none !important;
				border: 1px solid #ccc !important;
			}
	
			p, pre {
				font-size: 10pt;
			}
	
			td, th { 
				font-size: 10pt;
				border: 1px;
			}
	
			th {
				font-weight: bold;				
			}
	
		</style>		
	
		<form method="POST" action=".">
		
			<table>
				<tbody>
					<tr>
						<td style="text-align: left;">
							<input type="search" name="keywords" value="${keywords}" class="form-control" placeholder="enter keywords" autofocus required>
						</td>					
						<td style="text-align: center;">
							<button type="submit" class="btn btn-md btn-success" style="margin-left: 3px;" id="submitButton">Search &gt;</button>
						</td>			
					</tr>
				</tbody>		
			</table>	
		
		</form>	
		
	`;

}
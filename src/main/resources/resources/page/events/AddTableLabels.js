$(document).ready(function () {
	var styles = '';
	var tblHeaders = {};
	$('.datagrid1 table.pgNavigation').parent().addClass('td_pgNavigation');
	$('table.datagrid1').each(function (tblIndex) {
		var table = $(this);
		if (table.hasClass('nonresponsive')) return;
		var tblClass;

		var dataContent = table.data('content');
		if (dataContent) {
			tblClass = tblHeaders[dataContent];
			table.addClass(tblClass);
			return;
		}

		tblClass = "tbl_" + tblIndex;

		var dataHeader = table.data('header');
		if (dataHeader) {
			tblHeaders[dataHeader] = tblClass;
			table.addClass('altheader');
		}
		else {
			table.addClass(tblClass);
		}

		var indexFrom = 1;
		var indexTd = 1;

		$('tr.header td, tr.altheader td', table).each(function (index) {
		    var td = $(this);
		    var indexTr = td.parent().index() + 1;
		    if (indexFrom != indexTr) {
		        indexFrom = indexTr;
		        indexTd = 1;
		        styles = styles.replace(new RegExp('ROW_TO', 'g'), ':nth-of-type(-n+' + (indexFrom - 1) + ')');
		    }
			var tdShotText = td.data('shotText');
			var tdText;
			if (tdShotText) {
				tdText = tdShotText;
			}
			else {
				tdText = $.trim(td.text());
				if (tdText == '') tdText = '\\00a0';
			}

			styles += '.' + tblClass + ' tr:nth-of-type(n+' + indexFrom + ')ROW_TO td:nth-of-type(' + indexTd + '):before { content: "' + tdText + '"; } ';
			indexTd++;
		});
		styles = styles.replace(new RegExp('ROW_TO', 'g'), '');
	});
	if (styles) {
		$('head').append('<style> @media only screen and (max-width: 760px), (min-device-width: 768px) and (max-device-width: 1024px) { ' +
			styles +
		'} </style>');
	}
});

//IMPORTANT! This library assumes that the following libraries have been loaded by the calling page:
//	javascript_library.js
//	yui/build/yahoo/yahoo-min.js
//	yui/build/yahoo/dom-min.js
//	yui/build/yahoo/event-min.js
//	yui/build/yahoo/container-min.js

var m_HideAddToCalendarHoverTID = null;
var m_LoadAddToCalendarHoverTID = null;
// Based Story-2851, event calendar is overriding session id for same event.  Issue due to old m_AddToCalendarHoverEventID has same EventId value for session
// Issue is due to using only one field to hold multiple types of Ids: events or sessions
//  Fix is to generalize to DateID and have additional variable DateType to differentiate if last pop-up was from event or session
var m_AddToCalendarHoverDateID = 0;
var m_AddToCalendarHoverDateType = '';
var m_AddToCalendarHoverEncodedDate;
var m_AddToCalendarHoverAlign = 'tr';

YAHOO.namespace("container");

function YAHOOinitAddToCalendarHover() {
	YAHOO.container.AddToCalendarHover = 
		new YAHOO.widget.Panel("AddToCalendarHover", { visible:false,
			iframe:false,
			constraintoviewport:true,
			close:true,
			draggable:false,
			modal:false,
			underlay:"shadow",
			width:"250px"
		} );

	YAHOO.container.AddToCalendarHover.render();
}

YAHOO.util.Event.onDOMReady(YAHOOinitAddToCalendarHover);

function HideAddToCalendarHover()
{
	m_HideAddToCalendarHoverTID = setTimeout('YAHOO.container.AddToCalendarHover.hide();',700);
}

// Consolidated to single method for both events and sessions
function LoadAddToCalendarHover(dateID, dateType, encodedDate, dateDataURL)
{
	var bIsVisible = YAHOO.container.AddToCalendarHover.cfg.getProperty('visible');
	
	if (
        (dateID == m_AddToCalendarHoverDateID) &&
        (dateType == m_AddToCalendarHoverDateType) &&
        (encodedDate == m_AddToCalendarHoverEncodedDate)
       ) {	//the id hasn't changed so we need only show the panel if it's hidden
		if(!bIsVisible) YAHOO.container.AddToCalendarHover.show();
		return false;
	}
	
	var ContainerBd = document.getElementById('AddToCalendarHoverBody');
	
	//only show "loading" if the panel isn't currently visible
	if(!bIsVisible) {
		ContainerBd.innerHTML = 'Loading...&nbsp;';
		ShowAddToCalendarHover(dateID, encodedDate);
	}
	
	var xmlhttp = null;
	if (window.XMLHttpRequest) {	//code for Mozilla, etc.
		xmlhttp = new XMLHttpRequest();
	} else if(window.ActiveXObject) {	//code for IE
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	if(xmlhttp) {	//wire up the event to handle the response on successful load
		xmlhttp.onreadystatechange = function() {
			if(xmlhttp.readyState==4 && xmlhttp.status==200 && xmlhttp.responseText!='') {
			    m_AddToCalendarHoverDateID = dateID;
			    m_AddToCalendarHoverDateType = dateType;
			    m_AddToCalendarHoverEncodedDate = encodedDate;
				ContainerBd.innerHTML = xmlhttp.responseText;
				ShowAddToCalendarHover(dateID, encodedDate);
			}
		}
		
		xmlhttp.open("GET", dateDataURL, true);
		xmlhttp.send(null);
	}
	
	return false;
}

function ShowAddToCalendarHover(EventID, EncodedDate)
{
	YAHOO.container.AddToCalendarHover.cfg.setProperty('context', ['AddToCalendarHoverLink_'+ EventID + '_' + EncodedDate,'tl',m_AddToCalendarHoverAlign]);
	//IE hack: underlay size does not change with panel size; resize it now
	if(document.all) YAHOO.container.AddToCalendarHover.sizeUnderlay();
	YAHOO.container.AddToCalendarHover.show();
}

function AddToCalendarHover_OnMouseOver()
{
	clearTimeout(m_HideAddToCalendarHoverTID);
	clearTimeout(m_LoadAddToCalendarHoverTID);
}

function AddToCalendarHoverLink_OnMouseOver(EventID, EncodedDate)
{
	clearTimeout(m_HideAddToCalendarHoverTID);
	clearTimeout(m_LoadAddToCalendarHoverTID);
	m_LoadAddToCalendarHoverTID = setTimeout(function () {
	    LoadAddToCalendarHover(EventID, 'E', EncodedDate, '/events/add_to_calendar.asp?id=' + EventID);
	}, 300);
}

function AddToCalendarHoverLinkSession_OnMouseOver(EventID, SessionID, GroupID, EncodedDate) {
	clearTimeout(m_HideAddToCalendarHoverTID);
	clearTimeout(m_LoadAddToCalendarHoverTID);
	m_LoadAddToCalendarHoverTID = setTimeout(function () {
	    LoadAddToCalendarHover(SessionID, 'S', EncodedDate, '/events/add_to_calendar_session.asp?EventID=' + EventID + '&SessionID=' + SessionID + '&GroupID=' + GroupID);
	}, 300);
}
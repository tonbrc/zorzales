//IMPORTANT! This library assumes that the following libraries have been loaded by the calling page:
//	javascript_library.js
//	yui/build/yahoo/yahoo-min.js
//	yui/build/yahoo/dom-min.js
//	yui/build/yahoo/event-min.js
//	yui/build/yahoo/container-min.js

YAHOO.namespace("container");

function YAHOOinitCformMoreInfo() {
	YAHOO.container.CformMoreInfo = 
		new YAHOO.widget.Panel("CformMoreInfo", { visible:false,
		   close:false,
		   iframe:false,
		   draggable:false,
		   underlay:"shadow",
		   width:"270px"
		} );

	YAHOO.container.CformMoreInfo.render();
}

YAHOO.util.Event.onDOMReady(YAHOOinitCformMoreInfo);

var CformLabel_OnClick = function(FieldID) {
	//this is a template for defining a field label click event handler
}

function CformLabel_OnMouseOver(DomID, FieldDesc)
{
	document.getElementById('CformMoreInfoBody').innerHTML = FieldDesc;
	YAHOO.container.CformMoreInfo.cfg.setProperty('context', [DomID,'tl','bl']);
	
	//IE hack: underlay size does not change with panel size; resize it now
	if(document.all) YAHOO.container.CformMoreInfo.sizeUnderlay();
	
	YAHOO.container.CformMoreInfo.show();
}

function CformLabel_OnMouseOut(DomID)
{
	YAHOO.container.CformMoreInfo.hide();
}

function CformTextCounter(FieldID, MaxLen)
{
	var field = document.getElementById(FieldID);
	var val = fixnewlines(field.value.toString());
	var len = val.length;
	
	//if aready too long, trim it before making any adjustments
	if(len>MaxLen) {
 		val = val.substring(0, MaxLen);
		len = val.length;
		field.value = val;
	}
	
	//update 'characters left' counter
	var counter = document.getElementById(FieldID +'_Counter');
	counter.innerHTML = new String(MaxLen - len);
}

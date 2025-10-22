function Favorite(id)
{
	this.Category = '';
	this.ID = objectExists(id) ? id : 0;
	this.Parameters = '';
	this.Title = '';
	this.Type = ''
}

YAHOO.namespace("container");

function YAHOOinitFavoriteOpts() 
{
	YAHOO.container.FavoriteOpts = 
		new YAHOO.widget.Panel("FavoriteOptsPanel", { visible:false,
			iframe:false,
			constraintoviewport:true,
			close:false,
			draggable:false,
			modal:false,
			underlay:'shadow',
			//width:'360px',
			fixedcenter:true
			} );
		
	YAHOO.container.FavoriteOpts.render();
}

YAHOO.util.Event.onDOMReady(YAHOOinitFavoriteOpts);

function ShowFavoriteOpts(favorite, blnReload)
{
	//encode form data for http post
	var sFormData = "FavoriteID="+ encodeURIComponent(favorite.ID);
	sFormData += "&strFavoriteTypeID_FK="+ encodeURIComponent(favorite.Type);
	sFormData += "&strFavoriteParameters="+ encodeURIComponent(favorite.Parameters);
	sFormData += "&strTitle="+ encodeURIComponent(favorite.Title);
	
	//load the data
	LoadFavoriteFormData(sFormData, blnReload);
	
	//IE hack: underlay size does not change with panel size; resize it now
	if(document.all) YAHOO.container.FavoriteOpts.sizeUnderlay();
	
	document.getElementById('FavoriteEditor').style.display = '';
	YAHOO.container.FavoriteOpts.show();
	
	return false;
}

function LoadFavoriteFormData(sFormData, blnReload)
{
	var xmlhttp = newXmlHttp();
	if(!xmlhttp) return false;
		
	//submit to ajax post handler
	xmlhttp.open("POST", "/global_engine/ajax/favorite_form.asp", false);
	xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xmlhttp.send(sFormData);
	
	//exit if we did not receive an error-free response
	if(xmlhttp.status!=200 || xmlhttp.responseText=="") return false;
	
	//the response should be a JSON string
	var jsonData
	try { //to parse the string into a js-object
		jsonData = YAHOO.lang.JSON.parse(xmlhttp.responseText.toString()); 
	} catch(e) { return; }
	
	//set the values on the form from the JSON response
	document.FavoriteEditor.FavoriteID.value = jsonData.FavoriteID;
	document.FavoriteEditor.strTitle.value = jsonData.strTitle;
	document.FavoriteEditor.strCategory.value = jsonData.strCategory;
	document.FavoriteEditor.strFavoriteTypeID_FK.value = jsonData.strFavoriteTypeID_FK;
	document.FavoriteEditor.strFavoriteParameters.value = jsonData.strFavoriteParameters;
	
	//Handle IsPrivate Radio checking
	if(jsonData.blnIsPrivate) {
		$("#blnIsPrivate1").attr('checked', 'checked');
	}
	else{
		$("#blnIsPrivate0").attr('checked', 'checked');
	}	
	
	//Category Array for AutoComplete TextBox
	actb(document.getElementById('strCategory'), jsonData.arrCategory);
	
	if (jsonData.FavoriteID == 0) {
	    if (blnUseEngagement) {
	        $("#FavoriteEditorTitle").html('Add This as a Bookmark');
	    } else {
	        $("#FavoriteEditorTitle").html('Add This as a Favorite');
	    }
	}
	else {
	    if (blnUseEngagement) {
	        $("#FavoriteEditorTitle").html('Edit This Bookmark');
	    } else {
	        $("#FavoriteEditorTitle").html('Edit This Favorite');
	    }
		
		//show the delete button since this is an edit
		document.FavoriteEditor.FavoriteEditor_btnDelete.style.display = '';
		
		if (objectExists(document.getElementById('FavoriteOptsLinkImg')))
		{
		    //change the star from inactive (grey) to active (yellow)
		    if (blnUseEngagement) {
		        document.getElementById('FavoriteOptsLinkImg').src = '/global_graphics/icons/bookmark_saved.gif';
		        document.getElementById('FavoriteOptsLinkImg').title = 'Edit This Bookmark';
		        document.getElementById('FavoriteOptsLinkImg').alt = 'Edit This Bookmark';
		    }
		    else {
		        document.getElementById('FavoriteOptsLinkImg').src = '/global_graphics/icons/fav.gif';
		        document.getElementById('FavoriteOptsLinkImg').title = 'Edit This Favorite';
		        document.getElementById('FavoriteOptsLinkImg').alt = 'Edit This Favorite';
		    }
		}
	}
	
	if (blnReload){
		//set whether or not to reload the page after the form is submitted
		document.getElementById('blnFavoriteReload').value = '1';
	}
	return false;
}

function FavoriteEditor_Submit(fFavoriteEditor)
{
	var f = fFavoriteEditor;
	
	var sFormData = $("#FavoriteEditor").serialize();
	
	if (FavoriteEditor_IsValid(sFormData))
	{
		var xmlhttp = newXmlHttp();
		if(!xmlhttp) return false;
		
		//send async request with callback function		
		sendSimpleHttpRequest("/global_engine/ajax/favorite_process.asp", FavoriteCallbackHandler, sFormData, xmlhttp);		
		
		//close the form
		YAHOO.container.FavoriteOpts.hide();
	}
	
	return false;
}

function FavoriteEditor_btnSubmit_OnClick(sender)
{

	sender.form.strCommand.value = 'submit';
	
	if (objectExists(document.getElementById('FavoriteOptsLinkImg')))
	{
	    //change the star from inactive (grey) to active (yellow)
	    if (blnUseEngagement) {
	        document.getElementById('FavoriteOptsLinkImg').src = '/global_graphics/icons/bookmark_saved.gif';
	        document.getElementById('FavoriteOptsLinkImg').title = 'Edit This Bookmark';
	        document.getElementById('FavoriteOptsLinkImg').alt = 'Edit This Bookmark';	        
	    } else {
	        document.getElementById('FavoriteOptsLinkImg').src = '/global_graphics/icons/fav.gif';
	        document.getElementById('FavoriteOptsLinkImg').title = 'Edit This Favorite';
	        document.getElementById('FavoriteOptsLinkImg').alt = 'Edit This Favorite';
	    }
	}
	
	return true;
}

function FavoriteEditor_btnDelete_OnClick(sender)
{
    if (blnUseEngagement) {
        if (!confirm('Are you sure you want to remove this bookmark? ')) {
            return false;
        }
    } else {
        if (!confirm('Are you sure you want to remove this favorite? ')) {
            return false;
        }
    }
	
	sender.form.strCommand.value = 'delete';
	
	if (objectExists(document.getElementById('FavoriteOptsLinkImg')))
	{
	    //change the star from active (yellow) to inactive (grey)
	    if (blnUseEngagement) {
	        document.getElementById('FavoriteOptsLinkImg').src = '/global_graphics/icons/bookmark_unsaved.png';
	        document.getElementById('FavoriteOptsLinkImg').title = 'Add This as a Bookmark';
	        document.getElementById('FavoriteOptsLinkImg').alt = 'Add This as a Bookmark';
	    } else {
	        document.getElementById('FavoriteOptsLinkImg').src = '/global_graphics/icons/fav_off.gif';
	        document.getElementById('FavoriteOptsLinkImg').title = 'Add This as a Favorite';
	        document.getElementById('FavoriteOptsLinkImg').alt = 'Add This as a Favorite';
	    }
	}
	
	return true;
}

function FavoriteEditor_IsValid(FormData)
{
	
	var bIsValid = ValidateForm(FormData,'FormErrorList', false);
	dhtmlDisplay('FormErrors', bIsValid ? 'none':'');
	
	if(bIsValid) return true;
	
	return false;
}

function FavoriteCallbackHandler()
{
	if (document.getElementById('blnFavoriteReload').value == '1')
	{
		//reload the page
		location.reload(true);
	}
}

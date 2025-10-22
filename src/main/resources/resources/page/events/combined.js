
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// site-specific declarations
// test
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
var m_blnDoBodyUnload = false;
var m_winAddressManager;
var m_BlinkTopAlertBarTID;

//the following "BarHeight" values MUST equal height + border-width as defined in global_base.css
var m_iTopAlertBarHeight = 21;
var m_iTopToolBarHeight = 25;
var ProgressID; // for polling progress bar
var ShowProgressBar = false;
var DefaultTimer;

var CategorySearchResults = [];

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// site-specific functions
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//


function WriteAdminNavBar(LinkedMemberExists, HasMemberAuthID, MemberName, IsContentAdmin, SmartLink)
{
	try { if (m_blnSuppressAdminNavBar) return; } catch (e) { };

	var sContent = '';
	if (HasMemberAuthID) {
		sContent += '<div style="float:left">YOU ARE SIGNED IN AS: ';
		sContent += ('<span style="text-transform:uppercase">' + MemberName);
		sContent += '</span> (<a href="/logout.aspx">SIGN OUT</a>)&nbsp;&nbsp;</div>';
		sContent += '<div style="float:right">';
	} else if (LinkedMemberExists) {
		sContent += '<div style="float:center">';
		sContent += '<a href="/general/login_admin_as_linked_member.asp">SIGN IN TO THE COMMUNITY</a>&nbsp;|&nbsp;';
	} else {
		sContent += '<div style="float:center">';
	}

	sContent += '<a href="/admin/">ADMIN DASHBOARD</a>';

	if (SmartLink != undefined)
	{
		if (SmartLink.length > 0)
			sContent += '&nbsp;|&nbsp;<a href="' + SmartLink + '">RETURN TO PREVIOUS ADMIN PAGE</a>';
	}

	if (IsContentAdmin) {
		sContent += '&nbsp;|&nbsp;<a href="#" onclick="openPopup(\'/admin/content/ResourceManager.aspx\',\'winResMgr\',\'toolbar=false,status,scrollbars,resizable\',\'900\',\'790\'); return false;">SITE RESOURCE MANAGER</a>';
		sContent += '&nbsp;|&nbsp;<a href="#" onclick="ToggleAdminEditMode()"); return false;" id="togglelink">';

		var toggle = getCookie("AdminEditMode");

		if (toggle != null && toggle != "") {
			if (toggle == "1") {
				sContent += 'EDIT MODE [ON]</a>'
			}
			else {
				sContent += 'EDIT MODE [OFF]</a>'
			}
		}
		else {
			sContent += 'EDIT MODE [OFF]</a>'
		}
	}

	sContent += '</div>';

	WriteTopAlertBar(sContent);
}

function ToggleAdminEditMode() {
	var toggle = getCookie("AdminEditMode");

	if (toggle != null) {
		if (toggle == "1") {
			setCookie("AdminEditMode", "0", "/", 1);
		}
		else {
			setCookie("AdminEditMode", "1", "/", 1);
		}
	}
	else {
		setCookie("AdminEditMode", "0", "/", 1);
	}

	window.location.reload();
	return;
}

function WriteTopAlertBar(sContent, iBlinks) {
	var TopAlertBarText = document.getElementById('TopAlertBarText');
	if (TopAlertBarText) {	//update alert bar text
		TopAlertBarText.innerHTML = sContent;

	} else {
		//create the alert bar
		var TopAlertBar = document.createElement('div');
		TopAlertBar.setAttribute('id', 'TopAlertBar');

		TopAlertBarText = document.createElement('div');
		TopAlertBarText.setAttribute('id', 'TopAlertBarText');


		TopAlertBarText.onmouseover = function() {
			document.getElementById('TopAlertBarText').style.display = '';
			clearTimeout(m_BlinkTopAlertBarTID);
		};

		TopAlertBarText.innerHTML = sContent;
		TopAlertBar.appendChild(TopAlertBarText);

		var docBody = document.getElementsByTagName('body')[0];

		docBody.appendChild(TopAlertBar);

	}

	if ((!isNaN(iBlinks)) && iBlinks > 0) BlinkTopAlertBar(iBlinks);

	var $ToolBar = $("#TopAlertBar");
	// Create sticky tool bar
	StickyFooter($ToolBar);

	// Hide Tool  Bar on scroll
	HideOnScroll($ToolBar);
}

function WriteTopToolBar(sContent) {
	var TopToolBarText = document.getElementById('TopToolBarText');
	if (TopToolBarText) {	//update top toolbar text
		TopToolBarText.innerHTML = sContent;
	} else {
		//create the toolbar
		var iTop = 0;
		if (document.getElementById('TopAlertBar')) {
			iTop = (m_iTopAlertBarHeight * 1);

		}

		var TopToolBar = document.createElement('div');
		TopToolBar.setAttribute('id', 'TopToolBar');

		TopToolBarText = document.createElement('div');
		TopToolBarText.setAttribute('id', 'TopToolBarText');

		TopToolBarText.innerHTML = sContent;
		TopToolBar.appendChild(TopToolBarText);

		var docBody = document.getElementsByTagName('body')[0];

		docBody.appendChild(TopToolBar);

		var TopAlertBarHeight = 21;
	
		var $ToolBar = $("#TopToolBar");

		if (document.getElementById('TopAlertBar')) {

			StickyFooterWithAlertBar($ToolBar);// account for the extra space of the admin bar
			HideOnScroll($ToolBar);
		}
		else
		{
			StickyFooter($ToolBar);// no admin bar present
			HideOnScroll($ToolBar);
		}
	}
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// Progress bar functions
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

function CreateProgressBarMarkup() {

	//  create empty divs that will hold the information from the jquery ajax call in function WriteProgressBar
	//	var CurrentScoreHiddenField = document.createElement('input');
	//	CurrentScoreHiddenField.setAttribute('type', 'hidden');
	//	CurrentScoreHiddenField.setAttribute('id', 'CurrentScore');

	//	var GameLevelNameHiddenField = document.createElement('input');
	//	GameLevelNameHiddenField.setAttribute('type', 'hidden');
	//	GameLevelNameHiddenField.setAttribute('id', 'GameLevelName');

	//	var BarEnabledHiddenField = document.createElement('input');
	//	BarEnabledHiddenField.setAttribute('type', 'hidden');
	//	BarEnabledHiddenField.setAttribute('id', 'IsProgressBarEnabled');

	//	var GameLevelHiddenField = document.createElement('input');
	//	GameLevelHiddenField.setAttribute('type', 'hidden');
	//	GameLevelHiddenField.setAttribute('id', 'GameLevel');

	//	var ScoreUpdatedHiddenField = document.createElement('input');
	//	ScoreUpdatedHiddenField.setAttribute('type', 'hidden');
	//	ScoreUpdatedHiddenField.setAttribute('id', 'ScoreUpdated');

	//	var ShowProgressBarAlwaysHiddenField = document.createElement('input');
	//	ShowProgressBarAlwaysHiddenField.setAttribute('type', 'hidden');
	//	ShowProgressBarAlwaysHiddenField.setAttribute('id', 'ShowProgressBarAlways');


	//	var HasCurrentBadgeMarkupHiddenField = document.createElement('input');
	//	HasCurrentBadgeMarkupHiddenField.setAttribute('type', 'hidden');
	//	HasCurrentBadgeMarkupHiddenField.setAttribute('id', 'HasCurrentBadgeMarkup');

	//	var HasNextBadgeMarkupHiddenField = document.createElement('input');
	//	HasNextBadgeMarkupHiddenField.setAttribute('type', 'hidden');
	//	HasNextBadgeMarkupHiddenField.setAttribute('id', 'HasNextBadgeMarkup');

	var CurrentScoreDiv = document.createElement('div');
	CurrentScoreDiv.setAttribute('id', 'CurrentScore');
	CurrentScoreDiv.style.display = 'none';

	var GameLevelNameDiv = document.createElement('div');
	GameLevelNameDiv.setAttribute('id', 'GameLevelName');
	GameLevelNameDiv.style.display = 'none';	

	var BarEnabledDiv = document.createElement('div');
	BarEnabledDiv.setAttribute('id', 'IsProgressBarEnabled');
	BarEnabledDiv.style.display = 'none';	

	var GameLevelDiv = document.createElement('div');
	GameLevelDiv.setAttribute('id', 'GameLevel');
	GameLevelDiv.style.display = 'none';	

	var ScoreUpdatedDiv = document.createElement('div');
	ScoreUpdatedDiv.setAttribute('id', 'ScoreUpdated');
	ScoreUpdatedDiv.style.display = 'none';

	// Create the tool bar that will hold the progress bar stuff
	var progressToolBarDiv = document.createElement('div');
	progressToolBarDiv.setAttribute('id', 'ProgressToolBar');
	progressToolBarDiv.style.display = 'none';

	var ShowProgressBarDiv = document.createElement('div');
	ShowProgressBarDiv.setAttribute('id', 'ShowProgressBarAlways');
	ShowProgressBarDiv.style.display = 'none';

	var HasCurrentBadgeMarkupDiv = document.createElement('div');
	HasCurrentBadgeMarkupDiv.setAttribute('id', 'HasCurrentBadgeMarkup');
	HasCurrentBadgeMarkupDiv.style.display = 'none';

	var HasNextBadgeMarkuDiv = document.createElement('div');
	HasNextBadgeMarkuDiv.setAttribute('id', 'HasNextBadgeMarkup');
	HasNextBadgeMarkuDiv.style.display = 'none';

	var YuiDiv = document.createElement('div');
	YuiDiv.setAttribute('class', 'yui-skin-sam');

	// I'm lazy, create the inner tool bar with text that will be placed inside the progress tool bar
	var progressToolBarInnerHtml = '<div id="ProgressBarText" style="display:none;" onmouseover="showBadge(this)">' +
								   '</div><div class="progressBar" id="progressBar" style="display:none;"></div>' +
								   '<div id="NextProgressBarText" style="display:none;" onmouseover="showBadge(this)"></div>';

	var YuiDivInnerHtml = '<div id="BadgePanel" style="visibility: hidden;" class="BadgePanel">' +
				 '<div id="BadgePanelHead" class="hd"></div>' +
				 '<div id="BadgePanelBody" class="bd"></div></div>';

	YuiDiv.innerHTML = YuiDivInnerHtml;

	// put those divs inside the progress tool bar
	progressToolBarDiv.innerHTML = progressToolBarInnerHtml;

	// append everything!
	var docBody = document.getElementsByTagName('body')[0];

//	docBody.appendChild(CurrentScoreHiddenField);
//	docBody.appendChild(GameLevelNameHiddenField);
//	docBody.appendChild(BarEnabledHiddenField);
//	docBody.appendChild(GameLevelHiddenField);
//	docBody.appendChild(ScoreUpdatedHiddenField);
//	docBody.appendChild(ShowProgressBarAlwaysHiddenField);
//	docBody.appendChild(HasNextBadgeMarkupHiddenField);
//	docBody.appendChild(HasCurrentBadgeMarkupHiddenField);
	docBody.appendChild(HasNextBadgeMarkuDiv)
	docBody.appendChild(HasCurrentBadgeMarkupDiv);
	docBody.appendChild(ShowProgressBarDiv);
	docBody.appendChild(ScoreUpdatedDiv);
	docBody.appendChild(GameLevelDiv);
	docBody.appendChild(BarEnabledDiv);
	docBody.appendChild(GameLevelNameDiv);
	docBody.appendChild(CurrentScoreDiv);
	docBody.appendChild(progressToolBarDiv);
	docBody.appendChild(YuiDiv);

	// wire up mouse out to hide either badge on mouse out of tool bar
	$('#ProgressToolBar').mouseout(function() {
		YAHOO.container.BadgePanel.hide();
	});
	
	createBadgeYUI();
	WriteProgressBar();
}

function WriteProgressBar() {

	var url = '/general/ProgressBarReceiver.aspx?TransferSession=0';

	// only poll for new data if Pulse has not been disabled
	if (getCookie("PulseOff") != "1")
	{
		$.ajax({
			url: url,
			async: true,
			dataType: 'json',
			success: function (json) {
				$('#CurrentScore').text(json.CurrentScore); // the current score as a string, only in 10s
				$('#ProgressBarText').text(json.CurrentLevelName); // the current game level name with stats(percentage achieved until next level)
				$('#NextProgressBarText').text(json.NextLevelName); // the name of the next level if one exists
				$('#IsProgressBarEnabled').text(json.IsProgressBarEnabled);
				$('#GameLevel').text(json.LevelName);
				$('#ScoreUpdated').text(json.blnUserAchievedNewScore);
				$('#ShowProgressBarAlways').text(json.ShowProgressBarAlways);
				$('#HasCurrentBadgeMarkup').text(json.HasCurrentBadgeMarkup);
				$('#HasNextBadgeMarkup').text(json.HasNextBadgeMarkup);

				var progress = $("#CurrentScore").text();
				var intProgress = parseInt(progress);
				var isScoreUpdated = $("#ScoreUpdated").text();
				var showProgressBarAlways = $("#ShowProgressBarAlways").text();
				var IsProgressBarEnabled = $("#IsProgressBarEnabled").text();
				var hasCurrentBadgeMarkup = $("#HasCurrentBadgeMarkup").text();
				var hasNextBadgeMarkup = $("#HasNextBadgeMarkup").text();

				$("#ProgressToolBar").hide();
				$("#ProgressBarText").hide();
				$("#progressBar").hide();
				$("#NextProgressBarText").hide();

				//add onmouseover/onhover to ProgressBarText conditionally
				if ((hasCurrentBadgeMarkup == "False") | (hasCurrentBadgeMarkup == "false")) {
					$("#ProgressBarText").remove('onmouseover', 'showBadge(this)');
				}
				//add onmouseover/onhover NextProgressBarText conditionally
				if ((hasNextBadgeMarkup == "False") | (hasNextBadgeMarkup == "false")) {
					$("#NextProgressBarText").remove('onmouseover', 'showBadge(this)');
				}

				// check to see if there is a value  for game level, if there isn't then no use for progress bar
				var gameLevel = $("#GameLevel"); // this value only holds the text of the actual game level name with no statistics
				var ProgressBarText = $("#ProgressBarText"); // this holds game level name with current percent achieved, set to invisible already
				var ProgressBar = $("#progressBar");
				var ProgressToolBar = $("#ProgressToolBar");
				var NextProgressBarText = $("#NextProgressBarText");

				// Don't show if progress bar isn't enabled
				if (IsProgressBarEnabled.toLowerCase() == "true") {
					if ((!gameLevel.text()) && (!NextProgressBarText.text())) {
						// hide the tool bar, no game levels exist
						ProgressToolBar.hide();
						ProgressBarText.hide();
						ProgressBar.hide();
						NextProgressBarText.hide();
					}
					else {
						// else if it's active set the value
						var ProgressBar = $("#progressBar");
						var ProgressToolBar = $("#ProgressToolBar");
						$("div.progressBar").progressbar({
							value: intProgress
						});

						$("#profileProgressBar").progressbar({
							value: intProgress
						});

						if ((isScoreUpdated == "True") | (isScoreUpdated == "true")) {
							// set the animation acccording to user preference on progress bar display
							if (showProgressBarAlways.toLowerCase() == "false") {
								ProgressBarText.show();
								ProgressBar.show();
								NextProgressBarText.show();

								ProgressToolBar.show(3000).fadeIn(4000).delay(5000);
								ProgressToolBar.hide(2000).fadeOut(2000);
							}
							else // it's set to always active
							{
								ProgressBarText.show();
								ProgressBar.show();
								NextProgressBarText.show();
								ProgressToolBar.show();
							}
						}

					}
				}

			},
			complete: function () {

				return true;
			}
		});
	}
	pollForProgress();
}

function pollForProgress(retrys) {
	// poll for new progress bar data, new score
	try {
		//check for new conversations every 60 seconds
		ProgressID = setTimeout(function() { WriteProgressBar() }, 60000);
	}
	catch (e) {
		//retry 3 times before giving up
		if (isNaN(retrys)) retrys = 0;
		if (retrys < 3) {
			retrys++;
			ProgressID = setTimeout(function() { WriteProgressBar(retrys) }, 1000);
		}
	}
}

function createBadgeYUI() {

	YAHOO.namespace("container");

	function YAHOOinitBadgePanel() {
		YAHOO.container.BadgePanel = new YAHOO.widget.Panel("BadgePanel", { visible: false,
			iframe: true,
			constraintoviewport: true,
			close: false,
			draggable: false,
			modal: false,
			underlay: 'shadow'
		});

		YAHOO.container.BadgePanel.render();
	}

	YAHOO.util.Event.onDOMReady(YAHOOinitBadgePanel);	
}

function showBadge(Badge) {

	var currentId = $(Badge).attr('id');
	
	var url = '/general/GameLevelBadgeReciever.aspx?selected=' + $(Badge).attr('id');

	$.ajax({
		url: url,
		async: true,
		dataType: 'json',
		success: function(json) {
			if (json.SelectedBadge) {
				$('#BadgePanelBody').html(json.SelectedBadge);
				//IE hack: underlay size does not change with panel size; resize it now
				if (document.all) YAHOO.container.BadgePanel.sizeUnderlay();

				if (document.all) YAHOO.container.BadgePanel.sizeUnderlay();
				YAHOO.container.BadgePanel.cfg.setProperty('context', [currentId, 'tl', 'bl']);
				YAHOO.container.BadgePanel.show();
			}
		},
		complete: function() {

			return true;
		}
	});	
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// End progress bar functions
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

function StickyFooterWithAlertBar(ToolBar) {// if the user is an admin and chatting place the chat bar above the admin bar
	if (document.compatMode == 'BackCompat') {// Are we in quirks mode?

		$(function() {
			positionFooter();
			function positionFooter() {
				$("#TopToolBar").css({ position: "absolute", top: ($(window).scrollTop() + $(window).height() - 45) + "px" })
			}

			$(window)
		.scroll(positionFooter)
		.resize(positionFooter)
		});

	}
	else {// standards mode thus position fixed works
		$(ToolBar).css({
			position: 'fixed',
			bottom: '21px'
		});

	}
}

function StickyFooter(ToolBar) {// Chat bar with no active admin bar

	// The css class for CSS1Compat aka standards is already set so nothing will happen unless in quirks aka BackCompat
	if (document.compatMode == 'BackCompat') {

		$(function() {
			positionFooter();
			function positionFooter() {
				ToolBar.css({ position: "absolute", top: ($(window).scrollTop() + $(window).height() - ToolBar.height()) + "px" })
			}

			$(window)
		.scroll(positionFooter)
		.resize(positionFooter)
		});
	}

}

function HideOnScroll(ToolBar) {
	var $menu = ToolBar;
	var opacity = $menu.css("opacity");
	var scrollStopped;

	var fadeInCallback = function() {
		if (typeof scrollStopped != 'undefined') {
			clearInterval(scrollStopped);
		}

		scrollStopped = setTimeout(function() {
			$menu.animate({ opacity: 1 }, "fast");
		}, 100);
	}

	$(window).scroll(function() {
		if (!$menu.is(":animated") && opacity == 1) {
			$menu.animate({ opacity: 0 }, "fast", fadeInCallback);
		} else {
			fadeInCallback.call(this);
		}
	});
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// Category auto complete functions
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

function QuickSearchForm_DoSubmit()
{
	var QuickSearchForm = document.getElementById('QuickSearchForm');	
	if(QuickSearchForm)
	{
		ClearDefaultValue(QuickSearchForm.bst);
		QuickSearchForm.submit();
	}
	return false;
}

function QuickSearchForm_OnFocus()
{
	var element = document.getElementById("QuickSearchForm_bst");
	ClearDefaultValue(element);
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// End category auto complete functions
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

function BlinkTopAlertBar(HowManyTimes, i)
{
	if (isNaN(i)) i = 1;

	if (i % 2 == 0) {
		document.getElementById('TopAlertBarText').style.display = '';
	} else {
		document.getElementById('TopAlertBarText').style.display = 'none';
	}

	if (i < (HowManyTimes * 2)) {
		i++;
		m_BlinkTopAlertBarTID = setTimeout(function() { BlinkTopAlertBar(HowManyTimes, i) }, 300);
	}
}

function CheckCityStateZip(oForm, sCityField, sZipField, sStateField, sStateList) {
	if (eval('oForm.' + sCityField).value == '') return false;
	if (eval('oForm.' + sZipField).value == '') return false;
	if (eval('oForm.' + sStateField).value == '') {
		var oStateList = eval('oForm.' + sStateList);
		if (oStateList.options[oStateList.selectedIndex].value == '') return false;
	}

	return true;
}

function CheckMultipartForms(blnAllowSubmit) {
	if (blnAllowSubmit) return;
	if (!document.forms.length > 0) return;

	var blnFoundOne = false;
	for (var i = 0; i < document.forms.length; i++) {
		if (document.forms[i].enctype.toLowerCase() == 'multipart/form-data') {
			blnFoundOne = true;
			document.forms[i].onsubmit = function() { return false; }
		}
	}

	if (blnFoundOne) alert('We\'\re sorry, file uploads and forms containing file uploads\nhave been temporarily disabled. Please check back in a few minutes.');
}

function DoUploadProgress(sender) {	//does the hidden field exist for storing the progress-id?
    return true; //The progress bar doesn't work for AWS, return true and do nothing more
    var sUid = '', sPid = '';
	if (sender.UploadID) {
		sUid = sender.UploadID.value;
	} else if (sender.ProgressID) {
		sPid = sender.ProgressID.value;
	} else {
		return true;
	}

	//are there any files being uploaded?
	var fields = sender.elements;
	var bHasFile = false;
	FieldLoop: for (var i = 0; i < fields.length; i++) {
		if (fields[i].type.toLowerCase() == 'file' && fields[i].value != '') {
			bHasFile = true;
			break FieldLoop;
		}
	}

	if (!bHasFile) return true;

	var sAction = sender.action;

	var rx = new RegExp("\\?.+=", "i");
	if (rx.test(sAction)) {
		sAction += '&';
	} else {
		rx.compile("\\?$", "i");
		if (!rx.test(sAction)) sAction += '?';
	}

	var sIdArg = sUid.length > 0 ? 'uid=' + sUid : 'pid=' + sPid;

	sAction += sIdArg;
	sender.action = sAction;

	openPopup('/general/upload_progress.asp?' + sIdArg, 'UploadProgress', 'status,toolbar=false', 250, 120);

	return true;
}

function openCsvExport(unicode, alternateUrl, extraQueryArgs) {
	var Url = alternateUrl == null ? '/admin/database/csv_export.asp' : alternateUrl;
	if (extraQueryArgs == null) extraQueryArgs = '';
	openPopup(Url + '?unicode=' + unicode.toString() + '&' + extraQueryArgs.toString(), '_blank', 'resizable,status,toolbar=false', 350, 150);
	return false;
}

//address-manager window functions
function openAddressManager(AddrMgrUrl, MasterElementId, QueryArgs) {
	m_winAddressManager = returnPopup(AddrMgrUrl + '?OpenerMasterElementId=' + MasterElementId + '&' + QueryArgs, 'AddressManager', 'resizable,scrollbars,status,toolbar=false', 660, 660);
	m_winAddressManager.focus()
	return false;
}

function closeAddressManager() {
	try { m_winAddressManager.close(); } catch (e) { };
}

function openMugshotPopup(Url) {
	return openPopup(Url, 'MemberMugshot', 'resizable,scrollbars,status,toolbar=false', 537, 405);
}

function openPrintView(Url, OpenDialog, QueryArgs) {
	openPopup(Url + "?PrintView=1&OpenDialog=" + OpenDialog + "&" + QueryArgs,
		"PrintView", "menubar,scrollbars,status,toolbar=false", 640, 640);
	return false;
}

//begin dynamic help functions
var m_blnInlineHelpIsOn = false;

function switchInlineHelpDisplay() {
	if (m_blnInlineHelpIsOn) {
		doInlineHelpOff();
	} else {
		doInlineHelpOn();
	}
	return false;
}

function doInlineHelpOn() {
	//show inline help areas
	setInlineHelpDisplay(true);
	//switch toggle link
	dhtmlDisplay('InlineHelpLinkShow', 'none');
	dhtmlDisplay('InlineHelpLinkHide', '');
	//set current state
	m_blnInlineHelpIsOn = true;
	//preserve current state in cookie
	setInlineHelpCookie();
}

function doInlineHelpOff() {
	//hide inline help areas
	setInlineHelpDisplay(false);
	//switch toggle link
	dhtmlDisplay('InlineHelpLinkShow', '');
	dhtmlDisplay('InlineHelpLinkHide', 'none');
	//set current state
	m_blnInlineHelpIsOn = false;
	//preserve current state in cookie
	setInlineHelpCookie();
}

function setInlineHelpCookie() {
	if (document.cookie) {	//set cookie expiry at 1 year
		var datExpires = new Date();
		datExpires.setTime(datExpires.getTime() + 31536000000);
		if (m_blnInlineHelpIsOn) {
			document.cookie = 'InlineHelpDisplay=InlineHelpDisplayOn; expires=' + datExpires.toGMTString() + '; path=/';
		} else {
			document.cookie = 'InlineHelpDisplay=InlineHelpDisplayOff; expires=' + datExpires.toGMTString() + '; path=/';
		}
	}
}

function setInlineHelpDisplay(visible) {
	setInlineHelpDisplayItems(document.anchors, visible);
	setInlineHelpDisplayItems(document.links, visible);
}

function setInlineHelpDisplayItems(items, visible) {
	for (var i = 0; i < items.length; i++) {
		if (items[i].className.toLowerCase() == 'inlinehelp') {
			if (items[i].href == '') {
				items[i].style.display = visible ? 'inline' : 'none';
			} else {
				items[i].style.display = visible ? 'inline' : 'none';
				items[i].style.textDecoration = 'underline';
			}
		}
	}
}

function initInlineHelpDisplay() {
	if ((document.cookie) && (document.cookie.toString().indexOf('InlineHelpDisplayOff') >= 0)) {
		doInlineHelpOff();
	} else {
		doInlineHelpOn()
	}
}

function mediaPopup(theURL) {
	openPopup(theURL, 'winMediaPopup', 'status,toolbar=false', 622, 496);
	return false;
}

function AlertAppUpdate() {
	if (confirm('There have been updates to the\nsystem since your last visit!\n\nClick OK to review the latest features, \nenhancements and bug fixes.'))
		location.href = '/admin/client_services/updates.asp';
}

function ConfirmSignIn(strMemberName) {
	return confirm('You will now be signed in as ' + strMemberName + '. \n\nAre you sure you want to continue? ');
}

//search form functions
function SearchForm_q_OnKeyPress(e, sender) {
	if (getkey(e) == 13) {
		return SearchForm_Validate(sender);
	}
	return true;
}

function SearchForm_Validate(sender, element) {
	if (!element) element = sender.form.q;

	var sVal = element.value;

	if (sVal == '' || /^[\s]+$/.test(sVal)) {
		alert('Please enter some search criteria. ');
		element.focus();
		return false;
	}

	return true;
}

function StartNewSearch(FormId) {
	var SearchForm = document.getElementById(FormId);
	if (SearchForm) {
		SearchForm.q.value = '';
		SearchForm.style.display = '';
		SearchForm.q.focus();
	}
	return false;
}

function FilterSearchByCatalog(CatalogEnum) {
		var win = (parent) ? parent : self;
		var sQuery = win.location.search.replace(/\&?c=[^\&]*\&?/, "");
		if (sQuery.length == 0)
		{
			sQuery = '?';
		} else if (sQuery != '?')
		{
			sQuery += '&';
		}

		win.location.href = win.location.pathname + sQuery + "c=" + CatalogEnum.toString();
	return false;
}

function FilterIframeSearchCatalog(Catalog, CatalogEnum)
{
	// The category filter is an empty span appended to the end of the search box text, it will hold a link that is created in the same manner that the parent page is 
	// using to create the remove filter link with as is the case with old functionality when you click on a category in the search results description text
	// This function is used for the actual links created inside of the iframe window, when you filter by one of these categories "More Results" link, then we will want to show
	// the results un filtered, but with the current category
	self.location.href = self.location.href + "&c=" + CatalogEnum;
	var bSelectedCategory = window.parent.document.getElementById('bCategoryFilter');
	bSelectedCategory.innerHTML = " in " + Catalog + "<a href=# title=\"Remove Filter \" onclick=\"return FilterSearchByCatalog(" + 0 + ");\"><sup>(x)</sup></a>";
}

function emoticon(code, txtarea) {
	if ($("#ifRadEditor_strBody").is(":visible")) {
		//new RadEditor IFrame is on the page
		var $editor = $("#ifRadEditor_strBody").contents().find("body div#RadEditor1_contentDiv");

		if ($editor.is(":visible")) {
			// design mode
			$editor.append(code);
		}
		else {
			// HTML mode
			$editor = $("#ifRadEditor_strBody").contents().find("body td#RadEditor1Center iframe").contents().find("body textarea");

			$editor.val($editor.val() + code);
		}

		return;
	}

	if ((!txtarea) || typeof (txtarea) == 'undefined') {
		txtarea = document.frmMessage.strBody;
	}

	try { oUtil.obj.insertHTML(code); return; } catch (e) { }

	try { insertAtCaret(txtarea, code) } catch (e) { }
}

var m_bYuiGenericDialogResult;
var m_sDialogHeaderText = "";

//Two Button (confirm style) dialog
function YuiGenericDialog(Id, BodyText, Callback, TrueText, FalseText, ContainerId, PanelWidth, posX, posY, timeoutSeconds)
{
	if (!objectExists(TrueText)) TrueText = 'Yes';
	if (!objectExists(FalseText)) FalseText = 'No';
	if (!objectExists(PanelWidth)) PanelWidth = '300px';
	if (!objectExists(timeoutSeconds)) timeoutSeconds = 0;

	var blnCentered = true;
	if (objectExists(posX) && objectExists(posY))
	{
		blnCentered = false;
	}
	else
	{
		posX = 0;
		posY = 0;
	}

	var dialog = new YAHOO.widget.SimpleDialog(Id, {
		text: BodyText,
		iframe: false,
		visible: false,
		close: false,
		draggable: false,
		fixedcenter: blnCentered,
		constraintoviewport: true,
		modal: true,
		postmethod: 'none',
		underlay: 'shadow',
		width: PanelWidth,
		x: posX,
		y: posY
	});

	dialog.setHeader("Attention");
	if (m_sDialogHeaderText != '') {
		dialog.setHeader(m_sDialogHeaderText);
	}
	//dialog.cfg.setProperty("icon",YAHOO.widget.SimpleDialog.ICON_HELP);

	var aButtons = new Array();

	if (TrueText.length > 0) {
		aButtons[0] = {
			text: TrueText, handler: function () {
				m_bYuiGenericDialogResult = true;
				this.hide();
				Callback();
			}, isDefault: true
		};
	}

	if (FalseText.length > 0) {
		aButtons[1] = {
			text: FalseText, handler: function () {
				m_bYuiGenericDialogResult = false;
				this.hide();
				Callback();
			}
		};
	}

	dialog.cfg.queueProperty("buttons", aButtons);

	if (!objectExists(ContainerId)) ContainerId = "PageBase_RaiseAlert";

	var container = document.getElementById(ContainerId);
	if (!container) return;

	m_bYuiGenericDialogResult = null;

	dialog.render(container);
	dialog.show();

	if (timeoutSeconds > 0) setTimeout(function () { dialog.hide(); }, Math.round(timeoutSeconds * 1000));
}

function YuiGenericDialogCallback_ButtonClick(button) {
	if (m_bYuiGenericDialogResult) {
		button.onclick = function() { return true; }
		button.click();
	}
}

//call as a replacement for JavaScript Confirm (i.e. <a href="#" onclick="YUIConfirm("Are you sure?", function(){ if (m_bYuiGenericDialogResult) { dosomething(); } });">Submit</a>
function YUIConfirm(msg, yesaction) {
	YuiGenericDialog("confirm",
			msg,
       		yesaction
      );
}
function YUIConfirmCustomHeader(msg, yesaction, headertext) {
	m_sDialogHeaderText = headertext;
	YuiGenericDialog("confirm",
			msg,
       		yesaction
      );
}
function YUIConfirmCustomHeaderCustomPosition(msg, yesaction, headertext, posX, posY)
{
	m_sDialogHeaderText = headertext;
	YuiGenericDialog("confirm", msg, yesaction, null, null, null, null, posX, posY);
}



//One button (alert style) dialog
function YuiGenericAlert(Id, BodyText, Callback, ButtonText, ContainerId, PanelWidth) {
	if (!objectExists(ButtonText)) ButtonText = 'OK';
	if (!objectExists(PanelWidth)) PanelWidth = '300px';

	var dialog = new YAHOO.widget.SimpleDialog(Id, {
		text: BodyText,
		iframe: false,
		visible: false,
		close: false,
		draggable: false,
		fixedcenter: true,
		constraintoviewport: true,
		modal: true,
		postmethod: 'none',
		underlay: 'shadow',
		width: PanelWidth
	}
	);

	dialog.setHeader("Attention");
	//dialog.cfg.setProperty("icon", YAHOO.widget.SimpleDialog.ICON_HELP);

	dialog.cfg.queueProperty("buttons", [
	{ text: ButtonText, handler: function() {
		m_bYuiGenericDialogResult = true;
		this.hide();
		Callback();
	}, isDefault: true
	}
]);

	if (!objectExists(ContainerId)) ContainerId = "PageBase_RaiseAlert";

	var container = document.getElementById(ContainerId);
	if (!container) return;

	m_bYuiGenericDialogResult = null;

	dialog.render(container);
	dialog.show();
}

// Page Alert - Mimics the Page Alert temporary dialog box that appears, but this one can be called from javascript.
function ShowPageAlert(message)
{
	var container = document.getElementById('PageBase_RaiseAlert');

	if (container)
	{
		var AlertID = new Date().getTime();

		if ((document.cookie) && (document.cookie.toString().indexOf(AlertID) < 0))
		{
			document.cookie = 'AlertID=' + AlertID;

			PageBase_RaiseAlert_Dialog = new YAHOO.widget.SimpleDialog("PageBase_RaiseAlert_Dialog", {
				text: message,
				iframe: false,
				visible: true,
				close: true,
				draggable: true,
				modal: false,
				underlay: 'shadow',
				width: '270px',
				x: 5,
				y: 5
			});

			PageBase_RaiseAlert_Dialog.setHeader("Attention");
			PageBase_RaiseAlert_Dialog.cfg.setProperty("icon", YAHOO.widget.SimpleDialog.ICON_WARN);
			PageBase_RaiseAlert_Dialog.render(container);

			var PageBase_RaiseAlert_Tid = setTimeout('PageBase_RaiseAlert_Dialog.hide();', 7000);
		}
	}
}

//added type in order to color the alert accordingly.
//Type values: info, success, warning, danger.  Default: info
function RaiseAlert(message, type)
{
    //lowercase
    type = typeof type !== 'undefined' ? type.toLowerCase() : "info";
    var icon = "fa-bullhorn";

    switch (type) {
        case "warning": icon = "fa-bullhorn";
            break;
        case "danger": icon = "fa-flag";
            break;
        case "success": icon = "fa-check";
            break;
        default:
            type = "info";
            break;
    }

    if (!$("#jsPageAlert").length) {
        $("<div id='jsPageAlert'></div>").prependTo("BODY"); //
    };
	var markup =
		"<div role='alert' class='anchored-alert-top alert alert-"+type+" fade in animated fadeInDown'>" +
			"<button data-dismiss='alert' class='close' type='button'><span aria-hidden='true'>x</span><span class='sr-only'>Close</span></button>" +
			"<i class='fa "+icon+" mright-10'></i>" + message +
		"</div>";

	$("#jsPageAlert").html(markup);

	if (document.cookie && document.cookie.toString().indexOf(AlertID) < 0)
	{
		var AlertID = Date.now();
		document.cookie = 'AlertID=' + AlertID;
	}

	// Auto-dismiss after 5 seconds
	var toggleAlert = function()
	{
		$('.anchored-alert-top').removeClass('fadeInDown').addClass('fadeOutUp');
	}
	setTimeout(toggleAlert, 5000);
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// common functions
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
function getCurrentTime() {
	var now = new Date();
	return now.getTime();
}

function fixnewlines(val) {
	// Adjust newlines so can do correct character counting for MySQL. MySQL counts a newline as 2 characters.
	if (val.indexOf('\r\n') != -1)
		; // this is IE on windows. Puts both characters for a newline, just what MySQL does. No need to alter
	else if (val.indexOf('\r') != -1)
		val = val.replace(/\r/g, "\r\n"); // this is IE on a Mac. Need to add the line feed
	else if (val.indexOf('\n') != -1)
		val = val.replace(/\n/g, "\r\n"); // this is Firefox on any platform. Need to add carriage return
	else
		; // no newlines in the textarea  
	return val;
}

function objectExists(o) {
	if (typeof o == 'undefined' || o == null) return false;
	return true;
}

function isEmpty(val) {
	return (!val || val == null || val.toString() == '');
}

function replaceAccents(sVal) {
	var RetVal = new String(sVal);

	var regExps = [/[\xC0-\xC5]/g,
		/[\xE0-\xE5]/g,
		/[\xC8-\xCB]/g,
		/[\xE8-\xEB]/g,
		/[\xCC-\xCF]/g,
		/[\xEC-\xEF]/g,
		/[\xD2-\xD6]/g,
		/[\xF2-\xF6]/g,
		/[\xD9-\xDC]/g,
		/[\xF9-\xFC]/g,
		/\xDD/g, /\xFD/g,
		/\xC7/g, /\xE7/g,
		/\xD1/g, /\xF1/g];

	var repChar = ['A', 'a', 'E', 'e', 'I', 'i', 'O', 'o', 'U', 'u', 'Y', 'y', 'C', 'c', 'N', 'n'];

	for (var i = 0; i < regExps.length; i++)
		RetVal = RetVal.replace(regExps[i], repChar[i]);

	return RetVal;
}

function replaceReturns(sVal) {
	var RetVal = fixnewlines(sVal.toString());
	return RetVal.replace(/\r\n/g, '<br/>');
}

function insertAtCaret(obj, text) {
	if (document.selection) {
		obj.focus();
		var orig = obj.value.replace(/\r\n/g, "\n");
		var range = document.selection.createRange();

		if (range.parentElement() != obj) {
			return false;
		}

		range.text = text;

		var actual = tmp = obj.value.replace(/\r\n/g, "\n");

		for (var diff = 0; diff < orig.length; diff++) {
			if (orig.charAt(diff) != actual.charAt(diff)) break;
		}

		for (var index = 0, start = 0;
			tmp.match(text)
				&& (tmp = tmp.replace(text, ""))
				&& index <= diff;
			index = start + text.length
		) {
			start = actual.indexOf(text, index);
		}
	} else if (obj.selectionStart) {
		var start = obj.selectionStart;
		var end = obj.selectionEnd;

		obj.value = obj.value.substr(0, start)
			+ text
			+ obj.value.substr(end, obj.value.length);
	}

	if (start != null) {
		setCaretTo(obj, start + text.length);
	} else {
		obj.value += text;
	}
}

function setCaretTo(obj, pos) {
	if (obj.createTextRange) {
		var range = obj.createTextRange();
		range.move('character', pos);
		range.select();
	} else if (obj.selectionStart) {
		obj.focus();
		obj.setSelectionRange(pos, pos);
	}
}

function stripHtml(sVal) {
	return sVal.toString().replace(/<[\?\/!A-Za-z]+[^<>]*>?/ig, ' ');
}

function urlDecode(sVal) {
	if (isEmpty(sVal)) return sVal;
	return decodeURIComponent(sVal.toString()).replace(/\+/g, ' ');
}

function setCookie(name, value, path, expiredays) {
	var sCookie = name + '=' + escape(value);

	if (expiredays && typeof (expiredays) != 'undefined') {
		var exdate = new Date();
		exdate.setDate(exdate.getDate() + expiredays);
		sCookie += ('; expires=' + exdate.toGMTString());
	}

	if (path && typeof (path) != 'undefined') sCookie += ('; path=' + path);

	document.cookie = sCookie;
}

function setCookie_Secure(name, value, path, expiredays, secure, samesite) {
    var sCookie = name + '=' + escape(value);

    if (expiredays && typeof (expiredays) != 'undefined') {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + expiredays);
        sCookie += ('; expires=' + exdate.toGMTString());
    }

    if (path && typeof (path) != 'undefined') sCookie += ('; path=' + path);
    if (secure && typeof (secure) != 'undefined') sCookie += '; secure';
    if (samesite && typeof (samesite) != 'undefined') sCookie += ('; samesite=' + samesite);

    document.cookie = sCookie;
}

function getCookie(name) {
	if ((!document.cookie) || document.cookie.length == 0) return '';

	var iStart = document.cookie.indexOf(name + '=');
	if (iStart >= 0) {
		iStart += (name.length + 1);
		var iEnd = document.cookie.indexOf(";", iStart);
		if (iEnd < 0) iEnd = document.cookie.length;
		return unescape(document.cookie.substring(iStart, iEnd));
	}

	return '';
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// helpers for wiring-up event handlers
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
function addEventHandler_OnLoad(oFunc) {
	var oldHandler = window.onload;
	if (typeof window.onload != 'function') {
		window.onload = oFunc;
	} else {
		window.onload = function() {
			oldHandler();
			oFunc();
		}
	}
}

function addEventHandler_OnUnload(oFunc) {
	var oldHandler = window.onunload;
	if (typeof window.onunload != 'function') {
		window.onunload = oFunc;
	} else {
		window.onunload = function() {
			oldHandler();
			oFunc();
		}
	}
}

function addEventHandler_OnLoadAndUnload(oFunc) {
	addEventHandler_OnLoad(oFunc);
	addEventHandler_OnUnload(oFunc);
}

function addEventHandler_OnSubmit(oForm, oFunc) {
	var oldHandler = oForm.onsubmit;
	if (typeof oForm.onsubmit != 'function') {
		oForm.onsubmit = oFunc;
	} else {
		oForm.onsubmit = function() {
			oldHandler();
			oFunc();
		}
	}
}

function addEventHandler_OnSubmitChained(oForm, oFunc) {
	var oldHandler = oForm.onsubmit;
	if (typeof oForm.onsubmit != 'function') {
		oForm.onsubmit = oFunc;
	} else {
		oForm.onsubmit = function() {
			return oldHandler() && oFunc();
		}
	}
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// window functions
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
var blnRefreshWindow = false;
var blnCallBackRefresh = false;


function getWinSize() {
	var iWinW = 0;
	var iWinH = 0;
	if (typeof (window.innerWidth) != 'undefined') {
		iWinW = window.innerWidth;
		iWinH = window.innerHeight;
	} else {
		var d = document;
		if (d.documentElement && typeof (d.documentElement.clientWidth) != 'undefined' &&
			d.documentElement.clientWidth !== 0) {
			iWinW = d.documentElement.clientWidth;
			iWinH = d.documentElement.clientHeight;
		} else if (document.body && typeof (d.body.clientWidth) != 'undefined') {
			iWinW = d.body.clientWidth;
			iWinH = d.body.clientHeight;
		}
	}

	var aRetVal = new Array(1);
	aRetVal[0] = iWinW;
	aRetVal[1] = iWinH;

	return aRetVal;
}

function windowIsOpen(objWindow) {
	var blnIsOpen = false;

	if (typeof (objWindow) == 'object') {
		if (!objWindow.closed) {
			blnIsOpen = true;
		}
	}
	return blnIsOpen;
}

function setOpenerRefresh() {
	if (windowIsOpen(opener)) {
		opener.blnRefreshWindow = true;
	}
}

function reloadSelf() {
	var now = new Date();
	var newHref = location.protocol + '//' + location.hostname + location.pathname;
	var qString = location.search.replace(/\&?reloadtime=[^\&]*\&?/, '');

	if (qString.length == 0) {
		qString = '?'
	} else if (qString != '?') {
		qString += '&';
	}

	newHref += qString + 'reloadtime=' + now.getTime();

	location.href = newHref;
}



function refreshOpener(strDefaultURL, blnCloseMe) {
	var blnExists = false;

	if (windowIsOpen(opener)) {

	    if (opener.blnCallBackRefresh)
	    {

	        opener.SubmitRefresh();
	    }
        else
		if (opener.blnRefreshWindow == true) {

			var now = new Date();
			var newHref = opener.location.protocol + '//' + opener.location.hostname + opener.location.pathname;
			var qString = opener.location.search.replace(/\&?reloadtime=[^\&]*\&?/, '');

			if (qString.length == 0) {
				qString = '?'
			} else if (qString != '?') {
				qString += '&';
			}

			newHref += qString + 'reloadtime=' + now.getTime();

			opener.location.href = newHref;

			opener.focus();
		}
		blnExists = true;
	}

	if (blnExists == false) {
		window.open(strDefaultURL);
		blnCloseMe = true;
	}

	if (blnCloseMe == true) window.close(self);
}

function openerLocation(strLocation, blnCloseMe) {
	if (windowIsOpen(opener)) {
		opener.location.href = strLocation;
		if (blnCloseMe) opener.focus();
	} else {
		window.open(strLocation);
	}

	if (blnCloseMe) window.close(self);
}

function focusPopup(objPopup, theURL, winName, features, width, height) {
	var blnIsOpen = true;
	if (typeof (objPopup) != 'object') {
		blnIsOpen = false;
	} else if (objPopup.closed) {
		blnIsOpen = false;
	}
	if (blnIsOpen == false) {
		objPopup = returnPopup(theURL, winName, features, width, height);
	}
	objPopup.focus();
	return objPopup;
}

function goToUrlOnClick(Url) {
	location.href = Url;
	return false;
}

function goToUrlOnClickTargetParent(Url) {
	parent.location.href = Url;
	return false;
}

function openPopup(theURL, winName, features, width, height) {
	var objPopup = returnPopup(theURL, winName, features, width, height);
	objPopup.focus();
}

function returnPopup(theURL, winName, features, width, height) {
	var winWidth = width;
	var winHeight = height;
	var strWinSize = ",width=" + winWidth + ",height=" + winHeight;

	if (window.screen) {
		var winPosL = (screen.availWidth - winWidth) / 2;
		var winPosT = (screen.availHeight - winHeight) / 2;
		strWinSize += ",left=" + winPosL + ",screenX=" + winPosL + ",top=" + winPosT + ",screenY=" + winPosT;
	}

	return window.open(theURL, winName, features + strWinSize);
}

function closePopup() {
	window.close(self);
}

function setWinStatus(value) {
	window.status = value;
	return true;
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// form functions
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
function addOptionToSelectList(DomID, value) {
	var SelectList = document.getElementById(DomID);
	SelectList.options[SelectList.length] = new Option(value, value);
}

function removeSelectedOption(DomID) {
	var SelectList = document.getElementById(DomID);
	SelectList.options[SelectList.selectedIndex] = null;
}

function addHiddenInputToForm(form, name, value) {
	var newInput = document.createElement('INPUT');
	if (document.all) {
		newInput.type = 'hidden';
		newInput.id = name;
		newInput.name = name;
		newInput.value = value;
	} else {
		newInput.setAttribute('type', 'hidden');
		newInput.setAttribute('id', name);
		newInput.setAttribute('name', name);
		newInput.setAttribute('value', value);
	}
	form.appendChild(newInput);
}

function ClearDefaultValue(o) {
	if (o && o.value && o.defaultValue && o.value.toLowerCase() == o.defaultValue.toLowerCase()) o.value = '';
}

function checkRadioByValue(oRadio, value) {
	if (oRadio) {
		if (oRadio.length > 0) {
			for (var i = 0; i < oRadio.length; i++)
				oRadio[i].checked = (oRadio[i].value == value.toString());
		} else {
			oRadio.checked = (oRadio.value == value.toString());
		}
	}
}

function getCheckedRadioValue(oRadio) {
	if (oRadio) {
		if (oRadio.length > 0) {
			for (var i = 0; i < oRadio.length; i++) {
				if (oRadio[i].checked) return oRadio[i].value;
			}
		} else if (oRadio.checked) {
			return oRadio.value;
		}
	}
	return null;
}

function getSelectedText(elmnt) {
	if (elmnt && elmnt.options) {
		return elmnt.options[elmnt.selectedIndex].text;
	}
	return '';
}

function getSelectedTextById(elementId) {
	var elmnt = document.getElementById(elementId);
	return getSelectedText(elmnt);
}

function getSelectedValue(elmnt) {
	if (elmnt && elmnt.options) {
		return elmnt.options[elmnt.selectedIndex].value;
	}
	return '';
}

function getSelectedValueById(elementId) {
	var elmnt = document.getElementById(elementId);
	return getSelectedValue(elmnt);
}

function selectOptionByValue(oSelect, value) {
	if (oSelect) {
		for (var i = 0; i < oSelect.length; i++) {
			if (oSelect.options[i].value == value.toString()) {
				oSelect.selectedIndex = i;
				break;
			}
		}
	}
}

function verifyMsg(jsStrURL, jsStrMsg) {
	if (confirm(jsStrMsg)) {
		this.window.location = jsStrURL;
		return true;
	}
}

function CheckALL(objCheckbox) {
	if (objCheckbox) {
		var len = objCheckbox.length;

		if (len > 0) {
			var i = 0;
			for (i = 0; i < len; i++) {
				objCheckbox[i].checked = true;
			}
		} else {
			objCheckbox.checked = true;
		}
	}
}

function UnCheckALL(objCheckbox) {
	if (objCheckbox) {
		var len = objCheckbox.length;

		if (len > 0) {
			var i = 0;
			for (i = 0; i < len; i++) {
				objCheckbox[i].checked = false;
			}
		} else {
			objCheckbox.checked = false;
		}
	}
}

function formFocus(strFormname, strElement) {
	var objE = eval('document.' + strFormname + '.' + strElement);
	if (objE) objE.focus();
}

function buildHumanSQL(objElement, strHeadline) {

	var inputLocal = objElement;
	var strSQLHuman = '<b>' + strHeadline + '</b>\n';
	strSQLHuman += '<ul>\n';

	if (inputLocal) {
		var len = inputLocal.length;
		var i = 0;
		for (i = 0; i < len; i++) {

			if (inputLocal.options[i].selected) {

				strSQLHuman += '<li>' + inputLocal.options[i].text + '<br></li>\n';
			}
		}
	}

	strSQLHuman += '</ul>'
	objElement.form.txt_sqlHuman.value = strSQLHuman;
	return true;
}

function ClickOnCrKeyPress(e, button) {
	if (getkey(e) == 13) {
		button.click();
		return false;
	}
	else return true;
}

function DoOnCrKeyPress(e, oFunc) {
	if (getkey(e) == 13) {
		oFunc();
		return false;
	}
	else return true;
}

function SubmitOnCrKeyPress(e, sender) {
	if (getkey(e) == 13) {
		sender.form.submit();
		return false;
	}
	else return true;
}

function VoidOnCrKeyPress(e) {
	return (getkey(e) != 13);
}

function getkey(e) {
	if (window.event)
		return window.event.keyCode;
	else if (e)
		return e.which;
	else
		return null;
}

function confirmDelete(objForm, strElement, strValue) {
	var ItemRow = document.getElementById(strValue.toString());
	var strPrevClass = '';

	if (ItemRow) {
		strPrevClass = ItemRow.className;
		ItemRow.className = 'delitem';
	}

	if (confirm('Are you sure you want to delete the selected item? ')) {
		eval('objForm.' + strElement).value = strValue;
		return true;
	}
	else {
		if (ItemRow) ItemRow.className = strPrevClass;
		return false;
	}
}

function InlineDelete_Submit(sender, keyfield, id) {
	return confirmDelete(sender.form, keyfield, id);
}

function InlineItem_Delete(sender, ItemID) {
	return confirmDelete(sender.form, 'ItemID', ItemID);
}

//adds a new option to a userlist element
function UserListAdd(sender, ID, AllowComma, DefaultValue) {
	var SelectList = eval('sender.form.' + ID + '_select');
	var UserInput = eval('sender.form.' + ID + '_input');

	if (SelectList && UserInput) {
		var val = stripHtml(UserInput.value.toString());
		if (!AllowComma) val = val.replace(/,/g, '');
		if (val != '') {
			SelectList.options[SelectList.length] = new Option(val, val);
			RebuildUserList(sender.form, ID);
		}
		if (DefaultValue != null) UserInput.value = DefaultValue;
		try { //IE throws an exception if the focus() method of an invisible object is called
			UserInput.focus();
		} catch (e) { };
	}
}

//removes the selected option from a userlist element
function UserListRemove(sender, ID) {
	var SelectList = eval('sender.form.' + ID + '_select');
	if (SelectList) {
		SelectList.options[SelectList.selectedIndex] = null;
		RebuildUserList(sender.form, ID);
	}
}

//rebuilds the hidden value of a userlist element
function RebuildUserList(form, ID) {
	var HiddenInput = eval('form.' + ID);
	if (!HiddenInput) {
		addHiddenInputToForm(form, ID, '');
		HiddenInput = eval('form.' + ID);
	}
	HiddenInput.value = '';

	var SelectList = eval('form.' + ID + '_select');
	if (SelectList) {
		for (var i = 0; i < SelectList.length; i++)
			HiddenInput.value += SelectList.options[i].value + '\r\n';
	}
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// DHTML display functions
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
function adjustIFrameHeight(DomID, Height) {
	var frame = document.getElementById(DomID);
	var frameDoc = getIFrameDoc(DomID);

	if (frameDoc == null) return;

	if (Height)
	{
		frame.height = Height;
	}
	else
	{
		frame.height = frameDoc.body.offsetHeight;
	}
}

function adjustIFrameHeight300(DomID) {
	var frame = document.getElementById(DomID);
	var frameDoc = getIFrameDoc(DomID);

	if (frameDoc == null) return;

	frame.height = frameDoc.body.offsetHeight + 350;
}

function getIFrameDoc(FrameID) {
	var frame = document.getElementById(FrameID);
	var ret = null;

	if (frame.contentDocument) {	// W3C compliant (Mozilla)
		ret = frame.contentDocument;
	} else {
		// IE
		ret = document.frames[FrameID].document;
	}

	return ret;
}

function ul_onclick(jsObj) {
	var i;
	var style;

	for (i = 0; i < jsObj.children.length; i++) {
		style = jsObj.children[i].style;
		if (style.display == "none") {
			style.display = "";
		}
		else {
			style.display = "none";
		}
	}
}

function setDisplay(DomId, Value) {
	var element = document.getElementById(DomId);
	if (element) element.style.display = Value;
	return false;
}

function switchDisplay(strDomID) {
	var CssStyle = document.getElementById(strDomID).style;
	if (CssStyle) {
		if (CssStyle.display == '') {
			CssStyle.display = 'none';
		}
		else {
			CssStyle.display = '';
		}
		setCssDisplayCookie(strDomID);
	}
	return false;
}

function switchDisplayToggle(parentId, childOn, childOff) {
	var CssStyle = document.getElementById(parentId).style;
	if ((CssStyle) && (CssStyle.display == '')) {
		dhtmlDisplay(childOff, '');
		dhtmlDisplay(childOn, 'none');
	}
	else {
		dhtmlDisplay(childOff, 'none');
		dhtmlDisplay(childOn, '');
	}
	return false;
}

function getCssDisplayCookie(domId) {
	if (document.cookie) {
		var CssStyle = document.getElementById(domId).style;
		if ((CssStyle) && (document.cookie.toString().indexOf(domId + 'DisplayOn') < 0)) {
			CssStyle.display = 'none';
		}
		else {
			CssStyle.display = '';
		}
	}
}

function setCssDisplayCookie(domId) {
	if (document.cookie) {
		var CssStyle = document.getElementById(domId).style;
		if ((CssStyle) && (CssStyle.display == '')) {
			document.cookie = domId + 'Display=' + domId + 'DisplayOn';
		}
		else {
			document.cookie = domId + 'Display=' + domId + 'DisplayOff';
		}
	}
}

function textCounter(field, cntfield, maxlimit) {
	var val = fixnewlines(field.value.toString());
	var len = val.length;

	//if aready too long, trim it before making any adjustments
	if (len > maxlimit) {
		val = val.substring(0, maxlimit);
		len = val.length;
		field.value = val;
	}

	//update 'characters left' counter
	cntfield.value = (maxlimit - len);
}

function TextCounter_Window_OnLoad(FormName, InputName, MaxLen) {
	var form = eval('document.' + FormName);
	var TextInput = eval('form.' + InputName);

	TextInput.onkeyup = function() {
		textCounter(this, eval('this.form.' + InputName + '_Counter'), MaxLen);
	}

	textCounter(TextInput, eval('form.' + InputName + '_Counter'), MaxLen);
}

function InitTextCounter(FormName, InputName, MaxLen) {
	addEventHandler_OnLoad(function() { TextCounter_Window_OnLoad(FormName, InputName, MaxLen); });
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// DTHML edit functions 
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
function dhtmlDisplay(domID, dVal) {
	var element = document.getElementById(domID);
	if (element) element.style.display = dVal;
}

function dhtmlFormEdit(objForm, domLEN, domID) {

	var styleView;
	var styleEdit;
	var i = 1;
	for (i = 1; i <= domLEN; i++) {

		var styleView = document.getElementById('view' + i.toString()).style;
		var styleEdit = document.getElementById('edit' + i.toString()).style;

		if ((i.toString() == domID.toString()) && (styleView.display == "")) {
			styleView.display = "none";
			styleEdit.display = "";
			intLastOpenRow = i.toString();
		} else {
			styleView.display = "";
			styleEdit.display = "none";
		}
	}

	objForm.reset();
	return false;

}

function dhtmlFormSubmit(objForm1, objForm2, domID, sysAction) {

	var i = 0;
	for (i = 0; i < objForm2.length; i++) {

		var objE = eval('objForm1.' + objForm2[i].name + domID);

		if (objE) {
			if (objE.type == 'checkbox' | objE.type == 'radio') {
				if (objE.checked) {
					objForm2[i].value = objE.value;
				}
			} else if (objE.type == 'select') {
				var j = 0;
				for (j = 0; j < objE.length; j++) {
					if (objE.options[i].selected) {
						objForm2[i].value = objE.options[j].value;
					}
				}
			} else {
				objForm2[i].value = objE.value;
			}
		}
	}

	objForm2.sys_id.value = domID;
	objForm2.sys_action.value = sysAction;

	var blnSubmit;
	if (sysAction == 'delete') {
		blnSubmit = confirm('Click OK to delete this record.');
	} else {
		blnSubmit = true;
	}

	if (blnSubmit) objForm2.submit();
	return false;

}

function MaximizeScrollingBlock(DomId) {
	var o = document.getElementById(DomId);

	if (o) {
		o.style.overflow = 'visible';
		o.style.height = 'auto';
	}

	return false;
}

function RestoreScrollingBlock(DomId, Height) {
	var o = document.getElementById(DomId);

	if (o) {
		o.style.overflow = 'auto';
		o.style.height = Height;
	}

	return false;
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// "AJAX" functions ;)
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
function setInnerHtmlFromHttpRequest(Id, Url) {
	var xmlhttp = null;
	if (window.XMLHttpRequest) {	//code for Mozilla, etc.
		xmlhttp = new XMLHttpRequest();
	} else if (window.ActiveXObject) {	//code for IE
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}

	if (xmlhttp) {	//wire up the event to handle the response on successful load
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200 && xmlhttp.responseText != '') {
				var container = document.getElementById(Id);
				container.innerHTML = xmlhttp.responseText;
				container.style.display = '';
			}
		}

		xmlhttp.open("GET", Url, true);
		xmlhttp.send(null);
	}
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// 3rd-party functions
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

// Countdown in Java Script .. Cameron Gregory http://www.bloke.com/
// permission to use and modify as long as you leave these 4 comment
// lines in tact and unmodified.
// http://www.bloke.com/javascript/Countdown/
var clockForm, clockTime, clockTimeout, clockFormat, clockTid, clockRefresh;

function doDate() {

	dt = new Date();

	if (clockTime != 0) {
		v1 = Math.round((clockTime - dt) / 1000);
		//add timeout value to time
		v1 += Math.round(clockTimeout * 60);
		if (v1 <= 0) {
			clockForm.date.value = "expired";
			//dont set the timer again
		}
		else {
			if (clockFormat == 1)
				clockForm.date.value = v1;
			else if (clockFormat == 2) {
				sec = v1 % 60;
				v1 = Math.floor(v1 / 60);
				min = v1 % 60;
				hour = Math.floor(v1 / 60);
				if (sec < 10) sec = "0" + sec;
				if (min < 10) min = "0" + min;
				if (hour > 0) {
					clockForm.date.value = hour + "h " + min + "m " + sec + "s";
				} else {
					clockForm.date.value = min + "m " + sec + "s";
				}
			}
			else if (clockFormat == 3) {
				sec = v1 % 60;
				v1 = Math.floor(v1 / 60);
				min = v1 % 60;
				v1 = Math.floor(v1 / 60);
				hour = v1 % 24;
				day = Math.floor(v1 / 24);
				if (sec < 10) sec = "0" + sec;
				if (min < 10) min = "0" + min;
				if (hour < 10) hour = "0" + hour;
				clockForm.date.value = day + "d " + hour + "h " + min + "m " + sec + "s";
			}
			else if (clockFormat == 4) {
				sec = v1 % 60;
				v1 = Math.floor(v1 / 60);
				min = v1 % 60;
				v1 = Math.floor(v1 / 60);
				hour = v1 % 24;
				day = Math.floor(v1 / 24);
				clockForm.date.value = day + (day == 1 ? "day " : "days ") + hour + (hour == 1 ? "hour " : "hours ") + min + (min == 1 ? "min " : "mins ") + sec + (sec == 1 ? "sec " : "secs ")
			}
			else {
				clockForm.date.value = "invalid format";
			}
			clockTid = window.setTimeout("doDate()", clockRefresh);
		}
	}
	else
		clockForm.date.value = "error";
}

function startCountdown(objForm, time, timeout, format) {
	clockForm = objForm;
	clockTime = new Date(time);
	clockTimeout = timeout;
	clockFormat = format;
	clockTid = 0;
	clockRefresh = 1000;
	if (Math.round((clockTime - new Date()) / 1000) < -60) {
		//clock is too far out of sync
		clockForm.date.value = "unknown";
	}
	else {
		clockTid = window.setTimeout("doDate()", clockRefresh);
	}
}

//shift all the characters in the inval by shiftval characters from the charset
//  example:  "cat", 2, "abcdefghijklmnopqrstuvwxyz"
// would become "ecv"
// if a character is not found in charset, it is untouched.
//if a shift operation goes out of bounds, it will roll to the other side of charset
function CharShiftDecrypt(strInVal, shiftval, shiftCharSet) {
	var strInString = new String(strInVal);
	var intInString = strInString.length;
	var strCharSet = new String(shiftCharSet);
	var intCharSetLen = strCharSet.length;
	var strOutVal = new String('');

	var nextchar, nextindex, ascii_nextchar, i;

	//for each character
	for (i = 0; i < intInString; i++) {
		// grab the next character to encrypt
		nextchar = strInString.substr(i, 1);

		//look it up in charset
		nextindex = strCharSet.indexOf(nextchar, 0)
		if (nextindex >= 0) { //found it
			nextindex = (nextindex - shiftval) % intCharSetLen // modulo this so can stay in bounds for next operation

			//check bounds of nextindex
			if (nextindex < 0) {
				nextindex = nextindex + intCharSetLen //wrap around to high end of charset
			}
			else if (nextindex >= intCharSetLen) { //this wont happen btw, becuase of modulo, but anyway
				nextindex = nextindex - intCharSetLen
			}
			strOutVal += strCharSet.charAt(nextindex);
		}
		else { //char not found in set, so add it as is
			strOutVal += nextchar;
		}
	}

	return strOutVal;

}

//function used with jupload version 2.4+
function jupload_result(result_html) {
	window.setTimeout(function() {
		document.open();
		document.write(result_html);
		document.close();
	}, 1000);
}

//Returns an array of StyleSheet DOM objects for the <link .. /> tags on a page
//See http://www.javascriptkit.com/domref/stylesheet.shtml for the available properties you can use on the array
function getAllSheets() {
	//if you want ICEbrowser's limited support, do it this way
	if (!window.ScriptEngine && navigator.__ice_version) {
		//IE errors if it sees navigator.__ice_version when a window is closing
		//window.ScriptEngine hides it from that
		return document.styleSheets;
	}
	if (document.getElementsByTagName) {
		//DOM browsers - get link and style tags
		var Lt = document.getElementsByTagName('link');
		var St = document.getElementsByTagName('style');
	} else if (document.styleSheets && document.all) {
		//not all browsers that supply document.all supply document.all.tags
		//but those that do and can switch stylesheets will also provide
		//document.styleSheets (checking for document.all.tags produces errors
		//in IE [WHY?!], even though it does actually support it)
		var Lt = document.all.tags('LINK'), St = document.all.tags('STYLE');
	} else { return []; } //lesser browser - return a blank array
	//for all link tags ...
	for (var x = 0, os = []; Lt[x]; x++) {
		//check for the rel attribute to see if it contains 'style'
		if (Lt[x].rel) {
			var rel = Lt[x].rel;
		} else if (Lt[x].getAttribute) {
			var rel = Lt[x].getAttribute('rel');
		} else { var rel = ''; }
		if (typeof (rel) == 'string' && rel.toLowerCase().indexOf('style') + 1) {
			//fill os with linked stylesheets
			os[os.length] = Lt[x];
		}
	}
	return os;
}


//Generating Pop-up Print Preview page
//Creates a new window, loads the style sheets from the parrent window (for proper site rendering),
//then grabs the HTML from the <body> tag and substrings looking for the special YM print comments
function createPrintPagePopup() {
	//Creating new page
	var pp = window.open('', 'print', 'height=600,width=600,scrollbars=yes');
	//Adding HTML opening tag with <HEAD> � </HEAD> portion 
	pp.document.writeln('<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">');
	pp.document.writeln('<html xmlns="http://www.w3.org/1999/xhtml">');

	pp.document.writeln('<head><title>Print Preview</title>')

	//include all the stylesheets that are on the current page
	for (var x = 0, ss = getAllSheets(); ss[x]; x++) {
		//for each stylesheet ...
		pp.document.writeln('<link rel="stylesheet" type="text/css" href="' + ss[x].href + '"/>');
	}

	pp.document.writeln('<style type="text/css" media="print">')
	pp.document.writeln('#PRINT, #CLOSE { display:none; }');
	pp.document.writeln('#SpContent { width:100% !important; }');
	pp.document.writeln('#CustomPageBody { overflow: visible !important; overflow-y: visible !important; overflow-x: visible !important; width:100% !important; }');
	pp.document.writeln('.YMPrintMe { display: table-cell !important; }');
	pp.document.writeln('</style>');
	pp.document.writeln('<style type="text/css">')
	pp.document.writeln('#SpContent { height:100% !important; width:100% !important; }');
	pp.document.writeln('#CustomPageBody { overflow: visible !important; overflow-y: visible !important; overflow-x: visible !important; width:100% !important; }');
	pp.document.writeln('.YMPrintMe { display: table-cell !important; }');
	pp.document.writeln('</style>');
	pp.document.writeln('<script type="text/javascript">');
	pp.document.writeln('function printthis() {');
	pp.document.writeln('	try {');
	pp.document.writeln('		window.print();');
	pp.document.writeln('	} catch(e) {');
	pp.document.writeln('window.focus();')
	pp.document.writeln('		window.print();');
	pp.document.writeln('window.close();');
	//pp.document.writeln('		alert("error");');
	pp.document.writeln('	}');
	pp.document.writeln('}</script>');
	pp.document.writeln('</head>')

	//Adding Body Tag
	pp.document.writeln('<body>');
	//Adding form Tag
	pp.document.writeln('<form method="post">');

	//Creating two buttons Print and Close within a HTML table
	pp.document.writeln('<TABLE width=100%><TR><TD></TD></TR><TR><TD align=right>');
	pp.document.writeln('<INPUT ID="PRINT" type="button" value="Print" class="formbutton" onclick="javascript:printthis();">');
	pp.document.writeln('<INPUT ID="CLOSE" type="button" class="formbutton" value="Close" onclick="javascript:window.openter=\'x\'; window.close();">');
	pp.document.writeln('</TD></TR><TR><TD></TD></TR></TABLE>');

	//Writing print area of the calling page
	var body;
	body = document.getElementById('PageBody').innerHTML;
	var idxStart = body.indexOf('@@DG_PRINT_PAGE_BEGIN@@', 0) + 70;
	var len = body.indexOf('@@DG_PRINT_PAGE_END@@', 0) - idxStart - 4;
	body = body.substr(idxStart, len);
	pp.document.writeln(body);

	//Ending Tag of </form>, </body> and </HTML>
	pp.document.writeln('</form></body></HTML>');
}

function getQueryStringParam(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");

	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.search);

	if (results == null)
		return "";
	else
		return decodeURIComponent(results[1].replace(/\+/g, " "));
}

// Adds or replaces the query string parameter [name] with [value] in the given [url].
// If [url] is blank, we'll attempt to get the current URL. If [value] is blank, we'll
// remove the parameter from the query string entirely.
function setQueryStringParam(name, value, url) {
	if (!url) url = window.location.href;
	var re = new RegExp("([?|&])" + name + "=.*?(&|#|$)", "gi");

	if (url.match(re)) {
		if (value)
			return url.replace(re, '$1' + name + "=" + value + '$2');
		else
			return url.replace(re, '$2');
	}
	else {
		if (value) {
			var separator = url.indexOf('?') !== -1 ? '&' : '?',
                hash = url.split('#');
			url = hash[0] + separator + name + '=' + value;
			if (hash[1]) url += '#' + hash[1];
			return url;
		}
		else
			return url;
	}
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Custom Form Paging & Validation
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var m_customFormPageNum = 0;
var m_customFormPageErrors = new Array();
var m_customFormMultiPageGuid;

function ShowCustomFormPage(page, totalPages) {
	if (m_customFormPageErrors.length < totalPages) {
		//set array to inital state
		for (var i = 0; i < totalPages; i++) {
			m_customFormPageErrors[i] = 'NA';
		}
	}

	//**** validate the page before switching...


	//build data package for this page
	var data = '';
	var currentPageID = "formpage" + m_customFormPageNum;

	//build a name/value pair post data string
	$('#' + currentPageID + ' :input').each(function() {
	        var elementIsCheckable = $(this).is(":radio,:checkbox"); //checkable, as in, can the user "check" it on the UI, ie a checkbox or radio button
	        if (!elementIsCheckable || $(this).is(":checked")) {
	            data += $(this).prop('name') + '=' + encodeURIComponent($(this).val()) + "&"
	        }
	        //TODO: handle file upload (if it becomes a requirement in the future)
	});

	//remove the trailing "&"
	if (data.length > 0) data = data.substring(0, data.length - 1);

	//validate the form, errors go into the "CFormErrors" div, null is to not validate the capcha
	var valid = ValidateForm(data, 'CFormErrors', null);

	if (valid) {
		m_customFormPageErrors[m_customFormPageNum] = '';
	}
	else {
		m_customFormPageErrors[m_customFormPageNum] = $('#CFormErrors').html();
	}

	//Apply the CSS classes to valid pages during each page transistion
	for (var i = 0; i < m_customFormPageErrors.length; i++) {
		if (m_customFormPageErrors[i] == '') {
			$('#pagination' + i).addClass('valid');
			$('#pagination' + i).removeClass('invalid');
		}
		else if (m_customFormPageErrors[i] == 'NA') {
			$('#pagination' + i).removeClass('invalid');
			$('#pagination' + i).removeClass('valid');
		}
		else {// if (m_customFormPageErrors[i] != '') {
			$('#pagination' + i).addClass('invalid');
			$('#pagination' + i).removeClass('valid');
		}
	}


	//stop action if the page is invalid
	if (!valid) {
		$('#CFormErrors').addClass('infobox');
		//return false;
	}


	//*** End Validation

	//set the "next/prev" page that we are going to as the current
	$('#CustomFormPager:not(.legend)').children().removeClass('current');


	if (page == 'next')
		m_customFormPageNum++;
	else if (page == 'prev')
		m_customFormPageNum--;
	else
		m_customFormPageNum = page;

	for (var i = 0; i < totalPages; i++) {
		// Setup pagination
		if (m_customFormPageNum == i) {
			$('#formpage' + i).show();
			$('#pagination' + i).addClass('current');
		}
		else {
			$('#formpage' + i).hide();
		}
	}

	// Deal with the PREV button
	if (m_customFormPageNum == 0) {
		$('#formpage_prev').hide();
	}
	else {
		$('#formpage_prev').show();
	}

	// Deal with the NEXT button
	if (m_customFormPageNum == totalPages - 1) {
		$('#formpage_next').hide();
		$('#sOr').hide();
		$('#CFormCaptchaSubmit').show();
	}
	else {
		$('#formpage_next').show();
		$('#sOr').show();
		$('#CFormCaptchaSubmit').hide();
	}

	//clear the errors div on each virtual page load
	var errors = '';
	for (var i = 0; i < m_customFormPageErrors.length; i++) {
		if (m_customFormPageErrors[i] != 'NA') {
			errors += m_customFormPageErrors[i];
		}
	}

	if (errors == '') {
		$('#CFormErrors').removeClass('infobox');
		$('#CFormErrors').html('');
	}
	else {
		$('#CFormErrors').addClass('infobox');
		$('#CFormErrors').html('<ul style="margin: 0px;">' + errors + '</ul>');
	}

	// Scroll to the top of the form page.
	$('html,body').animate({
		scrollTop: $("#CustomFormForm").offset().top
	}, 'slow');
}

function SubmitCustomForm(strUseCaptcha) {
	var valid = true;
	var data = $("#CustomFormForm").serialize();
	var blnUseCaptcha = false;
	var errors;

	if (strUseCaptcha == 'True') {
		blnUseCaptcha = true;
	}

	valid = ValidateForm(data, 'CFormErrors', blnUseCaptcha);

	if (!valid) {
		$('#CFormErrors').addClass('infobox');

		// Read the errors from the div first, then store it back in there with the ul around it.
		errors = $('#CFormErrors').html();
		$('#CFormErrors').html('<ul style="margin: 0px;">' + errors + '</ul>');
	

	    // Scroll to the top of the form page.
		$('html,body').animate({
		    scrollTop: $("#CustomFormForm").offset().top
		}, 'slow');
    }

	if (m_customFormPageErrors != null && m_customFormPageErrors.length > 0) {
		//multi-page form, do final validation check before submit
		for (var i = 0; i < m_customFormPageErrors.length - 1; i++) { //skip the last page....
			if (m_customFormPageErrors[i].length != 0) {
				//alert("--" + m_customFormPageErrors[i] + "--");
				valid = false;
			}
		}
		if (!valid) {
			alert("Please make sure you visit each page and complete all required fields.");
		}
	}

	// add check for attached item, if item is attached pass query string to check out page
	// redirect here to checkout page

	return valid;
}
		
function createBasicYUI() 
{	
	YAHOO.namespace("container");

	function YAHOOinitDescriptionPanel() {
		YAHOO.container.DescriptionPanel = new YAHOO.widget.SimpleDialog("DescriptionPanel", { visible: false,
			iframe: false,
			constraintoviewport: true,
			close: false,
			draggable: false,
			modal: false,
			underlay: 'shadow',
			width: '350px',
			height: '200px',
			x: 20,
			fixedcenter: false
		});

		YAHOO.container.DescriptionPanel.cfg.queueProperty("buttons", [
			{ text: 'Yes', handler: function() {
				document.getElementById("blnUpdateUserProfileData").checked = true;
				this.cancel();
			}, isDefault: true
			},
			{ text: 'No', handler: function() {
				document.getElementById("blnUpdateUserProfileData").checked = false;
				this.cancel();
			}
			}
		]);
		
		YAHOO.container.DescriptionPanel.render();
	}

	YAHOO.util.Event.onDOMReady(YAHOOinitDescriptionPanel);

}


function showDialog()// goes with above function
{
	//	//IE hack: underlay size does not change with panel size; resize it now
	if (document.all) YAHOO.container.DescriptionPanel.sizeUnderlay();
		YAHOO.container.DescriptionPanel.show();
}

/*******************************************************\
* Custom Fields File Uploader Stuff						*
\*******************************************************/
function openFileUploadDialog(fileUploadControlID)
{
	window.open("/general/CustomFieldFileUpload.aspx?controlID=" + fileUploadControlID, 'fileUploadPopup', 'width=800,height=600,toolbar=0,menubar=0,location=0,status=0,scrollbars=1,resizable=1,left=300,top=200');
}

/*******************************************************\
* Rich Text Editor Stuff								*
\*******************************************************/
function OpenTextEditor(showSourceControlID, showResourcesControlID, disableMediaControlID, useAbsolutePathsControlID, modeControlID, contentControlID, messageControlID, shouldShowWidgetsControlID, groupID, previewControlID, publishingPathControlID, styleSheetControlID, macrosControlID, emailModeControlID, isBackend) {
	var textEditor = window.open("/TextEditor.aspx?" +
		"ss=" + $("#" + showSourceControlID).val() +
		"&sr=" + $("#" + showResourcesControlID).val() +
		"&dm=" + $("#" + disableMediaControlID).val() +
		"&uap=" + $("#" + useAbsolutePathsControlID).val() +
		"&m=" + $("#" + modeControlID).val() +
		"&group=" + groupID +
		"&pp=" + $("#" + publishingPathControlID).val() +
		"&s=" + $("#" + styleSheetControlID).val() +
		"&macros=" + $("#" + macrosControlID).val() +
		"&em=" + $("#" + emailModeControlID).val() +
		"&ib=" + isBackend, "TextEditor_" + contentControlID, "width=730,height=700,resizable=yes,scrollbars=yes", true);

	//set variables for control ids to access data from parent page
	textEditor.contentControlID = contentControlID;
	textEditor.messageControlID = messageControlID;
	textEditor.shouldShowWidgetsControlID = shouldShowWidgetsControlID;
	textEditor.previewControlID = previewControlID;

	textEditor.focus();
}
// called from popup
function GetTextEditorContent(contentControlID) {
	return $("#" + contentControlID).val();
}
// called from popup
function HandleTextEditorSave(contentControlID, messageControlID, strHTML, strDateTime, previewControlID) {
	$("#" + contentControlID).val(strHTML);

	// preview is a RadEditor in an iframe and we have the iframe ID
	var $iframe = $("#" + previewControlID);
	var $divContentPreview = $iframe.contents().find("body #reContentPreview");

	$divContentPreview.html(strHTML);

	var intHeight = $iframe.contents().find("html").height();

	intHeight = (intHeight > 350 ? 350 : (intHeight < 100 ? 100 : intHeight)); //min=100 max=350

	$iframe.css("min-height", intHeight + "px").css("max-height", intHeight);

	$("#" + messageControlID).html("&nbsp;Changes made in the popup editor will not commit until this form is submitted.").css("padding-top", "2px").css("padding-bottom", "2px");
}
// called from popup
function ShouldShowWidgets(shouldShowWidgetsControlID) {
	return $("#" + shouldShowWidgetsControlID).val() == "1";
}
function ToggleWidgets(strFieldName) {
	$("#trWidgets_" + strFieldName).toggle();
}

function cleanupHtmlForMobileMenu($listItemElements) {
	//remove the classes that RadMenu attached
	$listItemElements.removeAttr('class');

	$listItemElements.each(function (idx) {
		//debugger;
		$(this).find('a').removeAttr('class');
		$(this).find('a').removeAttr('id');
		$(this).find('a>span').removeAttr('class');

		//remove any iframes that may have 
		//been created for IE
		$(this).find('iframe').remove();

		//loop through any divs and replace them
		//with the inner content
		var $divs = $(this).find('div');
		if ($divs.length !== 0) {
			//debugger;
			$divs.each(function (idx) {
				//debugger;
				$(this).find('ul').removeAttr('class');
				$(this).find('ul').removeAttr('style');

				cleanupHtmlForMobileMenu($(this).find('ul>li'));
				var content = $(this).html();
				$(this).replaceWith(content);
			});
		}
	});
};

function isValidEmailAddress(email)
{    
    return /^[-a-zA-Z0-9~!$%^&*_=+}{\'?]+(\.[-a-zA-Z0-9~!$%^&*_=+}{\'?]+)*@((\[?[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\]?)|(([a-zA-Z0-9]+[\w\-]*\.)+[a-zA-Z]{2,63}))$/.test(email);
}

//returns the value of an xml node's child node by tag name
function GetChildNodeValue(Node, TagName)
{
	var RetVal;
	try {
		RetVal = Node.getElementsByTagName(TagName)[0].childNodes[0].nodeValue;
	} catch(e) {
		RetVal = '';
	}
	return RetVal;
}

//returns the value of an xml node
function GetNodeValue(Node)
{
	var RetVal;
	try {
		RetVal = Node.childNodes[0].nodeValue;
	} catch(e) {
		RetVal = '';
	}
	return RetVal;
}

//creates a new xml node and assigns a value if supplied
function NewNode(xmlDoc, Name, Value)
{
	if(!xmlDoc) return null;
	
	var RetNode = xmlDoc.createElement(Name);
	if(Value) {
		var nValue = xmlDoc.createTextNode(Value.toString());
		RetNode.appendChild(nValue);
	}
	
	return RetNode;
}

//creates a new xml node and assigns a CDATA value if supplied
function NewCdataNode(xmlDoc, Name, Value)
{
	if(!xmlDoc) return null;
	
	var RetNode = xmlDoc.createElement(Name);
	if(Value) {
		var nValue = xmlDoc.createCDATASection(Value.toString());
		RetNode.appendChild(nValue);
	}
	
	return RetNode;
}



var FORM_VALIDATION_URL = '/global_engine/validate_form.asp';

function defaultBadBrowserHandler() {
	alert('This interface requires features which your browser does not supprt. \n\n' +
		'You will now be redirected to the Client Services Support Center, \n' +
		'where you will find additional information on browser requirements. ');
	location.href = '/admin/client_services/backend_technical_requirements.asp';
	return null;
}

function ignoreBadBrowser() {
	return null;
}

function DisableToolbarButton(DomId) {
	var btn = document.getElementById(DomId);
	btn.className = 'disabled';
	btn.onclick = function () { return false; };
}

function EnableToolbarButton(DomId) {
	var btn = document.getElementById(DomId);
	btn.className = '';
	btn.onclick = eval(DomId + '_OnClick');
}

function newXmlDoc() {
	var xmldoc = null;
	if (window.ActiveXObject) {
		// browser is IE
		xmldoc = new ActiveXObject('Microsoft.XMLDOM');
	} else if (document.implementation && document.implementation.createDocument) {
		// browser is Mozilla, Firefox, Opera, etc.
		xmldoc = document.implementation.createDocument('', '', null);
	} else {
		return null;
	}
	xmldoc.async = false;
	return xmldoc;
}

function newXmlHttp(BadBrowserHandler) {
	var xmlhttp = null;
	if (window.ActiveXObject) {
		// browser is IE
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	} else if (window.XMLHttpRequest) {
		// browser is Mozilla, Firefox, Opera, etc.
		xmlhttp = new XMLHttpRequest();
	} else {
		if (BadBrowserHandler && typeof (BadBrowserHandler) != 'undefined') {
			return BadBrowserHandler();
		} else {
			return defaultBadBrowserHandler();
		}
	}
	return xmlhttp;
}

function sendSimpleHttpRequest(url, callback, formData, xmlhttp) {
	if (!objectExists(xmlhttp)) xmlhttp = newXmlHttp(function () { });

	var bAsync = objectExists(callback);
	var bPost = objectExists(formData);
	var sMethod = bPost ? "POST" : "GET";

	if (bAsync) {
		//wire up the callback
		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) callback();
		}
	}

	xmlhttp.open(sMethod, url, bAsync);
	if (bPost) xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xmlhttp.send(formData);

	return xmlhttp;
}

function getXml(xmlNode) {
	if (xmlNode == null) return null;
	if (xmlNode.xml) {
		return xmlNode.xml;
	} else {
		var s = new XMLSerializer();
		return s.serializeToString(xmlNode);
	}
}

function loadNewXml(sXml) {
	var xmlDoc;
	if (window.ActiveXObject) {
		// browser is IE
		xmlDoc = newXmlDoc();
		xmlDoc.loadXML(sXml);
	} else {
		// browser is Mozilla, Firefox, Opera, etc.
		xmlDoc = (new DOMParser()).parseFromString(sXml, 'text/xml');
	}
	return xmlDoc;
}

function ValidateForm(FormData, ErrorListDomId, ValidateCaptchaCode, ValidationUrl)
{
	try
	{
		var xmlhttp = newXmlHttp(ignoreBadBrowser);

		var sUrl = ((ValidationUrl == null || ValidationUrl == "") ? FORM_VALIDATION_URL : ValidationUrl) + "?";
		if (ValidateCaptchaCode) sUrl += "captcha=1&"

		sUrl += "cb=" + getCurrentTime();

		xmlhttp.open("POST", sUrl, false);
		xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
		xmlhttp.send(FormData);

		var sErrorList = '';
		if (xmlhttp.status == 200)
		{
		    var xmlDoc;
		    if (xmlhttp.responseXml)
		    {
		        xmlDoc = xmlhttp.responseXml;
		    } else
		    {
		        xmlDoc = (new DOMParser()).parseFromString(xmlhttp.responseText, 'text/xml');
		    }
		    var n = xmlDoc.documentElement;

		    var iErrCount = parseInt(n.getElementsByTagName('ErrCount')[0].childNodes[0].nodeValue);
		    if (iErrCount == 0) return true;

		    sErrorList = n.getElementsByTagName('ErrorList')[0].childNodes[0].nodeValue;
		}
		else
		{
		    sErrorList = xmlhttp.status + " : " + xmlhttp.statusText;
		}

		document.getElementById(ErrorListDomId).innerHTML = sErrorList;
    } catch (e) { }

	return false;
}


//IMPORTANT! This library assumes that the following libraries have been loaded by the calling page:
//	javascript_library.js
//	yui/build/yahoo/yahoo-min.js
//	yui/build/yahoo/dom-min.js
//	yui/build/yahoo/event-min.js
//	yui/build/yahoo/container-min.js

YAHOO.namespace("container");

function YAHOOinitContextualHelp() {
	YAHOO.container.ContextualHelp = 
		new YAHOO.widget.Panel("ContextualHelp", { visible:false,
			iframe:false,
			visible:false,
			constraintoviewport:false,
			close:true,
			draggable:true,
			modal:false,
			underlay:'none',
			width: '400px',
			zIndex: 20000
		} );

	YAHOO.container.ContextualHelp.render();
}

YAHOO.util.Event.onDOMReady(YAHOOinitContextualHelp);

function HelpLink_OnClick(HelpID, blnShowOnLeftOfIcon) {

	var PopupCorner, IconCorner;
	if (blnShowOnLeftOfIcon == true)
	{
		PopupCorner = 'tr';
		IconCorner = 'bl';
	}
	else{
		PopupCorner = 'tl';
		IconCorner = 'br';
	}

	var ContainerHd = document.getElementById('ContextualHelpHead');
	if(ContainerHd.innerHTML.length==0)
		ContainerHd.innerHTML = '<i class="fa fa-info-circle mright-5" style="font-size: 14px;"></i>Help';
	
	var ContainerBd = document.getElementById('ContextualHelpBody');
	ContainerBd.innerHTML = 'Loading...';
	
	YAHOO.container.ContextualHelp.cfg.setProperty('context', ['HelpLink_'+ HelpID,PopupCorner,IconCorner, '', [0, 0]]);

	YAHOO.container.ContextualHelp.cfg.setProperty('width', '100%');
	YAHOO.container.ContextualHelp.cfg.setProperty('height', null);
	YAHOO.container.ContextualHelp.cfg.setProperty('fixedcenter', false);
	YAHOO.container.ContextualHelp.cfg.setProperty('underlay', 'none');
	
	//IE hack: underlay size does not change with panel size; resize it now
	if(document.all) YAHOO.container.ContextualHelp.sizeUnderlay();
	
	YAHOO.container.ContextualHelp.show();

	document.getElementById(YAHOO.container.ContextualHelp.id).style.maxWidth = '400px';
	
	var xmlhttp = null;
	if (window.XMLHttpRequest)
	{	//code for Mozilla, etc.
		xmlhttp = new XMLHttpRequest();
	} else if(window.ActiveXObject)
	{	//code for IE
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}
	
	if(xmlhttp)
	{	//wire up the event to handle the response on successful load
		xmlhttp.onreadystatechange = function() {
			if(xmlhttp.readyState==4 && xmlhttp.status==200 && xmlhttp.responseText!='') {
				ContainerBd.innerHTML = xmlhttp.responseText;
				
				//IE hack: underlay size does not change with panel size; resize it now
				if(document.all) YAHOO.container.ContextualHelp.sizeUnderlay();
			}
		}
		
		xmlhttp.open("GET",'/get_help_topic.asp?id='+ HelpID,true);
		xmlhttp.send(null);
	}
	
	return false;
}

function HelpLink_Engagement_OnClick(HelpID, blnShowOnLeftOfIcon) {

    $.get('/get_help_topic.asp?id=' + HelpID, function (data, status) {
        if (status == 'success'){
            //$('#ContextualHelpEngagBody').innerHTML = data;
            $('#myHelpModal .modal-body p').html(data);
            console.log('data: ' + data);
            $('#myHelpModal').modal('show');
        }
    });
    return false;
}

function getBackendHelpLink(HelpID, blnShowOnLeftOfIcon) {
	document.write('<a id="HelpLink_' + HelpID +
		'" href="#" title="Help is available" onclick="return HelpLink_OnClick(\'' + HelpID + '\', ' + blnShowOnLeftOfIcon + ')"><i class="fa fa-question-circle" style="font-size: 14px;"></i></a>'
	);
}

function getHelpLink(HelpID, blnShowOnLeftOfIcon)
{
	document.write('<a id="HelpLink_'+ HelpID +
		'" href="#" title="Help is available" onclick="return HelpLink_OnClick(\'' + HelpID + '\', ' + blnShowOnLeftOfIcon + ')"><img src="/global_graphics/icons/helpme.gif" border=0 height=13 width=11 vspace=2></a>'
	);
}

function getHelpLinkEngagement(HelpID, blnShowOnLeftOfIcon) {
    document.write('<a id="HelpLink_' + HelpID +
		'" href="#" title="Help is available" onclick="return HelpLink_OnClick(\'' + HelpID + '\', ' + blnShowOnLeftOfIcon + ')"><i class="fa fa-question-circle"> </i></a>'
	);
}

function getHelpTextLink(HelpID, sText, blnShowOnLeftOfText) {
	document.write('<a class="mleft-0" id="HelpLink_' + HelpID +
		'" href="#" title="Help is available" onclick="return HelpLink_OnClick(\'' + HelpID + '\', ' + blnShowOnLeftOfText + ')"><i class="fa fa-question-circle mright-5"></i>' + sText + '</a>'
	);
}


function CustomHelpLink_OnClick(HelpID, Width, Height, ContextName) {
	var ContainerHd = document.getElementById('ContextualHelpHead');

	if (ContainerHd.innerHTML.length == 0)
		ContainerHd.innerHTML = '<img src="/global_graphics/icons/more_info_16x16.png" align="left" alt="" border=0 height=16 width=16 vspace=3> Help';

	var ContainerBd = document.getElementById('ContextualHelpBody');
	ContainerBd.innerHTML = 'Loading...';

	YAHOO.container.ContextualHelp.cfg.setProperty('context', [ContextName, 'tl', 'br']);
	YAHOO.container.ContextualHelp.cfg.setProperty('fixedcenter', 'contained');
	YAHOO.container.ContextualHelp.cfg.setProperty('underlay', 'shadow');
	
	if (!(Width == "undefined")) {
		YAHOO.container.ContextualHelp.cfg.setProperty('width', Width + 'px');
	}
	else {
		YAHOO.container.ContextualHelp.cfg.setProperty('width', '400px');
	}

	if (!(Height == "undefined")) {
		YAHOO.container.ContextualHelp.cfg.setProperty('height', Height + 'px');
	}
	else {
		YAHOO.container.ContextualHelp.cfg.setProperty('height', '150px');
	}
	
	//IE hack: underlay size does not change with panel size; resize it now
	if (document.all) YAHOO.container.ContextualHelp.sizeUnderlay();

	YAHOO.container.ContextualHelp.show();
	
	var xmlhttp = null;
	if (window.XMLHttpRequest) {	//code for Mozilla, etc.
		xmlhttp = new XMLHttpRequest();
	} else if (window.ActiveXObject) {	//code for IE
		xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	}

	if (xmlhttp) {	//wire up the event to handle the response on successful load
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200 && xmlhttp.responseText != '') {
				ContainerBd.innerHTML = xmlhttp.responseText;

				//IE hack: underlay size does not change with panel size; resize it now
				if (document.all) YAHOO.container.ContextualHelp.sizeUnderlay();
			}
		}
		
		xmlhttp.open("GET", '/help/default.aspx?id=' + HelpID, true);
		xmlhttp.send(null);
	}
	
	return false;
}

function CustomHelpLink_OnMouseOut() {
	YAHOO.container.ContextualHelp.hide();

	return false;
}

function getCustomHelpLink(HelpID, Label, Width, Height) {

	document.write('<a id="CustomHelpLink_' + HelpID +
		'" href="#" title="Help is available" onclick="return CustomHelpLink_OnClick(\'' + HelpID +
		'\', \'' + Width + '\', \'' + Height + '\', \'CustomHelpLink_' + HelpID +'\')">' + Label + '</a>'
	);
}

function AutoCompleteField(dataURL, refreshDataEachFocus)
{
	this.Init = function(domID)
	{
		addEventHandler_OnLoad(function(){
		
			var element = document.getElementById(domID);
			actb(element);
			var oldHandler = element.onfocus;
		
			if (typeof element.onfocus != 'function') {
				element.onfocus = function() {
					if (typeof AutoCompleteField_OnFocus.handleEvent == 'function')
					{
						AutoCompleteField_OnFocus.handleEvent(domID, dataURL);
						if (!refreshDataEachFocus)
						{
							//eliminate the focus event handler to avoid refresh
							AutoCompleteField_OnFocus.handleEvent = null;
						}
					}
				}
			} 
			else 
			{
				element.onfocus = function() {
					if (typeof AutoCompleteField_OnFocus.handleEvent == 'function')
					{
						AutoCompleteField_OnFocus.handleEvent(domID, dataURL);
						if (!refreshDataEachFocus)
						{
							//eliminate the focus event handler to avoid refresh
							AutoCompleteField_OnFocus.handleEvent = null;
						}
					}
					oldHandler();
				}
			}
		})	
	}
}

AutoCompleteField_OnFocus = new AutoCompleteField_FocusHandler()

function AutoCompleteField_FocusHandler() 
{
	this.handleEvent = function(domID, dataURL) 
	{
		BindAutoCompleteValues(domID, dataURL);
	}
}

function BindAutoCompleteValues(domID, dataURL)
{
	var xmlhttp = newXmlHttp();
	if(!xmlhttp) return false;
	
	var now = new Date();
	dataURL += '?ts='+ now.getTime();
	
	//submit to ajax post handler
	xmlhttp.open("GET", dataURL, true);
	xmlhttp.send(null);
	
	xmlhttp.onreadystatechange = function() {
		if(xmlhttp.readyState==4 && xmlhttp.status==200 && xmlhttp.responseText!="")
		{
			//the response should be a JSON string
			var jsonData
			try { //to parse the string into a js-object
				jsonData = YAHOO.lang.JSON.parse(xmlhttp.responseText.toString()); 
			} catch(e) { return; }
			
			//set the values on the form from the JSON response
			actb(document.getElementById(domID), jsonData.arrValues);
		}
	}

	return false;
}

function actb(obj,ca){
	/* ---- Public Variables ---- */
	this.actb_timeOut = -1; // Autocomplete Timeout in ms (-1: autocomplete never time out)
	this.actb_lim = 4;    // Number of elements autocomplete can show (-1: no limit)
	this.actb_firstText = false; // should the auto complete be limited to the beginning of keyword?
	this.actb_mouse = true; // Enable Mouse Support
	this.actb_delimiter = new Array(';',',');  // Delimiter for multiple autocomplete. Set it to empty array for single autocomplete
	this.actb_startcheck = 1; // Show widget only after this number of characters is typed in.
	/* ---- Public Variables ---- */

	/* --- Styles --- */
	this.actb_bgColor = '#888888';
	this.actb_textColor = '#FFFFFF';
	this.actb_hColor = '#000000';
	this.actb_fFamily = 'Verdana';
	this.actb_fSize = '11px';
	this.actb_hStyle = 'text-decoration:underline;font-weight="bold"';
	/* --- Styles --- */

	/* ---- Private Variables ---- */
	var actb_delimwords = new Array();
	var actb_cdelimword = 0;
	var actb_delimchar = new Array();
	var actb_display = false;
	var actb_pos = 0;
	var actb_total = 0;
	var actb_curr = null;
	var actb_rangeu = 0;
	var actb_ranged = 0;
	var actb_bool = new Array();
	var actb_pre = 0;
	var actb_toid;
	var actb_tomake = false;
	var actb_getpre = "";
	var actb_mouse_on_list = 1;
	var actb_kwcount = 0;
	var actb_caretmove = false;
	this.actb_keywords = new Array();
	/* ---- Private Variables---- */
	
	this.actb_keywords = ca;
	var actb_self = this;

	actb_curr = obj;
	
	addEvent(actb_curr,"focus",actb_setup);
	function actb_setup(){
		addEvent(document,"keydown",actb_checkkey);
		addEvent(actb_curr,"blur",actb_clear);
		addEvent(document,"keypress",actb_keypress);
	}

	function actb_clear(evt){
		if (!evt) evt = event;
		removeEvent(document,"keydown",actb_checkkey);
		removeEvent(actb_curr,"blur",actb_clear);
		removeEvent(document,"keypress",actb_keypress);
		actb_removedisp();
	}
	function actb_parse(n){
		if (actb_self.actb_delimiter.length > 0){
			var t = actb_delimwords[actb_cdelimword].trim().addslashes();
			var plen = actb_delimwords[actb_cdelimword].trim().length;
		}else{
			var t = actb_curr.value.addslashes();
			var plen = actb_curr.value.length;
		}
		var tobuild = '';
		var i;

		if (actb_self.actb_firstText){
			var re = new RegExp("^" + t, "i");
		}else{
			var re = new RegExp(t, "i");
		}
		var p = n.search(re);
				
		for (i=0;i<p;i++){
			tobuild += n.substr(i,1);
		}
		tobuild += "<font style='"+(actb_self.actb_hStyle)+"'>"
		for (i=p;i<plen+p;i++){
			tobuild += n.substr(i,1);
		}
		tobuild += "</font>";
			for (i=plen+p;i<n.length;i++){
			tobuild += n.substr(i,1);
		}
		return tobuild;
	}
	function actb_generate(){
		if (document.getElementById('tat_table')){ actb_display = false;document.body.removeChild(document.getElementById('tat_table')); } 
		if (actb_kwcount == 0){
			actb_display = false;
			return;
		}
		a = document.createElement('table');
		a.cellSpacing='1px';
		a.cellPadding='2px';
		a.style.position='absolute';
		a.style.top = eval(curTop(actb_curr) + actb_curr.offsetHeight) + "px";
		a.style.left = curLeft(actb_curr) + "px";
		a.style.backgroundColor=actb_self.actb_bgColor;
		a.id = 'tat_table';
		document.body.appendChild(a);
		var i;
		var first = true;
		var j = 1;
		if (actb_self.actb_mouse){
			a.onmouseout = actb_table_unfocus;
			a.onmouseover = actb_table_focus;
		}
		var counter = 0;
		for (i=0;i<actb_self.actb_keywords.length;i++){
			if (actb_bool[i]){
				counter++;
				r = a.insertRow(-1);
				if (first && !actb_tomake){
					r.style.backgroundColor = actb_self.actb_hColor;
					first = false;
					actb_pos = counter;
				}else if(actb_pre == i){
					r.style.backgroundColor = actb_self.actb_hColor;
					first = false;
					actb_pos = counter;
				}else{
					r.style.backgroundColor = actb_self.actb_bgColor;
				}
				r.id = 'tat_tr'+(j);
				c = r.insertCell(-1);
				c.style.color = actb_self.actb_textColor;
				c.style.fontFamily = actb_self.actb_fFamily;
				c.style.fontSize = actb_self.actb_fSize;
				c.innerHTML = actb_parse(actb_self.actb_keywords[i]);
				c.id = 'tat_td'+(j);
				c.setAttribute('pos',j);
				if (actb_self.actb_mouse){
					c.style.cursor = 'pointer';
					c.onclick=actb_mouseclick;
					c.onmouseover = actb_table_highlight;
				}
				j++;
			}
			if (j - 1 == actb_self.actb_lim && j < actb_total){
				r = a.insertRow(-1);
				r.style.backgroundColor = actb_self.actb_bgColor;
				c = r.insertCell(-1);
				c.style.color = actb_self.actb_textColor;
				c.style.fontFamily = 'arial narrow';
				c.style.fontSize = actb_self.actb_fSize;
				c.align='center';
				replaceHTML(c,'\\/');
				if (actb_self.actb_mouse){
					c.style.cursor = 'pointer';
					c.onclick = actb_mouse_down;
				}
				break;
			}
		}
		actb_rangeu = 1;
		actb_ranged = j-1;
		actb_display = true;
		if (actb_pos <= 0) actb_pos = 1;
	}
	function actb_remake(){
		document.body.removeChild(document.getElementById('tat_table'));
		a = document.createElement('table');
		a.cellSpacing='1px';
		a.cellPadding='2px';
		a.style.position='absolute';
		a.style.top = eval(curTop(actb_curr) + actb_curr.offsetHeight) + "px";
		a.style.left = curLeft(actb_curr) + "px";
		a.style.backgroundColor=actb_self.actb_bgColor;
		a.id = 'tat_table';
		if (actb_self.actb_mouse){
			a.onmouseout= actb_table_unfocus;
			a.onmouseover=actb_table_focus;
		}
		document.body.appendChild(a);
		var i;
		var first = true;
		var j = 1;
		if (actb_rangeu > 1){
			r = a.insertRow(-1);
			r.style.backgroundColor = actb_self.actb_bgColor;
			c = r.insertCell(-1);
			c.style.color = actb_self.actb_textColor;
			c.style.fontFamily = 'arial narrow';
			c.style.fontSize = actb_self.actb_fSize;
			c.align='center';
			replaceHTML(c,'/\\');
			if (actb_self.actb_mouse){
				c.style.cursor = 'pointer';
				c.onclick = actb_mouse_up;
			}
		}
		for (i=0;i<actb_self.actb_keywords.length;i++){
			if (actb_bool[i]){
				if (j >= actb_rangeu && j <= actb_ranged){
					r = a.insertRow(-1);
					r.style.backgroundColor = actb_self.actb_bgColor;
					r.id = 'tat_tr'+(j);
					c = r.insertCell(-1);
					c.style.color = actb_self.actb_textColor;
					c.style.fontFamily = actb_self.actb_fFamily;
					c.style.fontSize = actb_self.actb_fSize;
					c.innerHTML = actb_parse(actb_self.actb_keywords[i]);
					c.id = 'tat_td'+(j);
					c.setAttribute('pos',j);
					if (actb_self.actb_mouse){
						c.style.cursor = 'pointer';
						c.onclick=actb_mouseclick;
						c.onmouseover = actb_table_highlight;
					}
					j++;
				}else{
					j++;
				}
			}
			if (j > actb_ranged) break;
		}
		if (j-1 < actb_total){
			r = a.insertRow(-1);
			r.style.backgroundColor = actb_self.actb_bgColor;
			c = r.insertCell(-1);
			c.style.color = actb_self.actb_textColor;
			c.style.fontFamily = 'arial narrow';
			c.style.fontSize = actb_self.actb_fSize;
			c.align='center';
			replaceHTML(c,'\\/');
			if (actb_self.actb_mouse){
				c.style.cursor = 'pointer';
				c.onclick = actb_mouse_down;
			}
		}
	}
	function actb_goup(){
		if (!actb_display) return;
		if (actb_pos == 1) return;
		document.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_bgColor;
		actb_pos--;
		if (actb_pos < actb_rangeu) actb_moveup();
		document.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_hColor;
		if (actb_toid) clearTimeout(actb_toid);
		if (actb_self.actb_timeOut > 0) actb_toid = setTimeout(function(){actb_mouse_on_list=0;actb_removedisp();},actb_self.actb_timeOut);
	}
	function actb_godown(){
		if (!actb_display) return;
		if (actb_pos == actb_total) return;
		document.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_bgColor;
		actb_pos++;
		if (actb_pos > actb_ranged) actb_movedown();
		document.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_hColor;
		if (actb_toid) clearTimeout(actb_toid);
		if (actb_self.actb_timeOut > 0) actb_toid = setTimeout(function(){actb_mouse_on_list=0;actb_removedisp();},actb_self.actb_timeOut);
	}
	function actb_movedown(){
		actb_rangeu++;
		actb_ranged++;
		actb_remake();
	}
	function actb_moveup(){
		actb_rangeu--;
		actb_ranged--;
		actb_remake();
	}

	/* Mouse */
	function actb_mouse_down(){
		document.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_bgColor;
		actb_pos++;
		actb_movedown();
		document.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_hColor;
		actb_curr.focus();
		actb_mouse_on_list = 0;
		if (actb_toid) clearTimeout(actb_toid);
		if (actb_self.actb_timeOut > 0) actb_toid = setTimeout(function(){actb_mouse_on_list=0;actb_removedisp();},actb_self.actb_timeOut);
	}
	function actb_mouse_up(evt){
		if (!evt) evt = event;
		if (evt.stopPropagation){
			evt.stopPropagation();
		}else{
			evt.cancelBubble = true;
		}
		document.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_bgColor;
		actb_pos--;
		actb_moveup();
		document.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_hColor;
		actb_curr.focus();
		actb_mouse_on_list = 0;
		if (actb_toid) clearTimeout(actb_toid);
		if (actb_self.actb_timeOut > 0) actb_toid = setTimeout(function(){actb_mouse_on_list=0;actb_removedisp();},actb_self.actb_timeOut);
	}
	function actb_mouseclick(evt){
		if (!evt) evt = event;
		if (!actb_display) return;
		actb_mouse_on_list = 0;
		actb_pos = this.getAttribute('pos');
		actb_penter();
	}
	function actb_table_focus(){
		actb_mouse_on_list = 1;
	}
	function actb_table_unfocus(){
		actb_mouse_on_list = 0;
		if (actb_toid) clearTimeout(actb_toid);
		if (actb_self.actb_timeOut > 0) actb_toid = setTimeout(function(){actb_mouse_on_list = 0;actb_removedisp();},actb_self.actb_timeOut);
	}
	function actb_table_highlight(){
		actb_mouse_on_list = 1;
		document.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_bgColor;
		actb_pos = this.getAttribute('pos');
		while (actb_pos < actb_rangeu) actb_moveup();
		while (actb_pos > actb_ranged) actb_movedown();
		document.getElementById('tat_tr'+actb_pos).style.backgroundColor = actb_self.actb_hColor;
		if (actb_toid) clearTimeout(actb_toid);
		if (actb_self.actb_timeOut > 0) actb_toid = setTimeout(function(){actb_mouse_on_list = 0;actb_removedisp();},actb_self.actb_timeOut);
	}
	/* ---- */

	function actb_insertword(a){
		if (actb_self.actb_delimiter.length > 0){
			str = '';
			l=0;
			for (i=0;i<actb_delimwords.length;i++){
				if (actb_cdelimword == i){
					prespace = postspace = '';
					gotbreak = false;
					for (j=0;j<actb_delimwords[i].length;++j){
						if (actb_delimwords[i].charAt(j) != ' '){
							gotbreak = true;
							break;
						}
						prespace += ' ';
					}
					for (j=actb_delimwords[i].length-1;j>=0;--j){
						if (actb_delimwords[i].charAt(j) != ' ') break;
						postspace += ' ';
					}
					str += prespace;
					str += a;
					l = str.length;
					if (gotbreak) str += postspace;
				}else{
					str += actb_delimwords[i];
				}
				if (i != actb_delimwords.length - 1){
					str += actb_delimchar[i];
				}
			}
			actb_curr.value = str;
			setCaret(actb_curr,l);
		}else{
			actb_curr.value = a;
		}
		actb_mouse_on_list = 0;
		actb_removedisp();
	}
	function actb_penter(){
		if (!actb_display) return;
		actb_display = false;
		var word = '';
		var c = 0;
		for (var i=0;i<=actb_self.actb_keywords.length;i++){
			if (actb_bool[i]) c++;
			if (c == actb_pos){
				word = actb_self.actb_keywords[i];
				break;
			}
		}
		actb_insertword(word);
		l = getCaretStart(actb_curr);
	}
	function actb_removedisp(){
		if (actb_mouse_on_list==0){
			actb_display = 0;
			if (document.getElementById('tat_table')){ document.body.removeChild(document.getElementById('tat_table')); }
			if (actb_toid) clearTimeout(actb_toid);
		}
	}
	function actb_keypress(e){
		if (actb_caretmove) stopEvent(e);
		return !actb_caretmove;
	}
	function actb_checkkey(evt){
		if (!evt) evt = event;
		a = evt.keyCode;
		caret_pos_start = getCaretStart(actb_curr);
		actb_caretmove = 0;
		switch (a){
			case 38:
				actb_goup();
				actb_caretmove = 1;
				return false;
				break;
			case 40:
				actb_godown();
				actb_caretmove = 1;
				return false;
				break;
			case 13: case 9:
				if (actb_display){
					actb_caretmove = 1;
					actb_penter();
					return false;
				}else{
					return true;
				}
				break;
			default:
				setTimeout(function(){actb_tocomplete(a)},50);
				break;
		}
	}

	function actb_tocomplete(kc){
		if (kc == 38 || kc == 40 || kc == 13) return;
		var i;
		if (actb_display){ 
			var word = 0;
			var c = 0;
			for (var i=0;i<=actb_self.actb_keywords.length;i++){
				if (actb_bool[i]) c++;
				if (c == actb_pos){
					word = i;
					break;
				}
			}
			actb_pre = word;
		}else{ actb_pre = -1};
		
		if (actb_curr.value == ''){
			actb_mouse_on_list = 0;
			actb_removedisp();
			return;
		}
		if (actb_self.actb_delimiter.length > 0){
			caret_pos_start = getCaretStart(actb_curr);
			caret_pos_end = getCaretEnd(actb_curr);
			
			delim_split = '';
			for (i=0;i<actb_self.actb_delimiter.length;i++){
				delim_split += actb_self.actb_delimiter[i];
			}
			delim_split = delim_split.addslashes();
			delim_split_rx = new RegExp("(["+delim_split+"])");
			c = 0;
			actb_delimwords = new Array();
			actb_delimwords[0] = '';
			for (i=0,j=actb_curr.value.length;i<actb_curr.value.length;i++,j--){
				if (actb_curr.value.substr(i,j).search(delim_split_rx) == 0){
					ma = actb_curr.value.substr(i,j).match(delim_split_rx);
					actb_delimchar[c] = ma[1];
					c++;
					actb_delimwords[c] = '';
				}else{
					actb_delimwords[c] += actb_curr.value.charAt(i);
				}
			}

			var l = 0;
			actb_cdelimword = -1;
			for (i=0;i<actb_delimwords.length;i++){
				if (caret_pos_end >= l && caret_pos_end <= l + actb_delimwords[i].length){
					actb_cdelimword = i;
				}
				l+=actb_delimwords[i].length + 1;
			}
			var ot = actb_delimwords[actb_cdelimword].trim(); 
			var t = actb_delimwords[actb_cdelimword].addslashes().trim();
		}else{
			var ot = actb_curr.value;
			var t = actb_curr.value.addslashes();
		}
		if (ot.length == 0){
			actb_mouse_on_list = 0;
			actb_removedisp();
		}
		if (ot.length < actb_self.actb_startcheck) return this;
		if (actb_self.actb_firstText){
			var re = new RegExp("^" + t, "i");
		}else{
			var re = new RegExp(t, "i");
		}

		actb_total = 0;
		actb_tomake = false;
		actb_kwcount = 0;
		for (i=0;i<actb_self.actb_keywords.length;i++){
			actb_bool[i] = false;
			if (re.test(actb_self.actb_keywords[i])){
				actb_total++;
				actb_bool[i] = true;
				actb_kwcount++;
				if (actb_pre == i) actb_tomake = true;
			}
		}

		if (actb_toid) clearTimeout(actb_toid);
		if (actb_self.actb_timeOut > 0) actb_toid = setTimeout(function(){actb_mouse_on_list = 0;actb_removedisp();},actb_self.actb_timeOut);
		actb_generate();
	}
	return this;
}

/* Event Functions */

// Add an event to the obj given
// event_name refers to the event trigger, without the "on", like click or mouseover
// func_name refers to the function callback when event is triggered
function addEvent(obj,event_name,func_name){
	if (obj.attachEvent){
		obj.attachEvent("on"+event_name, func_name);
	}else if(obj.addEventListener){
		obj.addEventListener(event_name,func_name,true);
	}else{
		obj["on"+event_name] = func_name;
	}
}

// Removes an event from the object
function removeEvent(obj,event_name,func_name){
	if (obj.detachEvent){
		obj.detachEvent("on"+event_name,func_name);
	}else if(obj.removeEventListener){
		obj.removeEventListener(event_name,func_name,true);
	}else{
		obj["on"+event_name] = null;
	}
}

// Stop an event from bubbling up the event DOM
function stopEvent(evt){
	evt || window.event;
	if (evt.stopPropagation){
		evt.stopPropagation();
		evt.preventDefault();
	}else if(typeof evt.cancelBubble != "undefined"){
		evt.cancelBubble = true;
		evt.returnValue = false;
	}
	return false;
}

// Get the obj that starts the event
function getElement(evt){
	if (window.event){
		return window.event.srcElement;
	}else{
		return evt.currentTarget;
	}
}
// Get the obj that triggers off the event
function getTargetElement(evt){
	if (window.event){
		return window.event.srcElement;
	}else{
		return evt.target;
	}
}
// For IE only, stops the obj from being selected
function stopSelect(obj){
	if (typeof obj.onselectstart != 'undefined'){
		addEvent(obj,"selectstart",function(){ return false;});
	}
}

/*    Caret Functions     */

// Get the end position of the caret in the object. Note that the obj needs to be in focus first
function getCaretEnd(obj){
	if(typeof obj.selectionEnd != "undefined"){
		return obj.selectionEnd;
	}else if(document.selection&&document.selection.createRange){
		var M=document.selection.createRange();
		try{
			var Lp = M.duplicate();
			Lp.moveToElementText(obj);
		}catch(e){
			var Lp=obj.createTextRange();
		}
		Lp.setEndPoint("EndToEnd",M);
		var rb=Lp.text.length;
		if(rb>obj.value.length){
			return -1;
		}
		return rb;
	}
}
// Get the start position of the caret in the object
function getCaretStart(obj){
	if(typeof obj.selectionStart != "undefined"){
		return obj.selectionStart;
	}else if(document.selection&&document.selection.createRange){
		var M=document.selection.createRange();
		try{
			var Lp = M.duplicate();
			Lp.moveToElementText(obj);
		}catch(e){
			var Lp=obj.createTextRange();
		}
		Lp.setEndPoint("EndToStart",M);
		var rb=Lp.text.length;
		if(rb>obj.value.length){
			return -1;
		}
		return rb;
	}
}
// sets the caret position to l in the object
function setCaret(obj,l){
	obj.focus();
	if (obj.setSelectionRange){
		obj.setSelectionRange(l,l);
	}else if(obj.createTextRange){
		m = obj.createTextRange();		
		m.moveStart('character',l);
		m.collapse();
		m.select();
	}
}
// sets the caret selection from s to e in the object
function setSelection(obj,s,e){
	obj.focus();
	if (obj.setSelectionRange){
		obj.setSelectionRange(s,e);
	}else if(obj.createTextRange){
		m = obj.createTextRange();		
		m.moveStart('character',s);
		m.moveEnd('character',e);
		m.select();
	}
}

/*    Escape function   */
String.prototype.addslashes = function(){
	return this.replace(/(["\\\.\|\[\]\^\*\+\?\$\(\)])/g, '\\$1');
}
String.prototype.trim = function () {
    return this.replace(/^\s*(\S*(\s+\S+)*)\s*$/, "$1");
};
/* --- Escape --- */

/* Offset position from top of the screen */
function curTop(obj){
	toreturn = 0;
	while(obj){
		toreturn += obj.offsetTop;
		obj = obj.offsetParent;
	}
	return toreturn;
}
function curLeft(obj){
	toreturn = 0;
	while(obj){
		toreturn += obj.offsetLeft;
		obj = obj.offsetParent;
	}
	return toreturn;
}
/* ------ End of Offset function ------- */

/* Types Function */

// is a given input a number?
function isNumber(a) {
    return typeof a == 'number' && isFinite(a);
}

/* Object Functions */

function replaceHTML(obj,text){
	while(el = obj.childNodes[0]){
		obj.removeChild(el);
	};
	obj.appendChild(document.createTextNode(text));
}


function Pulse(dateLastHeartbeat) {
	// time of the last heartbeat
	var timeLastHeartbeat = getCookie("PulseLH");
	if (timeLastHeartbeat == null || timeLastHeartbeat == "" || isNaN(timeLastHeartbeat)) {
		this.TimeLastHeartbeat = Date.parse("1970-01-01 00:00:00");
	} else {
		this.TimeLastHeartbeat = parseInt(timeLastHeartbeat);
	}

	this.Urls = new Array("/pulse.asp", "/pulse.aspx"); // the location of pulse.asp (or any heartbeat handler)
	this.Heartrate = 540; // the heartbeat interval in seconds - 540 (9 minutes)
	this.ConfirmInterval = 2700; // the confirmation interval in seconds - 2700 (45 minutes)
	this.AlertTimeout = 50; // the timeout for the alert box in seconds
	this.TID = null;

	this.Heartbeat = function () {
		var nowTime = (new Date()).getTime();

		// time of the last confirmation
		var timeLastConfirmation = getCookie("PulseLC");
		if (timeLastConfirmation == null || timeLastConfirmation == "" || isNaN(timeLastConfirmation)) {
			timeLastConfirmation = nowTime;
			setCookie("PulseLC", timeLastConfirmation, "/");
		} else {
			timeLastConfirmation = parseInt(timeLastConfirmation);
		}

		var nextConfirmation = Math.round(timeLastConfirmation + (this.ConfirmInterval * 1000));
		//alert(nextConfirmation);

		// raise a confirmation dialog if one is scheduled within half the time of a heartbeat interval?
		if (nextConfirmation <= nowTime) {
		    // confirm that a human is still present
		    var self = this;

		    // disable Pulse until user clicks confirm. Note: This also effects other pingers (Progress Bar, Chat)
		    setCookie("PulseOff", "1", "/");
		    setCookie("PulseLC", (new Date()).getTime(), "/");

		    if (window.location.pathname.indexOf("/admin/") == 0) {
		        // Back-End
		        // show alert with timeout of 50s (divPulseAlert is on Admin2.master)
		        $('#divPulseAlert').modal('show');

		        setTimeout(function () { $('#divPulseAlert').modal('hide'); }, this.AlertTimeout * 1000);
		    }
		    else {
		        // Front-End

		        if ($('#divPulseAlert').length > 0) {
		            // Front-End Engagement Templates:  divPulseAlert is on member_engagement/Subpage-master, member_engagement/member_sp_footer.asp ,  member_engagement/member_sp_footer_popup.asp
		        	$('#divPulseAlert').modal({ backdrop: "static", keyboard: false });
		        }   
		        else
		        {
				    YuiGenericDialog("ConfirmThump",
					    "It appears that you have been inactive for an extended period of time.<br /><br /> Would you like to continue your browsing session?",
					    function () {
					        if (m_bYuiGenericDialogResult) {
					            // reenable pulse
					            setCookie("PulseOff", "0", "/");
					            self.Heartbeat();
					        }
					    }
					    , "Yes, continue", "", null, null, null, null, this.AlertTimeout
				    );
                }
	        }

            return;
        }

		for (var i = 0; i < this.Urls.length; i++) {
			var xmlhttp = null;
			if (window.XMLHttpRequest) {
				xmlhttp = new XMLHttpRequest();
			} else if (window.ActiveXObject) {
				xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
			}

			if (xmlhttp) {
				xmlhttp.open("GET", this.Urls[i], true);
				xmlhttp.send(null);
			}
		}

		this.TimeLastHeartbeat = nowTime;
		setCookie("PulseLH", nowTime, "/");

		var self = this;
		this.TID = setTimeout(function () { self.Heartbeat(); }, Math.round(this.Heartrate * 1000));
	}

	this.Start = function () {
		// reenable Pulse if a confirmation had previously timed out
		setCookie("PulseOff", "0", "/");
		setCookie("PulseLC", (new Date()).getTime(), "/");

		var self = this;
		var nowTime = (new Date()).getTime();
		var nextHeartbeat = Math.round((this.Heartrate * 1000) - (nowTime - this.TimeLastHeartbeat));

		//should the next heartbeat happen within the next 10 seconds?
		if (nextHeartbeat < 10000) {
			// reset confirmation
			setCookie("PulseLC", nowTime, "/");

			//go ahead and do it now
			self.Heartbeat();
		} else {
			//wire it up on a delay
			this.TID = setTimeout(function () { self.Heartbeat(); }, nextHeartbeat);
		}
	}

	this.Restart = function () {
		setCookie("PulseOff", "0", "/");
		setCookie("PulseLC", (new Date()).getTime(), "/");

		this.Heartbeat();
	}
}



var m_ChatTID;
var m_ChatRequestAlert;

function alertBadBrowser()
{
	alert('The chat system requires features which your browser does not supprt. \n\n'+
		'The following browsers are recommended: \n\nInternet Explorer 7 (Windows) \n'+
		'Firefox 3 (Windows, Mac) \nSafari 2+ (Mac) ');
	self.close();
	return null;
}

function openNewChatWindow(recip)
{
	openPopup('/members/chat.asp?recip='+ recip, '_blank', 'status,resizable,toolbar=false', 550, 400);
	return false;
}

function openChatWindow(GUID, ChatID)
{
	openPopup('/members/chat.asp?cid='+ GUID, getChatWinName(ChatID), 'status,resizable,toolbar=false', 550, 400);
	return HideChatRequestAlert();
}

function getChatWinName(ChatID)
{
	return 'Chat_'+ ChatID.toString();
}

function getChatCookie(id)
{
	return getCookie('Chat_'+ id.toString());
}

function setChatCookie(id, value)
{
	setCookie('Chat_'+ id.toString(),value,'/');
}

function getChats()
{
	// only poll for new data if Pulse has not been disabled
	if (getCookie("PulseOff") != "1")
	{
		try {
			var sTime = (new Date()).getTime().toString();
			var xmlhttp = newXmlHttp(ignoreBadBrowser);
			xmlhttp.setRequestHeader("Cookie", "YmSessionId=" + getCookie('YmSessionId'));
			xmlhttp.open("GET", '/global_inc/xml/chat_xml.asp?type=chats&ts=' + sTime, false);
			xmlhttp.send(null);

			var xmlDoc, xmlRoot;
			if (xmlhttp.status == 200 && xmlhttp.responseText != '') {
				xmlDoc = loadNewXml(xmlhttp.responseText);
				xmlRoot = xmlDoc.documentElement;
			}

			var bInitialBuild = (!document.getElementById('ActiveChatList'));
			var sActiveChatList = '';


			var iChatCount = parseInt(GetChildNodeValue(xmlRoot, "Count"));
			if (!(isNaN(iChatCount) || iChatCount == 0)) {	//spin through chats; we only want display an alert when the participant has not yet been notified
				var iAlerts = -1;
				var aChatID = new Array();
				var aGUID = new Array();
				var aName = new Array();

				var nChats = xmlRoot.getElementsByTagName("Chats")[0].getElementsByTagName("Chat");
				var ChatID;
				for (var n = 0; n < nChats.length; n++) {
					ChatID = GetChildNodeValue(nChats[n], "ID");
					if (GetChildNodeValue(nChats[n], "Notfied") != '1') {
						iAlerts++;

						aChatID.length = iAlerts;
						aChatID[iAlerts] = ChatID;
						aGUID.length = iAlerts;
						aGUID[iAlerts] = GetChildNodeValue(nChats[n], "GUID");
						aName.length = iAlerts;
						aName[iAlerts] = GetChildNodeValue(nChats[n], "Name");

						AddToChatToolBar(ChatID, aGUID[iAlerts], aName[iAlerts]);
					} else if (bInitialBuild) {
						AddToChatToolBar(ChatID,
							GetChildNodeValue(nChats[n], "GUID"),
							GetChildNodeValue(nChats[n], "Name")
						);
					}

					if (GetChildNodeValue(nChats[n], "Unread") != '0') {
						//unread messages; flash the toolbar button
						ChatToolBarFlash(ChatID, 3);
					}
				}

				if (iAlerts >= 0) {
					var sAlertBody = '', sNameTrailer = '';
					if (iAlerts == 0) {	//single chat alert
						sNameTrailer = ' wants to chat!';
					} else {
						//multiple alerts
						sAlertBody = 'You have chat requests from:<br><br>';
					}

					for (var i = 0; i < aGUID.length; i++) {
						if (i > 0) sAlertBody += '<br>';
						sAlertBody += ('<a href=# onclick="return openChatWindow(\'' + aGUID[i] +
							'\',' + aChatID[i] + ');">' + aName[i] + sNameTrailer + '</a>');
					}

					RaiseChatRequestAlert(sAlertBody);
				}
			}

		} catch (e) { }
	}

	pollForChats();
}

function pollForChats(retrys)
{	//chat polling must fire without exception
	try {
		//check for new conversations every 30 seconds
		m_ChatTID = setTimeout(function(){ getChats() }, 30000);
	} catch(e) {
		//retry 9 times before giving up
		if(isNaN(retrys)) retrys = 0;
		
		if(retrys<9) {
			retrys++;
			m_ChatTID = setTimeout(function(){ pollForChats(retrys) }, 1000);
		}
	}
}

function RaiseChatRequestAlert(sAlertBody)
{
	var container = document.getElementById('PageBase_RaiseAlert');
	if(container) {
		if(m_ChatRequestAlert) {
			m_ChatRequestAlert.setBody(sAlertBody);
			
			//IE hack: underlay size does not change with panel size; resize it now
			if(document.all) m_ChatRequestAlert.sizeUnderlay();
			
			m_ChatRequestAlert.show();
		} else {
			m_ChatRequestAlert = new YAHOO.widget.SimpleDialog("ChatRequestAlert", {
				text:sAlertBody,
				iframe:false,
				visible:true,
				close:true,
				draggable:false,
				modal:false,
				underlay:'shadow',
				width:'270px',
				fixedcenter:true
				}
			);
			
			m_ChatRequestAlert.setHeader("Chat Request");
			m_ChatRequestAlert.render(container);
		}
	}
}

function HideChatRequestAlert()
{
	if(m_ChatRequestAlert) m_ChatRequestAlert.hide();
	return false;
}

function AddToChatToolBar(ChatID, GUID, Name)
{
	var ActiveChatList = document.getElementById('ActiveChatList');
	if(!ActiveChatList) {
		WriteTopToolBar('<label>AVAILABLE CHATS</label>');
		var TopToolBarText = document.getElementById('TopToolBarText');
		ActiveChatList = document.createElement('span');
		ActiveChatList.setAttribute('id','ActiveChatList');
		TopToolBarText.appendChild(ActiveChatList);		
	}
	
	var sNewLink = '<a href=# id="ChatTB_'+ ChatID +'" title="'+ Name +'"'+
		' onclick="return openChatWindow(\''+ GUID + '\','+ ChatID +');"'+
		' onmouseover="ChatToolBar_OnMouseOver(this);" onmouseout="ChatToolBar_OnMouseOut(this);">'+
		Name.substr(0,6) + '...</a>';
	
	ActiveChatList.innerHTML = sNewLink + ActiveChatList.innerHTML;
}

function ChatToolBarFlash(ChatID, HowManyTimes, i)
{
	var ChatLink = document.getElementById('ChatTB_'+ ChatID);
	if(!ChatLink) return;
	
	if(isNaN(i)) i = 1;
	
	if(i%2==0) {
		ChatLink.style.backgroundColor = 'Transparent';
	} else {
		ChatLink.style.backgroundColor = 'White';
	}
	
	if(i<(HowManyTimes*2)) {
		i++;
		setTimeout(function(){ ChatToolBarFlash(ChatID, HowManyTimes, i) }, 300);
	}

}

function ChatToolBar_OnMouseOver(sender)
{
	sender.style.backgroundColor = '#F2F6F9';
}

function ChatToolBar_OnMouseOut(sender)
{
	sender.style.backgroundColor = 'Transparent';
}


function AC_AddExtension(src,ext){if(src.indexOf('?')!=-1)return src.replace(/\?/,ext+'?');else return src+ext}function AC_Generateobj(objAttrs,params,embedAttrs){var str='<object ';for(var i in objAttrs)str+=i+'="'+objAttrs[i]+'" ';str+='>';for(var i in params)str+='<param name="'+i+'" value="'+params[i]+'" /> ';str+='<embed ';for(var i in embedAttrs)str+=i+'="'+embedAttrs[i]+'" ';str+=' ></embed></object>';document.write(str)}function AC_FL_RunContent(){var ret=AC_GetArgs(arguments,".swf","movie","clsid:d27cdb6e-ae6d-11cf-96b8-444553540000","application/x-shockwave-flash");AC_Generateobj(ret.objAttrs,ret.params,ret.embedAttrs)}function AC_SW_RunContent(){var ret=AC_GetArgs(arguments,".dcr","src","clsid:166B1BCA-3F9C-11CF-8075-444553540000",null);AC_Generateobj(ret.objAttrs,ret.params,ret.embedAttrs)}function AC_GetArgs(args,ext,srcParamName,classid,mimeType){var ret=new Object();ret.embedAttrs=new Object();ret.params=new Object();ret.objAttrs=new Object();for(var i=0;i<args.length;i=i+2){var currArg=args[i].toLowerCase();switch(currArg){case"classid":break;case"pluginspage":ret.embedAttrs[args[i]]=args[i+1];break;case"src":case"movie":args[i+1]=AC_AddExtension(args[i+1],ext);ret.embedAttrs["src"]=args[i+1];ret.params[srcParamName]=args[i+1];break;case"onafterupdate":case"onbeforeupdate":case"onblur":case"oncellchange":case"onclick":case"ondblClick":case"ondrag":case"ondragend":case"ondragenter":case"ondragleave":case"ondragover":case"ondrop":case"onfinish":case"onfocus":case"onhelp":case"onmousedown":case"onmouseup":case"onmouseover":case"onmousemove":case"onmouseout":case"onkeypress":case"onkeydown":case"onkeyup":case"onload":case"onlosecapture":case"onpropertychange":case"onreadystatechange":case"onrowsdelete":case"onrowenter":case"onrowexit":case"onrowsinserted":case"onstart":case"onscroll":case"onbeforeeditfocus":case"onactivate":case"onbeforedeactivate":case"ondeactivate":case"type":case"codebase":ret.objAttrs[args[i]]=args[i+1];break;case"width":case"height":case"align":case"vspace":case"hspace":case"class":case"title":case"accesskey":case"name":case"id":case"tabindex":ret.embedAttrs[args[i]]=ret.objAttrs[args[i]]=args[i+1];break;default:ret.embedAttrs[args[i]]=ret.params[args[i]]=args[i+1]}}ret.objAttrs["classid"]=classid;if(mimeType)ret.embedAttrs["type"]=mimeType;return ret}

function AC_AX_RunContent(){var ret=AC_AX_GetArgs(arguments);AC_Generateobj(ret.objAttrs,ret.params,ret.embedAttrs)}function AC_AX_GetArgs(args){var ret=new Object();ret.embedAttrs=new Object();ret.params=new Object();ret.objAttrs=new Object();for(var i=0;i<args.length;i=i+2){var currArg=args[i].toLowerCase();switch(currArg){case"pluginspage":case"type":case"src":ret.embedAttrs[args[i]]=args[i+1];break;case"data":case"codebase":case"classid":case"id":case"onafterupdate":case"onbeforeupdate":case"onblur":case"oncellchange":case"onclick":case"ondblClick":case"ondrag":case"ondragend":case"ondragenter":case"ondragleave":case"ondragover":case"ondrop":case"onfinish":case"onfocus":case"onhelp":case"onmousedown":case"onmouseup":case"onmouseover":case"onmousemove":case"onmouseout":case"onkeypress":case"onkeydown":case"onkeyup":case"onload":case"onlosecapture":case"onpropertychange":case"onreadystatechange":case"onrowsdelete":case"onrowenter":case"onrowexit":case"onrowsinserted":case"onstart":case"onscroll":case"onbeforeeditfocus":case"onactivate":case"onbeforedeactivate":case"ondeactivate":ret.objAttrs[args[i]]=args[i+1];break;case"width":case"height":case"align":case"vspace":case"hspace":case"class":case"title":case"accesskey":case"name":case"tabindex":ret.embedAttrs[args[i]]=ret.objAttrs[args[i]]=args[i+1];break;default:ret.embedAttrs[args[i]]=ret.params[args[i]]=args[i+1]}}return ret}


$(document).ready(function () {
    if ($('#divForumBreadCrumb').length == 0) {
        $.ajax({
            url: "/global_engine/ajax/BreadCrumbService.aspx",
            data: "url=" + encodeURIComponent(window.location.pathname + window.location.search) + "&ref=" + encodeURIComponent(document.referrer),
            dataType: "html",
            success: function(data) {
                {
                    $("#SpTitleBar").closest('tr').after("<tr><td class='tdBreadCrumb'>"+data+"</td></tr>");
                }
            },
            error: function(xhr, msg) {
                {
                }
            }
        });
    }
});


/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
	var initializing = false;

	// The base JQClass implementation (does nothing)
	window.JQClass = function(){};

	// Collection of derived classes
	JQClass.classes = {};
 
	// Create a new JQClass that inherits from this class
	JQClass.extend = function extender(prop) {
		var base = this.prototype;

		// Instantiate a base class (but only create the instance,
		// don't run the init constructor)
		initializing = true;
		var prototype = new this();
		initializing = false;

		// Copy the properties over onto the new prototype
		for (var name in prop) {
			// Check if we're overwriting an existing function
			prototype[name] = typeof prop[name] == 'function' &&
				typeof base[name] == 'function' ?
				(function(name, fn){
					return function() {
						var __super = this._super;

						// Add a new ._super() method that is the same method
						// but on the super-class
						this._super = function(args) {
							return base[name].apply(this, args || []);
						};

						var ret = fn.apply(this, arguments);				

						// The method only need to be bound temporarily, so we
						// remove it when we're done executing
						this._super = __super;

						return ret;
					};
				})(name, prop[name]) :
				prop[name];
		}

		// The dummy class constructor
		function JQClass() {
			// All construction is actually done in the init method
			if (!initializing && this._init) {
				this._init.apply(this, arguments);
			}
		}

		// Populate our constructed prototype object
		JQClass.prototype = prototype;

		// Enforce the constructor to be what we expect
		JQClass.prototype.constructor = JQClass;

		// And make this class extendable
		JQClass.extend = extender;

		return JQClass;
	};
})();

(function($) { // Ensure $, encapsulate

	/** Abstract base class for collection plugins v1.0.1.
		Written by Keith Wood (kbwood{at}iinet.com.au) December 2013.
		Licensed under the MIT (https://github.com/jquery/jquery/blob/master/LICENSE.txt) license.
		@module $.JQPlugin
		@abstract */
	JQClass.classes.JQPlugin = JQClass.extend({

		/** Name to identify this plugin.
			@example name: 'tabs' */
		name: 'plugin',

		/** Default options for instances of this plugin (default: {}).
			@example defaultOptions: {
 	selectedClass: 'selected',
 	triggers: 'click'
 } */
		defaultOptions: {},
		
		/** Options dependent on the locale.
			Indexed by language and (optional) country code, with '' denoting the default language (English/US).
			@example regionalOptions: {
	'': {
		greeting: 'Hi'
	}
 } */
		regionalOptions: {},
		
		/** Names of getter methods - those that can't be chained (default: []).
			@example _getters: ['activeTab'] */
		_getters: [],

		/** Retrieve a marker class for affected elements.
			@private
			@return {string} The marker class. */
		_getMarker: function() {
			return 'is-' + this.name;
		},
		
		/** Initialise the plugin.
			Create the jQuery bridge - plugin name <code>xyz</code>
			produces <code>$.xyz</code> and <code>$.fn.xyz</code>. */
		_init: function() {
			// Apply default localisations
			$.extend(this.defaultOptions, (this.regionalOptions && this.regionalOptions['']) || {});
			// Camel-case the name
			var jqName = camelCase(this.name);
			// Expose jQuery singleton manager
			$[jqName] = this;
			// Expose jQuery collection plugin
			$.fn[jqName] = function(options) {
				var otherArgs = Array.prototype.slice.call(arguments, 1);
				if ($[jqName]._isNotChained(options, otherArgs)) {
					return $[jqName][options].apply($[jqName], [this[0]].concat(otherArgs));
				}
				return this.each(function() {
					if (typeof options === 'string') {
						if (options[0] === '_' || !$[jqName][options]) {
							throw 'Unknown method: ' + options;
						}
						$[jqName][options].apply($[jqName], [this].concat(otherArgs));
					}
					else {
						$[jqName]._attach(this, options);
					}
				});
			};
		},

		/** Set default values for all subsequent instances.
			@param options {object} The new default options.
			@example $.plugin.setDefauls({name: value}) */
		setDefaults: function(options) {
			$.extend(this.defaultOptions, options || {});
		},
		
		/** Determine whether a method is a getter and doesn't permit chaining.
			@private
			@param name {string} The method name.
			@param otherArgs {any[]} Any other arguments for the method.
			@return {boolean} True if this method is a getter, false otherwise. */
		_isNotChained: function(name, otherArgs) {
			if (name === 'option' && (otherArgs.length === 0 ||
					(otherArgs.length === 1 && typeof otherArgs[0] === 'string'))) {
				return true;
			}
			return $.inArray(name, this._getters) > -1;
		},
		
		/** Initialise an element. Called internally only.
			Adds an instance object as data named for the plugin.
			@param elem {Element} The element to enhance.
			@param options {object} Overriding settings. */
		_attach: function(elem, options) {
			elem = $(elem);
			if (elem.hasClass(this._getMarker())) {
				return;
			}
			elem.addClass(this._getMarker());
			options = $.extend({}, this.defaultOptions, this._getMetadata(elem), options || {});
			var inst = $.extend({name: this.name, elem: elem, options: options},
				this._instSettings(elem, options));
			elem.data(this.name, inst); // Save instance against element
			this._postAttach(elem, inst);
			this.option(elem, options);
		},

		/** Retrieve additional instance settings.
			Override this in a sub-class to provide extra settings.
			@param elem {jQuery} The current jQuery element.
			@param options {object} The instance options.
			@return {object} Any extra instance values.
			@example _instSettings: function(elem, options) {
 	return {nav: elem.find(options.navSelector)};
 } */
		_instSettings: function(elem, options) {
			return {};
		},

		/** Plugin specific post initialisation.
			Override this in a sub-class to perform extra activities.
			@param elem {jQuery} The current jQuery element.
			@param inst {object} The instance settings.
			@example _postAttach: function(elem, inst) {
 	elem.on('click.' + this.name, function() {
 		...
 	});
 } */
		_postAttach: function(elem, inst) {
		},

		/** Retrieve metadata configuration from the element.
			Metadata is specified as an attribute:
			<code>data-&lt;plugin name>="&lt;setting name>: '&lt;value>', ..."</code>.
			Dates should be specified as strings in this format: 'new Date(y, m-1, d)'.
			@private
			@param elem {jQuery} The source element.
			@return {object} The inline configuration or {}. */
		_getMetadata: function(elem) {
			try {
				var data = elem.data(this.name.toLowerCase()) || '';
				data = data.replace(/'/g, '"');
				data = data.replace(/([a-zA-Z0-9]+):/g, function(match, group, i) { 
					var count = data.substring(0, i).match(/"/g); // Handle embedded ':'
					return (!count || count.length % 2 === 0 ? '"' + group + '":' : group + ':');
				});
				data = $.parseJSON('{' + data + '}');
				for (var name in data) { // Convert dates
					var value = data[name];
					if (typeof value === 'string' && value.match(/^new Date\((.*)\)$/)) {
						data[name] = eval(value);
					}
				}
				return data;
			}
			catch (e) {
				return {};
			}
		},

		/** Retrieve the instance data for element.
			@param elem {Element} The source element.
			@return {object} The instance data or {}. */
		_getInst: function(elem) {
			return $(elem).data(this.name) || {};
		},
		
		/** Retrieve or reconfigure the settings for a plugin.
			@param elem {Element} The source element.
			@param name {object|string} The collection of new option values or the name of a single option.
			@param [value] {any} The value for a single named option.
			@return {any|object} If retrieving a single value or all options.
			@example $(selector).plugin('option', 'name', value)
 $(selector).plugin('option', {name: value, ...})
 var value = $(selector).plugin('option', 'name')
 var options = $(selector).plugin('option') */
		option: function(elem, name, value) {
			elem = $(elem);
			var inst = elem.data(this.name);
			if  (!name || (typeof name === 'string' && value == null)) {
				var options = (inst || {}).options;
				return (options && name ? options[name] : options);
			}
			if (!elem.hasClass(this._getMarker())) {
				return;
			}
			var options = name || {};
			if (typeof name === 'string') {
				options = {};
				options[name] = value;
			}
			this._optionsChanged(elem, inst, options);
			$.extend(inst.options, options);
		},
		
		/** Plugin specific options processing.
			Old value available in <code>inst.options[name]</code>, new value in <code>options[name]</code>.
			Override this in a sub-class to perform extra activities.
			@param elem {jQuery} The current jQuery element.
			@param inst {object} The instance settings.
			@param options {object} The new options.
			@example _optionsChanged: function(elem, inst, options) {
 	if (options.name != inst.options.name) {
 		elem.removeClass(inst.options.name).addClass(options.name);
 	}
 } */
		_optionsChanged: function(elem, inst, options) {
		},
		
		/** Remove all trace of the plugin.
			Override <code>_preDestroy</code> for plugin-specific processing.
			@param elem {Element} The source element.
			@example $(selector).plugin('destroy') */
		destroy: function(elem) {
			elem = $(elem);
			if (!elem.hasClass(this._getMarker())) {
				return;
			}
			this._preDestroy(elem, this._getInst(elem));
			elem.removeData(this.name).removeClass(this._getMarker());
		},

		/** Plugin specific pre destruction.
			Override this in a sub-class to perform extra activities and undo everything that was
			done in the <code>_postAttach</code> or <code>_optionsChanged</code> functions.
			@param elem {jQuery} The current jQuery element.
			@param inst {object} The instance settings.
			@example _preDestroy: function(elem, inst) {
 	elem.off('.' + this.name);
 } */
		_preDestroy: function(elem, inst) {
		}
	});
	
	/** Convert names from hyphenated to camel-case.
		@private
		@param value {string} The original hyphenated name.
		@return {string} The camel-case version. */
	function camelCase(name) {
		return name.replace(/-([a-z])/g, function(match, group) {
			return group.toUpperCase();
		});
	}
	
	/** Expose the plugin base.
		@namespace "$.JQPlugin" */
	$.JQPlugin = {
	
		/** Create a new collection plugin.
			@memberof "$.JQPlugin"
			@param [superClass='JQPlugin'] {string} The name of the parent class to inherit from.
			@param overrides {object} The property/function overrides for the new class.
			@example $.JQPlugin.createPlugin({
 	name: 'tabs',
 	defaultOptions: {selectedClass: 'selected'},
 	_initSettings: function(elem, options) { return {...}; },
 	_postAttach: function(elem, inst) { ... }
 }); */
		createPlugin: function(superClass, overrides) {
			if (typeof superClass === 'object') {
				overrides = superClass;
				superClass = 'JQPlugin';
			}
			superClass = camelCase(superClass);
			var className = camelCase(overrides.name);
			JQClass.classes[className] = JQClass.classes[superClass].extend(overrides);
			new JQClass.classes[className]();
		}
	};

})(jQuery);

/* http://keith-wood.name/countdown.html
   Countdown for jQuery v2.0.1.
   Written by Keith Wood (kbwood{at}iinet.com.au) January 2008.
   Available under the MIT (https://github.com/jquery/jquery/blob/master/LICENSE.txt) license. 
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

	var pluginName = 'countdown';

	var Y = 0; // Years
	var O = 1; // Months
	var W = 2; // Weeks
	var D = 3; // Days
	var H = 4; // Hours
	var M = 5; // Minutes
	var S = 6; // Seconds

	/** Create the countdown plugin.
		<p>Sets an element to show the time remaining until a given instant.</p>
		<p>Expects HTML like:</p>
		<pre>&lt;div>&lt;/div></pre>
		<p>Provide inline configuration like:</p>
		<pre>&lt;div data-countdown="name: 'value'">&lt;/div></pre>
	 	@module Countdown
		@augments JQPlugin
		@example $(selector).countdown({until: +300}) */
	$.JQPlugin.createPlugin({
	
		/** The name of the plugin. */
		name: pluginName,

		/** Countdown expiry callback.
			Triggered when the countdown expires.
			@callback expiryCallback */

		/** Countdown server synchronisation callback.
			Triggered when the countdown is initialised.
			@callback serverSyncCallback
			@return {Date} The current date/time on the server as expressed in the local timezone. */
			
		/** Countdown tick callback.
			Triggered on every <code>tickInterval</code> ticks of the countdown.
			@callback tickCallback
			@param periods {number[]} The breakdown by period (years, months, weeks, days,
					hours, minutes, seconds) of the time remaining/passed. */

		/** Countdown which labels callback.
			Triggered when the countdown is being display to determine which set of labels
			(<code>labels</code>, <code>labels1</code>, ...) are to be used for the current period value.
			@callback whichLabelsCallback
			@param num {number} The current period value.
			@return {number} The suffix for the label set to use. */
			
		/** Default settings for the plugin.
			@property until {Date|number|string} The date/time to count down to, or number of seconds
						offset from now, or string of amounts and units for offset(s) from now:
						'Y' years, 'O' months, 'W' weeks, 'D' days, 'H' hours, 'M' minutes, 'S' seconds.
			@example until: new Date(2013, 12-1, 25, 13, 30)
 until: +300
 until: '+1O -2D'
			@property [since] {Date|number|string} The date/time to count up from, or
						number of seconds offset from now, or string for unit offset(s):
						'Y' years, 'O' months, 'W' weeks, 'D' days, 'H' hours, 'M' minutes, 'S' seconds.
			@example since: new Date(2013, 1-1, 1)
 since: -300
 since: '-1O +2D'
			@property [timezone=null] {number} The timezone (hours or minutes from GMT) for the target times,
						or null for client local timezone.
			@example timezone: +10
 timezone: -60
			@property [serverSync=null] {serverSyncCallback} A function to retrieve the current server time
						for synchronisation.
			@property [format='dHMS'] {string} The format for display - upper case for always, lower case only if non-zero,
						'Y' years, 'O' months, 'W' weeks, 'D' days, 'H' hours, 'M' minutes, 'S' seconds.
			@property [layout=''] {string} Build your own layout for the countdown.
			@example layout: '{d<}{dn} {dl}{d>} {hnn}:{mnn}:{snn}'
			@property [compact=false] {boolean} True to display in a compact format, false for an expanded one.
			@property [padZeroes=false] {boolean} True to add leading zeroes
			@property [significant=0] {number} The number of periods with non-zero values to show, zero for all.
			@property [description=''] {string} The description displayed for the countdown.
			@property [expiryUrl=''] {string} A URL to load upon expiry, replacing the current page.
			@property [expiryText=''] {string} Text to display upon expiry, replacing the countdown. This may be HTML.
			@property [alwaysExpire=false] {boolean} True to trigger <code>onExpiry</code> even if target time has passed.
			@property [onExpiry=null] {expiryCallback} Callback when the countdown expires -
						receives no parameters and <code>this</code> is the containing division.
			@example onExpiry: function() {
	...
 }
			@property [onTick=null] {tickCallback} Callback when the countdown is updated -
						receives <code>number[7]</code> being the breakdown by period
						(years, months, weeks, days, hours, minutes, seconds - based on
						<code>format</code>) and <code>this</code> is the containing division.
			@example onTick: function(periods) {
 	var secs = $.countdown.periodsToSeconds(periods);
 	if (secs < 300) { // Last five minutes
		...
 	}
 }
			@property [tickInterval=1] {number} The interval (seconds) between <code>onTick</code> callbacks. */
		defaultOptions: {
			until: null,
			since: null,
			timezone: null,
			serverSync: null,
			format: 'dHMS',
			layout: '',
			compact: false,
			padZeroes: false,
			significant: 0,
			description: '',
			expiryUrl: '',
			expiryText: '',
			alwaysExpire: false,
			onExpiry: null,
			onTick: null,
			tickInterval: 1
		},

		/** Localisations for the plugin.
			Entries are objects indexed by the language code ('' being the default US/English).
			Each object has the following attributes.
			@property [labels=['Years','Months','Weeks','Days','Hours','Minutes','Seconds']] {string[]}
						The display texts for the counter periods.
			@property [labels1=['Year','Month','Week','Day','Hour','Minute','Second']] {string[]}
						The display texts for the counter periods if they have a value of 1.
						Add other <code>labels<em>n</em></code> attributes as necessary to
						cater for other numeric idiosyncrasies of the localisation.
			@property [compactLabels=['y','m','w','d']] {string[]} The compact texts for the counter periods.
			@property [whichLabels=null] {whichLabelsCallback} A function to determine which
						<code>labels<em>n</em></code> to use.
			@example whichLabels: function(num) {
	return (num > 1 ? 0 : 1);
 }
			@property [digits=['0','1',...,'9']] {number[]} The digits to display (0-9).
			@property [timeSeparator=':'] {string} Separator for time periods in the compact layout.
			@property [isRTL=false] {boolean} True for right-to-left languages, false for left-to-right. */
		regionalOptions: { // Available regional settings, indexed by language/country code
			'': { // Default regional settings - English/US
				labels: ['Years', 'Months', 'Weeks', 'Days', 'Hours', 'Minutes', 'Seconds'],
				labels1: ['Year', 'Month', 'Week', 'Day', 'Hour', 'Minute', 'Second'],
				compactLabels: ['y', 'm', 'w', 'd'],
				whichLabels: null,
				digits: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
				timeSeparator: ':',
				isRTL: false
			}
		},
		
		/** Names of getter methods - those that can't be chained. */
		_getters: ['getTimes'],

		/* Class name for the right-to-left marker. */
		_rtlClass: pluginName + '-rtl',
		/* Class name for the countdown section marker. */
		_sectionClass: pluginName + '-section',
		/* Class name for the period amount marker. */
		_amountClass: pluginName + '-amount',
		/* Class name for the period name marker. */
		_periodClass: pluginName + '-period',
		/* Class name for the countdown row marker. */
		_rowClass: pluginName + '-row',
		/* Class name for the holding countdown marker. */
		_holdingClass: pluginName + '-holding',
		/* Class name for the showing countdown marker. */
		_showClass: pluginName + '-show',
		/* Class name for the description marker. */
		_descrClass: pluginName + '-descr',

		/* List of currently active countdown elements. */
		_timerElems: [],

		/** Additional setup for the countdown.
			Apply default localisations.
			Create the timer. */
		_init: function() {
			var self = this;
			this._super();
			this._serverSyncs = [];
			var now = (typeof Date.now == 'function' ? Date.now :
				function() { return new Date().getTime(); });
			var perfAvail = (window.performance && typeof window.performance.now == 'function');
			// Shared timer for all countdowns
			function timerCallBack(timestamp) {
				var drawStart = (timestamp < 1e12 ? // New HTML5 high resolution timer
					(perfAvail ? (performance.now() + performance.timing.navigationStart) : now()) :
					// Integer milliseconds since unix epoch
					timestamp || now());
				if (drawStart - animationStartTime >= 1000) {
							self._updateElems();
					animationStartTime = drawStart;
				}
				requestAnimationFrame(timerCallBack);
			}
			var requestAnimationFrame = window.requestAnimationFrame ||
				window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
				window.oRequestAnimationFrame || window.msRequestAnimationFrame || null;
				// This is when we expect a fall-back to setInterval as it's much more fluid
			var animationStartTime = 0;
			if (!requestAnimationFrame || $.noRequestAnimationFrame) {
				$.noRequestAnimationFrame = null;
						setInterval(function() { self._updateElems(); }, 980); // Fall back to good old setInterval
			}
			else {
				animationStartTime = window.animationStartTime ||
					window.webkitAnimationStartTime || window.mozAnimationStartTime ||
					window.oAnimationStartTime || window.msAnimationStartTime || now();
				requestAnimationFrame(timerCallBack);
			}
		},
	
		/** Convert a date/time to UTC.
			@param tz {number} The hour or minute offset from GMT, e.g. +9, -360.
			@param year {Date|number} the date/time in that timezone or the year in that timezone.
			@param [month] {number} The month (0 - 11) (omit if <code>year</code> is a <code>Date</code>).
			@param [day] {number} The day (omit if <code>year</code> is a <code>Date</code>).
			@param [hours] {number} The hour (omit if <code>year</code> is a <code>Date</code>).
			@param [mins] {number} The minute (omit if <code>year</code> is a <code>Date</code>).
			@param [secs] {number} The second (omit if <code>year</code> is a <code>Date</code>).
			@param [ms] {number} The millisecond (omit if <code>year</code> is a <code>Date</code>).
			@return {Date} The equivalent UTC date/time.
			@example $.countdown.UTCDate(+10, 2013, 12-1, 25, 12, 0)
 $.countdown.UTCDate(-7, new Date(2013, 12-1, 25, 12, 0)) */
		UTCDate: function(tz, year, month, day, hours, mins, secs, ms) {
			if (typeof year == 'object' && year.constructor == Date) {
				ms = year.getMilliseconds();
				secs = year.getSeconds();
				mins = year.getMinutes();
				hours = year.getHours();
				day = year.getDate();
				month = year.getMonth();
				year = year.getFullYear();
			}
			var d = new Date();
			d.setUTCFullYear(year);
			d.setUTCDate(1);
			d.setUTCMonth(month || 0);
			d.setUTCDate(day || 1);
			d.setUTCHours(hours || 0);
			d.setUTCMinutes((mins || 0) - (Math.abs(tz) < 30 ? tz * 60 : tz));
			d.setUTCSeconds(secs || 0);
			d.setUTCMilliseconds(ms || 0);
			return d;
		},

		/** Convert a set of periods into seconds.
	   Averaged for months and years.
			@param periods {number[]} The periods per year/month/week/day/hour/minute/second.
			@return {number} The corresponding number of seconds.
			@example var secs = $.countdown.periodsToSeconds(periods) */
		periodsToSeconds: function(periods) {
			return periods[0] * 31557600 + periods[1] * 2629800 + periods[2] * 604800 +
				periods[3] * 86400 + periods[4] * 3600 + periods[5] * 60 + periods[6];
		},

		_instSettings: function(elem, options) {
			return {_periods: [0, 0, 0, 0, 0, 0, 0]};
		},

		/** Add an element to the list of active ones.
			@private
			@param elem {Element} The countdown element. */
		_addElem: function(elem) {
			if (!this._hasElem(elem)) {
				this._timerElems.push(elem);
			}
		},

		/** See if an element is in the list of active ones.
			@private
			@param elem {Element} The countdown element.
			@return {boolean} True if present, false if not. */
		_hasElem: function(elem) {
			return ($.inArray(elem, this._timerElems) > -1);
		},

		/** Remove an element from the list of active ones.
			@private
			@param elem {Element} The countdown element. */
		_removeElem: function(elem) {
			this._timerElems = $.map(this._timerElems,
				function(value) { return (value == elem ? null : value); }); // delete entry
		},

		/** Update each active timer element.
			@private */
		_updateElems: function() {
			for (var i = this._timerElems.length - 1; i >= 0; i--) {
				this._updateCountdown(this._timerElems[i]);
			}
		},

		_optionsChanged: function(elem, inst, options) {
			if (options.layout) {
				options.layout = options.layout.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
			}
			this._resetExtraLabels(inst.options, options);
			var timezoneChanged = (inst.options.timezone != options.timezone);
			$.extend(inst.options, options);
			this._adjustSettings(elem, inst,
				options.until != null || options.since != null || timezoneChanged);
			var now = new Date();
			if ((inst._since && inst._since < now) || (inst._until && inst._until > now)) {
				this._addElem(elem[0]);
			}
			this._updateCountdown(elem, inst);
		},

		/** Redisplay the countdown with an updated display.
			@private
			@param elem {Element|jQuery} The containing division.
			@param inst {object} The current settings for this instance. */
		_updateCountdown: function(elem, inst) {
			elem = elem.jquery ? elem : $(elem);
			inst = inst || this._getInst(elem);
			if (!inst) {
				return;
			}
			elem.html(this._generateHTML(inst)).toggleClass(this._rtlClass, inst.options.isRTL);
			if ($.isFunction(inst.options.onTick)) {
				var periods = inst._hold != 'lap' ? inst._periods :
					this._calculatePeriods(inst, inst._show, inst.options.significant, new Date());
				if (inst.options.tickInterval == 1 ||
						this.periodsToSeconds(periods) % inst.options.tickInterval == 0) {
					inst.options.onTick.apply(elem[0], [periods]);
				}
			}
			var expired = inst._hold != 'pause' &&
				(inst._since ? inst._now.getTime() < inst._since.getTime() :
				inst._now.getTime() >= inst._until.getTime());
			if (expired && !inst._expiring) {
				inst._expiring = true;
				if (this._hasElem(elem[0]) || inst.options.alwaysExpire) {
					this._removeElem(elem[0]);
					if ($.isFunction(inst.options.onExpiry)) {
						inst.options.onExpiry.apply(elem[0], []);
					}
					if (inst.options.expiryText) {
						var layout = inst.options.layout;
						inst.options.layout = inst.options.expiryText;
						this._updateCountdown(elem[0], inst);
						inst.options.layout = layout;
					}
					if (inst.options.expiryUrl) {
						window.location = inst.options.expiryUrl;
					}
				}
				inst._expiring = false;
			}
			else if (inst._hold == 'pause') {
				this._removeElem(elem[0]);
			}
		},

		/** Reset any extra labelsn and compactLabelsn entries if changing labels.
			@private
			@param base {object} The options to be updated.
			@param options {object} The new option values. */
		_resetExtraLabels: function(base, options) {
			for (var n in options) {
				if (n.match(/[Ll]abels[02-9]|compactLabels1/)) {
					base[n] = options[n];
				}
			}
			for (var n in base) { // Remove custom numbered labels
				if (n.match(/[Ll]abels[02-9]|compactLabels1/) && typeof options[n] === 'undefined') {
					base[n] = null;
				}
			}
		},
	
		/** Calculate internal settings for an instance.
			@private
			@param elem {jQuery} The containing division.
			@param inst {object} The current settings for this instance.
			@param recalc {boolean} True if until or since are set. */
		_adjustSettings: function(elem, inst, recalc) {
		var now;
		var serverOffset = 0;
		var serverEntry = null;
		for (var i = 0; i < this._serverSyncs.length; i++) {
			if (this._serverSyncs[i][0] == inst.options.serverSync) {
				serverEntry = this._serverSyncs[i][1];
				break;
			}
		}
		if (serverEntry != null) {
			serverOffset = (inst.options.serverSync ? serverEntry : 0);
			now = new Date();
		}
		else {
			var serverResult = ($.isFunction(inst.options.serverSync) ?
					inst.options.serverSync.apply(elem[0], []) : null);
			now = new Date();
			serverOffset = (serverResult ? now.getTime() - serverResult.getTime() : 0);
			this._serverSyncs.push([inst.options.serverSync, serverOffset]);
		}
		var timezone = inst.options.timezone;
		timezone = (timezone == null ? -now.getTimezoneOffset() : timezone);
		if (recalc || (!recalc && inst._until == null && inst._since == null)) {
			inst._since = inst.options.since;
			if (inst._since != null) {
				inst._since = this.UTCDate(timezone, this._determineTime(inst._since, null));
				if (inst._since && serverOffset) {
					inst._since.setMilliseconds(inst._since.getMilliseconds() + serverOffset);
				}
			}
			inst._until = this.UTCDate(timezone, this._determineTime(inst.options.until, now));
			if (serverOffset) {
				inst._until.setMilliseconds(inst._until.getMilliseconds() + serverOffset);
			}
		}
		inst._show = this._determineShow(inst);
	},

		/** Remove the countdown widget from a div.
			@param elem {jQuery} The containing division.
			@param inst {object} The current instance object. */
		_preDestroy: function(elem, inst) {
			this._removeElem(elem[0]);
			elem.empty();
	},

		/** Pause a countdown widget at the current time.
	   Stop it running but remember and display the current time.
			@param elem {Element} The containing division.
			@example $(selector).countdown('pause') */
		pause: function(elem) {
			this._hold(elem, 'pause');
	},

		/** Pause a countdown widget at the current time.
	   Stop the display but keep the countdown running.
			@param elem {Element} The containing division.
			@example $(selector).countdown('lap') */
		lap: function(elem) {
			this._hold(elem, 'lap');
		},

		/** Resume a paused countdown widget.
			@param elem {Element} The containing division.
			@example $(selector).countdown('resume') */
		resume: function(elem) {
			this._hold(elem, null);
		},

		/** Toggle a paused countdown widget.
			@param elem {Element} The containing division.
			@example $(selector).countdown('toggle') */
		toggle: function(elem) {
			var inst = $.data(elem, this.name) || {};
			this[!inst._hold ? 'pause' : 'resume'](elem);
		},

		/** Toggle a lapped countdown widget.
			@param elem {Element} The containing division.
			@example $(selector).countdown('toggleLap') */
		toggleLap: function(elem) {
			var inst = $.data(elem, this.name) || {};
			this[!inst._hold ? 'lap' : 'resume'](elem);
		},

		/** Pause or resume a countdown widget.
			@private
			@param elem {Element} The containing division.
			@param hold {string} The new hold setting. */
		_hold: function(elem, hold) {
			var inst = $.data(elem, this.name);
		if (inst) {
			if (inst._hold == 'pause' && !hold) {
				inst._periods = inst._savePeriods;
				var sign = (inst._since ? '-' : '+');
				inst[inst._since ? '_since' : '_until'] =
					this._determineTime(sign + inst._periods[0] + 'y' +
						sign + inst._periods[1] + 'o' + sign + inst._periods[2] + 'w' +
						sign + inst._periods[3] + 'd' + sign + inst._periods[4] + 'h' + 
						sign + inst._periods[5] + 'm' + sign + inst._periods[6] + 's');
					this._addElem(elem);
			}
			inst._hold = hold;
			inst._savePeriods = (hold == 'pause' ? inst._periods : null);
				$.data(elem, this.name, inst);
				this._updateCountdown(elem, inst);
		}
	},

		/** Return the current time periods.
			@param elem {Element} The containing division.
			@return {number[]} The current periods for the countdown.
			@example var periods = $(selector).countdown('getTimes') */
		getTimes: function(elem) {
			var inst = $.data(elem, this.name);
		return (!inst ? null : (inst._hold == 'pause' ? inst._savePeriods : (!inst._hold ? inst._periods :
			this._calculatePeriods(inst, inst._show, inst.options.significant, new Date()))));
	},

		/** A time may be specified as an exact value or a relative one.
			@private
			@param setting {string|number|Date} The date/time value as a relative or absolute value.
			@param defaultTime {Date} The date/time to use if no other is supplied.
			@return {Date} The corresponding date/time. */
	_determineTime: function(setting, defaultTime) {
			var self = this;
		var offsetNumeric = function(offset) { // e.g. +300, -2
			var time = new Date();
			time.setTime(time.getTime() + offset * 1000);
			return time;
		};
		var offsetString = function(offset) { // e.g. '+2d', '-4w', '+3h +30m'
			offset = offset.toLowerCase();
			var time = new Date();
			var year = time.getFullYear();
			var month = time.getMonth();
			var day = time.getDate();
			var hour = time.getHours();
			var minute = time.getMinutes();
			var second = time.getSeconds();
			var pattern = /([+-]?[0-9]+)\s*(s|m|h|d|w|o|y)?/g;
			var matches = pattern.exec(offset);
			while (matches) {
				switch (matches[2] || 's') {
					case 's': second += parseInt(matches[1], 10); break;
					case 'm': minute += parseInt(matches[1], 10); break;
					case 'h': hour += parseInt(matches[1], 10); break;
					case 'd': day += parseInt(matches[1], 10); break;
					case 'w': day += parseInt(matches[1], 10) * 7; break;
					case 'o':
						month += parseInt(matches[1], 10); 
							day = Math.min(day, self._getDaysInMonth(year, month));
						break;
					case 'y':
						year += parseInt(matches[1], 10);
							day = Math.min(day, self._getDaysInMonth(year, month));
						break;
				}
				matches = pattern.exec(offset);
			}
			return new Date(year, month, day, hour, minute, second, 0);
		};
		var time = (setting == null ? defaultTime :
			(typeof setting == 'string' ? offsetString(setting) :
			(typeof setting == 'number' ? offsetNumeric(setting) : setting)));
		if (time) time.setMilliseconds(0);
		return time;
	},

		/** Determine the number of days in a month.
			@private
			@param year {number} The year.
			@param month {number} The month.
			@return {number} The days in that month. */
	_getDaysInMonth: function(year, month) {
		return 32 - new Date(year, month, 32).getDate();
	},

		/** Default implementation to determine which set of labels should be used for an amount.
			Use the <code>labels</code> attribute with the same numeric suffix (if it exists).
			@private
			@param num {number} The amount to be displayed.
			@return {number} The set of labels to be used for this amount. */
	_normalLabels: function(num) {
		return num;
	},

		/** Generate the HTML to display the countdown widget.
			@private
			@param inst {object} The current settings for this instance.
			@return {string} The new HTML for the countdown display. */
	_generateHTML: function(inst) {
		var self = this;
		// Determine what to show
		inst._periods = (inst._hold ? inst._periods :
			this._calculatePeriods(inst, inst._show, inst.options.significant, new Date()));
		// Show all 'asNeeded' after first non-zero value
		var shownNonZero = false;
		var showCount = 0;
		var sigCount = inst.options.significant;
		var show = $.extend({}, inst._show);
		for (var period = Y; period <= S; period++) {
			shownNonZero |= (inst._show[period] == '?' && inst._periods[period] > 0);
			show[period] = (inst._show[period] == '?' && !shownNonZero ? null : inst._show[period]);
			showCount += (show[period] ? 1 : 0);
			sigCount -= (inst._periods[period] > 0 ? 1 : 0);
		}
		var showSignificant = [false, false, false, false, false, false, false];
		for (var period = S; period >= Y; period--) { // Determine significant periods
			if (inst._show[period]) {
				if (inst._periods[period]) {
					showSignificant[period] = true;
				}
				else {
					showSignificant[period] = sigCount > 0;
					sigCount--;
				}
			}
		}
		var labels = (inst.options.compact ? inst.options.compactLabels : inst.options.labels);
		var whichLabels = inst.options.whichLabels || this._normalLabels;
		var showCompact = function(period) {
			var labelsNum = inst.options['compactLabels' + whichLabels(inst._periods[period])];
			return (show[period] ? self._translateDigits(inst, inst._periods[period]) +
				(labelsNum ? labelsNum[period] : labels[period]) + ' ' : '');
		};
		var minDigits = (inst.options.padZeroes ? 2 : 1);
		var showFull = function(period) {
			var labelsNum = inst.options['labels' + whichLabels(inst._periods[period])];
			return ((!inst.options.significant && show[period]) ||
				(inst.options.significant && showSignificant[period]) ?
					'<span class="' + self._sectionClass + '">' +
					'<span class="' + self._amountClass + '">' +
				self._minDigits(inst, inst._periods[period], minDigits) + '</span>' +
				'<span class="' + self._periodClass + '">' +
				(labelsNum ? labelsNum[period] : labels[period]) + '</span></span>' : '');
		};
		return (inst.options.layout ? this._buildLayout(inst, show, inst.options.layout,
			inst.options.compact, inst.options.significant, showSignificant) :
			((inst.options.compact ? // Compact version
			'<span class="' + this._rowClass + ' ' + this._amountClass +
			(inst._hold ? ' ' + this._holdingClass : '') + '">' + 
			showCompact(Y) + showCompact(O) + showCompact(W) + showCompact(D) + 
			(show[H] ? this._minDigits(inst, inst._periods[H], 2) : '') +
			(show[M] ? (show[H] ? inst.options.timeSeparator : '') +
			this._minDigits(inst, inst._periods[M], 2) : '') +
			(show[S] ? (show[H] || show[M] ? inst.options.timeSeparator : '') +
			this._minDigits(inst, inst._periods[S], 2) : '') :
			// Full version
			'<span class="' + this._rowClass + ' ' + this._showClass + (inst.options.significant || showCount) +
			(inst._hold ? ' ' + this._holdingClass : '') + '">' +
			showFull(Y) + showFull(O) + showFull(W) + showFull(D) +
			showFull(H) + showFull(M) + showFull(S)) + '</span>' +
			(inst.options.description ? '<span class="' + this._rowClass + ' ' + this._descrClass + '">' +
			inst.options.description + '</span>' : '')));
	},

		/** Construct a custom layout.
			@private
			@param inst {object} The current settings for this instance.
			@param show {boolean[]} Flags indicating which periods are requested.
			@param layout {string} The customised layout.
			@param compact {boolean} True if using compact labels.
			@param significant {number} The number of periods with values to show, zero for all.
			@param showSignificant {boolean[]} Other periods to show for significance.
			@return {string} The custom HTML. */
	_buildLayout: function(inst, show, layout, compact, significant, showSignificant) {
		var labels = inst.options[compact ? 'compactLabels' : 'labels'];
		var whichLabels = inst.options.whichLabels || this._normalLabels;
		var labelFor = function(index) {
			return (inst.options[(compact ? 'compactLabels' : 'labels') +
				whichLabels(inst._periods[index])] || labels)[index];
		};
		var digit = function(value, position) {
			return inst.options.digits[Math.floor(value / position) % 10];
		};
		var subs = {desc: inst.options.description, sep: inst.options.timeSeparator,
			yl: labelFor(Y), yn: this._minDigits(inst, inst._periods[Y], 1),
			ynn: this._minDigits(inst, inst._periods[Y], 2),
			ynnn: this._minDigits(inst, inst._periods[Y], 3), y1: digit(inst._periods[Y], 1),
			y10: digit(inst._periods[Y], 10), y100: digit(inst._periods[Y], 100),
			y1000: digit(inst._periods[Y], 1000),
			ol: labelFor(O), on: this._minDigits(inst, inst._periods[O], 1),
			onn: this._minDigits(inst, inst._periods[O], 2),
			onnn: this._minDigits(inst, inst._periods[O], 3), o1: digit(inst._periods[O], 1),
			o10: digit(inst._periods[O], 10), o100: digit(inst._periods[O], 100),
			o1000: digit(inst._periods[O], 1000),
			wl: labelFor(W), wn: this._minDigits(inst, inst._periods[W], 1),
			wnn: this._minDigits(inst, inst._periods[W], 2),
			wnnn: this._minDigits(inst, inst._periods[W], 3), w1: digit(inst._periods[W], 1),
			w10: digit(inst._periods[W], 10), w100: digit(inst._periods[W], 100),
			w1000: digit(inst._periods[W], 1000),
			dl: labelFor(D), dn: this._minDigits(inst, inst._periods[D], 1),
			dnn: this._minDigits(inst, inst._periods[D], 2),
			dnnn: this._minDigits(inst, inst._periods[D], 3), d1: digit(inst._periods[D], 1),
			d10: digit(inst._periods[D], 10), d100: digit(inst._periods[D], 100),
			d1000: digit(inst._periods[D], 1000),
			hl: labelFor(H), hn: this._minDigits(inst, inst._periods[H], 1),
			hnn: this._minDigits(inst, inst._periods[H], 2),
			hnnn: this._minDigits(inst, inst._periods[H], 3), h1: digit(inst._periods[H], 1),
			h10: digit(inst._periods[H], 10), h100: digit(inst._periods[H], 100),
			h1000: digit(inst._periods[H], 1000),
			ml: labelFor(M), mn: this._minDigits(inst, inst._periods[M], 1),
			mnn: this._minDigits(inst, inst._periods[M], 2),
			mnnn: this._minDigits(inst, inst._periods[M], 3), m1: digit(inst._periods[M], 1),
			m10: digit(inst._periods[M], 10), m100: digit(inst._periods[M], 100),
			m1000: digit(inst._periods[M], 1000),
			sl: labelFor(S), sn: this._minDigits(inst, inst._periods[S], 1),
			snn: this._minDigits(inst, inst._periods[S], 2),
			snnn: this._minDigits(inst, inst._periods[S], 3), s1: digit(inst._periods[S], 1),
			s10: digit(inst._periods[S], 10), s100: digit(inst._periods[S], 100),
			s1000: digit(inst._periods[S], 1000)};
		var html = layout;
		// Replace period containers: {p<}...{p>}
		for (var i = Y; i <= S; i++) {
			var period = 'yowdhms'.charAt(i);
			var re = new RegExp('\\{' + period + '<\\}([\\s\\S]*)\\{' + period + '>\\}', 'g');
			html = html.replace(re, ((!significant && show[i]) ||
				(significant && showSignificant[i]) ? '$1' : ''));
		}
		// Replace period values: {pn}
		$.each(subs, function(n, v) {
			var re = new RegExp('\\{' + n + '\\}', 'g');
			html = html.replace(re, v);
		});
		return html;
	},

		/** Ensure a numeric value has at least n digits for display.
			@private
			@param inst {object} The current settings for this instance.
			@param value {number} The value to display.
			@param len {number} The minimum length.
			@return {string} The display text. */
	_minDigits: function(inst, value, len) {
		value = '' + value;
		if (value.length >= len) {
			return this._translateDigits(inst, value);
		}
		value = '0000000000' + value;
		return this._translateDigits(inst, value.substr(value.length - len));
	},

		/** Translate digits into other representations.
			@private
			@param inst {object} The current settings for this instance.
			@param value {string} The text to translate.
			@return {string} The translated text. */
	_translateDigits: function(inst, value) {
		return ('' + value).replace(/[0-9]/g, function(digit) {
				return inst.options.digits[digit];
			});
	},

		/** Translate the format into flags for each period.
			@private
			@param inst {object} The current settings for this instance.
			@return {string[]} Flags indicating which periods are requested (?) or
					required (!) by year, month, week, day, hour, minute, second. */
	_determineShow: function(inst) {
		var format = inst.options.format;
		var show = [];
		show[Y] = (format.match('y') ? '?' : (format.match('Y') ? '!' : null));
		show[O] = (format.match('o') ? '?' : (format.match('O') ? '!' : null));
		show[W] = (format.match('w') ? '?' : (format.match('W') ? '!' : null));
		show[D] = (format.match('d') ? '?' : (format.match('D') ? '!' : null));
		show[H] = (format.match('h') ? '?' : (format.match('H') ? '!' : null));
		show[M] = (format.match('m') ? '?' : (format.match('M') ? '!' : null));
		show[S] = (format.match('s') ? '?' : (format.match('S') ? '!' : null));
		return show;
	},
	
		/** Calculate the requested periods between now and the target time.
			@private
			@param inst {object} The current settings for this instance.
			@param show {string[]} Flags indicating which periods are requested/required.
			@param significant {number} The number of periods with values to show, zero for all.
			@param now {Date} The current date and time.
			@return {number[]} The current time periods (always positive)
					by year, month, week, day, hour, minute, second. */
	_calculatePeriods: function(inst, show, significant, now) {
		// Find endpoints
		inst._now = now;
		inst._now.setMilliseconds(0);
		var until = new Date(inst._now.getTime());
		if (inst._since) {
			if (now.getTime() < inst._since.getTime()) {
				inst._now = now = until;
			}
			else {
				now = inst._since;
			}
		}
		else {
			until.setTime(inst._until.getTime());
			if (now.getTime() > inst._until.getTime()) {
				inst._now = now = until;
			}
		}
		// Calculate differences by period
		var periods = [0, 0, 0, 0, 0, 0, 0];
		if (show[Y] || show[O]) {
			// Treat end of months as the same
				var lastNow = this._getDaysInMonth(now.getFullYear(), now.getMonth());
				var lastUntil = this._getDaysInMonth(until.getFullYear(), until.getMonth());
			var sameDay = (until.getDate() == now.getDate() ||
				(until.getDate() >= Math.min(lastNow, lastUntil) &&
				now.getDate() >= Math.min(lastNow, lastUntil)));
			var getSecs = function(date) {
				return (date.getHours() * 60 + date.getMinutes()) * 60 + date.getSeconds();
			};
			var months = Math.max(0,
				(until.getFullYear() - now.getFullYear()) * 12 + until.getMonth() - now.getMonth() +
				((until.getDate() < now.getDate() && !sameDay) ||
				(sameDay && getSecs(until) < getSecs(now)) ? -1 : 0));
			periods[Y] = (show[Y] ? Math.floor(months / 12) : 0);
			periods[O] = (show[O] ? months - periods[Y] * 12 : 0);
			// Adjust for months difference and end of month if necessary
			now = new Date(now.getTime());
			var wasLastDay = (now.getDate() == lastNow);
				var lastDay = this._getDaysInMonth(now.getFullYear() + periods[Y],
				now.getMonth() + periods[O]);
			if (now.getDate() > lastDay) {
				now.setDate(lastDay);
			}
			now.setFullYear(now.getFullYear() + periods[Y]);
			now.setMonth(now.getMonth() + periods[O]);
			if (wasLastDay) {
				now.setDate(lastDay);
			}
		}
		var diff = Math.floor((until.getTime() - now.getTime()) / 1000);
		var extractPeriod = function(period, numSecs) {
			periods[period] = (show[period] ? Math.floor(diff / numSecs) : 0);
			diff -= periods[period] * numSecs;
		};
		extractPeriod(W, 604800);
		extractPeriod(D, 86400);
		extractPeriod(H, 3600);
		extractPeriod(M, 60);
		extractPeriod(S, 1);
		if (diff > 0 && !inst._since) { // Round up if left overs
			var multiplier = [1, 12, 4.3482, 7, 24, 60, 60];
			var lastShown = S;
			var max = 1;
			for (var period = S; period >= Y; period--) {
				if (show[period]) {
					if (periods[lastShown] >= max) {
						periods[lastShown] = 0;
						diff = 1;
					}
					if (diff > 0) {
						periods[period]++;
						diff = 0;
						lastShown = period;
						max = 1;
					}
				}
				max *= multiplier[period];
			}
		}
		if (significant) { // Zero out insignificant periods
			for (var period = Y; period <= S; period++) {
				if (significant && periods[period]) {
					significant--;
				}
				else if (!significant) {
					periods[period] = 0;
				}
			}
		}
		return periods;
	}
	});

})(jQuery);


function htmlHardDecode(input) {
    var e = document.createElement('div');
    e.innerHTML = input;
    return e.innerText;
}

function unwrap(val) {
    if (!val) return "";
    if (typeof val === "object") {
        if (val['#text']) return unwrap(val['#text']);
        if (val['#cdata']) {
            const cdata = unwrap(val['#cdata']);
            if (typeof cdata === "string" && cdata.trim().length > 0) {
                return cdata.trim();
            } else {
                return "";
            }
        }
        if (Array.isArray(val)) return unwrap(val[0]);
        return "";
    }
    return String(val).trim();
}

function htmlSoftDecode(input) {
    var e = document.createElement('textarea');;
    e.innerHTML = input;
    return e.value;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function decodeObject(object) {
    if (object instanceof Object) {
        for (const prop in object) {
            object[prop] = decodeObject(object[prop]);
        }
    }
    else if (typeof (object) === 'string') {
        return htmlSoftDecode(object);
    }

    return object;
}

function Interval(start, end) {
    this.start = start;
    this.end = end;

    this.length = function () {
        return this.end - this.start + 1;
    }
    this.intersect = function (index) {
        return index >= this.start && index <= this.end;
    }
}

function HtmlContentInterval(start, end) {
    Interval.call(this, start, end);
}

function CDataContentInterval(start, end) {
    Interval.call(this, start, end);
}

function SelfClosedTagInterval(start, end) {
    Interval.call(this, start, end);
}

SelfClosedTagInterval.isSelfEnclosingTag = function (start, end, html) {
    const enclosingTagNames = [
        "area",
        "base",
        "br",
        "col",
        "embed",
        "hr",
        "img",
        "input",
        "link",
        "meta",
        "param",
        "source",
        "track",
        "wbr",
        "menuitem",
        "keygen",
        "command",
    ];

    if (html[end - 1] === "/") return true;

    const tagContent = html.substring(start + 1, end);

    for (const et of enclosingTagNames) {
        if (tagContent.startsWith(et)) return true;
    }

    return false;
}

function BaseTagInterval(start, end, html) {
    this.tagName = "";
    Interval.call(this, start, end);

    let currentIndex = start + 1;

    // in case of closing tag
    if (html[currentIndex] === '/') {
        currentIndex++;
    }

    const regexp = /^[a-zA-Z]+$/;
    // while is word
    while (currentIndex < html.length && regexp.test(html[currentIndex])) {
        this.tagName += html[currentIndex++];
    }
}

function ClosingTagInterval(start, end, html) {
    BaseTagInterval.call(this, start, end, html);
}

ClosingTagInterval.isClosingTag = function (start, end, html) {
    return html[start + 1] === '/';
}

function TagInterval(start, end, html) {
    BaseTagInterval.call(this, start, end, html);
}

function StyleTagInterval(start, end) {
    Interval.call(this, start, end);
}

StyleTagInterval.findEnclosingTagEnd = function (openingTagEndIndex, html) {
    for (let i = openingTagEndIndex + 1; i < html.length; i++) {
        if (html[i] === ">") return i;
    }
    return -1;
}

StyleTagInterval.isStyleTag = function (tag) {
    return tag.indexOf("style") !== -1;
}

function CDataTagInterval(start, end, html) {
    Interval.call(this, start, end);
}

CDataTagInterval.tagStartText = '<![CDATA[';
CDataTagInterval.tagEndText = ']]>';

CDataTagInterval.isCdataTag = function (start, html) {
    if (html.length < CDataTagInterval.tagStartText.length) return false;

    return html.substring(start, CDataTagInterval.tagStartText.length) === CDataTagInterval.tagStartText;
}

CDataTagInterval.getCDataContentInfo = function (tagStart, html) {
    const cData = {
        tagStart: tagStart,
        tagEnd: html.length
    };

    let contentInterval = null;

    for (let i = tagStart; i < html.length; i++) {
        if (html.substring(i, CDataTagInterval.tagEndText.length) === CDataTagInterval.tagEndText) {
            contentInterval = {
                start: tagStart + CDataTagInterval.tagStartText.length,
                end: i - 1
            };

            cData.tagEnd = i + CDataTagInterval.tagEndText.length - 1;
            cData.contentInterval = contentInterval;

            return cData;
        }
    }

    console.error("CData tag not closed");
    return cData;
}

function HtmlParser(html) {
    // looks through html and stores intervals in htmlIntervals.
    this.parse = function () {
        let firstCharacterIndex = null;

        for (let index = 0; index < this.html.length; index++) {
            if (CDataTagInterval.isCdataTag(index, this.html)) {
                const cData = CDataTagInterval.getCDataContentInfo(index, this.html);

                if (cData.contentInterval) {
                    this.htmlIntervals.push(new CDataContentInterval(cData.contentInterval.start, cData.contentInterval.end));
                    index = cData.tagEnd + 1;
                }
            }
            else if (this.isTag(index)) {
                if (firstCharacterIndex != null) {
                    this.htmlIntervals.push(new HtmlContentInterval(firstCharacterIndex, index - 1));
                }

                firstCharacterIndex = null;

                let endTagIndex = this.findTagEnclosing(index);
                const tag = this.html.substring(index, endTagIndex + 1)

                if (SelfClosedTagInterval.isSelfEnclosingTag(index, endTagIndex, this.html)) {
                    this.htmlIntervals.push(new SelfClosedTagInterval(index, endTagIndex));
                }
                else if (StyleTagInterval.isStyleTag(tag)) {
                    endTagIndex = StyleTagInterval.findEnclosingTagEnd(endTagIndex, this.html);
                    if (endTagIndex === -1) {
                        console.warn("No style tag enclosing");
                    }
                    this.htmlIntervals.push(new StyleTagInterval(index, endTagIndex));
                }
                else if (ClosingTagInterval.isClosingTag(index, endTagIndex, this.html)) {
                    this.htmlIntervals.push(new ClosingTagInterval(index, endTagIndex, this.html));
                }
                else {
                    this.htmlIntervals.push(new TagInterval(index, endTagIndex, this.html));
                }

                index = endTagIndex;
            }
            else if (firstCharacterIndex == null) {
                firstCharacterIndex = index;
            }
        }

        if (firstCharacterIndex != null) {
            this.htmlIntervals.push(new HtmlContentInterval(firstCharacterIndex, this.html.length));
        }
    }

    this.isTag = function (index) {
        return this.html[index] === "<";
    }

    this.findTagEnclosing = function (index) {
        for (let i = index; i < this.html.length; i++) {
            if (this.html[i] === ">") return i;
        }

        return this.html.length;
    }

    this.getContent = function (charToKeep) {
        return FilterLogic.filter(charToKeep, this.htmlIntervals, this.html);
    }

    this.htmlIntervals = [];
    this.html = html;
    this.parse();
}

function FilterLogic() {
}

FilterLogic.filter = function (charToKeep, intervals, html) {
    let charactersToKeep = +charToKeep;
    let openedTags = [];
    let resultHtml = "";
    let lastVisitedIntervalIndex = 0;

    for (; lastVisitedIntervalIndex < intervals.length; lastVisitedIntervalIndex++) {
        const interval = intervals[lastVisitedIntervalIndex];

        // Unique logic for cdata. We want to escape all html in that tag.
        if (interval instanceof CDataContentInterval) {
            let originalIntervalSubstring = "";

            if (charactersToKeep > interval.length()) {
                originalIntervalSubstring = html.substring(interval.start, interval.end + 1);
                charactersToKeep -= interval.length();
                resultHtml += escapeHtml(originalIntervalSubstring);
            } else {
                originalIntervalSubstring = html.substring(interval.start, interval.start + charactersToKeep);
                resultHtml += escapeHtml(originalIntervalSubstring);
                break;
            }

            continue;
        }

        // Check if this interval is part of plain text
        if (interval instanceof HtmlContentInterval) {
            const plainText = html.substring(interval.start, interval.end + 1);

            // Add text as long as we haven't reached the charToKeep limit
            if (charactersToKeep > 0) {
                const textToAdd = plainText.length <= charactersToKeep
                    ? plainText
                    : plainText.substring(0, charactersToKeep);

                resultHtml += textToAdd;  // Add the visible text to the result
                charactersToKeep -= textToAdd.length;  // Reduce the remaining characters to keep

                // Stop if we've used up the character limit
                if (charactersToKeep <= 0) 
                    break;

                continue;
            }
        }

        
        else if (interval instanceof TagInterval) {
            openedTags.push(interval);
        }
        else if (interval instanceof ClosingTagInterval) {
            const closingIndex = this.findClosingTagIndex(openedTags, interval);

            if (closingIndex !== -1) {
                openedTags.splice(closingIndex, 1);
            }

        }
        else if(interval instanceof StyleTagInterval){
            let textStart = 0, textEnd = 0;
            for (let i = interval.start; i < interval.end; i++) {
                if (html[i] === ">"){
                    if(html[i+1] === "<")
                        continue;
                    textStart = i+1;       //Tag has ended, start text search from next index
                    break;
                }
            }
            for (let i = textStart; i < interval.end; i++) {
                if (html[i] === "<"){
                    textEnd = i;
                }
            }
            if(textStart > 0 && textEnd > 0){
                const availableText = html.substring(textStart, textEnd);

                // Add text as long as we haven't reached the charToKeep limit
                if (charactersToKeep > 0) {
                    const plainTextToAdd = availableText.length <= charactersToKeep
                        ? availableText
                        : availableText.substring(0, charactersToKeep);

                    resultHtml += plainTextToAdd;  // Add the visible text to the result
                    charactersToKeep -= plainTextToAdd.length;  // Reduce the remaining characters to keep

                    // Stop if we've used up the character limit
                    if (charactersToKeep <= 0) 
                        break;

                    continue;
                }
            }
        }
        resultHtml += html.substring(interval.start, interval.end + 1);
    }

    if (!openedTags.length) {
        return resultHtml;
    }

    for (const openedTag of openedTags) {
        for (let i = lastVisitedIntervalIndex; i < intervals.length; i++) {
            const interval = intervals[i];

            if (interval instanceof ClosingTagInterval && openedTag.tagName === interval.tagName) {
                resultHtml += html.substring(interval.start, interval.end + 1);
                break;
            }
        }
    }

    return resultHtml;
}


FilterLogic.findClosingTagIndex = function (openedTags, closingTag) {
    for (let i = openedTags.length === 0 ? 0 : openedTags.length - 1; i >= 0; i--) {
        //Only proceed if openedTags has some data, otherwise openedTags[i].tagName will break
        if(openedTags.length != 0){
            if (openedTags[i].tagName == closingTag.tagName) {
                return i;
            }
        }
    }
    return -1;
}

var basicRssParseStrategy = {
    getDescription: function (item) {
        return unwrap(item.description);
    },
    getTitle: function (item) {
        return unwrap(item.title);
    },
};

var domElements = {
    getLinkWithClass: function (content, linkHref, className = null) {
        const link = document.createElement('a');

        link.setAttribute("href", unwrap(linkHref));
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
        link.innerHTML += content;
        if (className) {
            link.setAttribute("class", className);
        }

        return link;
    },
    addChannelItemToContainer: function (container, itemInfo, rssBuilder) {
        const item = document.createElement('div');
        item.setAttribute("class", "rss-item");

        if (itemInfo.title) {
            const link = this.getLinkWithClass(rssBuilder.parseStrategy.getTitle(itemInfo), itemInfo.link, "rss-item-title");
            item.appendChild(link);
        }
        if (itemInfo.pubDate && rssBuilder._showDates) {
            const date = document.createElement('div');
            date.setAttribute("class", "rss-item-date");
            date.append(rssBuilder.getDate(itemInfo.pubDate, rssBuilder._timeZone, rssBuilder._dateFormat));
            item.appendChild(date);
        }        
        if (itemInfo.description && (rssBuilder._showFullDescriptions || rssBuilder._charactersLength > 0)) {
            const description = document.createElement('div');
            description.setAttribute("class", "rss-item-description");

            const descriptionHtml = rssBuilder.parseStrategy.getDescription(itemInfo);

            let decodedDescription = "";

            if (rssBuilder._showFullDescriptions) {
                decodedDescription = descriptionHtml;
            }
            else {
                const htmlParser = new HtmlParser(descriptionHtml);
                decodedDescription = htmlParser.getContent(rssBuilder._charactersLength);
            }

            description.innerHTML = decodedDescription;

            item.appendChild(description);
        }

        item.appendChild(document.createElement('br'));
        container.appendChild(item);
    }
}

class RssBuilder {
    set showAllItems(value) {
        this._showAllItems = value;
        this.updateHtml();
    };
    set rssUrl(value) {
        this._rssUrl = value;
        this._retrieveRssFeed(value);
    };
    set channelHeader(value) {
        this._channelHeader = value;
        this.updateHtml();
    };
    set numberOfItems(value) {
        this._numberOfItems = value;
        this.updateHtml();
    };
    set showDates(value) {
        this._showDates = value;
        this.updateHtml();
    };
    set timeZone(value) {
        this._timeZone = value;
        this.updateHtml();
    };
    set showFullDescriptions(value) {
        this._showFullDescriptions = value;
        this.updateHtml();
    };
    set charactersLength(value) {
        this._charactersLength = value;
        this.updateHtml();
    };
    // Used to apply content to block with id
    set containerId(value) {
        this._containerId = value;
        this.updateHtml();
    };
    set dateFormat(value) {
        this._dateFormat = value;
        this.updateHtml();
    };
    set isDebug(value) {
        this._isDebug = value;
    };
    set apiUrl(value) {
        this._apiUrl = value;
    };
    clearContent() {
        this._rssContent = null;
        this.updateHtml();
    };
    build() {
        this._builderReady = true;
        this.updateHtml();
    };
    parseStrategy = null;
    getDate(date, tz, dateFormat) {
        if (!date) return;
        date = unwrap(date);       
        let formattedDate = moment(new Date(date));

        if (tz !== null || tz !== undefined) {
            formattedDate = formattedDate.utcOffset(tz * 60);
        }

        let dateAsText = formattedDate.format(dateFormat.replace("dd", "DD")); 
        
        return dateAsText;
    };
    updateHtml() {
        this._container = this._findContainer();

        const rssBlock = this._container.getElementsByClassName("rss-box");

        if (rssBlock && rssBlock.length) {
            rssBlock[0].remove();
        }

        if (!this._builderReady || !this._rssContent) return;

        // will be used in future
        this.parseStrategy = basicRssParseStrategy;

        const box = document.createElement('div');
        box.setAttribute("class", "rss-box");

        const channel = document.createElement('div');
        channel.setAttribute("class", "rss-channel");

        if (this._rssContent?.rss?.channel?.title && (this._channelHeader == 'title' || this._channelHeader == 'both')) {
            const title_container = document.createElement('p');

            title_container.setAttribute("class", "rss-channel-title");
            title_container.innerHTML += this.parseStrategy.getTitle(this._rssContent.rss.channel);

            channel.appendChild(title_container);
        }

        if (this._rssContent?.rss?.channel?.description && (this._channelHeader == 'description' || this._channelHeader == 'both')) {
            const description_container = document.createElement('p');

            description_container.setAttribute("class", "rss-channel-description");
            description_container.innerHTML = this.parseStrategy.getDescription(this._rssContent.rss.channel);

            channel.appendChild(description_container);
        }

        box.appendChild(channel);

        if (this._rssContent?.rss?.channel?.item) {
            const items_container = document.createElement('div');
            items_container.setAttribute("class", "rss-items");

            if (this._rssContent?.rss?.channel?.item instanceof Array) {
                const items = this._showAllItems ? this._rssContent.rss.channel.item : this._rssContent.rss.channel.item.slice(0, this._numberOfItems);

                items.forEach(i => {
                    domElements.addChannelItemToContainer(items_container, i, this);
                });
            } else if (this._rssContent?.rss?.channel?.item instanceof Object) {
                domElements.addChannelItemToContainer(items_container, this._rssContent?.rss?.channel?.item, this);
            }

            box.appendChild(items_container);
        }

        this._container.appendChild(box);
    };
    _retrieveRssFeed(url) {
        var httpRequest;

        if (window.XMLHttpRequest) { // Mozilla, Safari, ...88
            httpRequest = new XMLHttpRequest();
        } else if (window.ActiveXObject) { // IE
            httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
        }

        const that = this;

        httpRequest.overrideMimeType('text/xml');
        httpRequest.onreadystatechange = function () {
            if (httpRequest.readyState == 4 && httpRequest.status == 200) {
                let decodedHtml = htmlHardDecode(httpRequest.responseText);

                const dom = xmlReader.parseXml(decodedHtml);
                const json = xmlReader.xml2json(dom).replace("undefined", ""); // due to a parse error of xml document

                that._rssContent = JSON.parse(json);
                decodeObject(that._rssContent);

                that.updateHtml();
            }
            else if (httpRequest.readyState == 4 && (httpRequest.status == 403 || httpRequest.status == 404 || httpRequest.status == 500) && that._isDebug) {
                RaiseAlert('RSS URL is invalid. Please provide another link.', 'danger');
                that.clearContent();
            }
            else if (httpRequest.readyState == 1 && httpRequest.status == 401) {
                RaiseAlert('Cookie expired. Please reload the page.', 'danger');
            }
            else {
                that.clearContent();

                that.updateHtml();
            }
        };
        httpRequest.open('POST', `${that._apiUrl}/RssBuilder`, true);

        httpRequest.setRequestHeader('accept', 'application/rss+xml,application/rdf+xml,application/atom+xml,application/xml;q=0.9,text/xml;q=0.8;*/*');
        httpRequest.setRequestHeader("Content-Type", "application/json;");
        httpRequest.setRequestHeader('x-ss-id', getCookie('ss-id'));

        const body = JSON.stringify({ Url: that._rssUrl });

        httpRequest.send(body);
    };
    _findContainer() {
        let container;

        if (this._containerId) {
            container = document.getElementById(this._containerId);
            if (!container) {
                console.error(`Container ${this._containerId} not found`);
            }
        } else {
            container = document.body;
        }

        return container;
    }
}

var xmlReader = {
    parseXml: function (xml) {
        var dom = null;
        if (window.DOMParser) {
            try {
                dom = (new DOMParser()).parseFromString(xml, "text/xml");
            }
            catch (e) { dom = null; }
        }
        else if (window.ActiveXObject) {
            try {
                dom = new ActiveXObject('Microsoft.XMLDOM');
                dom.async = false;
                if (!dom.loadXML(xml)) // parse error ..

                    window.alert(dom.parseError.reason + dom.parseError.srcText);
            }
            catch (e) { dom = null; }
        }
        else
            alert("cannot parse xml string!");
        return dom;
    },
    xml2json: function (xml, tab) {
        var X = {
            toObj: function (xml) {
                var o = {};
                if (xml.nodeType == 1) {   // element node ..
                    if (xml.attributes.length)   // element with attributes  ..
                        for (var i = 0; i < xml.attributes.length; i++)
                            o["@" + xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue || "").toString();
                    if (xml.firstChild) { // element has child nodes ..
                        var textChild = 0, cdataChild = 0, hasElementChild = false;
                        for (var n = xml.firstChild; n; n = n.nextSibling) {
                            if (n.nodeType == 1) hasElementChild = true;
                            else if (n.nodeType == 3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                            else if (n.nodeType == 4) cdataChild++; // cdata section node
                        }
                        if (hasElementChild) {
                            if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                                X.removeWhite(xml);
                                for (var n = xml.firstChild; n; n = n.nextSibling) {
                                    if (n.nodeType == 3)  // text node
                                        o["#text"] = X.escape(n.nodeValue);
                                    else if (n.nodeType == 4)  // cdata node
                                        o["#cdata"] = X.escape(n.nodeValue);
                                    else if (o[n.nodeName]) {  // multiple occurence of element ..
                                        if (o[n.nodeName] instanceof Array)
                                            o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                                        else
                                            o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                                    }
                                    else  // first occurence of element..
                                        o[n.nodeName] = X.toObj(n);
                                }
                            }
                            else { // mixed content
                                if (!xml.attributes.length)
                                    o = X.escape(X.innerXml(xml));
                                else
                                    o["#text"] = X.escape(X.innerXml(xml));
                            }
                        }
                        else if (textChild) { // pure text
                            if (!xml.attributes.length)
                                o = X.escape(X.innerXml(xml));
                            else
                                o["#text"] = X.escape(X.innerXml(xml));
                        }
                        else if (cdataChild) { // cdata
                            if (cdataChild > 1)
                                o = X.escape(X.innerXml(xml));
                            else
                                for (var n = xml.firstChild; n; n = n.nextSibling)
                                    o["#cdata"] = X.escape(n.nodeValue);
                        }
                    }
                    if (!xml.attributes.length && !xml.firstChild) o = null;
                }
                else if (xml.nodeType == 9) { // document.node
                    o = X.toObj(xml.documentElement);
                }
                else
                    alert("unhandled node type: " + xml.nodeType);
                return o;
            },
            toJson: function (o, name, ind) {
                var json = name ? ("\"" + name + "\"") : "";
                if (o instanceof Array) {
                    for (var i = 0, n = o.length; i < n; i++)
                        o[i] = X.toJson(o[i], "", ind + "\t");
                    json += (name ? ":[" : "[") + (o.length > 1 ? ("\n" + ind + "\t" + o.join(",\n" + ind + "\t") + "\n" + ind) : o.join("")) + "]";
                }
                else if (o == null)
                    json += (name && ":") + "null";
                else if (typeof (o) == "object") {
                    var arr = [];
                    for (var m in o)
                        arr[arr.length] = X.toJson(o[m], m, ind + "\t");
                    json += (name ? ":{" : "{") + (arr.length > 1 ? ("\n" + ind + "\t" + arr.join(",\n" + ind + "\t") + "\n" + ind) : arr.join("")) + "}";
                }
                else if (typeof (o) == "string")
                    json += (name && ":") + "\"" + o.toString() + "\"";
                else
                    json += (name && ":") + o.toString();
                return json;
            },
            innerXml: function (node) {
                var s = ""
                if ("innerHTML" in node)
                    s = node.innerHTML;
                else {
                    var asXml = function (n) {
                        var s = "";
                        if (n.nodeType == 1) {
                            s += "<" + n.nodeName;
                            for (var i = 0; i < n.attributes.length; i++)
                                s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue || "").toString() + "\"";
                            if (n.firstChild) {
                                s += ">";
                                for (var c = n.firstChild; c; c = c.nextSibling)
                                    s += asXml(c);
                                s += "</" + n.nodeName + ">";
                            }
                            else
                                s += "/>";
                        }
                        else if (n.nodeType == 3)
                            s += n.nodeValue;
                        else if (n.nodeType == 4)
                            s += "<![CDATA[" + n.nodeValue + "]]>";
                        return s;
                    };
                    for (var c = node.firstChild; c; c = c.nextSibling)
                        s += asXml(c);
                }
                return s;
            },
            escape: function (txt) {
                return txt.replace(/[\\]/g, "\\\\")
                    .replace(/[\"]/g, '\\"')
                    .replace(/[\n]/g, '\\n')
                    .replace(/[\r]/g, '\\r');
            },
            removeWhite: function (e) {
                e.normalize();
                for (var n = e.firstChild; n;) {
                    if (n.nodeType == 3) {  // text node
                        if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                            var nxt = n.nextSibling;
                            e.removeChild(n);
                            n = nxt;
                        }
                        else
                            n = n.nextSibling;
                    }
                    else if (n.nodeType == 1) {  // element node
                        X.removeWhite(n);
                        n = n.nextSibling;
                    }
                    else                      // any other node
                        n = n.nextSibling;
                }
                return e;
            }
        };
        if (xml.nodeType == 9) // document node
            xml = xml.documentElement;
        var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
        return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
    }
}

    //! moment.js
    //! version : 2.29.1
    //! authors : Tim Wood, Iskren Chernev, Moment.js contributors
    //! license : MIT
    //! momentjs.com

    ; (function (global, factory) {
        typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
            typeof define === 'function' && define.amd ? define(factory) :
                global.moment = factory()
    }(this, (function () {
        'use strict';

        var hookCallback;

        function hooks() {
            return hookCallback.apply(null, arguments);
        }

        // This is done to register the method called with moment()
        // without creating circular dependencies.
        function setHookCallback(callback) {
            hookCallback = callback;
        }

        function isArray(input) {
            return (
                input instanceof Array ||
                Object.prototype.toString.call(input) === '[object Array]'
            );
        }

        function isObject(input) {
            // IE8 will treat undefined and null as object if it wasn't for
            // input != null
            return (
                input != null &&
                Object.prototype.toString.call(input) === '[object Object]'
            );
        }

        function hasOwnProp(a, b) {
            return Object.prototype.hasOwnProperty.call(a, b);
        }

        function isObjectEmpty(obj) {
            if (Object.getOwnPropertyNames) {
                return Object.getOwnPropertyNames(obj).length === 0;
            } else {
                var k;
                for (k in obj) {
                    if (hasOwnProp(obj, k)) {
                        return false;
                    }
                }
                return true;
            }
        }

        function isUndefined(input) {
            return input === void 0;
        }

        function isNumber(input) {
            return (
                typeof input === 'number' ||
                Object.prototype.toString.call(input) === '[object Number]'
            );
        }

        function isDate(input) {
            return (
                input instanceof Date ||
                Object.prototype.toString.call(input) === '[object Date]'
            );
        }

        function map(arr, fn) {
            var res = [],
                i;
            for (i = 0; i < arr.length; ++i) {
                res.push(fn(arr[i], i));
            }
            return res;
        }

        function extend(a, b) {
            for (var i in b) {
                if (hasOwnProp(b, i)) {
                    a[i] = b[i];
                }
            }

            if (hasOwnProp(b, 'toString')) {
                a.toString = b.toString;
            }

            if (hasOwnProp(b, 'valueOf')) {
                a.valueOf = b.valueOf;
            }

            return a;
        }

        function createUTC(input, format, locale, strict) {
            return createLocalOrUTC(input, format, locale, strict, true).utc();
        }

        function defaultParsingFlags() {
            // We need to deep clone this object.
            return {
                empty: false,
                unusedTokens: [],
                unusedInput: [],
                overflow: -2,
                charsLeftOver: 0,
                nullInput: false,
                invalidEra: null,
                invalidMonth: null,
                invalidFormat: false,
                userInvalidated: false,
                iso: false,
                parsedDateParts: [],
                era: null,
                meridiem: null,
                rfc2822: false,
                weekdayMismatch: false,
            };
        }

        function getParsingFlags(m) {
            if (m._pf == null) {
                m._pf = defaultParsingFlags();
            }
            return m._pf;
        }

        var some;
        if (Array.prototype.some) {
            some = Array.prototype.some;
        } else {
            some = function (fun) {
                var t = Object(this),
                    len = t.length >>> 0,
                    i;

                for (i = 0; i < len; i++) {
                    if (i in t && fun.call(this, t[i], i, t)) {
                        return true;
                    }
                }

                return false;
            };
        }

        function isValid(m) {
            if (m._isValid == null) {
                var flags = getParsingFlags(m),
                    parsedParts = some.call(flags.parsedDateParts, function (i) {
                        return i != null;
                    }),
                    isNowValid =
                        !isNaN(m._d.getTime()) &&
                        flags.overflow < 0 &&
                        !flags.empty &&
                        !flags.invalidEra &&
                        !flags.invalidMonth &&
                        !flags.invalidWeekday &&
                        !flags.weekdayMismatch &&
                        !flags.nullInput &&
                        !flags.invalidFormat &&
                        !flags.userInvalidated &&
                        (!flags.meridiem || (flags.meridiem && parsedParts));

                if (m._strict) {
                    isNowValid =
                        isNowValid &&
                        flags.charsLeftOver === 0 &&
                        flags.unusedTokens.length === 0 &&
                        flags.bigHour === undefined;
                }

                if (Object.isFrozen == null || !Object.isFrozen(m)) {
                    m._isValid = isNowValid;
                } else {
                    return isNowValid;
                }
            }
            return m._isValid;
        }

        function createInvalid(flags) {
            var m = createUTC(NaN);
            if (flags != null) {
                extend(getParsingFlags(m), flags);
            } else {
                getParsingFlags(m).userInvalidated = true;
            }

            return m;
        }

        // Plugins that add properties should also add the key here (null value),
        // so we can properly clone ourselves.
        var momentProperties = (hooks.momentProperties = []),
            updateInProgress = false;

        function copyConfig(to, from) {
            var i, prop, val;

            if (!isUndefined(from._isAMomentObject)) {
                to._isAMomentObject = from._isAMomentObject;
            }
            if (!isUndefined(from._i)) {
                to._i = from._i;
            }
            if (!isUndefined(from._f)) {
                to._f = from._f;
            }
            if (!isUndefined(from._l)) {
                to._l = from._l;
            }
            if (!isUndefined(from._strict)) {
                to._strict = from._strict;
            }
            if (!isUndefined(from._tzm)) {
                to._tzm = from._tzm;
            }
            if (!isUndefined(from._isUTC)) {
                to._isUTC = from._isUTC;
            }
            if (!isUndefined(from._offset)) {
                to._offset = from._offset;
            }
            if (!isUndefined(from._pf)) {
                to._pf = getParsingFlags(from);
            }
            if (!isUndefined(from._locale)) {
                to._locale = from._locale;
            }

            if (momentProperties.length > 0) {
                for (i = 0; i < momentProperties.length; i++) {
                    prop = momentProperties[i];
                    val = from[prop];
                    if (!isUndefined(val)) {
                        to[prop] = val;
                    }
                }
            }

            return to;
        }

        // Moment prototype object
        function Moment(config) {
            copyConfig(this, config);
            this._d = new Date(config._d != null ? config._d.getTime() : NaN);
            if (!this.isValid()) {
                this._d = new Date(NaN);
            }
            // Prevent infinite loop in case updateOffset creates new moment
            // objects.
            if (updateInProgress === false) {
                updateInProgress = true;
                hooks.updateOffset(this);
                updateInProgress = false;
            }
        }

        function isMoment(obj) {
            return (
                obj instanceof Moment || (obj != null && obj._isAMomentObject != null)
            );
        }

        function warn(msg) {
            if (
                hooks.suppressDeprecationWarnings === false &&
                typeof console !== 'undefined' &&
                console.warn
            ) {
                console.warn('Deprecation warning: ' + msg);
            }
        }

        function deprecate(msg, fn) {
            var firstTime = true;

            return extend(function () {
                if (hooks.deprecationHandler != null) {
                    hooks.deprecationHandler(null, msg);
                }
                if (firstTime) {
                    var args = [],
                        arg,
                        i,
                        key;
                    for (i = 0; i < arguments.length; i++) {
                        arg = '';
                        if (typeof arguments[i] === 'object') {
                            arg += '\n[' + i + '] ';
                            for (key in arguments[0]) {
                                if (hasOwnProp(arguments[0], key)) {
                                    arg += key + ': ' + arguments[0][key] + ', ';
                                }
                            }
                            arg = arg.slice(0, -2); // Remove trailing comma and space
                        } else {
                            arg = arguments[i];
                        }
                        args.push(arg);
                    }
                    warn(
                        msg +
                        '\nArguments: ' +
                        Array.prototype.slice.call(args).join('') +
                        '\n' +
                        new Error().stack
                    );
                    firstTime = false;
                }
                return fn.apply(this, arguments);
            }, fn);
        }

        var deprecations = {};

        function deprecateSimple(name, msg) {
            if (hooks.deprecationHandler != null) {
                hooks.deprecationHandler(name, msg);
            }
            if (!deprecations[name]) {
                warn(msg);
                deprecations[name] = true;
            }
        }

        hooks.suppressDeprecationWarnings = false;
        hooks.deprecationHandler = null;

        function isFunction(input) {
            return (
                (typeof Function !== 'undefined' && input instanceof Function) ||
                Object.prototype.toString.call(input) === '[object Function]'
            );
        }

        function set(config) {
            var prop, i;
            for (i in config) {
                if (hasOwnProp(config, i)) {
                    prop = config[i];
                    if (isFunction(prop)) {
                        this[i] = prop;
                    } else {
                        this['_' + i] = prop;
                    }
                }
            }
            this._config = config;
            // Lenient ordinal parsing accepts just a number in addition to
            // number + (possibly) stuff coming from _dayOfMonthOrdinalParse.
            // TODO: Remove "ordinalParse" fallback in next major release.
            this._dayOfMonthOrdinalParseLenient = new RegExp(
                (this._dayOfMonthOrdinalParse.source || this._ordinalParse.source) +
                '|' +
                /\d{1,2}/.source
            );
        }

        function mergeConfigs(parentConfig, childConfig) {
            var res = extend({}, parentConfig),
                prop;
            for (prop in childConfig) {
                if (hasOwnProp(childConfig, prop)) {
                    if (isObject(parentConfig[prop]) && isObject(childConfig[prop])) {
                        res[prop] = {};
                        extend(res[prop], parentConfig[prop]);
                        extend(res[prop], childConfig[prop]);
                    } else if (childConfig[prop] != null) {
                        res[prop] = childConfig[prop];
                    } else {
                        delete res[prop];
                    }
                }
            }
            for (prop in parentConfig) {
                if (
                    hasOwnProp(parentConfig, prop) &&
                    !hasOwnProp(childConfig, prop) &&
                    isObject(parentConfig[prop])
                ) {
                    // make sure changes to properties don't modify parent config
                    res[prop] = extend({}, res[prop]);
                }
            }
            return res;
        }

        function Locale(config) {
            if (config != null) {
                this.set(config);
            }
        }

        var keys;

        if (Object.keys) {
            keys = Object.keys;
        } else {
            keys = function (obj) {
                var i,
                    res = [];
                for (i in obj) {
                    if (hasOwnProp(obj, i)) {
                        res.push(i);
                    }
                }
                return res;
            };
        }

        var defaultCalendar = {
            sameDay: '[Today at] LT',
            nextDay: '[Tomorrow at] LT',
            nextWeek: 'dddd [at] LT',
            lastDay: '[Yesterday at] LT',
            lastWeek: '[Last] dddd [at] LT',
            sameElse: 'L',
        };

        function calendar(key, mom, now) {
            var output = this._calendar[key] || this._calendar['sameElse'];
            return isFunction(output) ? output.call(mom, now) : output;
        }

        function zeroFill(number, targetLength, forceSign) {
            var absNumber = '' + Math.abs(number),
                zerosToFill = targetLength - absNumber.length,
                sign = number >= 0;
            return (
                (sign ? (forceSign ? '+' : '') : '-') +
                Math.pow(10, Math.max(0, zerosToFill)).toString().substr(1) +
                absNumber
            );
        }

        var formattingTokens = /(\[[^\[]*\])|(\\)?([Hh]mm(ss)?|Mo|MM?M?M?|Do|DDDo|DD?D?D?|ddd?d?|do?|w[o|w]?|W[o|W]?|Qo?|N{1,5}|YYYYYY|YYYYY|YYYY|YY|y{2,4}|yo?|gg(ggg?)?|GG(GGG?)?|e|E|a|A|hh?|HH?|kk?|mm?|ss?|S{1,9}|x|X|zz?|ZZ?|.)/g,
            localFormattingTokens = /(\[[^\[]*\])|(\\)?(LTS|LT|LL?L?L?|l{1,4})/g,
            formatFunctions = {},
            formatTokenFunctions = {};

        // token:    'M'
        // padded:   ['MM', 2]
        // ordinal:  'Mo'
        // callback: function () { this.month() + 1 }
        function addFormatToken(token, padded, ordinal, callback) {
            var func = callback;
            if (typeof callback === 'string') {
                func = function () {
                    return this[callback]();
                };
            }
            if (token) {
                formatTokenFunctions[token] = func;
            }
            if (padded) {
                formatTokenFunctions[padded[0]] = function () {
                    return zeroFill(func.apply(this, arguments), padded[1], padded[2]);
                };
            }
            if (ordinal) {
                formatTokenFunctions[ordinal] = function () {
                    return this.localeData().ordinal(
                        func.apply(this, arguments),
                        token
                    );
                };
            }
        }

        function removeFormattingTokens(input) {
            if (input.match(/\[[\s\S]/)) {
                return input.replace(/^\[|\]$/g, '');
            }
            return input.replace(/\\/g, '');
        }

        function makeFormatFunction(format) {
            var array = format.match(formattingTokens),
                i,
                length;

            for (i = 0, length = array.length; i < length; i++) {
                if (formatTokenFunctions[array[i]]) {
                    array[i] = formatTokenFunctions[array[i]];
                } else {
                    array[i] = removeFormattingTokens(array[i]);
                }
            }

            return function (mom) {
                var output = '',
                    i;
                for (i = 0; i < length; i++) {
                    output += isFunction(array[i])
                        ? array[i].call(mom, format)
                        : array[i];
                }
                return output;
            };
        }

        // format date using native date object
        function formatMoment(m, format) {
            if (!m.isValid()) {
                return m.localeData().invalidDate();
            }

            format = expandFormat(format, m.localeData());
            formatFunctions[format] =
                formatFunctions[format] || makeFormatFunction(format);

            return formatFunctions[format](m);
        }

        function expandFormat(format, locale) {
            var i = 5;

            function replaceLongDateFormatTokens(input) {
                return locale.longDateFormat(input) || input;
            }

            localFormattingTokens.lastIndex = 0;
            while (i >= 0 && localFormattingTokens.test(format)) {
                format = format.replace(
                    localFormattingTokens,
                    replaceLongDateFormatTokens
                );
                localFormattingTokens.lastIndex = 0;
                i -= 1;
            }

            return format;
        }

        var defaultLongDateFormat = {
            LTS: 'h:mm:ss A',
            LT: 'h:mm A',
            L: 'MM/DD/YYYY',
            LL: 'MMMM D, YYYY',
            LLL: 'MMMM D, YYYY h:mm A',
            LLLL: 'dddd, MMMM D, YYYY h:mm A',
        };

        function longDateFormat(key) {
            var format = this._longDateFormat[key],
                formatUpper = this._longDateFormat[key.toUpperCase()];

            if (format || !formatUpper) {
                return format;
            }

            this._longDateFormat[key] = formatUpper
                .match(formattingTokens)
                .map(function (tok) {
                    if (
                        tok === 'MMMM' ||
                        tok === 'MM' ||
                        tok === 'DD' ||
                        tok === 'dddd'
                    ) {
                        return tok.slice(1);
                    }
                    return tok;
                })
                .join('');

            return this._longDateFormat[key];
        }

        var defaultInvalidDate = 'Invalid date';

        function invalidDate() {
            return this._invalidDate;
        }

        var defaultOrdinal = '%d',
            defaultDayOfMonthOrdinalParse = /\d{1,2}/;

        function ordinal(number) {
            return this._ordinal.replace('%d', number);
        }

        var defaultRelativeTime = {
            future: 'in %s',
            past: '%s ago',
            s: 'a few seconds',
            ss: '%d seconds',
            m: 'a minute',
            mm: '%d minutes',
            h: 'an hour',
            hh: '%d hours',
            d: 'a day',
            dd: '%d days',
            w: 'a week',
            ww: '%d weeks',
            M: 'a month',
            MM: '%d months',
            y: 'a year',
            yy: '%d years',
        };

        function relativeTime(number, withoutSuffix, string, isFuture) {
            var output = this._relativeTime[string];
            return isFunction(output)
                ? output(number, withoutSuffix, string, isFuture)
                : output.replace(/%d/i, number);
        }

        function pastFuture(diff, output) {
            var format = this._relativeTime[diff > 0 ? 'future' : 'past'];
            return isFunction(format) ? format(output) : format.replace(/%s/i, output);
        }

        var aliases = {};

        function addUnitAlias(unit, shorthand) {
            var lowerCase = unit.toLowerCase();
            aliases[lowerCase] = aliases[lowerCase + 's'] = aliases[shorthand] = unit;
        }

        function normalizeUnits(units) {
            return typeof units === 'string'
                ? aliases[units] || aliases[units.toLowerCase()]
                : undefined;
        }

        function normalizeObjectUnits(inputObject) {
            var normalizedInput = {},
                normalizedProp,
                prop;

            for (prop in inputObject) {
                if (hasOwnProp(inputObject, prop)) {
                    normalizedProp = normalizeUnits(prop);
                    if (normalizedProp) {
                        normalizedInput[normalizedProp] = inputObject[prop];
                    }
                }
            }

            return normalizedInput;
        }

        var priorities = {};

        function addUnitPriority(unit, priority) {
            priorities[unit] = priority;
        }

        function getPrioritizedUnits(unitsObj) {
            var units = [],
                u;
            for (u in unitsObj) {
                if (hasOwnProp(unitsObj, u)) {
                    units.push({ unit: u, priority: priorities[u] });
                }
            }
            units.sort(function (a, b) {
                return a.priority - b.priority;
            });
            return units;
        }

        function isLeapYear(year) {
            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
        }

        function absFloor(number) {
            if (number < 0) {
                // -0 -> 0
                return Math.ceil(number) || 0;
            } else {
                return Math.floor(number);
            }
        }

        function toInt(argumentForCoercion) {
            var coercedNumber = +argumentForCoercion,
                value = 0;

            if (coercedNumber !== 0 && isFinite(coercedNumber)) {
                value = absFloor(coercedNumber);
            }

            return value;
        }

        function makeGetSet(unit, keepTime) {
            return function (value) {
                if (value != null) {
                    set$1(this, unit, value);
                    hooks.updateOffset(this, keepTime);
                    return this;
                } else {
                    return get(this, unit);
                }
            };
        }

        function get(mom, unit) {
            return mom.isValid()
                ? mom._d['get' + (mom._isUTC ? 'UTC' : '') + unit]()
                : NaN;
        }

        function set$1(mom, unit, value) {
            if (mom.isValid() && !isNaN(value)) {
                if (
                    unit === 'FullYear' &&
                    isLeapYear(mom.year()) &&
                    mom.month() === 1 &&
                    mom.date() === 29
                ) {
                    value = toInt(value);
                    mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](
                        value,
                        mom.month(),
                        daysInMonth(value, mom.month())
                    );
                } else {
                    mom._d['set' + (mom._isUTC ? 'UTC' : '') + unit](value);
                }
            }
        }

        // MOMENTS

        function stringGet(units) {
            units = normalizeUnits(units);
            if (isFunction(this[units])) {
                return this[units]();
            }
            return this;
        }

        function stringSet(units, value) {
            if (typeof units === 'object') {
                units = normalizeObjectUnits(units);
                var prioritized = getPrioritizedUnits(units),
                    i;
                for (i = 0; i < prioritized.length; i++) {
                    this[prioritized[i].unit](units[prioritized[i].unit]);
                }
            } else {
                units = normalizeUnits(units);
                if (isFunction(this[units])) {
                    return this[units](value);
                }
            }
            return this;
        }

        var match1 = /\d/, //       0 - 9
            match2 = /\d\d/, //      00 - 99
            match3 = /\d{3}/, //     000 - 999
            match4 = /\d{4}/, //    0000 - 9999
            match6 = /[+-]?\d{6}/, // -999999 - 999999
            match1to2 = /\d\d?/, //       0 - 99
            match3to4 = /\d\d\d\d?/, //     999 - 9999
            match5to6 = /\d\d\d\d\d\d?/, //   99999 - 999999
            match1to3 = /\d{1,3}/, //       0 - 999
            match1to4 = /\d{1,4}/, //       0 - 9999
            match1to6 = /[+-]?\d{1,6}/, // -999999 - 999999
            matchUnsigned = /\d+/, //       0 - inf
            matchSigned = /[+-]?\d+/, //    -inf - inf
            matchOffset = /Z|[+-]\d\d:?\d\d/gi, // +00:00 -00:00 +0000 -0000 or Z
            matchShortOffset = /Z|[+-]\d\d(?::?\d\d)?/gi, // +00 -00 +00:00 -00:00 +0000 -0000 or Z
            matchTimestamp = /[+-]?\d+(\.\d{1,3})?/, // 123456789 123456789.123
            // any word (or two) characters or numbers including two/three word month in arabic.
            // includes scottish gaelic two word and hyphenated months
            matchWord = /[0-9]{0,256}['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFF07\uFF10-\uFFEF]{1,256}|[\u0600-\u06FF\/]{1,256}(\s*?[\u0600-\u06FF]{1,256}){1,2}/i,
            regexes;

        regexes = {};

        function addRegexToken(token, regex, strictRegex) {
            regexes[token] = isFunction(regex)
                ? regex
                : function (isStrict, localeData) {
                    return isStrict && strictRegex ? strictRegex : regex;
                };
        }

        function getParseRegexForToken(token, config) {
            if (!hasOwnProp(regexes, token)) {
                return new RegExp(unescapeFormat(token));
            }

            return regexes[token](config._strict, config._locale);
        }

        // Code from http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript
        function unescapeFormat(s) {
            return regexEscape(
                s
                    .replace('\\', '')
                    .replace(/\\(\[)|\\(\])|\[([^\]\[]*)\]|\\(.)/g, function (
                        matched,
                        p1,
                        p2,
                        p3,
                        p4
                    ) {
                        return p1 || p2 || p3 || p4;
                    })
            );
        }

        function regexEscape(s) {
            return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        }

        var tokens = {};

        function addParseToken(token, callback) {
            var i,
                func = callback;
            if (typeof token === 'string') {
                token = [token];
            }
            if (isNumber(callback)) {
                func = function (input, array) {
                    array[callback] = toInt(input);
                };
            }
            for (i = 0; i < token.length; i++) {
                tokens[token[i]] = func;
            }
        }

        function addWeekParseToken(token, callback) {
            addParseToken(token, function (input, array, config, token) {
                config._w = config._w || {};
                callback(input, config._w, config, token);
            });
        }

        function addTimeToArrayFromToken(token, input, config) {
            if (input != null && hasOwnProp(tokens, token)) {
                tokens[token](input, config._a, config, token);
            }
        }

        var YEAR = 0,
            MONTH = 1,
            DATE = 2,
            HOUR = 3,
            MINUTE = 4,
            SECOND = 5,
            MILLISECOND = 6,
            WEEK = 7,
            WEEKDAY = 8;

        function mod(n, x) {
            return ((n % x) + x) % x;
        }

        var indexOf;

        if (Array.prototype.indexOf) {
            indexOf = Array.prototype.indexOf;
        } else {
            indexOf = function (o) {
                // I know
                var i;
                for (i = 0; i < this.length; ++i) {
                    if (this[i] === o) {
                        return i;
                    }
                }
                return -1;
            };
        }

        function daysInMonth(year, month) {
            if (isNaN(year) || isNaN(month)) {
                return NaN;
            }
            var modMonth = mod(month, 12);
            year += (month - modMonth) / 12;
            return modMonth === 1
                ? isLeapYear(year)
                    ? 29
                    : 28
                : 31 - ((modMonth % 7) % 2);
        }

        // FORMATTING

        addFormatToken('M', ['MM', 2], 'Mo', function () {
            return this.month() + 1;
        });

        addFormatToken('MMM', 0, 0, function (format) {
            return this.localeData().monthsShort(this, format);
        });

        addFormatToken('MMMM', 0, 0, function (format) {
            return this.localeData().months(this, format);
        });

        // ALIASES

        addUnitAlias('month', 'M');

        // PRIORITY

        addUnitPriority('month', 8);

        // PARSING

        addRegexToken('M', match1to2);
        addRegexToken('MM', match1to2, match2);
        addRegexToken('MMM', function (isStrict, locale) {
            return locale.monthsShortRegex(isStrict);
        });
        addRegexToken('MMMM', function (isStrict, locale) {
            return locale.monthsRegex(isStrict);
        });

        addParseToken(['M', 'MM'], function (input, array) {
            array[MONTH] = toInt(input) - 1;
        });

        addParseToken(['MMM', 'MMMM'], function (input, array, config, token) {
            var month = config._locale.monthsParse(input, token, config._strict);
            // if we didn't find a month name, mark the date as invalid.
            if (month != null) {
                array[MONTH] = month;
            } else {
                getParsingFlags(config).invalidMonth = input;
            }
        });

        // LOCALES

        var defaultLocaleMonths = 'January_February_March_April_May_June_July_August_September_October_November_December'.split(
            '_'
        ),
            defaultLocaleMonthsShort = 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split(
                '_'
            ),
            MONTHS_IN_FORMAT = /D[oD]?(\[[^\[\]]*\]|\s)+MMMM?/,
            defaultMonthsShortRegex = matchWord,
            defaultMonthsRegex = matchWord;

        function localeMonths(m, format) {
            if (!m) {
                return isArray(this._months)
                    ? this._months
                    : this._months['standalone'];
            }
            return isArray(this._months)
                ? this._months[m.month()]
                : this._months[
                (this._months.isFormat || MONTHS_IN_FORMAT).test(format)
                    ? 'format'
                    : 'standalone'
                ][m.month()];
        }

        function localeMonthsShort(m, format) {
            if (!m) {
                return isArray(this._monthsShort)
                    ? this._monthsShort
                    : this._monthsShort['standalone'];
            }
            return isArray(this._monthsShort)
                ? this._monthsShort[m.month()]
                : this._monthsShort[
                MONTHS_IN_FORMAT.test(format) ? 'format' : 'standalone'
                ][m.month()];
        }

        function handleStrictParse(monthName, format, strict) {
            var i,
                ii,
                mom,
                llc = monthName.toLocaleLowerCase();
            if (!this._monthsParse) {
                // this is not used
                this._monthsParse = [];
                this._longMonthsParse = [];
                this._shortMonthsParse = [];
                for (i = 0; i < 12; ++i) {
                    mom = createUTC([2000, i]);
                    this._shortMonthsParse[i] = this.monthsShort(
                        mom,
                        ''
                    ).toLocaleLowerCase();
                    this._longMonthsParse[i] = this.months(mom, '').toLocaleLowerCase();
                }
            }

            if (strict) {
                if (format === 'MMM') {
                    ii = indexOf.call(this._shortMonthsParse, llc);
                    return ii !== -1 ? ii : null;
                } else {
                    ii = indexOf.call(this._longMonthsParse, llc);
                    return ii !== -1 ? ii : null;
                }
            } else {
                if (format === 'MMM') {
                    ii = indexOf.call(this._shortMonthsParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._longMonthsParse, llc);
                    return ii !== -1 ? ii : null;
                } else {
                    ii = indexOf.call(this._longMonthsParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._shortMonthsParse, llc);
                    return ii !== -1 ? ii : null;
                }
            }
        }

        function localeMonthsParse(monthName, format, strict) {
            var i, mom, regex;

            if (this._monthsParseExact) {
                return handleStrictParse.call(this, monthName, format, strict);
            }

            if (!this._monthsParse) {
                this._monthsParse = [];
                this._longMonthsParse = [];
                this._shortMonthsParse = [];
            }

            // TODO: add sorting
            // Sorting makes sure if one month (or abbr) is a prefix of another
            // see sorting in computeMonthsParse
            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                mom = createUTC([2000, i]);
                if (strict && !this._longMonthsParse[i]) {
                    this._longMonthsParse[i] = new RegExp(
                        '^' + this.months(mom, '').replace('.', '') + '$',
                        'i'
                    );
                    this._shortMonthsParse[i] = new RegExp(
                        '^' + this.monthsShort(mom, '').replace('.', '') + '$',
                        'i'
                    );
                }
                if (!strict && !this._monthsParse[i]) {
                    regex =
                        '^' + this.months(mom, '') + '|^' + this.monthsShort(mom, '');
                    this._monthsParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (
                    strict &&
                    format === 'MMMM' &&
                    this._longMonthsParse[i].test(monthName)
                ) {
                    return i;
                } else if (
                    strict &&
                    format === 'MMM' &&
                    this._shortMonthsParse[i].test(monthName)
                ) {
                    return i;
                } else if (!strict && this._monthsParse[i].test(monthName)) {
                    return i;
                }
            }
        }

        // MOMENTS

        function setMonth(mom, value) {
            var dayOfMonth;

            if (!mom.isValid()) {
                // No op
                return mom;
            }

            if (typeof value === 'string') {
                if (/^\d+$/.test(value)) {
                    value = toInt(value);
                } else {
                    value = mom.localeData().monthsParse(value);
                    // TODO: Another silent failure?
                    if (!isNumber(value)) {
                        return mom;
                    }
                }
            }

            dayOfMonth = Math.min(mom.date(), daysInMonth(mom.year(), value));
            mom._d['set' + (mom._isUTC ? 'UTC' : '') + 'Month'](value, dayOfMonth);
            return mom;
        }

        function getSetMonth(value) {
            if (value != null) {
                setMonth(this, value);
                hooks.updateOffset(this, true);
                return this;
            } else {
                return get(this, 'Month');
            }
        }

        function getDaysInMonth() {
            return daysInMonth(this.year(), this.month());
        }

        function monthsShortRegex(isStrict) {
            if (this._monthsParseExact) {
                if (!hasOwnProp(this, '_monthsRegex')) {
                    computeMonthsParse.call(this);
                }
                if (isStrict) {
                    return this._monthsShortStrictRegex;
                } else {
                    return this._monthsShortRegex;
                }
            } else {
                if (!hasOwnProp(this, '_monthsShortRegex')) {
                    this._monthsShortRegex = defaultMonthsShortRegex;
                }
                return this._monthsShortStrictRegex && isStrict
                    ? this._monthsShortStrictRegex
                    : this._monthsShortRegex;
            }
        }

        function monthsRegex(isStrict) {
            if (this._monthsParseExact) {
                if (!hasOwnProp(this, '_monthsRegex')) {
                    computeMonthsParse.call(this);
                }
                if (isStrict) {
                    return this._monthsStrictRegex;
                } else {
                    return this._monthsRegex;
                }
            } else {
                if (!hasOwnProp(this, '_monthsRegex')) {
                    this._monthsRegex = defaultMonthsRegex;
                }
                return this._monthsStrictRegex && isStrict
                    ? this._monthsStrictRegex
                    : this._monthsRegex;
            }
        }

        function computeMonthsParse() {
            function cmpLenRev(a, b) {
                return b.length - a.length;
            }

            var shortPieces = [],
                longPieces = [],
                mixedPieces = [],
                i,
                mom;
            for (i = 0; i < 12; i++) {
                // make the regex if we don't have it already
                mom = createUTC([2000, i]);
                shortPieces.push(this.monthsShort(mom, ''));
                longPieces.push(this.months(mom, ''));
                mixedPieces.push(this.months(mom, ''));
                mixedPieces.push(this.monthsShort(mom, ''));
            }
            // Sorting makes sure if one month (or abbr) is a prefix of another it
            // will match the longer piece.
            shortPieces.sort(cmpLenRev);
            longPieces.sort(cmpLenRev);
            mixedPieces.sort(cmpLenRev);
            for (i = 0; i < 12; i++) {
                shortPieces[i] = regexEscape(shortPieces[i]);
                longPieces[i] = regexEscape(longPieces[i]);
            }
            for (i = 0; i < 24; i++) {
                mixedPieces[i] = regexEscape(mixedPieces[i]);
            }

            this._monthsRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
            this._monthsShortRegex = this._monthsRegex;
            this._monthsStrictRegex = new RegExp(
                '^(' + longPieces.join('|') + ')',
                'i'
            );
            this._monthsShortStrictRegex = new RegExp(
                '^(' + shortPieces.join('|') + ')',
                'i'
            );
        }

        // FORMATTING

        addFormatToken('Y', 0, 0, function () {
            var y = this.year();
            return y <= 9999 ? zeroFill(y, 4) : '+' + y;
        });

        addFormatToken(0, ['YY', 2], 0, function () {
            return this.year() % 100;
        });

        addFormatToken(0, ['YYYY', 4], 0, 'year');
        addFormatToken(0, ['YYYYY', 5], 0, 'year');
        addFormatToken(0, ['YYYYYY', 6, true], 0, 'year');

        // ALIASES

        addUnitAlias('year', 'y');

        // PRIORITIES

        addUnitPriority('year', 1);

        // PARSING

        addRegexToken('Y', matchSigned);
        addRegexToken('YY', match1to2, match2);
        addRegexToken('YYYY', match1to4, match4);
        addRegexToken('YYYYY', match1to6, match6);
        addRegexToken('YYYYYY', match1to6, match6);

        addParseToken(['YYYYY', 'YYYYYY'], YEAR);
        addParseToken('YYYY', function (input, array) {
            array[YEAR] =
                input.length === 2 ? hooks.parseTwoDigitYear(input) : toInt(input);
        });
        addParseToken('YY', function (input, array) {
            array[YEAR] = hooks.parseTwoDigitYear(input);
        });
        addParseToken('Y', function (input, array) {
            array[YEAR] = parseInt(input, 10);
        });

        // HELPERS

        function daysInYear(year) {
            return isLeapYear(year) ? 366 : 365;
        }

        // HOOKS

        hooks.parseTwoDigitYear = function (input) {
            return toInt(input) + (toInt(input) > 68 ? 1900 : 2000);
        };

        // MOMENTS

        var getSetYear = makeGetSet('FullYear', true);

        function getIsLeapYear() {
            return isLeapYear(this.year());
        }

        function createDate(y, m, d, h, M, s, ms) {
            // can't just apply() to create a date:
            // https://stackoverflow.com/q/181348
            var date;
            // the date constructor remaps years 0-99 to 1900-1999
            if (y < 100 && y >= 0) {
                // preserve leap years using a full 400 year cycle, then reset
                date = new Date(y + 400, m, d, h, M, s, ms);
                if (isFinite(date.getFullYear())) {
                    date.setFullYear(y);
                }
            } else {
                date = new Date(y, m, d, h, M, s, ms);
            }

            return date;
        }

        function createUTCDate(y) {
            var date, args;
            // the Date.UTC function remaps years 0-99 to 1900-1999
            if (y < 100 && y >= 0) {
                args = Array.prototype.slice.call(arguments);
                // preserve leap years using a full 400 year cycle, then reset
                args[0] = y + 400;
                date = new Date(Date.UTC.apply(null, args));
                if (isFinite(date.getUTCFullYear())) {
                    date.setUTCFullYear(y);
                }
            } else {
                date = new Date(Date.UTC.apply(null, arguments));
            }

            return date;
        }

        // start-of-first-week - start-of-year
        function firstWeekOffset(year, dow, doy) {
            var // first-week day -- which january is always in the first week (4 for iso, 1 for other)
                fwd = 7 + dow - doy,
                // first-week day local weekday -- which local weekday is fwd
                fwdlw = (7 + createUTCDate(year, 0, fwd).getUTCDay() - dow) % 7;

            return -fwdlw + fwd - 1;
        }

        // https://en.wikipedia.org/wiki/ISO_week_date#Calculating_a_date_given_the_year.2C_week_number_and_weekday
        function dayOfYearFromWeeks(year, week, weekday, dow, doy) {
            var localWeekday = (7 + weekday - dow) % 7,
                weekOffset = firstWeekOffset(year, dow, doy),
                dayOfYear = 1 + 7 * (week - 1) + localWeekday + weekOffset,
                resYear,
                resDayOfYear;

            if (dayOfYear <= 0) {
                resYear = year - 1;
                resDayOfYear = daysInYear(resYear) + dayOfYear;
            } else if (dayOfYear > daysInYear(year)) {
                resYear = year + 1;
                resDayOfYear = dayOfYear - daysInYear(year);
            } else {
                resYear = year;
                resDayOfYear = dayOfYear;
            }

            return {
                year: resYear,
                dayOfYear: resDayOfYear,
            };
        }

        function weekOfYear(mom, dow, doy) {
            var weekOffset = firstWeekOffset(mom.year(), dow, doy),
                week = Math.floor((mom.dayOfYear() - weekOffset - 1) / 7) + 1,
                resWeek,
                resYear;

            if (week < 1) {
                resYear = mom.year() - 1;
                resWeek = week + weeksInYear(resYear, dow, doy);
            } else if (week > weeksInYear(mom.year(), dow, doy)) {
                resWeek = week - weeksInYear(mom.year(), dow, doy);
                resYear = mom.year() + 1;
            } else {
                resYear = mom.year();
                resWeek = week;
            }

            return {
                week: resWeek,
                year: resYear,
            };
        }

        function weeksInYear(year, dow, doy) {
            var weekOffset = firstWeekOffset(year, dow, doy),
                weekOffsetNext = firstWeekOffset(year + 1, dow, doy);
            return (daysInYear(year) - weekOffset + weekOffsetNext) / 7;
        }

        // FORMATTING

        addFormatToken('w', ['ww', 2], 'wo', 'week');
        addFormatToken('W', ['WW', 2], 'Wo', 'isoWeek');

        // ALIASES

        addUnitAlias('week', 'w');
        addUnitAlias('isoWeek', 'W');

        // PRIORITIES

        addUnitPriority('week', 5);
        addUnitPriority('isoWeek', 5);

        // PARSING

        addRegexToken('w', match1to2);
        addRegexToken('ww', match1to2, match2);
        addRegexToken('W', match1to2);
        addRegexToken('WW', match1to2, match2);

        addWeekParseToken(['w', 'ww', 'W', 'WW'], function (
            input,
            week,
            config,
            token
        ) {
            week[token.substr(0, 1)] = toInt(input);
        });

        // HELPERS

        // LOCALES

        function localeWeek(mom) {
            return weekOfYear(mom, this._week.dow, this._week.doy).week;
        }

        var defaultLocaleWeek = {
            dow: 0, // Sunday is the first day of the week.
            doy: 6, // The week that contains Jan 6th is the first week of the year.
        };

        function localeFirstDayOfWeek() {
            return this._week.dow;
        }

        function localeFirstDayOfYear() {
            return this._week.doy;
        }

        // MOMENTS

        function getSetWeek(input) {
            var week = this.localeData().week(this);
            return input == null ? week : this.add((input - week) * 7, 'd');
        }

        function getSetISOWeek(input) {
            var week = weekOfYear(this, 1, 4).week;
            return input == null ? week : this.add((input - week) * 7, 'd');
        }

        // FORMATTING

        addFormatToken('d', 0, 'do', 'day');

        addFormatToken('dd', 0, 0, function (format) {
            return this.localeData().weekdaysMin(this, format);
        });

        addFormatToken('ddd', 0, 0, function (format) {
            return this.localeData().weekdaysShort(this, format);
        });

        addFormatToken('dddd', 0, 0, function (format) {
            return this.localeData().weekdays(this, format);
        });

        addFormatToken('e', 0, 0, 'weekday');
        addFormatToken('E', 0, 0, 'isoWeekday');

        // ALIASES

        addUnitAlias('day', 'd');
        addUnitAlias('weekday', 'e');
        addUnitAlias('isoWeekday', 'E');

        // PRIORITY
        addUnitPriority('day', 11);
        addUnitPriority('weekday', 11);
        addUnitPriority('isoWeekday', 11);

        // PARSING

        addRegexToken('d', match1to2);
        addRegexToken('e', match1to2);
        addRegexToken('E', match1to2);
        addRegexToken('dd', function (isStrict, locale) {
            return locale.weekdaysMinRegex(isStrict);
        });
        addRegexToken('ddd', function (isStrict, locale) {
            return locale.weekdaysShortRegex(isStrict);
        });
        addRegexToken('dddd', function (isStrict, locale) {
            return locale.weekdaysRegex(isStrict);
        });

        addWeekParseToken(['dd', 'ddd', 'dddd'], function (input, week, config, token) {
            var weekday = config._locale.weekdaysParse(input, token, config._strict);
            // if we didn't get a weekday name, mark the date as invalid
            if (weekday != null) {
                week.d = weekday;
            } else {
                getParsingFlags(config).invalidWeekday = input;
            }
        });

        addWeekParseToken(['d', 'e', 'E'], function (input, week, config, token) {
            week[token] = toInt(input);
        });

        // HELPERS

        function parseWeekday(input, locale) {
            if (typeof input !== 'string') {
                return input;
            }

            if (!isNaN(input)) {
                return parseInt(input, 10);
            }

            input = locale.weekdaysParse(input);
            if (typeof input === 'number') {
                return input;
            }

            return null;
        }

        function parseIsoWeekday(input, locale) {
            if (typeof input === 'string') {
                return locale.weekdaysParse(input) % 7 || 7;
            }
            return isNaN(input) ? null : input;
        }

        // LOCALES
        function shiftWeekdays(ws, n) {
            return ws.slice(n, 7).concat(ws.slice(0, n));
        }

        var defaultLocaleWeekdays = 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split(
            '_'
        ),
            defaultLocaleWeekdaysShort = 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
            defaultLocaleWeekdaysMin = 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
            defaultWeekdaysRegex = matchWord,
            defaultWeekdaysShortRegex = matchWord,
            defaultWeekdaysMinRegex = matchWord;

        function localeWeekdays(m, format) {
            var weekdays = isArray(this._weekdays)
                ? this._weekdays
                : this._weekdays[
                m && m !== true && this._weekdays.isFormat.test(format)
                    ? 'format'
                    : 'standalone'
                ];
            return m === true
                ? shiftWeekdays(weekdays, this._week.dow)
                : m
                    ? weekdays[m.day()]
                    : weekdays;
        }

        function localeWeekdaysShort(m) {
            return m === true
                ? shiftWeekdays(this._weekdaysShort, this._week.dow)
                : m
                    ? this._weekdaysShort[m.day()]
                    : this._weekdaysShort;
        }

        function localeWeekdaysMin(m) {
            return m === true
                ? shiftWeekdays(this._weekdaysMin, this._week.dow)
                : m
                    ? this._weekdaysMin[m.day()]
                    : this._weekdaysMin;
        }

        function handleStrictParse$1(weekdayName, format, strict) {
            var i,
                ii,
                mom,
                llc = weekdayName.toLocaleLowerCase();
            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
                this._shortWeekdaysParse = [];
                this._minWeekdaysParse = [];

                for (i = 0; i < 7; ++i) {
                    mom = createUTC([2000, 1]).day(i);
                    this._minWeekdaysParse[i] = this.weekdaysMin(
                        mom,
                        ''
                    ).toLocaleLowerCase();
                    this._shortWeekdaysParse[i] = this.weekdaysShort(
                        mom,
                        ''
                    ).toLocaleLowerCase();
                    this._weekdaysParse[i] = this.weekdays(mom, '').toLocaleLowerCase();
                }
            }

            if (strict) {
                if (format === 'dddd') {
                    ii = indexOf.call(this._weekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                } else if (format === 'ddd') {
                    ii = indexOf.call(this._shortWeekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                } else {
                    ii = indexOf.call(this._minWeekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                }
            } else {
                if (format === 'dddd') {
                    ii = indexOf.call(this._weekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._shortWeekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._minWeekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                } else if (format === 'ddd') {
                    ii = indexOf.call(this._shortWeekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._weekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._minWeekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                } else {
                    ii = indexOf.call(this._minWeekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._weekdaysParse, llc);
                    if (ii !== -1) {
                        return ii;
                    }
                    ii = indexOf.call(this._shortWeekdaysParse, llc);
                    return ii !== -1 ? ii : null;
                }
            }
        }

        function localeWeekdaysParse(weekdayName, format, strict) {
            var i, mom, regex;

            if (this._weekdaysParseExact) {
                return handleStrictParse$1.call(this, weekdayName, format, strict);
            }

            if (!this._weekdaysParse) {
                this._weekdaysParse = [];
                this._minWeekdaysParse = [];
                this._shortWeekdaysParse = [];
                this._fullWeekdaysParse = [];
            }

            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already

                mom = createUTC([2000, 1]).day(i);
                if (strict && !this._fullWeekdaysParse[i]) {
                    this._fullWeekdaysParse[i] = new RegExp(
                        '^' + this.weekdays(mom, '').replace('.', '\\.?') + '$',
                        'i'
                    );
                    this._shortWeekdaysParse[i] = new RegExp(
                        '^' + this.weekdaysShort(mom, '').replace('.', '\\.?') + '$',
                        'i'
                    );
                    this._minWeekdaysParse[i] = new RegExp(
                        '^' + this.weekdaysMin(mom, '').replace('.', '\\.?') + '$',
                        'i'
                    );
                }
                if (!this._weekdaysParse[i]) {
                    regex =
                        '^' +
                        this.weekdays(mom, '') +
                        '|^' +
                        this.weekdaysShort(mom, '') +
                        '|^' +
                        this.weekdaysMin(mom, '');
                    this._weekdaysParse[i] = new RegExp(regex.replace('.', ''), 'i');
                }
                // test the regex
                if (
                    strict &&
                    format === 'dddd' &&
                    this._fullWeekdaysParse[i].test(weekdayName)
                ) {
                    return i;
                } else if (
                    strict &&
                    format === 'ddd' &&
                    this._shortWeekdaysParse[i].test(weekdayName)
                ) {
                    return i;
                } else if (
                    strict &&
                    format === 'dd' &&
                    this._minWeekdaysParse[i].test(weekdayName)
                ) {
                    return i;
                } else if (!strict && this._weekdaysParse[i].test(weekdayName)) {
                    return i;
                }
            }
        }

        // MOMENTS

        function getSetDayOfWeek(input) {
            if (!this.isValid()) {
                return input != null ? this : NaN;
            }
            var day = this._isUTC ? this._d.getUTCDay() : this._d.getDay();
            if (input != null) {
                input = parseWeekday(input, this.localeData());
                return this.add(input - day, 'd');
            } else {
                return day;
            }
        }

        function getSetLocaleDayOfWeek(input) {
            if (!this.isValid()) {
                return input != null ? this : NaN;
            }
            var weekday = (this.day() + 7 - this.localeData()._week.dow) % 7;
            return input == null ? weekday : this.add(input - weekday, 'd');
        }

        function getSetISODayOfWeek(input) {
            if (!this.isValid()) {
                return input != null ? this : NaN;
            }

            // behaves the same as moment#day except
            // as a getter, returns 7 instead of 0 (1-7 range instead of 0-6)
            // as a setter, sunday should belong to the previous week.

            if (input != null) {
                var weekday = parseIsoWeekday(input, this.localeData());
                return this.day(this.day() % 7 ? weekday : weekday - 7);
            } else {
                return this.day() || 7;
            }
        }

        function weekdaysRegex(isStrict) {
            if (this._weekdaysParseExact) {
                if (!hasOwnProp(this, '_weekdaysRegex')) {
                    computeWeekdaysParse.call(this);
                }
                if (isStrict) {
                    return this._weekdaysStrictRegex;
                } else {
                    return this._weekdaysRegex;
                }
            } else {
                if (!hasOwnProp(this, '_weekdaysRegex')) {
                    this._weekdaysRegex = defaultWeekdaysRegex;
                }
                return this._weekdaysStrictRegex && isStrict
                    ? this._weekdaysStrictRegex
                    : this._weekdaysRegex;
            }
        }

        function weekdaysShortRegex(isStrict) {
            if (this._weekdaysParseExact) {
                if (!hasOwnProp(this, '_weekdaysRegex')) {
                    computeWeekdaysParse.call(this);
                }
                if (isStrict) {
                    return this._weekdaysShortStrictRegex;
                } else {
                    return this._weekdaysShortRegex;
                }
            } else {
                if (!hasOwnProp(this, '_weekdaysShortRegex')) {
                    this._weekdaysShortRegex = defaultWeekdaysShortRegex;
                }
                return this._weekdaysShortStrictRegex && isStrict
                    ? this._weekdaysShortStrictRegex
                    : this._weekdaysShortRegex;
            }
        }

        function weekdaysMinRegex(isStrict) {
            if (this._weekdaysParseExact) {
                if (!hasOwnProp(this, '_weekdaysRegex')) {
                    computeWeekdaysParse.call(this);
                }
                if (isStrict) {
                    return this._weekdaysMinStrictRegex;
                } else {
                    return this._weekdaysMinRegex;
                }
            } else {
                if (!hasOwnProp(this, '_weekdaysMinRegex')) {
                    this._weekdaysMinRegex = defaultWeekdaysMinRegex;
                }
                return this._weekdaysMinStrictRegex && isStrict
                    ? this._weekdaysMinStrictRegex
                    : this._weekdaysMinRegex;
            }
        }

        function computeWeekdaysParse() {
            function cmpLenRev(a, b) {
                return b.length - a.length;
            }

            var minPieces = [],
                shortPieces = [],
                longPieces = [],
                mixedPieces = [],
                i,
                mom,
                minp,
                shortp,
                longp;
            for (i = 0; i < 7; i++) {
                // make the regex if we don't have it already
                mom = createUTC([2000, 1]).day(i);
                minp = regexEscape(this.weekdaysMin(mom, ''));
                shortp = regexEscape(this.weekdaysShort(mom, ''));
                longp = regexEscape(this.weekdays(mom, ''));
                minPieces.push(minp);
                shortPieces.push(shortp);
                longPieces.push(longp);
                mixedPieces.push(minp);
                mixedPieces.push(shortp);
                mixedPieces.push(longp);
            }
            // Sorting makes sure if one weekday (or abbr) is a prefix of another it
            // will match the longer piece.
            minPieces.sort(cmpLenRev);
            shortPieces.sort(cmpLenRev);
            longPieces.sort(cmpLenRev);
            mixedPieces.sort(cmpLenRev);

            this._weekdaysRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
            this._weekdaysShortRegex = this._weekdaysRegex;
            this._weekdaysMinRegex = this._weekdaysRegex;

            this._weekdaysStrictRegex = new RegExp(
                '^(' + longPieces.join('|') + ')',
                'i'
            );
            this._weekdaysShortStrictRegex = new RegExp(
                '^(' + shortPieces.join('|') + ')',
                'i'
            );
            this._weekdaysMinStrictRegex = new RegExp(
                '^(' + minPieces.join('|') + ')',
                'i'
            );
        }

        // FORMATTING

        function hFormat() {
            return this.hours() % 12 || 12;
        }

        function kFormat() {
            return this.hours() || 24;
        }

        addFormatToken('H', ['HH', 2], 0, 'hour');
        addFormatToken('h', ['hh', 2], 0, hFormat);
        addFormatToken('k', ['kk', 2], 0, kFormat);

        addFormatToken('hmm', 0, 0, function () {
            return '' + hFormat.apply(this) + zeroFill(this.minutes(), 2);
        });

        addFormatToken('hmmss', 0, 0, function () {
            return (
                '' +
                hFormat.apply(this) +
                zeroFill(this.minutes(), 2) +
                zeroFill(this.seconds(), 2)
            );
        });

        addFormatToken('Hmm', 0, 0, function () {
            return '' + this.hours() + zeroFill(this.minutes(), 2);
        });

        addFormatToken('Hmmss', 0, 0, function () {
            return (
                '' +
                this.hours() +
                zeroFill(this.minutes(), 2) +
                zeroFill(this.seconds(), 2)
            );
        });

        function meridiem(token, lowercase) {
            addFormatToken(token, 0, 0, function () {
                return this.localeData().meridiem(
                    this.hours(),
                    this.minutes(),
                    lowercase
                );
            });
        }

        meridiem('a', true);
        meridiem('A', false);

        // ALIASES

        addUnitAlias('hour', 'h');

        // PRIORITY
        addUnitPriority('hour', 13);

        // PARSING

        function matchMeridiem(isStrict, locale) {
            return locale._meridiemParse;
        }

        addRegexToken('a', matchMeridiem);
        addRegexToken('A', matchMeridiem);
        addRegexToken('H', match1to2);
        addRegexToken('h', match1to2);
        addRegexToken('k', match1to2);
        addRegexToken('HH', match1to2, match2);
        addRegexToken('hh', match1to2, match2);
        addRegexToken('kk', match1to2, match2);

        addRegexToken('hmm', match3to4);
        addRegexToken('hmmss', match5to6);
        addRegexToken('Hmm', match3to4);
        addRegexToken('Hmmss', match5to6);

        addParseToken(['H', 'HH'], HOUR);
        addParseToken(['k', 'kk'], function (input, array, config) {
            var kInput = toInt(input);
            array[HOUR] = kInput === 24 ? 0 : kInput;
        });
        addParseToken(['a', 'A'], function (input, array, config) {
            config._isPm = config._locale.isPM(input);
            config._meridiem = input;
        });
        addParseToken(['h', 'hh'], function (input, array, config) {
            array[HOUR] = toInt(input);
            getParsingFlags(config).bigHour = true;
        });
        addParseToken('hmm', function (input, array, config) {
            var pos = input.length - 2;
            array[HOUR] = toInt(input.substr(0, pos));
            array[MINUTE] = toInt(input.substr(pos));
            getParsingFlags(config).bigHour = true;
        });
        addParseToken('hmmss', function (input, array, config) {
            var pos1 = input.length - 4,
                pos2 = input.length - 2;
            array[HOUR] = toInt(input.substr(0, pos1));
            array[MINUTE] = toInt(input.substr(pos1, 2));
            array[SECOND] = toInt(input.substr(pos2));
            getParsingFlags(config).bigHour = true;
        });
        addParseToken('Hmm', function (input, array, config) {
            var pos = input.length - 2;
            array[HOUR] = toInt(input.substr(0, pos));
            array[MINUTE] = toInt(input.substr(pos));
        });
        addParseToken('Hmmss', function (input, array, config) {
            var pos1 = input.length - 4,
                pos2 = input.length - 2;
            array[HOUR] = toInt(input.substr(0, pos1));
            array[MINUTE] = toInt(input.substr(pos1, 2));
            array[SECOND] = toInt(input.substr(pos2));
        });

        // LOCALES

        function localeIsPM(input) {
            // IE8 Quirks Mode & IE7 Standards Mode do not allow accessing strings like arrays
            // Using charAt should be more compatible.
            return (input + '').toLowerCase().charAt(0) === 'p';
        }

        var defaultLocaleMeridiemParse = /[ap]\.?m?\.?/i,
            // Setting the hour should keep the time, because the user explicitly
            // specified which hour they want. So trying to maintain the same hour (in
            // a new timezone) makes sense. Adding/subtracting hours does not follow
            // this rule.
            getSetHour = makeGetSet('Hours', true);

        function localeMeridiem(hours, minutes, isLower) {
            if (hours > 11) {
                return isLower ? 'pm' : 'PM';
            } else {
                return isLower ? 'am' : 'AM';
            }
        }

        var baseConfig = {
            calendar: defaultCalendar,
            longDateFormat: defaultLongDateFormat,
            invalidDate: defaultInvalidDate,
            ordinal: defaultOrdinal,
            dayOfMonthOrdinalParse: defaultDayOfMonthOrdinalParse,
            relativeTime: defaultRelativeTime,

            months: defaultLocaleMonths,
            monthsShort: defaultLocaleMonthsShort,

            week: defaultLocaleWeek,

            weekdays: defaultLocaleWeekdays,
            weekdaysMin: defaultLocaleWeekdaysMin,
            weekdaysShort: defaultLocaleWeekdaysShort,

            meridiemParse: defaultLocaleMeridiemParse,
        };

        // internal storage for locale config files
        var locales = {},
            localeFamilies = {},
            globalLocale;

        function commonPrefix(arr1, arr2) {
            var i,
                minl = Math.min(arr1.length, arr2.length);
            for (i = 0; i < minl; i += 1) {
                if (arr1[i] !== arr2[i]) {
                    return i;
                }
            }
            return minl;
        }

        function normalizeLocale(key) {
            return key ? key.toLowerCase().replace('_', '-') : key;
        }

        // pick the locale from the array
        // try ['en-au', 'en-gb'] as 'en-au', 'en-gb', 'en', as in move through the list trying each
        // substring from most specific to least, but move to the next array item if it's a more specific variant than the current root
        function chooseLocale(names) {
            var i = 0,
                j,
                next,
                locale,
                split;

            while (i < names.length) {
                split = normalizeLocale(names[i]).split('-');
                j = split.length;
                next = normalizeLocale(names[i + 1]);
                next = next ? next.split('-') : null;
                while (j > 0) {
                    locale = loadLocale(split.slice(0, j).join('-'));
                    if (locale) {
                        return locale;
                    }
                    if (
                        next &&
                        next.length >= j &&
                        commonPrefix(split, next) >= j - 1
                    ) {
                        //the next array item is better than a shallower substring of this one
                        break;
                    }
                    j--;
                }
                i++;
            }
            return globalLocale;
        }

        function loadLocale(name) {
            var oldLocale = null,
                aliasedRequire;
            // TODO: Find a better way to register and load all the locales in Node
            if (
                locales[name] === undefined &&
                typeof module !== 'undefined' &&
                module &&
                module.exports
            ) {
                try {
                    oldLocale = globalLocale._abbr;
                    aliasedRequire = require;
                    aliasedRequire('./locale/' + name);
                    getSetGlobalLocale(oldLocale);
                } catch (e) {
                    // mark as not found to avoid repeating expensive file require call causing high CPU
                    // when trying to find en-US, en_US, en-us for every format call
                    locales[name] = null; // null means not found
                }
            }
            return locales[name];
        }

        // This function will load locale and then set the global locale.  If
        // no arguments are passed in, it will simply return the current global
        // locale key.
        function getSetGlobalLocale(key, values) {
            var data;
            if (key) {
                if (isUndefined(values)) {
                    data = getLocale(key);
                } else {
                    data = defineLocale(key, values);
                }

                if (data) {
                    // moment.duration._locale = moment._locale = data;
                    globalLocale = data;
                } else {
                    if (typeof console !== 'undefined' && console.warn) {
                        //warn user if arguments are passed but the locale could not be set
                        console.warn(
                            'Locale ' + key + ' not found. Did you forget to load it?'
                        );
                    }
                }
            }

            return globalLocale._abbr;
        }

        function defineLocale(name, config) {
            if (config !== null) {
                var locale,
                    parentConfig = baseConfig;
                config.abbr = name;
                if (locales[name] != null) {
                    deprecateSimple(
                        'defineLocaleOverride',
                        'use moment.updateLocale(localeName, config) to change ' +
                        'an existing locale. moment.defineLocale(localeName, ' +
                        'config) should only be used for creating a new locale ' +
                        'See http://momentjs.com/guides/#/warnings/define-locale/ for more info.'
                    );
                    parentConfig = locales[name]._config;
                } else if (config.parentLocale != null) {
                    if (locales[config.parentLocale] != null) {
                        parentConfig = locales[config.parentLocale]._config;
                    } else {
                        locale = loadLocale(config.parentLocale);
                        if (locale != null) {
                            parentConfig = locale._config;
                        } else {
                            if (!localeFamilies[config.parentLocale]) {
                                localeFamilies[config.parentLocale] = [];
                            }
                            localeFamilies[config.parentLocale].push({
                                name: name,
                                config: config,
                            });
                            return null;
                        }
                    }
                }
                locales[name] = new Locale(mergeConfigs(parentConfig, config));

                if (localeFamilies[name]) {
                    localeFamilies[name].forEach(function (x) {
                        defineLocale(x.name, x.config);
                    });
                }

                // backwards compat for now: also set the locale
                // make sure we set the locale AFTER all child locales have been
                // created, so we won't end up with the child locale set.
                getSetGlobalLocale(name);

                return locales[name];
            } else {
                // useful for testing
                delete locales[name];
                return null;
            }
        }

        function updateLocale(name, config) {
            if (config != null) {
                var locale,
                    tmpLocale,
                    parentConfig = baseConfig;

                if (locales[name] != null && locales[name].parentLocale != null) {
                    // Update existing child locale in-place to avoid memory-leaks
                    locales[name].set(mergeConfigs(locales[name]._config, config));
                } else {
                    // MERGE
                    tmpLocale = loadLocale(name);
                    if (tmpLocale != null) {
                        parentConfig = tmpLocale._config;
                    }
                    config = mergeConfigs(parentConfig, config);
                    if (tmpLocale == null) {
                        // updateLocale is called for creating a new locale
                        // Set abbr so it will have a name (getters return
                        // undefined otherwise).
                        config.abbr = name;
                    }
                    locale = new Locale(config);
                    locale.parentLocale = locales[name];
                    locales[name] = locale;
                }

                // backwards compat for now: also set the locale
                getSetGlobalLocale(name);
            } else {
                // pass null for config to unupdate, useful for tests
                if (locales[name] != null) {
                    if (locales[name].parentLocale != null) {
                        locales[name] = locales[name].parentLocale;
                        if (name === getSetGlobalLocale()) {
                            getSetGlobalLocale(name);
                        }
                    } else if (locales[name] != null) {
                        delete locales[name];
                    }
                }
            }
            return locales[name];
        }

        // returns locale data
        function getLocale(key) {
            var locale;

            if (key && key._locale && key._locale._abbr) {
                key = key._locale._abbr;
            }

            if (!key) {
                return globalLocale;
            }

            if (!isArray(key)) {
                //short-circuit everything else
                locale = loadLocale(key);
                if (locale) {
                    return locale;
                }
                key = [key];
            }

            return chooseLocale(key);
        }

        function listLocales() {
            return keys(locales);
        }

        function checkOverflow(m) {
            var overflow,
                a = m._a;

            if (a && getParsingFlags(m).overflow === -2) {
                overflow =
                    a[MONTH] < 0 || a[MONTH] > 11
                        ? MONTH
                        : a[DATE] < 1 || a[DATE] > daysInMonth(a[YEAR], a[MONTH])
                            ? DATE
                            : a[HOUR] < 0 ||
                                a[HOUR] > 24 ||
                                (a[HOUR] === 24 &&
                                    (a[MINUTE] !== 0 ||
                                        a[SECOND] !== 0 ||
                                        a[MILLISECOND] !== 0))
                                ? HOUR
                                : a[MINUTE] < 0 || a[MINUTE] > 59
                                    ? MINUTE
                                    : a[SECOND] < 0 || a[SECOND] > 59
                                        ? SECOND
                                        : a[MILLISECOND] < 0 || a[MILLISECOND] > 999
                                            ? MILLISECOND
                                            : -1;

                if (
                    getParsingFlags(m)._overflowDayOfYear &&
                    (overflow < YEAR || overflow > DATE)
                ) {
                    overflow = DATE;
                }
                if (getParsingFlags(m)._overflowWeeks && overflow === -1) {
                    overflow = WEEK;
                }
                if (getParsingFlags(m)._overflowWeekday && overflow === -1) {
                    overflow = WEEKDAY;
                }

                getParsingFlags(m).overflow = overflow;
            }

            return m;
        }

        // iso 8601 regex
        // 0000-00-00 0000-W00 or 0000-W00-0 + T + 00 or 00:00 or 00:00:00 or 00:00:00.000 + +00:00 or +0000 or +00)
        var extendedIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})-(?:\d\d-\d\d|W\d\d-\d|W\d\d|\d\d\d|\d\d))(?:(T| )(\d\d(?::\d\d(?::\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
            basicIsoRegex = /^\s*((?:[+-]\d{6}|\d{4})(?:\d\d\d\d|W\d\d\d|W\d\d|\d\d\d|\d\d|))(?:(T| )(\d\d(?:\d\d(?:\d\d(?:[.,]\d+)?)?)?)([+-]\d\d(?::?\d\d)?|\s*Z)?)?$/,
            tzRegex = /Z|[+-]\d\d(?::?\d\d)?/,
            isoDates = [
                ['YYYYYY-MM-DD', /[+-]\d{6}-\d\d-\d\d/],
                ['YYYY-MM-DD', /\d{4}-\d\d-\d\d/],
                ['GGGG-[W]WW-E', /\d{4}-W\d\d-\d/],
                ['GGGG-[W]WW', /\d{4}-W\d\d/, false],
                ['YYYY-DDD', /\d{4}-\d{3}/],
                ['YYYY-MM', /\d{4}-\d\d/, false],
                ['YYYYYYMMDD', /[+-]\d{10}/],
                ['YYYYMMDD', /\d{8}/],
                ['GGGG[W]WWE', /\d{4}W\d{3}/],
                ['GGGG[W]WW', /\d{4}W\d{2}/, false],
                ['YYYYDDD', /\d{7}/],
                ['YYYYMM', /\d{6}/, false],
                ['YYYY', /\d{4}/, false],
            ],
            // iso time formats and regexes
            isoTimes = [
                ['HH:mm:ss.SSSS', /\d\d:\d\d:\d\d\.\d+/],
                ['HH:mm:ss,SSSS', /\d\d:\d\d:\d\d,\d+/],
                ['HH:mm:ss', /\d\d:\d\d:\d\d/],
                ['HH:mm', /\d\d:\d\d/],
                ['HHmmss.SSSS', /\d\d\d\d\d\d\.\d+/],
                ['HHmmss,SSSS', /\d\d\d\d\d\d,\d+/],
                ['HHmmss', /\d\d\d\d\d\d/],
                ['HHmm', /\d\d\d\d/],
                ['HH', /\d\d/],
            ],
            aspNetJsonRegex = /^\/?Date\((-?\d+)/i,
            // RFC 2822 regex: For details see https://tools.ietf.org/html/rfc2822#section-3.3
            rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),?\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|([+-]\d{4}))$/,
            obsOffsets = {
                UT: 0,
                GMT: 0,
                EDT: -4 * 60,
                EST: -5 * 60,
                CDT: -5 * 60,
                CST: -6 * 60,
                MDT: -6 * 60,
                MST: -7 * 60,
                PDT: -7 * 60,
                PST: -8 * 60,
            };

        // date from iso format
        function configFromISO(config) {
            var i,
                l,
                string = config._i,
                match = extendedIsoRegex.exec(string) || basicIsoRegex.exec(string),
                allowTime,
                dateFormat,
                timeFormat,
                tzFormat;

            if (match) {
                getParsingFlags(config).iso = true;

                for (i = 0, l = isoDates.length; i < l; i++) {
                    if (isoDates[i][1].exec(match[1])) {
                        dateFormat = isoDates[i][0];
                        allowTime = isoDates[i][2] !== false;
                        break;
                    }
                }
                if (dateFormat == null) {
                    config._isValid = false;
                    return;
                }
                if (match[3]) {
                    for (i = 0, l = isoTimes.length; i < l; i++) {
                        if (isoTimes[i][1].exec(match[3])) {
                            // match[2] should be 'T' or space
                            timeFormat = (match[2] || ' ') + isoTimes[i][0];
                            break;
                        }
                    }
                    if (timeFormat == null) {
                        config._isValid = false;
                        return;
                    }
                }
                if (!allowTime && timeFormat != null) {
                    config._isValid = false;
                    return;
                }
                if (match[4]) {
                    if (tzRegex.exec(match[4])) {
                        tzFormat = 'Z';
                    } else {
                        config._isValid = false;
                        return;
                    }
                }
                config._f = dateFormat + (timeFormat || '') + (tzFormat || '');
                configFromStringAndFormat(config);
            } else {
                config._isValid = false;
            }
        }

        function extractFromRFC2822Strings(
            yearStr,
            monthStr,
            dayStr,
            hourStr,
            minuteStr,
            secondStr
        ) {
            var result = [
                untruncateYear(yearStr),
                defaultLocaleMonthsShort.indexOf(monthStr),
                parseInt(dayStr, 10),
                parseInt(hourStr, 10),
                parseInt(minuteStr, 10),
            ];

            if (secondStr) {
                result.push(parseInt(secondStr, 10));
            }

            return result;
        }

        function untruncateYear(yearStr) {
            var year = parseInt(yearStr, 10);
            if (year <= 49) {
                return 2000 + year;
            } else if (year <= 999) {
                return 1900 + year;
            }
            return year;
        }

        function preprocessRFC2822(s) {
            // Remove comments and folding whitespace and replace multiple-spaces with a single space
            return s
                .replace(/\([^)]*\)|[\n\t]/g, ' ')
                .replace(/(\s\s+)/g, ' ')
                .replace(/^\s\s*/, '')
                .replace(/\s\s*$/, '');
        }

        function checkWeekday(weekdayStr, parsedInput, config) {
            if (weekdayStr) {
                // TODO: Replace the vanilla JS Date object with an independent day-of-week check.
                var weekdayProvided = defaultLocaleWeekdaysShort.indexOf(weekdayStr),
                    weekdayActual = new Date(
                        parsedInput[0],
                        parsedInput[1],
                        parsedInput[2]
                    ).getDay();
                if (weekdayProvided !== weekdayActual) {
                    getParsingFlags(config).weekdayMismatch = true;
                    config._isValid = false;
                    return false;
                }
            }
            return true;
        }

        function calculateOffset(obsOffset, militaryOffset, numOffset) {
            if (obsOffset) {
                return obsOffsets[obsOffset];
            } else if (militaryOffset) {
                // the only allowed military tz is Z
                return 0;
            } else {
                var hm = parseInt(numOffset, 10),
                    m = hm % 100,
                    h = (hm - m) / 100;
                return h * 60 + m;
            }
        }

        // date and time from ref 2822 format
        function configFromRFC2822(config) {
            var match = rfc2822.exec(preprocessRFC2822(config._i)),
                parsedArray;
            if (match) {
                parsedArray = extractFromRFC2822Strings(
                    match[4],
                    match[3],
                    match[2],
                    match[5],
                    match[6],
                    match[7]
                );
                if (!checkWeekday(match[1], parsedArray, config)) {
                    return;
                }

                config._a = parsedArray;
                config._tzm = calculateOffset(match[8], match[9], match[10]);

                config._d = createUTCDate.apply(null, config._a);
                config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);

                getParsingFlags(config).rfc2822 = true;
            } else {
                config._isValid = false;
            }
        }

        // date from 1) ASP.NET, 2) ISO, 3) RFC 2822 formats, or 4) optional fallback if parsing isn't strict
        function configFromString(config) {
            var matched = aspNetJsonRegex.exec(config._i);
            if (matched !== null) {
                config._d = new Date(+matched[1]);
                return;
            }

            configFromISO(config);
            if (config._isValid === false) {
                delete config._isValid;
            } else {
                return;
            }

            configFromRFC2822(config);
            if (config._isValid === false) {
                delete config._isValid;
            } else {
                return;
            }

            if (config._strict) {
                config._isValid = false;
            } else {
                // Final attempt, use Input Fallback
                hooks.createFromInputFallback(config);
            }
        }

        hooks.createFromInputFallback = deprecate(
            'value provided is not in a recognized RFC2822 or ISO format. moment construction falls back to js Date(), ' +
            'which is not reliable across all browsers and versions. Non RFC2822/ISO date formats are ' +
            'discouraged. Please refer to http://momentjs.com/guides/#/warnings/js-date/ for more info.',
            function (config) {
                config._d = new Date(config._i + (config._useUTC ? ' UTC' : ''));
            }
        );

        // Pick the first defined of two or three arguments.
        function defaults(a, b, c) {
            if (a != null) {
                return a;
            }
            if (b != null) {
                return b;
            }
            return c;
        }

        function currentDateArray(config) {
            // hooks is actually the exported moment object
            var nowValue = new Date(hooks.now());
            if (config._useUTC) {
                return [
                    nowValue.getUTCFullYear(),
                    nowValue.getUTCMonth(),
                    nowValue.getUTCDate(),
                ];
            }
            return [nowValue.getFullYear(), nowValue.getMonth(), nowValue.getDate()];
        }

        // convert an array to a date.
        // the array should mirror the parameters below
        // note: all values past the year are optional and will default to the lowest possible value.
        // [year, month, day , hour, minute, second, millisecond]
        function configFromArray(config) {
            var i,
                date,
                input = [],
                currentDate,
                expectedWeekday,
                yearToUse;

            if (config._d) {
                return;
            }

            currentDate = currentDateArray(config);

            //compute day of the year from weeks and weekdays
            if (config._w && config._a[DATE] == null && config._a[MONTH] == null) {
                dayOfYearFromWeekInfo(config);
            }

            //if the day of the year is set, figure out what it is
            if (config._dayOfYear != null) {
                yearToUse = defaults(config._a[YEAR], currentDate[YEAR]);

                if (
                    config._dayOfYear > daysInYear(yearToUse) ||
                    config._dayOfYear === 0
                ) {
                    getParsingFlags(config)._overflowDayOfYear = true;
                }

                date = createUTCDate(yearToUse, 0, config._dayOfYear);
                config._a[MONTH] = date.getUTCMonth();
                config._a[DATE] = date.getUTCDate();
            }

            // Default to current date.
            // * if no year, month, day of month are given, default to today
            // * if day of month is given, default month and year
            // * if month is given, default only year
            // * if year is given, don't default anything
            for (i = 0; i < 3 && config._a[i] == null; ++i) {
                config._a[i] = input[i] = currentDate[i];
            }

            // Zero out whatever was not defaulted, including time
            for (; i < 7; i++) {
                config._a[i] = input[i] =
                    config._a[i] == null ? (i === 2 ? 1 : 0) : config._a[i];
            }

            // Check for 24:00:00.000
            if (
                config._a[HOUR] === 24 &&
                config._a[MINUTE] === 0 &&
                config._a[SECOND] === 0 &&
                config._a[MILLISECOND] === 0
            ) {
                config._nextDay = true;
                config._a[HOUR] = 0;
            }

            config._d = (config._useUTC ? createUTCDate : createDate).apply(
                null,
                input
            );
            expectedWeekday = config._useUTC
                ? config._d.getUTCDay()
                : config._d.getDay();

            // Apply timezone offset from input. The actual utcOffset can be changed
            // with parseZone.
            if (config._tzm != null) {
                config._d.setUTCMinutes(config._d.getUTCMinutes() - config._tzm);
            }

            if (config._nextDay) {
                config._a[HOUR] = 24;
            }

            // check for mismatching day of week
            if (
                config._w &&
                typeof config._w.d !== 'undefined' &&
                config._w.d !== expectedWeekday
            ) {
                getParsingFlags(config).weekdayMismatch = true;
            }
        }

        function dayOfYearFromWeekInfo(config) {
            var w, weekYear, week, weekday, dow, doy, temp, weekdayOverflow, curWeek;

            w = config._w;
            if (w.GG != null || w.W != null || w.E != null) {
                dow = 1;
                doy = 4;

                // TODO: We need to take the current isoWeekYear, but that depends on
                // how we interpret now (local, utc, fixed offset). So create
                // a now version of current config (take local/utc/offset flags, and
                // create now).
                weekYear = defaults(
                    w.GG,
                    config._a[YEAR],
                    weekOfYear(createLocal(), 1, 4).year
                );
                week = defaults(w.W, 1);
                weekday = defaults(w.E, 1);
                if (weekday < 1 || weekday > 7) {
                    weekdayOverflow = true;
                }
            } else {
                dow = config._locale._week.dow;
                doy = config._locale._week.doy;

                curWeek = weekOfYear(createLocal(), dow, doy);

                weekYear = defaults(w.gg, config._a[YEAR], curWeek.year);

                // Default to current week.
                week = defaults(w.w, curWeek.week);

                if (w.d != null) {
                    // weekday -- low day numbers are considered next week
                    weekday = w.d;
                    if (weekday < 0 || weekday > 6) {
                        weekdayOverflow = true;
                    }
                } else if (w.e != null) {
                    // local weekday -- counting starts from beginning of week
                    weekday = w.e + dow;
                    if (w.e < 0 || w.e > 6) {
                        weekdayOverflow = true;
                    }
                } else {
                    // default to beginning of week
                    weekday = dow;
                }
            }
            if (week < 1 || week > weeksInYear(weekYear, dow, doy)) {
                getParsingFlags(config)._overflowWeeks = true;
            } else if (weekdayOverflow != null) {
                getParsingFlags(config)._overflowWeekday = true;
            } else {
                temp = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy);
                config._a[YEAR] = temp.year;
                config._dayOfYear = temp.dayOfYear;
            }
        }

        // constant that refers to the ISO standard
        hooks.ISO_8601 = function () { };

        // constant that refers to the RFC 2822 form
        hooks.RFC_2822 = function () { };

        // date from string and format string
        function configFromStringAndFormat(config) {
            // TODO: Move this to another part of the creation flow to prevent circular deps
            if (config._f === hooks.ISO_8601) {
                configFromISO(config);
                return;
            }
            if (config._f === hooks.RFC_2822) {
                configFromRFC2822(config);
                return;
            }
            config._a = [];
            getParsingFlags(config).empty = true;

            // This array is used to make a Date, either with `new Date` or `Date.UTC`
            var string = '' + config._i,
                i,
                parsedInput,
                tokens,
                token,
                skipped,
                stringLength = string.length,
                totalParsedInputLength = 0,
                era;

            tokens =
                expandFormat(config._f, config._locale).match(formattingTokens) || [];

            for (i = 0; i < tokens.length; i++) {
                token = tokens[i];
                parsedInput = (string.match(getParseRegexForToken(token, config)) ||
                    [])[0];
                if (parsedInput) {
                    skipped = string.substr(0, string.indexOf(parsedInput));
                    if (skipped.length > 0) {
                        getParsingFlags(config).unusedInput.push(skipped);
                    }
                    string = string.slice(
                        string.indexOf(parsedInput) + parsedInput.length
                    );
                    totalParsedInputLength += parsedInput.length;
                }
                // don't parse if it's not a known token
                if (formatTokenFunctions[token]) {
                    if (parsedInput) {
                        getParsingFlags(config).empty = false;
                    } else {
                        getParsingFlags(config).unusedTokens.push(token);
                    }
                    addTimeToArrayFromToken(token, parsedInput, config);
                } else if (config._strict && !parsedInput) {
                    getParsingFlags(config).unusedTokens.push(token);
                }
            }

            // add remaining unparsed input length to the string
            getParsingFlags(config).charsLeftOver =
                stringLength - totalParsedInputLength;
            if (string.length > 0) {
                getParsingFlags(config).unusedInput.push(string);
            }

            // clear _12h flag if hour is <= 12
            if (
                config._a[HOUR] <= 12 &&
                getParsingFlags(config).bigHour === true &&
                config._a[HOUR] > 0
            ) {
                getParsingFlags(config).bigHour = undefined;
            }

            getParsingFlags(config).parsedDateParts = config._a.slice(0);
            getParsingFlags(config).meridiem = config._meridiem;
            // handle meridiem
            config._a[HOUR] = meridiemFixWrap(
                config._locale,
                config._a[HOUR],
                config._meridiem
            );

            // handle era
            era = getParsingFlags(config).era;
            if (era !== null) {
                config._a[YEAR] = config._locale.erasConvertYear(era, config._a[YEAR]);
            }

            configFromArray(config);
            checkOverflow(config);
        }

        function meridiemFixWrap(locale, hour, meridiem) {
            var isPm;

            if (meridiem == null) {
                // nothing to do
                return hour;
            }
            if (locale.meridiemHour != null) {
                return locale.meridiemHour(hour, meridiem);
            } else if (locale.isPM != null) {
                // Fallback
                isPm = locale.isPM(meridiem);
                if (isPm && hour < 12) {
                    hour += 12;
                }
                if (!isPm && hour === 12) {
                    hour = 0;
                }
                return hour;
            } else {
                // this is not supposed to happen
                return hour;
            }
        }

        // date from string and array of format strings
        function configFromStringAndArray(config) {
            var tempConfig,
                bestMoment,
                scoreToBeat,
                i,
                currentScore,
                validFormatFound,
                bestFormatIsValid = false;

            if (config._f.length === 0) {
                getParsingFlags(config).invalidFormat = true;
                config._d = new Date(NaN);
                return;
            }

            for (i = 0; i < config._f.length; i++) {
                currentScore = 0;
                validFormatFound = false;
                tempConfig = copyConfig({}, config);
                if (config._useUTC != null) {
                    tempConfig._useUTC = config._useUTC;
                }
                tempConfig._f = config._f[i];
                configFromStringAndFormat(tempConfig);

                if (isValid(tempConfig)) {
                    validFormatFound = true;
                }

                // if there is any input that was not parsed add a penalty for that format
                currentScore += getParsingFlags(tempConfig).charsLeftOver;

                //or tokens
                currentScore += getParsingFlags(tempConfig).unusedTokens.length * 10;

                getParsingFlags(tempConfig).score = currentScore;

                if (!bestFormatIsValid) {
                    if (
                        scoreToBeat == null ||
                        currentScore < scoreToBeat ||
                        validFormatFound
                    ) {
                        scoreToBeat = currentScore;
                        bestMoment = tempConfig;
                        if (validFormatFound) {
                            bestFormatIsValid = true;
                        }
                    }
                } else {
                    if (currentScore < scoreToBeat) {
                        scoreToBeat = currentScore;
                        bestMoment = tempConfig;
                    }
                }
            }

            extend(config, bestMoment || tempConfig);
        }

        function configFromObject(config) {
            if (config._d) {
                return;
            }

            var i = normalizeObjectUnits(config._i),
                dayOrDate = i.day === undefined ? i.date : i.day;
            config._a = map(
                [i.year, i.month, dayOrDate, i.hour, i.minute, i.second, i.millisecond],
                function (obj) {
                    return obj && parseInt(obj, 10);
                }
            );

            configFromArray(config);
        }

        function createFromConfig(config) {
            var res = new Moment(checkOverflow(prepareConfig(config)));
            if (res._nextDay) {
                // Adding is smart enough around DST
                res.add(1, 'd');
                res._nextDay = undefined;
            }

            return res;
        }

        function prepareConfig(config) {
            var input = config._i,
                format = config._f;

            config._locale = config._locale || getLocale(config._l);

            if (input === null || (format === undefined && input === '')) {
                return createInvalid({ nullInput: true });
            }

            if (typeof input === 'string') {
                config._i = input = config._locale.preparse(input);
            }

            if (isMoment(input)) {
                return new Moment(checkOverflow(input));
            } else if (isDate(input)) {
                config._d = input;
            } else if (isArray(format)) {
                configFromStringAndArray(config);
            } else if (format) {
                configFromStringAndFormat(config);
            } else {
                configFromInput(config);
            }

            if (!isValid(config)) {
                config._d = null;
            }

            return config;
        }

        function configFromInput(config) {
            var input = config._i;
            if (isUndefined(input)) {
                config._d = new Date(hooks.now());
            } else if (isDate(input)) {
                config._d = new Date(input.valueOf());
            } else if (typeof input === 'string') {
                configFromString(config);
            } else if (isArray(input)) {
                config._a = map(input.slice(0), function (obj) {
                    return parseInt(obj, 10);
                });
                configFromArray(config);
            } else if (isObject(input)) {
                configFromObject(config);
            } else if (isNumber(input)) {
                // from milliseconds
                config._d = new Date(input);
            } else {
                hooks.createFromInputFallback(config);
            }
        }

        function createLocalOrUTC(input, format, locale, strict, isUTC) {
            var c = {};

            if (format === true || format === false) {
                strict = format;
                format = undefined;
            }

            if (locale === true || locale === false) {
                strict = locale;
                locale = undefined;
            }

            if (
                (isObject(input) && isObjectEmpty(input)) ||
                (isArray(input) && input.length === 0)
            ) {
                input = undefined;
            }
            // object construction must be done this way.
            // https://github.com/moment/moment/issues/1423
            c._isAMomentObject = true;
            c._useUTC = c._isUTC = isUTC;
            c._l = locale;
            c._i = input;
            c._f = format;
            c._strict = strict;

            return createFromConfig(c);
        }

        function createLocal(input, format, locale, strict) {
            return createLocalOrUTC(input, format, locale, strict, false);
        }

        var prototypeMin = deprecate(
            'moment().min is deprecated, use moment.max instead. http://momentjs.com/guides/#/warnings/min-max/',
            function () {
                var other = createLocal.apply(null, arguments);
                if (this.isValid() && other.isValid()) {
                    return other < this ? this : other;
                } else {
                    return createInvalid();
                }
            }
        ),
            prototypeMax = deprecate(
                'moment().max is deprecated, use moment.min instead. http://momentjs.com/guides/#/warnings/min-max/',
                function () {
                    var other = createLocal.apply(null, arguments);
                    if (this.isValid() && other.isValid()) {
                        return other > this ? this : other;
                    } else {
                        return createInvalid();
                    }
                }
            );

        // Pick a moment m from moments so that m[fn](other) is true for all
        // other. This relies on the function fn to be transitive.
        //
        // moments should either be an array of moment objects or an array, whose
        // first element is an array of moment objects.
        function pickBy(fn, moments) {
            var res, i;
            if (moments.length === 1 && isArray(moments[0])) {
                moments = moments[0];
            }
            if (!moments.length) {
                return createLocal();
            }
            res = moments[0];
            for (i = 1; i < moments.length; ++i) {
                if (!moments[i].isValid() || moments[i][fn](res)) {
                    res = moments[i];
                }
            }
            return res;
        }

        // TODO: Use [].sort instead?
        function min() {
            var args = [].slice.call(arguments, 0);

            return pickBy('isBefore', args);
        }

        function max() {
            var args = [].slice.call(arguments, 0);

            return pickBy('isAfter', args);
        }

        var now = function () {
            return Date.now ? Date.now() : +new Date();
        };

        var ordering = [
            'year',
            'quarter',
            'month',
            'week',
            'day',
            'hour',
            'minute',
            'second',
            'millisecond',
        ];

        function isDurationValid(m) {
            var key,
                unitHasDecimal = false,
                i;
            for (key in m) {
                if (
                    hasOwnProp(m, key) &&
                    !(
                        indexOf.call(ordering, key) !== -1 &&
                        (m[key] == null || !isNaN(m[key]))
                    )
                ) {
                    return false;
                }
            }

            for (i = 0; i < ordering.length; ++i) {
                if (m[ordering[i]]) {
                    if (unitHasDecimal) {
                        return false; // only allow non-integers for smallest unit
                    }
                    if (parseFloat(m[ordering[i]]) !== toInt(m[ordering[i]])) {
                        unitHasDecimal = true;
                    }
                }
            }

            return true;
        }

        function isValid$1() {
            return this._isValid;
        }

        function createInvalid$1() {
            return createDuration(NaN);
        }

        function Duration(duration) {
            var normalizedInput = normalizeObjectUnits(duration),
                years = normalizedInput.year || 0,
                quarters = normalizedInput.quarter || 0,
                months = normalizedInput.month || 0,
                weeks = normalizedInput.week || normalizedInput.isoWeek || 0,
                days = normalizedInput.day || 0,
                hours = normalizedInput.hour || 0,
                minutes = normalizedInput.minute || 0,
                seconds = normalizedInput.second || 0,
                milliseconds = normalizedInput.millisecond || 0;

            this._isValid = isDurationValid(normalizedInput);

            // representation for dateAddRemove
            this._milliseconds =
                +milliseconds +
                seconds * 1e3 + // 1000
                minutes * 6e4 + // 1000 * 60
                hours * 1000 * 60 * 60; //using 1000 * 60 * 60 instead of 36e5 to avoid floating point rounding errors https://github.com/moment/moment/issues/2978
            // Because of dateAddRemove treats 24 hours as different from a
            // day when working around DST, we need to store them separately
            this._days = +days + weeks * 7;
            // It is impossible to translate months into days without knowing
            // which months you are are talking about, so we have to store
            // it separately.
            this._months = +months + quarters * 3 + years * 12;

            this._data = {};

            this._locale = getLocale();

            this._bubble();
        }

        function isDuration(obj) {
            return obj instanceof Duration;
        }

        function absRound(number) {
            if (number < 0) {
                return Math.round(-1 * number) * -1;
            } else {
                return Math.round(number);
            }
        }

        // compare two arrays, return the number of differences
        function compareArrays(array1, array2, dontConvert) {
            var len = Math.min(array1.length, array2.length),
                lengthDiff = Math.abs(array1.length - array2.length),
                diffs = 0,
                i;
            for (i = 0; i < len; i++) {
                if (
                    (dontConvert && array1[i] !== array2[i]) ||
                    (!dontConvert && toInt(array1[i]) !== toInt(array2[i]))
                ) {
                    diffs++;
                }
            }
            return diffs + lengthDiff;
        }

        // FORMATTING

        function offset(token, separator) {
            addFormatToken(token, 0, 0, function () {
                var offset = this.utcOffset(),
                    sign = '+';
                if (offset < 0) {
                    offset = -offset;
                    sign = '-';
                }
                return (
                    sign +
                    zeroFill(~~(offset / 60), 2) +
                    separator +
                    zeroFill(~~offset % 60, 2)
                );
            });
        }

        offset('Z', ':');
        offset('ZZ', '');

        // PARSING

        addRegexToken('Z', matchShortOffset);
        addRegexToken('ZZ', matchShortOffset);
        addParseToken(['Z', 'ZZ'], function (input, array, config) {
            config._useUTC = true;
            config._tzm = offsetFromString(matchShortOffset, input);
        });

        // HELPERS

        // timezone chunker
        // '+10:00' > ['10',  '00']
        // '-1530'  > ['-15', '30']
        var chunkOffset = /([\+\-]|\d\d)/gi;

        function offsetFromString(matcher, string) {
            var matches = (string || '').match(matcher),
                chunk,
                parts,
                minutes;

            if (matches === null) {
                return null;
            }

            chunk = matches[matches.length - 1] || [];
            parts = (chunk + '').match(chunkOffset) || ['-', 0, 0];
            minutes = +(parts[1] * 60) + toInt(parts[2]);

            return minutes === 0 ? 0 : parts[0] === '+' ? minutes : -minutes;
        }

        // Return a moment from input, that is local/utc/zone equivalent to model.
        function cloneWithOffset(input, model) {
            var res, diff;
            if (model._isUTC) {
                res = model.clone();
                diff =
                    (isMoment(input) || isDate(input)
                        ? input.valueOf()
                        : createLocal(input).valueOf()) - res.valueOf();
                // Use low-level api, because this fn is low-level api.
                res._d.setTime(res._d.valueOf() + diff);
                hooks.updateOffset(res, false);
                return res;
            } else {
                return createLocal(input).local();
            }
        }

        function getDateOffset(m) {
            // On Firefox.24 Date#getTimezoneOffset returns a floating point.
            // https://github.com/moment/moment/pull/1871
            return -Math.round(m._d.getTimezoneOffset());
        }

        // HOOKS

        // This function will be called whenever a moment is mutated.
        // It is intended to keep the offset in sync with the timezone.
        hooks.updateOffset = function () { };

        // MOMENTS

        // keepLocalTime = true means only change the timezone, without
        // affecting the local hour. So 5:31:26 +0300 --[utcOffset(2, true)]-->
        // 5:31:26 +0200 It is possible that 5:31:26 doesn't exist with offset
        // +0200, so we adjust the time as needed, to be valid.
        //
        // Keeping the time actually adds/subtracts (one hour)
        // from the actual represented time. That is why we call updateOffset
        // a second time. In case it wants us to change the offset again
        // _changeInProgress == true case, then we have to adjust, because
        // there is no such time in the given timezone.
        function getSetOffset(input, keepLocalTime, keepMinutes) {
            var offset = this._offset || 0,
                localAdjust;
            if (!this.isValid()) {
                return input != null ? this : NaN;
            }
            if (input != null) {
                if (typeof input === 'string') {
                    input = offsetFromString(matchShortOffset, input);
                    if (input === null) {
                        return this;
                    }
                } else if (Math.abs(input) < 16 && !keepMinutes) {
                    input = input * 60;
                }
                if (!this._isUTC && keepLocalTime) {
                    localAdjust = getDateOffset(this);
                }
                this._offset = input;
                this._isUTC = true;
                if (localAdjust != null) {
                    this.add(localAdjust, 'm');
                }
                if (offset !== input) {
                    if (!keepLocalTime || this._changeInProgress) {
                        addSubtract(
                            this,
                            createDuration(input - offset, 'm'),
                            1,
                            false
                        );
                    } else if (!this._changeInProgress) {
                        this._changeInProgress = true;
                        hooks.updateOffset(this, true);
                        this._changeInProgress = null;
                    }
                }
                return this;
            } else {
                return this._isUTC ? offset : getDateOffset(this);
            }
        }

        function getSetZone(input, keepLocalTime) {
            if (input != null) {
                if (typeof input !== 'string') {
                    input = -input;
                }

                this.utcOffset(input, keepLocalTime);

                return this;
            } else {
                return -this.utcOffset();
            }
        }

        function setOffsetToUTC(keepLocalTime) {
            return this.utcOffset(0, keepLocalTime);
        }

        function setOffsetToLocal(keepLocalTime) {
            if (this._isUTC) {
                this.utcOffset(0, keepLocalTime);
                this._isUTC = false;

                if (keepLocalTime) {
                    this.subtract(getDateOffset(this), 'm');
                }
            }
            return this;
        }

        function setOffsetToParsedOffset() {
            if (this._tzm != null) {
                this.utcOffset(this._tzm, false, true);
            } else if (typeof this._i === 'string') {
                var tZone = offsetFromString(matchOffset, this._i);
                if (tZone != null) {
                    this.utcOffset(tZone);
                } else {
                    this.utcOffset(0, true);
                }
            }
            return this;
        }

        function hasAlignedHourOffset(input) {
            if (!this.isValid()) {
                return false;
            }
            input = input ? createLocal(input).utcOffset() : 0;

            return (this.utcOffset() - input) % 60 === 0;
        }

        function isDaylightSavingTime() {
            return (
                this.utcOffset() > this.clone().month(0).utcOffset() ||
                this.utcOffset() > this.clone().month(5).utcOffset()
            );
        }

        function isDaylightSavingTimeShifted() {
            if (!isUndefined(this._isDSTShifted)) {
                return this._isDSTShifted;
            }

            var c = {},
                other;

            copyConfig(c, this);
            c = prepareConfig(c);

            if (c._a) {
                other = c._isUTC ? createUTC(c._a) : createLocal(c._a);
                this._isDSTShifted =
                    this.isValid() && compareArrays(c._a, other.toArray()) > 0;
            } else {
                this._isDSTShifted = false;
            }

            return this._isDSTShifted;
        }

        function isLocal() {
            return this.isValid() ? !this._isUTC : false;
        }

        function isUtcOffset() {
            return this.isValid() ? this._isUTC : false;
        }

        function isUtc() {
            return this.isValid() ? this._isUTC && this._offset === 0 : false;
        }

        // ASP.NET json date format regex
        var aspNetRegex = /^(-|\+)?(?:(\d*)[. ])?(\d+):(\d+)(?::(\d+)(\.\d*)?)?$/,
            // from http://docs.closure-library.googlecode.com/git/closure_goog_date_date.js.source.html
            // somewhat more in line with 4.4.3.2 2004 spec, but allows decimal anywhere
            // and further modified to allow for strings containing both week and day
            isoRegex = /^(-|\+)?P(?:([-+]?[0-9,.]*)Y)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)W)?(?:([-+]?[0-9,.]*)D)?(?:T(?:([-+]?[0-9,.]*)H)?(?:([-+]?[0-9,.]*)M)?(?:([-+]?[0-9,.]*)S)?)?$/;

        function createDuration(input, key) {
            var duration = input,
                // matching against regexp is expensive, do it on demand
                match = null,
                sign,
                ret,
                diffRes;

            if (isDuration(input)) {
                duration = {
                    ms: input._milliseconds,
                    d: input._days,
                    M: input._months,
                };
            } else if (isNumber(input) || !isNaN(+input)) {
                duration = {};
                if (key) {
                    duration[key] = +input;
                } else {
                    duration.milliseconds = +input;
                }
            } else if ((match = aspNetRegex.exec(input))) {
                sign = match[1] === '-' ? -1 : 1;
                duration = {
                    y: 0,
                    d: toInt(match[DATE]) * sign,
                    h: toInt(match[HOUR]) * sign,
                    m: toInt(match[MINUTE]) * sign,
                    s: toInt(match[SECOND]) * sign,
                    ms: toInt(absRound(match[MILLISECOND] * 1000)) * sign, // the millisecond decimal point is included in the match
                };
            } else if ((match = isoRegex.exec(input))) {
                sign = match[1] === '-' ? -1 : 1;
                duration = {
                    y: parseIso(match[2], sign),
                    M: parseIso(match[3], sign),
                    w: parseIso(match[4], sign),
                    d: parseIso(match[5], sign),
                    h: parseIso(match[6], sign),
                    m: parseIso(match[7], sign),
                    s: parseIso(match[8], sign),
                };
            } else if (duration == null) {
                // checks for null or undefined
                duration = {};
            } else if (
                typeof duration === 'object' &&
                ('from' in duration || 'to' in duration)
            ) {
                diffRes = momentsDifference(
                    createLocal(duration.from),
                    createLocal(duration.to)
                );

                duration = {};
                duration.ms = diffRes.milliseconds;
                duration.M = diffRes.months;
            }

            ret = new Duration(duration);

            if (isDuration(input) && hasOwnProp(input, '_locale')) {
                ret._locale = input._locale;
            }

            if (isDuration(input) && hasOwnProp(input, '_isValid')) {
                ret._isValid = input._isValid;
            }

            return ret;
        }

        createDuration.fn = Duration.prototype;
        createDuration.invalid = createInvalid$1;

        function parseIso(inp, sign) {
            // We'd normally use ~~inp for this, but unfortunately it also
            // converts floats to ints.
            // inp may be undefined, so careful calling replace on it.
            var res = inp && parseFloat(inp.replace(',', '.'));
            // apply sign while we're at it
            return (isNaN(res) ? 0 : res) * sign;
        }

        function positiveMomentsDifference(base, other) {
            var res = {};

            res.months =
                other.month() - base.month() + (other.year() - base.year()) * 12;
            if (base.clone().add(res.months, 'M').isAfter(other)) {
                --res.months;
            }

            res.milliseconds = +other - +base.clone().add(res.months, 'M');

            return res;
        }

        function momentsDifference(base, other) {
            var res;
            if (!(base.isValid() && other.isValid())) {
                return { milliseconds: 0, months: 0 };
            }

            other = cloneWithOffset(other, base);
            if (base.isBefore(other)) {
                res = positiveMomentsDifference(base, other);
            } else {
                res = positiveMomentsDifference(other, base);
                res.milliseconds = -res.milliseconds;
                res.months = -res.months;
            }

            return res;
        }

        // TODO: remove 'name' arg after deprecation is removed
        function createAdder(direction, name) {
            return function (val, period) {
                var dur, tmp;
                //invert the arguments, but complain about it
                if (period !== null && !isNaN(+period)) {
                    deprecateSimple(
                        name,
                        'moment().' +
                        name +
                        '(period, number) is deprecated. Please use moment().' +
                        name +
                        '(number, period). ' +
                        'See http://momentjs.com/guides/#/warnings/add-inverted-param/ for more info.'
                    );
                    tmp = val;
                    val = period;
                    period = tmp;
                }

                dur = createDuration(val, period);
                addSubtract(this, dur, direction);
                return this;
            };
        }

        function addSubtract(mom, duration, isAdding, updateOffset) {
            var milliseconds = duration._milliseconds,
                days = absRound(duration._days),
                months = absRound(duration._months);

            if (!mom.isValid()) {
                // No op
                return;
            }

            updateOffset = updateOffset == null ? true : updateOffset;

            if (months) {
                setMonth(mom, get(mom, 'Month') + months * isAdding);
            }
            if (days) {
                set$1(mom, 'Date', get(mom, 'Date') + days * isAdding);
            }
            if (milliseconds) {
                mom._d.setTime(mom._d.valueOf() + milliseconds * isAdding);
            }
            if (updateOffset) {
                hooks.updateOffset(mom, days || months);
            }
        }

        var add = createAdder(1, 'add'),
            subtract = createAdder(-1, 'subtract');

        function isString(input) {
            return typeof input === 'string' || input instanceof String;
        }

        // type MomentInput = Moment | Date | string | number | (number | string)[] | MomentInputObject | void; // null | undefined
        function isMomentInput(input) {
            return (
                isMoment(input) ||
                isDate(input) ||
                isString(input) ||
                isNumber(input) ||
                isNumberOrStringArray(input) ||
                isMomentInputObject(input) ||
                input === null ||
                input === undefined
            );
        }

        function isMomentInputObject(input) {
            var objectTest = isObject(input) && !isObjectEmpty(input),
                propertyTest = false,
                properties = [
                    'years',
                    'year',
                    'y',
                    'months',
                    'month',
                    'M',
                    'days',
                    'day',
                    'd',
                    'dates',
                    'date',
                    'D',
                    'hours',
                    'hour',
                    'h',
                    'minutes',
                    'minute',
                    'm',
                    'seconds',
                    'second',
                    's',
                    'milliseconds',
                    'millisecond',
                    'ms',
                ],
                i,
                property;

            for (i = 0; i < properties.length; i += 1) {
                property = properties[i];
                propertyTest = propertyTest || hasOwnProp(input, property);
            }

            return objectTest && propertyTest;
        }

        function isNumberOrStringArray(input) {
            var arrayTest = isArray(input),
                dataTypeTest = false;
            if (arrayTest) {
                dataTypeTest =
                    input.filter(function (item) {
                        return !isNumber(item) && isString(input);
                    }).length === 0;
            }
            return arrayTest && dataTypeTest;
        }

        function isCalendarSpec(input) {
            var objectTest = isObject(input) && !isObjectEmpty(input),
                propertyTest = false,
                properties = [
                    'sameDay',
                    'nextDay',
                    'lastDay',
                    'nextWeek',
                    'lastWeek',
                    'sameElse',
                ],
                i,
                property;

            for (i = 0; i < properties.length; i += 1) {
                property = properties[i];
                propertyTest = propertyTest || hasOwnProp(input, property);
            }

            return objectTest && propertyTest;
        }

        function getCalendarFormat(myMoment, now) {
            var diff = myMoment.diff(now, 'days', true);
            return diff < -6
                ? 'sameElse'
                : diff < -1
                    ? 'lastWeek'
                    : diff < 0
                        ? 'lastDay'
                        : diff < 1
                            ? 'sameDay'
                            : diff < 2
                                ? 'nextDay'
                                : diff < 7
                                    ? 'nextWeek'
                                    : 'sameElse';
        }

        function calendar$1(time, formats) {
            // Support for single parameter, formats only overload to the calendar function
            if (arguments.length === 1) {
                if (!arguments[0]) {
                    time = undefined;
                    formats = undefined;
                } else if (isMomentInput(arguments[0])) {
                    time = arguments[0];
                    formats = undefined;
                } else if (isCalendarSpec(arguments[0])) {
                    formats = arguments[0];
                    time = undefined;
                }
            }
            // We want to compare the start of today, vs this.
            // Getting start-of-today depends on whether we're local/utc/offset or not.
            var now = time || createLocal(),
                sod = cloneWithOffset(now, this).startOf('day'),
                format = hooks.calendarFormat(this, sod) || 'sameElse',
                output =
                    formats &&
                    (isFunction(formats[format])
                        ? formats[format].call(this, now)
                        : formats[format]);

            return this.format(
                output || this.localeData().calendar(format, this, createLocal(now))
            );
        }

        function clone() {
            return new Moment(this);
        }

        function isAfter(input, units) {
            var localInput = isMoment(input) ? input : createLocal(input);
            if (!(this.isValid() && localInput.isValid())) {
                return false;
            }
            units = normalizeUnits(units) || 'millisecond';
            if (units === 'millisecond') {
                return this.valueOf() > localInput.valueOf();
            } else {
                return localInput.valueOf() < this.clone().startOf(units).valueOf();
            }
        }

        function isBefore(input, units) {
            var localInput = isMoment(input) ? input : createLocal(input);
            if (!(this.isValid() && localInput.isValid())) {
                return false;
            }
            units = normalizeUnits(units) || 'millisecond';
            if (units === 'millisecond') {
                return this.valueOf() < localInput.valueOf();
            } else {
                return this.clone().endOf(units).valueOf() < localInput.valueOf();
            }
        }

        function isBetween(from, to, units, inclusivity) {
            var localFrom = isMoment(from) ? from : createLocal(from),
                localTo = isMoment(to) ? to : createLocal(to);
            if (!(this.isValid() && localFrom.isValid() && localTo.isValid())) {
                return false;
            }
            inclusivity = inclusivity || '()';
            return (
                (inclusivity[0] === '('
                    ? this.isAfter(localFrom, units)
                    : !this.isBefore(localFrom, units)) &&
                (inclusivity[1] === ')'
                    ? this.isBefore(localTo, units)
                    : !this.isAfter(localTo, units))
            );
        }

        function isSame(input, units) {
            var localInput = isMoment(input) ? input : createLocal(input),
                inputMs;
            if (!(this.isValid() && localInput.isValid())) {
                return false;
            }
            units = normalizeUnits(units) || 'millisecond';
            if (units === 'millisecond') {
                return this.valueOf() === localInput.valueOf();
            } else {
                inputMs = localInput.valueOf();
                return (
                    this.clone().startOf(units).valueOf() <= inputMs &&
                    inputMs <= this.clone().endOf(units).valueOf()
                );
            }
        }

        function isSameOrAfter(input, units) {
            return this.isSame(input, units) || this.isAfter(input, units);
        }

        function isSameOrBefore(input, units) {
            return this.isSame(input, units) || this.isBefore(input, units);
        }

        function diff(input, units, asFloat) {
            var that, zoneDelta, output;

            if (!this.isValid()) {
                return NaN;
            }

            that = cloneWithOffset(input, this);

            if (!that.isValid()) {
                return NaN;
            }

            zoneDelta = (that.utcOffset() - this.utcOffset()) * 6e4;

            units = normalizeUnits(units);

            switch (units) {
                case 'year':
                    output = monthDiff(this, that) / 12;
                    break;
                case 'month':
                    output = monthDiff(this, that);
                    break;
                case 'quarter':
                    output = monthDiff(this, that) / 3;
                    break;
                case 'second':
                    output = (this - that) / 1e3;
                    break; // 1000
                case 'minute':
                    output = (this - that) / 6e4;
                    break; // 1000 * 60
                case 'hour':
                    output = (this - that) / 36e5;
                    break; // 1000 * 60 * 60
                case 'day':
                    output = (this - that - zoneDelta) / 864e5;
                    break; // 1000 * 60 * 60 * 24, negate dst
                case 'week':
                    output = (this - that - zoneDelta) / 6048e5;
                    break; // 1000 * 60 * 60 * 24 * 7, negate dst
                default:
                    output = this - that;
            }

            return asFloat ? output : absFloor(output);
        }

        function monthDiff(a, b) {
            if (a.date() < b.date()) {
                // end-of-month calculations work correct when the start month has more
                // days than the end month.
                return -monthDiff(b, a);
            }
            // difference in months
            var wholeMonthDiff = (b.year() - a.year()) * 12 + (b.month() - a.month()),
                // b is in (anchor - 1 month, anchor + 1 month)
                anchor = a.clone().add(wholeMonthDiff, 'months'),
                anchor2,
                adjust;

            if (b - anchor < 0) {
                anchor2 = a.clone().add(wholeMonthDiff - 1, 'months');
                // linear across the month
                adjust = (b - anchor) / (anchor - anchor2);
            } else {
                anchor2 = a.clone().add(wholeMonthDiff + 1, 'months');
                // linear across the month
                adjust = (b - anchor) / (anchor2 - anchor);
            }

            //check for negative zero, return zero if negative zero
            return -(wholeMonthDiff + adjust) || 0;
        }

        hooks.defaultFormat = 'YYYY-MM-DDTHH:mm:ssZ';
        hooks.defaultFormatUtc = 'YYYY-MM-DDTHH:mm:ss[Z]';

        function toString() {
            return this.clone().locale('en').format('ddd MMM DD YYYY HH:mm:ss [GMT]ZZ');
        }

        function toISOString(keepOffset) {
            if (!this.isValid()) {
                return null;
            }
            var utc = keepOffset !== true,
                m = utc ? this.clone().utc() : this;
            if (m.year() < 0 || m.year() > 9999) {
                return formatMoment(
                    m,
                    utc
                        ? 'YYYYYY-MM-DD[T]HH:mm:ss.SSS[Z]'
                        : 'YYYYYY-MM-DD[T]HH:mm:ss.SSSZ'
                );
            }
            if (isFunction(Date.prototype.toISOString)) {
                // native implementation is ~50x faster, use it when we can
                if (utc) {
                    return this.toDate().toISOString();
                } else {
                    return new Date(this.valueOf() + this.utcOffset() * 60 * 1000)
                        .toISOString()
                        .replace('Z', formatMoment(m, 'Z'));
                }
            }
            return formatMoment(
                m,
                utc ? 'YYYY-MM-DD[T]HH:mm:ss.SSS[Z]' : 'YYYY-MM-DD[T]HH:mm:ss.SSSZ'
            );
        }

        /**
         * Return a human readable representation of a moment that can
         * also be evaluated to get a new moment which is the same
         *
         * @link https://nodejs.org/dist/latest/docs/api/util.html#util_custom_inspect_function_on_objects
         */
        function inspect() {
            if (!this.isValid()) {
                return 'moment.invalid(/* ' + this._i + ' */)';
            }
            var func = 'moment',
                zone = '',
                prefix,
                year,
                datetime,
                suffix;
            if (!this.isLocal()) {
                func = this.utcOffset() === 0 ? 'moment.utc' : 'moment.parseZone';
                zone = 'Z';
            }
            prefix = '[' + func + '("]';
            year = 0 <= this.year() && this.year() <= 9999 ? 'YYYY' : 'YYYYYY';
            datetime = '-MM-DD[T]HH:mm:ss.SSS';
            suffix = zone + '[")]';

            return this.format(prefix + year + datetime + suffix);
        }

        function format(inputString) {
            if (!inputString) {
                inputString = this.isUtc()
                    ? hooks.defaultFormatUtc
                    : hooks.defaultFormat;
            }
            var output = formatMoment(this, inputString);
            return this.localeData().postformat(output);
        }

        function from(time, withoutSuffix) {
            if (
                this.isValid() &&
                ((isMoment(time) && time.isValid()) || createLocal(time).isValid())
            ) {
                return createDuration({ to: this, from: time })
                    .locale(this.locale())
                    .humanize(!withoutSuffix);
            } else {
                return this.localeData().invalidDate();
            }
        }

        function fromNow(withoutSuffix) {
            return this.from(createLocal(), withoutSuffix);
        }

        function to(time, withoutSuffix) {
            if (
                this.isValid() &&
                ((isMoment(time) && time.isValid()) || createLocal(time).isValid())
            ) {
                return createDuration({ from: this, to: time })
                    .locale(this.locale())
                    .humanize(!withoutSuffix);
            } else {
                return this.localeData().invalidDate();
            }
        }

        function toNow(withoutSuffix) {
            return this.to(createLocal(), withoutSuffix);
        }

        // If passed a locale key, it will set the locale for this
        // instance.  Otherwise, it will return the locale configuration
        // variables for this instance.
        function locale(key) {
            var newLocaleData;

            if (key === undefined) {
                return this._locale._abbr;
            } else {
                newLocaleData = getLocale(key);
                if (newLocaleData != null) {
                    this._locale = newLocaleData;
                }
                return this;
            }
        }

        var lang = deprecate(
            'moment().lang() is deprecated. Instead, use moment().localeData() to get the language configuration. Use moment().locale() to change languages.',
            function (key) {
                if (key === undefined) {
                    return this.localeData();
                } else {
                    return this.locale(key);
                }
            }
        );

        function localeData() {
            return this._locale;
        }

        var MS_PER_SECOND = 1000,
            MS_PER_MINUTE = 60 * MS_PER_SECOND,
            MS_PER_HOUR = 60 * MS_PER_MINUTE,
            MS_PER_400_YEARS = (365 * 400 + 97) * 24 * MS_PER_HOUR;

        // actual modulo - handles negative numbers (for dates before 1970):
        function mod$1(dividend, divisor) {
            return ((dividend % divisor) + divisor) % divisor;
        }

        function localStartOfDate(y, m, d) {
            // the date constructor remaps years 0-99 to 1900-1999
            if (y < 100 && y >= 0) {
                // preserve leap years using a full 400 year cycle, then reset
                return new Date(y + 400, m, d) - MS_PER_400_YEARS;
            } else {
                return new Date(y, m, d).valueOf();
            }
        }

        function utcStartOfDate(y, m, d) {
            // Date.UTC remaps years 0-99 to 1900-1999
            if (y < 100 && y >= 0) {
                // preserve leap years using a full 400 year cycle, then reset
                return Date.UTC(y + 400, m, d) - MS_PER_400_YEARS;
            } else {
                return Date.UTC(y, m, d);
            }
        }

        function startOf(units) {
            var time, startOfDate;
            units = normalizeUnits(units);
            if (units === undefined || units === 'millisecond' || !this.isValid()) {
                return this;
            }

            startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

            switch (units) {
                case 'year':
                    time = startOfDate(this.year(), 0, 1);
                    break;
                case 'quarter':
                    time = startOfDate(
                        this.year(),
                        this.month() - (this.month() % 3),
                        1
                    );
                    break;
                case 'month':
                    time = startOfDate(this.year(), this.month(), 1);
                    break;
                case 'week':
                    time = startOfDate(
                        this.year(),
                        this.month(),
                        this.date() - this.weekday()
                    );
                    break;
                case 'isoWeek':
                    time = startOfDate(
                        this.year(),
                        this.month(),
                        this.date() - (this.isoWeekday() - 1)
                    );
                    break;
                case 'day':
                case 'date':
                    time = startOfDate(this.year(), this.month(), this.date());
                    break;
                case 'hour':
                    time = this._d.valueOf();
                    time -= mod$1(
                        time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE),
                        MS_PER_HOUR
                    );
                    break;
                case 'minute':
                    time = this._d.valueOf();
                    time -= mod$1(time, MS_PER_MINUTE);
                    break;
                case 'second':
                    time = this._d.valueOf();
                    time -= mod$1(time, MS_PER_SECOND);
                    break;
            }

            this._d.setTime(time);
            hooks.updateOffset(this, true);
            return this;
        }

        function endOf(units) {
            var time, startOfDate;
            units = normalizeUnits(units);
            if (units === undefined || units === 'millisecond' || !this.isValid()) {
                return this;
            }

            startOfDate = this._isUTC ? utcStartOfDate : localStartOfDate;

            switch (units) {
                case 'year':
                    time = startOfDate(this.year() + 1, 0, 1) - 1;
                    break;
                case 'quarter':
                    time =
                        startOfDate(
                            this.year(),
                            this.month() - (this.month() % 3) + 3,
                            1
                        ) - 1;
                    break;
                case 'month':
                    time = startOfDate(this.year(), this.month() + 1, 1) - 1;
                    break;
                case 'week':
                    time =
                        startOfDate(
                            this.year(),
                            this.month(),
                            this.date() - this.weekday() + 7
                        ) - 1;
                    break;
                case 'isoWeek':
                    time =
                        startOfDate(
                            this.year(),
                            this.month(),
                            this.date() - (this.isoWeekday() - 1) + 7
                        ) - 1;
                    break;
                case 'day':
                case 'date':
                    time = startOfDate(this.year(), this.month(), this.date() + 1) - 1;
                    break;
                case 'hour':
                    time = this._d.valueOf();
                    time +=
                        MS_PER_HOUR -
                        mod$1(
                            time + (this._isUTC ? 0 : this.utcOffset() * MS_PER_MINUTE),
                            MS_PER_HOUR
                        ) -
                        1;
                    break;
                case 'minute':
                    time = this._d.valueOf();
                    time += MS_PER_MINUTE - mod$1(time, MS_PER_MINUTE) - 1;
                    break;
                case 'second':
                    time = this._d.valueOf();
                    time += MS_PER_SECOND - mod$1(time, MS_PER_SECOND) - 1;
                    break;
            }

            this._d.setTime(time);
            hooks.updateOffset(this, true);
            return this;
        }

        function valueOf() {
            return this._d.valueOf() - (this._offset || 0) * 60000;
        }

        function unix() {
            return Math.floor(this.valueOf() / 1000);
        }

        function toDate() {
            return new Date(this.valueOf());
        }

        function toArray() {
            var m = this;
            return [
                m.year(),
                m.month(),
                m.date(),
                m.hour(),
                m.minute(),
                m.second(),
                m.millisecond(),
            ];
        }

        function toObject() {
            var m = this;
            return {
                years: m.year(),
                months: m.month(),
                date: m.date(),
                hours: m.hours(),
                minutes: m.minutes(),
                seconds: m.seconds(),
                milliseconds: m.milliseconds(),
            };
        }

        function toJSON() {
            // new Date(NaN).toJSON() === null
            return this.isValid() ? this.toISOString() : null;
        }

        function isValid$2() {
            return isValid(this);
        }

        function parsingFlags() {
            return extend({}, getParsingFlags(this));
        }

        function invalidAt() {
            return getParsingFlags(this).overflow;
        }

        function creationData() {
            return {
                input: this._i,
                format: this._f,
                locale: this._locale,
                isUTC: this._isUTC,
                strict: this._strict,
            };
        }

        addFormatToken('N', 0, 0, 'eraAbbr');
        addFormatToken('NN', 0, 0, 'eraAbbr');
        addFormatToken('NNN', 0, 0, 'eraAbbr');
        addFormatToken('NNNN', 0, 0, 'eraName');
        addFormatToken('NNNNN', 0, 0, 'eraNarrow');

        addFormatToken('y', ['y', 1], 'yo', 'eraYear');
        addFormatToken('y', ['yy', 2], 0, 'eraYear');
        addFormatToken('y', ['yyy', 3], 0, 'eraYear');
        addFormatToken('y', ['yyyy', 4], 0, 'eraYear');

        addRegexToken('N', matchEraAbbr);
        addRegexToken('NN', matchEraAbbr);
        addRegexToken('NNN', matchEraAbbr);
        addRegexToken('NNNN', matchEraName);
        addRegexToken('NNNNN', matchEraNarrow);

        addParseToken(['N', 'NN', 'NNN', 'NNNN', 'NNNNN'], function (
            input,
            array,
            config,
            token
        ) {
            var era = config._locale.erasParse(input, token, config._strict);
            if (era) {
                getParsingFlags(config).era = era;
            } else {
                getParsingFlags(config).invalidEra = input;
            }
        });

        addRegexToken('y', matchUnsigned);
        addRegexToken('yy', matchUnsigned);
        addRegexToken('yyy', matchUnsigned);
        addRegexToken('yyyy', matchUnsigned);
        addRegexToken('yo', matchEraYearOrdinal);

        addParseToken(['y', 'yy', 'yyy', 'yyyy'], YEAR);
        addParseToken(['yo'], function (input, array, config, token) {
            var match;
            if (config._locale._eraYearOrdinalRegex) {
                match = input.match(config._locale._eraYearOrdinalRegex);
            }

            if (config._locale.eraYearOrdinalParse) {
                array[YEAR] = config._locale.eraYearOrdinalParse(input, match);
            } else {
                array[YEAR] = parseInt(input, 10);
            }
        });

        function localeEras(m, format) {
            var i,
                l,
                date,
                eras = this._eras || getLocale('en')._eras;
            for (i = 0, l = eras.length; i < l; ++i) {
                switch (typeof eras[i].since) {
                    case 'string':
                        // truncate time
                        date = hooks(eras[i].since).startOf('day');
                        eras[i].since = date.valueOf();
                        break;
                }

                switch (typeof eras[i].until) {
                    case 'undefined':
                        eras[i].until = +Infinity;
                        break;
                    case 'string':
                        // truncate time
                        date = hooks(eras[i].until).startOf('day').valueOf();
                        eras[i].until = date.valueOf();
                        break;
                }
            }
            return eras;
        }

        function localeErasParse(eraName, format, strict) {
            var i,
                l,
                eras = this.eras(),
                name,
                abbr,
                narrow;
            eraName = eraName.toUpperCase();

            for (i = 0, l = eras.length; i < l; ++i) {
                name = eras[i].name.toUpperCase();
                abbr = eras[i].abbr.toUpperCase();
                narrow = eras[i].narrow.toUpperCase();

                if (strict) {
                    switch (format) {
                        case 'N':
                        case 'NN':
                        case 'NNN':
                            if (abbr === eraName) {
                                return eras[i];
                            }
                            break;

                        case 'NNNN':
                            if (name === eraName) {
                                return eras[i];
                            }
                            break;

                        case 'NNNNN':
                            if (narrow === eraName) {
                                return eras[i];
                            }
                            break;
                    }
                } else if ([name, abbr, narrow].indexOf(eraName) >= 0) {
                    return eras[i];
                }
            }
        }

        function localeErasConvertYear(era, year) {
            var dir = era.since <= era.until ? +1 : -1;
            if (year === undefined) {
                return hooks(era.since).year();
            } else {
                return hooks(era.since).year() + (year - era.offset) * dir;
            }
        }

        function getEraName() {
            var i,
                l,
                val,
                eras = this.localeData().eras();
            for (i = 0, l = eras.length; i < l; ++i) {
                // truncate time
                val = this.clone().startOf('day').valueOf();

                if (eras[i].since <= val && val <= eras[i].until) {
                    return eras[i].name;
                }
                if (eras[i].until <= val && val <= eras[i].since) {
                    return eras[i].name;
                }
            }

            return '';
        }

        function getEraNarrow() {
            var i,
                l,
                val,
                eras = this.localeData().eras();
            for (i = 0, l = eras.length; i < l; ++i) {
                // truncate time
                val = this.clone().startOf('day').valueOf();

                if (eras[i].since <= val && val <= eras[i].until) {
                    return eras[i].narrow;
                }
                if (eras[i].until <= val && val <= eras[i].since) {
                    return eras[i].narrow;
                }
            }

            return '';
        }

        function getEraAbbr() {
            var i,
                l,
                val,
                eras = this.localeData().eras();
            for (i = 0, l = eras.length; i < l; ++i) {
                // truncate time
                val = this.clone().startOf('day').valueOf();

                if (eras[i].since <= val && val <= eras[i].until) {
                    return eras[i].abbr;
                }
                if (eras[i].until <= val && val <= eras[i].since) {
                    return eras[i].abbr;
                }
            }

            return '';
        }

        function getEraYear() {
            var i,
                l,
                dir,
                val,
                eras = this.localeData().eras();
            for (i = 0, l = eras.length; i < l; ++i) {
                dir = eras[i].since <= eras[i].until ? +1 : -1;

                // truncate time
                val = this.clone().startOf('day').valueOf();

                if (
                    (eras[i].since <= val && val <= eras[i].until) ||
                    (eras[i].until <= val && val <= eras[i].since)
                ) {
                    return (
                        (this.year() - hooks(eras[i].since).year()) * dir +
                        eras[i].offset
                    );
                }
            }

            return this.year();
        }

        function erasNameRegex(isStrict) {
            if (!hasOwnProp(this, '_erasNameRegex')) {
                computeErasParse.call(this);
            }
            return isStrict ? this._erasNameRegex : this._erasRegex;
        }

        function erasAbbrRegex(isStrict) {
            if (!hasOwnProp(this, '_erasAbbrRegex')) {
                computeErasParse.call(this);
            }
            return isStrict ? this._erasAbbrRegex : this._erasRegex;
        }

        function erasNarrowRegex(isStrict) {
            if (!hasOwnProp(this, '_erasNarrowRegex')) {
                computeErasParse.call(this);
            }
            return isStrict ? this._erasNarrowRegex : this._erasRegex;
        }

        function matchEraAbbr(isStrict, locale) {
            return locale.erasAbbrRegex(isStrict);
        }

        function matchEraName(isStrict, locale) {
            return locale.erasNameRegex(isStrict);
        }

        function matchEraNarrow(isStrict, locale) {
            return locale.erasNarrowRegex(isStrict);
        }

        function matchEraYearOrdinal(isStrict, locale) {
            return locale._eraYearOrdinalRegex || matchUnsigned;
        }

        function computeErasParse() {
            var abbrPieces = [],
                namePieces = [],
                narrowPieces = [],
                mixedPieces = [],
                i,
                l,
                eras = this.eras();

            for (i = 0, l = eras.length; i < l; ++i) {
                namePieces.push(regexEscape(eras[i].name));
                abbrPieces.push(regexEscape(eras[i].abbr));
                narrowPieces.push(regexEscape(eras[i].narrow));

                mixedPieces.push(regexEscape(eras[i].name));
                mixedPieces.push(regexEscape(eras[i].abbr));
                mixedPieces.push(regexEscape(eras[i].narrow));
            }

            this._erasRegex = new RegExp('^(' + mixedPieces.join('|') + ')', 'i');
            this._erasNameRegex = new RegExp('^(' + namePieces.join('|') + ')', 'i');
            this._erasAbbrRegex = new RegExp('^(' + abbrPieces.join('|') + ')', 'i');
            this._erasNarrowRegex = new RegExp(
                '^(' + narrowPieces.join('|') + ')',
                'i'
            );
        }

        // FORMATTING

        addFormatToken(0, ['gg', 2], 0, function () {
            return this.weekYear() % 100;
        });

        addFormatToken(0, ['GG', 2], 0, function () {
            return this.isoWeekYear() % 100;
        });

        function addWeekYearFormatToken(token, getter) {
            addFormatToken(0, [token, token.length], 0, getter);
        }

        addWeekYearFormatToken('gggg', 'weekYear');
        addWeekYearFormatToken('ggggg', 'weekYear');
        addWeekYearFormatToken('GGGG', 'isoWeekYear');
        addWeekYearFormatToken('GGGGG', 'isoWeekYear');

        // ALIASES

        addUnitAlias('weekYear', 'gg');
        addUnitAlias('isoWeekYear', 'GG');

        // PRIORITY

        addUnitPriority('weekYear', 1);
        addUnitPriority('isoWeekYear', 1);

        // PARSING

        addRegexToken('G', matchSigned);
        addRegexToken('g', matchSigned);
        addRegexToken('GG', match1to2, match2);
        addRegexToken('gg', match1to2, match2);
        addRegexToken('GGGG', match1to4, match4);
        addRegexToken('gggg', match1to4, match4);
        addRegexToken('GGGGG', match1to6, match6);
        addRegexToken('ggggg', match1to6, match6);

        addWeekParseToken(['gggg', 'ggggg', 'GGGG', 'GGGGG'], function (
            input,
            week,
            config,
            token
        ) {
            week[token.substr(0, 2)] = toInt(input);
        });

        addWeekParseToken(['gg', 'GG'], function (input, week, config, token) {
            week[token] = hooks.parseTwoDigitYear(input);
        });

        // MOMENTS

        function getSetWeekYear(input) {
            return getSetWeekYearHelper.call(
                this,
                input,
                this.week(),
                this.weekday(),
                this.localeData()._week.dow,
                this.localeData()._week.doy
            );
        }

        function getSetISOWeekYear(input) {
            return getSetWeekYearHelper.call(
                this,
                input,
                this.isoWeek(),
                this.isoWeekday(),
                1,
                4
            );
        }

        function getISOWeeksInYear() {
            return weeksInYear(this.year(), 1, 4);
        }

        function getISOWeeksInISOWeekYear() {
            return weeksInYear(this.isoWeekYear(), 1, 4);
        }

        function getWeeksInYear() {
            var weekInfo = this.localeData()._week;
            return weeksInYear(this.year(), weekInfo.dow, weekInfo.doy);
        }

        function getWeeksInWeekYear() {
            var weekInfo = this.localeData()._week;
            return weeksInYear(this.weekYear(), weekInfo.dow, weekInfo.doy);
        }

        function getSetWeekYearHelper(input, week, weekday, dow, doy) {
            var weeksTarget;
            if (input == null) {
                return weekOfYear(this, dow, doy).year;
            } else {
                weeksTarget = weeksInYear(input, dow, doy);
                if (week > weeksTarget) {
                    week = weeksTarget;
                }
                return setWeekAll.call(this, input, week, weekday, dow, doy);
            }
        }

        function setWeekAll(weekYear, week, weekday, dow, doy) {
            var dayOfYearData = dayOfYearFromWeeks(weekYear, week, weekday, dow, doy),
                date = createUTCDate(dayOfYearData.year, 0, dayOfYearData.dayOfYear);

            this.year(date.getUTCFullYear());
            this.month(date.getUTCMonth());
            this.date(date.getUTCDate());
            return this;
        }

        // FORMATTING

        addFormatToken('Q', 0, 'Qo', 'quarter');

        // ALIASES

        addUnitAlias('quarter', 'Q');

        // PRIORITY

        addUnitPriority('quarter', 7);

        // PARSING

        addRegexToken('Q', match1);
        addParseToken('Q', function (input, array) {
            array[MONTH] = (toInt(input) - 1) * 3;
        });

        // MOMENTS

        function getSetQuarter(input) {
            return input == null
                ? Math.ceil((this.month() + 1) / 3)
                : this.month((input - 1) * 3 + (this.month() % 3));
        }

        // FORMATTING

        addFormatToken('D', ['DD', 2], 'Do', 'date');

        // ALIASES

        addUnitAlias('date', 'D');

        // PRIORITY
        addUnitPriority('date', 9);

        // PARSING

        addRegexToken('D', match1to2);
        addRegexToken('DD', match1to2, match2);
        addRegexToken('Do', function (isStrict, locale) {
            // TODO: Remove "ordinalParse" fallback in next major release.
            return isStrict
                ? locale._dayOfMonthOrdinalParse || locale._ordinalParse
                : locale._dayOfMonthOrdinalParseLenient;
        });

        addParseToken(['D', 'DD'], DATE);
        addParseToken('Do', function (input, array) {
            array[DATE] = toInt(input.match(match1to2)[0]);
        });

        // MOMENTS

        var getSetDayOfMonth = makeGetSet('Date', true);

        // FORMATTING

        addFormatToken('DDD', ['DDDD', 3], 'DDDo', 'dayOfYear');

        // ALIASES

        addUnitAlias('dayOfYear', 'DDD');

        // PRIORITY
        addUnitPriority('dayOfYear', 4);

        // PARSING

        addRegexToken('DDD', match1to3);
        addRegexToken('DDDD', match3);
        addParseToken(['DDD', 'DDDD'], function (input, array, config) {
            config._dayOfYear = toInt(input);
        });

        // HELPERS

        // MOMENTS

        function getSetDayOfYear(input) {
            var dayOfYear =
                Math.round(
                    (this.clone().startOf('day') - this.clone().startOf('year')) / 864e5
                ) + 1;
            return input == null ? dayOfYear : this.add(input - dayOfYear, 'd');
        }

        // FORMATTING

        addFormatToken('m', ['mm', 2], 0, 'minute');

        // ALIASES

        addUnitAlias('minute', 'm');

        // PRIORITY

        addUnitPriority('minute', 14);

        // PARSING

        addRegexToken('m', match1to2);
        addRegexToken('mm', match1to2, match2);
        addParseToken(['m', 'mm'], MINUTE);

        // MOMENTS

        var getSetMinute = makeGetSet('Minutes', false);

        // FORMATTING

        addFormatToken('s', ['ss', 2], 0, 'second');

        // ALIASES

        addUnitAlias('second', 's');

        // PRIORITY

        addUnitPriority('second', 15);

        // PARSING

        addRegexToken('s', match1to2);
        addRegexToken('ss', match1to2, match2);
        addParseToken(['s', 'ss'], SECOND);

        // MOMENTS

        var getSetSecond = makeGetSet('Seconds', false);

        // FORMATTING

        addFormatToken('S', 0, 0, function () {
            return ~~(this.millisecond() / 100);
        });

        addFormatToken(0, ['SS', 2], 0, function () {
            return ~~(this.millisecond() / 10);
        });

        addFormatToken(0, ['SSS', 3], 0, 'millisecond');
        addFormatToken(0, ['SSSS', 4], 0, function () {
            return this.millisecond() * 10;
        });
        addFormatToken(0, ['SSSSS', 5], 0, function () {
            return this.millisecond() * 100;
        });
        addFormatToken(0, ['SSSSSS', 6], 0, function () {
            return this.millisecond() * 1000;
        });
        addFormatToken(0, ['SSSSSSS', 7], 0, function () {
            return this.millisecond() * 10000;
        });
        addFormatToken(0, ['SSSSSSSS', 8], 0, function () {
            return this.millisecond() * 100000;
        });
        addFormatToken(0, ['SSSSSSSSS', 9], 0, function () {
            return this.millisecond() * 1000000;
        });

        // ALIASES

        addUnitAlias('millisecond', 'ms');

        // PRIORITY

        addUnitPriority('millisecond', 16);

        // PARSING

        addRegexToken('S', match1to3, match1);
        addRegexToken('SS', match1to3, match2);
        addRegexToken('SSS', match1to3, match3);

        var token, getSetMillisecond;
        for (token = 'SSSS'; token.length <= 9; token += 'S') {
            addRegexToken(token, matchUnsigned);
        }

        function parseMs(input, array) {
            array[MILLISECOND] = toInt(('0.' + input) * 1000);
        }

        for (token = 'S'; token.length <= 9; token += 'S') {
            addParseToken(token, parseMs);
        }

        getSetMillisecond = makeGetSet('Milliseconds', false);

        // FORMATTING

        addFormatToken('z', 0, 0, 'zoneAbbr');
        addFormatToken('zz', 0, 0, 'zoneName');

        // MOMENTS

        function getZoneAbbr() {
            return this._isUTC ? 'UTC' : '';
        }

        function getZoneName() {
            return this._isUTC ? 'Coordinated Universal Time' : '';
        }

        var proto = Moment.prototype;

        proto.add = add;
        proto.calendar = calendar$1;
        proto.clone = clone;
        proto.diff = diff;
        proto.endOf = endOf;
        proto.format = format;
        proto.from = from;
        proto.fromNow = fromNow;
        proto.to = to;
        proto.toNow = toNow;
        proto.get = stringGet;
        proto.invalidAt = invalidAt;
        proto.isAfter = isAfter;
        proto.isBefore = isBefore;
        proto.isBetween = isBetween;
        proto.isSame = isSame;
        proto.isSameOrAfter = isSameOrAfter;
        proto.isSameOrBefore = isSameOrBefore;
        proto.isValid = isValid$2;
        proto.lang = lang;
        proto.locale = locale;
        proto.localeData = localeData;
        proto.max = prototypeMax;
        proto.min = prototypeMin;
        proto.parsingFlags = parsingFlags;
        proto.set = stringSet;
        proto.startOf = startOf;
        proto.subtract = subtract;
        proto.toArray = toArray;
        proto.toObject = toObject;
        proto.toDate = toDate;
        proto.toISOString = toISOString;
        proto.inspect = inspect;
        if (typeof Symbol !== 'undefined' && Symbol.for != null) {
            proto[Symbol.for('nodejs.util.inspect.custom')] = function () {
                return 'Moment<' + this.format() + '>';
            };
        }
        proto.toJSON = toJSON;
        proto.toString = toString;
        proto.unix = unix;
        proto.valueOf = valueOf;
        proto.creationData = creationData;
        proto.eraName = getEraName;
        proto.eraNarrow = getEraNarrow;
        proto.eraAbbr = getEraAbbr;
        proto.eraYear = getEraYear;
        proto.year = getSetYear;
        proto.isLeapYear = getIsLeapYear;
        proto.weekYear = getSetWeekYear;
        proto.isoWeekYear = getSetISOWeekYear;
        proto.quarter = proto.quarters = getSetQuarter;
        proto.month = getSetMonth;
        proto.daysInMonth = getDaysInMonth;
        proto.week = proto.weeks = getSetWeek;
        proto.isoWeek = proto.isoWeeks = getSetISOWeek;
        proto.weeksInYear = getWeeksInYear;
        proto.weeksInWeekYear = getWeeksInWeekYear;
        proto.isoWeeksInYear = getISOWeeksInYear;
        proto.isoWeeksInISOWeekYear = getISOWeeksInISOWeekYear;
        proto.date = getSetDayOfMonth;
        proto.day = proto.days = getSetDayOfWeek;
        proto.weekday = getSetLocaleDayOfWeek;
        proto.isoWeekday = getSetISODayOfWeek;
        proto.dayOfYear = getSetDayOfYear;
        proto.hour = proto.hours = getSetHour;
        proto.minute = proto.minutes = getSetMinute;
        proto.second = proto.seconds = getSetSecond;
        proto.millisecond = proto.milliseconds = getSetMillisecond;
        proto.utcOffset = getSetOffset;
        proto.utc = setOffsetToUTC;
        proto.local = setOffsetToLocal;
        proto.parseZone = setOffsetToParsedOffset;
        proto.hasAlignedHourOffset = hasAlignedHourOffset;
        proto.isDST = isDaylightSavingTime;
        proto.isLocal = isLocal;
        proto.isUtcOffset = isUtcOffset;
        proto.isUtc = isUtc;
        proto.isUTC = isUtc;
        proto.zoneAbbr = getZoneAbbr;
        proto.zoneName = getZoneName;
        proto.dates = deprecate(
            'dates accessor is deprecated. Use date instead.',
            getSetDayOfMonth
        );
        proto.months = deprecate(
            'months accessor is deprecated. Use month instead',
            getSetMonth
        );
        proto.years = deprecate(
            'years accessor is deprecated. Use year instead',
            getSetYear
        );
        proto.zone = deprecate(
            'moment().zone is deprecated, use moment().utcOffset instead. http://momentjs.com/guides/#/warnings/zone/',
            getSetZone
        );
        proto.isDSTShifted = deprecate(
            'isDSTShifted is deprecated. See http://momentjs.com/guides/#/warnings/dst-shifted/ for more information',
            isDaylightSavingTimeShifted
        );

        function createUnix(input) {
            return createLocal(input * 1000);
        }

        function createInZone() {
            return createLocal.apply(null, arguments).parseZone();
        }

        function preParsePostFormat(string) {
            return string;
        }

        var proto$1 = Locale.prototype;

        proto$1.calendar = calendar;
        proto$1.longDateFormat = longDateFormat;
        proto$1.invalidDate = invalidDate;
        proto$1.ordinal = ordinal;
        proto$1.preparse = preParsePostFormat;
        proto$1.postformat = preParsePostFormat;
        proto$1.relativeTime = relativeTime;
        proto$1.pastFuture = pastFuture;
        proto$1.set = set;
        proto$1.eras = localeEras;
        proto$1.erasParse = localeErasParse;
        proto$1.erasConvertYear = localeErasConvertYear;
        proto$1.erasAbbrRegex = erasAbbrRegex;
        proto$1.erasNameRegex = erasNameRegex;
        proto$1.erasNarrowRegex = erasNarrowRegex;

        proto$1.months = localeMonths;
        proto$1.monthsShort = localeMonthsShort;
        proto$1.monthsParse = localeMonthsParse;
        proto$1.monthsRegex = monthsRegex;
        proto$1.monthsShortRegex = monthsShortRegex;
        proto$1.week = localeWeek;
        proto$1.firstDayOfYear = localeFirstDayOfYear;
        proto$1.firstDayOfWeek = localeFirstDayOfWeek;

        proto$1.weekdays = localeWeekdays;
        proto$1.weekdaysMin = localeWeekdaysMin;
        proto$1.weekdaysShort = localeWeekdaysShort;
        proto$1.weekdaysParse = localeWeekdaysParse;

        proto$1.weekdaysRegex = weekdaysRegex;
        proto$1.weekdaysShortRegex = weekdaysShortRegex;
        proto$1.weekdaysMinRegex = weekdaysMinRegex;

        proto$1.isPM = localeIsPM;
        proto$1.meridiem = localeMeridiem;

        function get$1(format, index, field, setter) {
            var locale = getLocale(),
                utc = createUTC().set(setter, index);
            return locale[field](utc, format);
        }

        function listMonthsImpl(format, index, field) {
            if (isNumber(format)) {
                index = format;
                format = undefined;
            }

            format = format || '';

            if (index != null) {
                return get$1(format, index, field, 'month');
            }

            var i,
                out = [];
            for (i = 0; i < 12; i++) {
                out[i] = get$1(format, i, field, 'month');
            }
            return out;
        }

        // ()
        // (5)
        // (fmt, 5)
        // (fmt)
        // (true)
        // (true, 5)
        // (true, fmt, 5)
        // (true, fmt)
        function listWeekdaysImpl(localeSorted, format, index, field) {
            if (typeof localeSorted === 'boolean') {
                if (isNumber(format)) {
                    index = format;
                    format = undefined;
                }

                format = format || '';
            } else {
                format = localeSorted;
                index = format;
                localeSorted = false;

                if (isNumber(format)) {
                    index = format;
                    format = undefined;
                }

                format = format || '';
            }

            var locale = getLocale(),
                shift = localeSorted ? locale._week.dow : 0,
                i,
                out = [];

            if (index != null) {
                return get$1(format, (index + shift) % 7, field, 'day');
            }

            for (i = 0; i < 7; i++) {
                out[i] = get$1(format, (i + shift) % 7, field, 'day');
            }
            return out;
        }

        function listMonths(format, index) {
            return listMonthsImpl(format, index, 'months');
        }

        function listMonthsShort(format, index) {
            return listMonthsImpl(format, index, 'monthsShort');
        }

        function listWeekdays(localeSorted, format, index) {
            return listWeekdaysImpl(localeSorted, format, index, 'weekdays');
        }

        function listWeekdaysShort(localeSorted, format, index) {
            return listWeekdaysImpl(localeSorted, format, index, 'weekdaysShort');
        }

        function listWeekdaysMin(localeSorted, format, index) {
            return listWeekdaysImpl(localeSorted, format, index, 'weekdaysMin');
        }

        getSetGlobalLocale('en', {
            eras: [
                {
                    since: '0001-01-01',
                    until: +Infinity,
                    offset: 1,
                    name: 'Anno Domini',
                    narrow: 'AD',
                    abbr: 'AD',
                },
                {
                    since: '0000-12-31',
                    until: -Infinity,
                    offset: 1,
                    name: 'Before Christ',
                    narrow: 'BC',
                    abbr: 'BC',
                },
            ],
            dayOfMonthOrdinalParse: /\d{1,2}(th|st|nd|rd)/,
            ordinal: function (number) {
                var b = number % 10,
                    output =
                        toInt((number % 100) / 10) === 1
                            ? 'th'
                            : b === 1
                                ? 'st'
                                : b === 2
                                    ? 'nd'
                                    : b === 3
                                        ? 'rd'
                                        : 'th';
                return number + output;
            },
        });

        // Side effect imports

        hooks.lang = deprecate(
            'moment.lang is deprecated. Use moment.locale instead.',
            getSetGlobalLocale
        );
        hooks.langData = deprecate(
            'moment.langData is deprecated. Use moment.localeData instead.',
            getLocale
        );

        var mathAbs = Math.abs;

        function abs() {
            var data = this._data;

            this._milliseconds = mathAbs(this._milliseconds);
            this._days = mathAbs(this._days);
            this._months = mathAbs(this._months);

            data.milliseconds = mathAbs(data.milliseconds);
            data.seconds = mathAbs(data.seconds);
            data.minutes = mathAbs(data.minutes);
            data.hours = mathAbs(data.hours);
            data.months = mathAbs(data.months);
            data.years = mathAbs(data.years);

            return this;
        }

        function addSubtract$1(duration, input, value, direction) {
            var other = createDuration(input, value);

            duration._milliseconds += direction * other._milliseconds;
            duration._days += direction * other._days;
            duration._months += direction * other._months;

            return duration._bubble();
        }

        // supports only 2.0-style add(1, 's') or add(duration)
        function add$1(input, value) {
            return addSubtract$1(this, input, value, 1);
        }

        // supports only 2.0-style subtract(1, 's') or subtract(duration)
        function subtract$1(input, value) {
            return addSubtract$1(this, input, value, -1);
        }

        function absCeil(number) {
            if (number < 0) {
                return Math.floor(number);
            } else {
                return Math.ceil(number);
            }
        }

        function bubble() {
            var milliseconds = this._milliseconds,
                days = this._days,
                months = this._months,
                data = this._data,
                seconds,
                minutes,
                hours,
                years,
                monthsFromDays;

            // if we have a mix of positive and negative values, bubble down first
            // check: https://github.com/moment/moment/issues/2166
            if (
                !(
                    (milliseconds >= 0 && days >= 0 && months >= 0) ||
                    (milliseconds <= 0 && days <= 0 && months <= 0)
                )
            ) {
                milliseconds += absCeil(monthsToDays(months) + days) * 864e5;
                days = 0;
                months = 0;
            }

            // The following code bubbles up values, see the tests for
            // examples of what that means.
            data.milliseconds = milliseconds % 1000;

            seconds = absFloor(milliseconds / 1000);
            data.seconds = seconds % 60;

            minutes = absFloor(seconds / 60);
            data.minutes = minutes % 60;

            hours = absFloor(minutes / 60);
            data.hours = hours % 24;

            days += absFloor(hours / 24);

            // convert days to months
            monthsFromDays = absFloor(daysToMonths(days));
            months += monthsFromDays;
            days -= absCeil(monthsToDays(monthsFromDays));

            // 12 months -> 1 year
            years = absFloor(months / 12);
            months %= 12;

            data.days = days;
            data.months = months;
            data.years = years;

            return this;
        }

        function daysToMonths(days) {
            // 400 years have 146097 days (taking into account leap year rules)
            // 400 years have 12 months === 4800
            return (days * 4800) / 146097;
        }

        function monthsToDays(months) {
            // the reverse of daysToMonths
            return (months * 146097) / 4800;
        }

        function as(units) {
            if (!this.isValid()) {
                return NaN;
            }
            var days,
                months,
                milliseconds = this._milliseconds;

            units = normalizeUnits(units);

            if (units === 'month' || units === 'quarter' || units === 'year') {
                days = this._days + milliseconds / 864e5;
                months = this._months + daysToMonths(days);
                switch (units) {
                    case 'month':
                        return months;
                    case 'quarter':
                        return months / 3;
                    case 'year':
                        return months / 12;
                }
            } else {
                // handle milliseconds separately because of floating point math errors (issue #1867)
                days = this._days + Math.round(monthsToDays(this._months));
                switch (units) {
                    case 'week':
                        return days / 7 + milliseconds / 6048e5;
                    case 'day':
                        return days + milliseconds / 864e5;
                    case 'hour':
                        return days * 24 + milliseconds / 36e5;
                    case 'minute':
                        return days * 1440 + milliseconds / 6e4;
                    case 'second':
                        return days * 86400 + milliseconds / 1000;
                    // Math.floor prevents floating point math errors here
                    case 'millisecond':
                        return Math.floor(days * 864e5) + milliseconds;
                    default:
                        throw new Error('Unknown unit ' + units);
                }
            }
        }

        // TODO: Use this.as('ms')?
        function valueOf$1() {
            if (!this.isValid()) {
                return NaN;
            }
            return (
                this._milliseconds +
                this._days * 864e5 +
                (this._months % 12) * 2592e6 +
                toInt(this._months / 12) * 31536e6
            );
        }

        function makeAs(alias) {
            return function () {
                return this.as(alias);
            };
        }

        var asMilliseconds = makeAs('ms'),
            asSeconds = makeAs('s'),
            asMinutes = makeAs('m'),
            asHours = makeAs('h'),
            asDays = makeAs('d'),
            asWeeks = makeAs('w'),
            asMonths = makeAs('M'),
            asQuarters = makeAs('Q'),
            asYears = makeAs('y');

        function clone$1() {
            return createDuration(this);
        }

        function get$2(units) {
            units = normalizeUnits(units);
            return this.isValid() ? this[units + 's']() : NaN;
        }

        function makeGetter(name) {
            return function () {
                return this.isValid() ? this._data[name] : NaN;
            };
        }

        var milliseconds = makeGetter('milliseconds'),
            seconds = makeGetter('seconds'),
            minutes = makeGetter('minutes'),
            hours = makeGetter('hours'),
            days = makeGetter('days'),
            months = makeGetter('months'),
            years = makeGetter('years');

        function weeks() {
            return absFloor(this.days() / 7);
        }

        var round = Math.round,
            thresholds = {
                ss: 44, // a few seconds to seconds
                s: 45, // seconds to minute
                m: 45, // minutes to hour
                h: 22, // hours to day
                d: 26, // days to month/week
                w: null, // weeks to month
                M: 11, // months to year
            };

        // helper function for moment.fn.from, moment.fn.fromNow, and moment.duration.fn.humanize
        function substituteTimeAgo(string, number, withoutSuffix, isFuture, locale) {
            return locale.relativeTime(number || 1, !!withoutSuffix, string, isFuture);
        }

        function relativeTime$1(posNegDuration, withoutSuffix, thresholds, locale) {
            var duration = createDuration(posNegDuration).abs(),
                seconds = round(duration.as('s')),
                minutes = round(duration.as('m')),
                hours = round(duration.as('h')),
                days = round(duration.as('d')),
                months = round(duration.as('M')),
                weeks = round(duration.as('w')),
                years = round(duration.as('y')),
                a =
                    (seconds <= thresholds.ss && ['s', seconds]) ||
                    (seconds < thresholds.s && ['ss', seconds]) ||
                    (minutes <= 1 && ['m']) ||
                    (minutes < thresholds.m && ['mm', minutes]) ||
                    (hours <= 1 && ['h']) ||
                    (hours < thresholds.h && ['hh', hours]) ||
                    (days <= 1 && ['d']) ||
                    (days < thresholds.d && ['dd', days]);

            if (thresholds.w != null) {
                a =
                    a ||
                    (weeks <= 1 && ['w']) ||
                    (weeks < thresholds.w && ['ww', weeks]);
            }
            a = a ||
                (months <= 1 && ['M']) ||
                (months < thresholds.M && ['MM', months]) ||
                (years <= 1 && ['y']) || ['yy', years];

            a[2] = withoutSuffix;
            a[3] = +posNegDuration > 0;
            a[4] = locale;
            return substituteTimeAgo.apply(null, a);
        }

        // This function allows you to set the rounding function for relative time strings
        function getSetRelativeTimeRounding(roundingFunction) {
            if (roundingFunction === undefined) {
                return round;
            }
            if (typeof roundingFunction === 'function') {
                round = roundingFunction;
                return true;
            }
            return false;
        }

        // This function allows you to set a threshold for relative time strings
        function getSetRelativeTimeThreshold(threshold, limit) {
            if (thresholds[threshold] === undefined) {
                return false;
            }
            if (limit === undefined) {
                return thresholds[threshold];
            }
            thresholds[threshold] = limit;
            if (threshold === 's') {
                thresholds.ss = limit - 1;
            }
            return true;
        }

        function humanize(argWithSuffix, argThresholds) {
            if (!this.isValid()) {
                return this.localeData().invalidDate();
            }

            var withSuffix = false,
                th = thresholds,
                locale,
                output;

            if (typeof argWithSuffix === 'object') {
                argThresholds = argWithSuffix;
                argWithSuffix = false;
            }
            if (typeof argWithSuffix === 'boolean') {
                withSuffix = argWithSuffix;
            }
            if (typeof argThresholds === 'object') {
                th = Object.assign({}, thresholds, argThresholds);
                if (argThresholds.s != null && argThresholds.ss == null) {
                    th.ss = argThresholds.s - 1;
                }
            }

            locale = this.localeData();
            output = relativeTime$1(this, !withSuffix, th, locale);

            if (withSuffix) {
                output = locale.pastFuture(+this, output);
            }

            return locale.postformat(output);
        }

        var abs$1 = Math.abs;

        function sign(x) {
            return (x > 0) - (x < 0) || +x;
        }

        function toISOString$1() {
            // for ISO strings we do not use the normal bubbling rules:
            //  * milliseconds bubble up until they become hours
            //  * days do not bubble at all
            //  * months bubble up until they become years
            // This is because there is no context-free conversion between hours and days
            // (think of clock changes)
            // and also not between days and months (28-31 days per month)
            if (!this.isValid()) {
                return this.localeData().invalidDate();
            }

            var seconds = abs$1(this._milliseconds) / 1000,
                days = abs$1(this._days),
                months = abs$1(this._months),
                minutes,
                hours,
                years,
                s,
                total = this.asSeconds(),
                totalSign,
                ymSign,
                daysSign,
                hmsSign;

            if (!total) {
                // this is the same as C#'s (Noda) and python (isodate)...
                // but not other JS (goog.date)
                return 'P0D';
            }

            // 3600 seconds -> 60 minutes -> 1 hour
            minutes = absFloor(seconds / 60);
            hours = absFloor(minutes / 60);
            seconds %= 60;
            minutes %= 60;

            // 12 months -> 1 year
            years = absFloor(months / 12);
            months %= 12;

            // inspired by https://github.com/dordille/moment-isoduration/blob/master/moment.isoduration.js
            s = seconds ? seconds.toFixed(3).replace(/\.?0+$/, '') : '';

            totalSign = total < 0 ? '-' : '';
            ymSign = sign(this._months) !== sign(total) ? '-' : '';
            daysSign = sign(this._days) !== sign(total) ? '-' : '';
            hmsSign = sign(this._milliseconds) !== sign(total) ? '-' : '';

            return (
                totalSign +
                'P' +
                (years ? ymSign + years + 'Y' : '') +
                (months ? ymSign + months + 'M' : '') +
                (days ? daysSign + days + 'D' : '') +
                (hours || minutes || seconds ? 'T' : '') +
                (hours ? hmsSign + hours + 'H' : '') +
                (minutes ? hmsSign + minutes + 'M' : '') +
                (seconds ? hmsSign + s + 'S' : '')
            );
        }

        var proto$2 = Duration.prototype;

        proto$2.isValid = isValid$1;
        proto$2.abs = abs;
        proto$2.add = add$1;
        proto$2.subtract = subtract$1;
        proto$2.as = as;
        proto$2.asMilliseconds = asMilliseconds;
        proto$2.asSeconds = asSeconds;
        proto$2.asMinutes = asMinutes;
        proto$2.asHours = asHours;
        proto$2.asDays = asDays;
        proto$2.asWeeks = asWeeks;
        proto$2.asMonths = asMonths;
        proto$2.asQuarters = asQuarters;
        proto$2.asYears = asYears;
        proto$2.valueOf = valueOf$1;
        proto$2._bubble = bubble;
        proto$2.clone = clone$1;
        proto$2.get = get$2;
        proto$2.milliseconds = milliseconds;
        proto$2.seconds = seconds;
        proto$2.minutes = minutes;
        proto$2.hours = hours;
        proto$2.days = days;
        proto$2.weeks = weeks;
        proto$2.months = months;
        proto$2.years = years;
        proto$2.humanize = humanize;
        proto$2.toISOString = toISOString$1;
        proto$2.toString = toISOString$1;
        proto$2.toJSON = toISOString$1;
        proto$2.locale = locale;
        proto$2.localeData = localeData;

        proto$2.toIsoString = deprecate(
            'toIsoString() is deprecated. Please use toISOString() instead (notice the capitals)',
            toISOString$1
        );
        proto$2.lang = lang;

        // FORMATTING

        addFormatToken('X', 0, 0, 'unix');
        addFormatToken('x', 0, 0, 'valueOf');

        // PARSING

        addRegexToken('x', matchSigned);
        addRegexToken('X', matchTimestamp);
        addParseToken('X', function (input, array, config) {
            config._d = new Date(parseFloat(input) * 1000);
        });
        addParseToken('x', function (input, array, config) {
            config._d = new Date(toInt(input));
        });

        //! moment.js

        hooks.version = '2.29.1';

        setHookCallback(createLocal);

        hooks.fn = proto;
        hooks.min = min;
        hooks.max = max;
        hooks.now = now;
        hooks.utc = createUTC;
        hooks.unix = createUnix;
        hooks.months = listMonths;
        hooks.isDate = isDate;
        hooks.locale = getSetGlobalLocale;
        hooks.invalid = createInvalid;
        hooks.duration = createDuration;
        hooks.isMoment = isMoment;
        hooks.weekdays = listWeekdays;
        hooks.parseZone = createInZone;
        hooks.localeData = getLocale;
        hooks.isDuration = isDuration;
        hooks.monthsShort = listMonthsShort;
        hooks.weekdaysMin = listWeekdaysMin;
        hooks.defineLocale = defineLocale;
        hooks.updateLocale = updateLocale;
        hooks.locales = listLocales;
        hooks.weekdaysShort = listWeekdaysShort;
        hooks.normalizeUnits = normalizeUnits;
        hooks.relativeTimeRounding = getSetRelativeTimeRounding;
        hooks.relativeTimeThreshold = getSetRelativeTimeThreshold;
        hooks.calendarFormat = getCalendarFormat;
        hooks.prototype = proto;

        // currently HTML5 input type only supports 24-hour formats
        hooks.HTML5_FMT = {
            DATETIME_LOCAL: 'YYYY-MM-DDTHH:mm', // <input type="datetime-local" />
            DATETIME_LOCAL_SECONDS: 'YYYY-MM-DDTHH:mm:ss', // <input type="datetime-local" step="1" />
            DATETIME_LOCAL_MS: 'YYYY-MM-DDTHH:mm:ss.SSS', // <input type="datetime-local" step="0.001" />
            DATE: 'YYYY-MM-DD', // <input type="date" />
            TIME: 'HH:mm', // <input type="time" />
            TIME_SECONDS: 'HH:mm:ss', // <input type="time" step="1" />
            TIME_MS: 'HH:mm:ss.SSS', // <input type="time" step="0.001" />
            WEEK: 'GGGG-[W]WW', // <input type="week" />
            MONTH: 'YYYY-MM', // <input type="month" />
        };

        return hooks;

    })));

//! moment-timezone.js
//! version : 0.5.31
//! Copyright (c) JS Foundation and other contributors
//! license : MIT
//! github.com/moment/moment-timezone

(function (root, factory) {
    "use strict";

    /*global define*/
    if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('moment')); // Node
    } else if (typeof define === 'function' && define.amd) {
        define(['moment'], factory);                 // AMD
    } else {
        factory(root.moment);                        // Browser
    }
}(this, function (moment) {
    "use strict";

    // Resolves es6 module loading issue
    if (moment.version === undefined && moment.default) {
        moment = moment.default;
    }

    // Do not load moment-timezone a second time.
    // if (moment.tz !== undefined) {
    // 	logError('Moment Timezone ' + moment.tz.version + ' was already loaded ' + (moment.tz.dataVersion ? 'with data from ' : 'without any data') + moment.tz.dataVersion);
    // 	return moment;
    // }

    var VERSION = "0.5.31",
        zones = {},
        links = {},
        countries = {},
        names = {},
        guesses = {},
        cachedGuess;

    if (!moment || typeof moment.version !== 'string') {
        logError('Moment Timezone requires Moment.js. See https://momentjs.com/timezone/docs/#/use-it/browser/');
    }

    var momentVersion = moment.version.split('.'),
        major = +momentVersion[0],
        minor = +momentVersion[1];

    // Moment.js version check
    if (major < 2 || (major === 2 && minor < 6)) {
        logError('Moment Timezone requires Moment.js >= 2.6.0. You are using Moment.js ' + moment.version + '. See momentjs.com');
    }

    /************************************
        Unpacking
    ************************************/

    function charCodeToInt(charCode) {
        if (charCode > 96) {
            return charCode - 87;
        } else if (charCode > 64) {
            return charCode - 29;
        }
        return charCode - 48;
    }

    function unpackBase60(string) {
        var i = 0,
            parts = string.split('.'),
            whole = parts[0],
            fractional = parts[1] || '',
            multiplier = 1,
            num,
            out = 0,
            sign = 1;

        // handle negative numbers
        if (string.charCodeAt(0) === 45) {
            i = 1;
            sign = -1;
        }

        // handle digits before the decimal
        for (i; i < whole.length; i++) {
            num = charCodeToInt(whole.charCodeAt(i));
            out = 60 * out + num;
        }

        // handle digits after the decimal
        for (i = 0; i < fractional.length; i++) {
            multiplier = multiplier / 60;
            num = charCodeToInt(fractional.charCodeAt(i));
            out += num * multiplier;
        }

        return out * sign;
    }

    function arrayToInt(array) {
        for (var i = 0; i < array.length; i++) {
            array[i] = unpackBase60(array[i]);
        }
    }

    function intToUntil(array, length) {
        for (var i = 0; i < length; i++) {
            array[i] = Math.round((array[i - 1] || 0) + (array[i] * 60000)); // minutes to milliseconds
        }

        array[length - 1] = Infinity;
    }

    function mapIndices(source, indices) {
        var out = [], i;

        for (i = 0; i < indices.length; i++) {
            out[i] = source[indices[i]];
        }

        return out;
    }

    function unpack(string) {
        var data = string.split('|'),
            offsets = data[2].split(' '),
            indices = data[3].split(''),
            untils = data[4].split(' ');

        arrayToInt(offsets);
        arrayToInt(indices);
        arrayToInt(untils);

        intToUntil(untils, indices.length);

        return {
            name: data[0],
            abbrs: mapIndices(data[1].split(' '), indices),
            offsets: mapIndices(offsets, indices),
            untils: untils,
            population: data[5] | 0
        };
    }

    /************************************
        Zone object
    ************************************/

    function Zone(packedString) {
        if (packedString) {
            this._set(unpack(packedString));
        }
    }

    Zone.prototype = {
        _set: function (unpacked) {
            this.name = unpacked.name;
            this.abbrs = unpacked.abbrs;
            this.untils = unpacked.untils;
            this.offsets = unpacked.offsets;
            this.population = unpacked.population;
        },

        _index: function (timestamp) {
            var target = +timestamp,
                untils = this.untils,
                i;

            for (i = 0; i < untils.length; i++) {
                if (target < untils[i]) {
                    return i;
                }
            }
        },

        countries: function () {
            var zone_name = this.name;
            return Object.keys(countries).filter(function (country_code) {
                return countries[country_code].zones.indexOf(zone_name) !== -1;
            });
        },

        parse: function (timestamp) {
            var target = +timestamp,
                offsets = this.offsets,
                untils = this.untils,
                max = untils.length - 1,
                offset, offsetNext, offsetPrev, i;

            for (i = 0; i < max; i++) {
                offset = offsets[i];
                offsetNext = offsets[i + 1];
                offsetPrev = offsets[i ? i - 1 : i];

                if (offset < offsetNext && tz.moveAmbiguousForward) {
                    offset = offsetNext;
                } else if (offset > offsetPrev && tz.moveInvalidForward) {
                    offset = offsetPrev;
                }

                if (target < untils[i] - (offset * 60000)) {
                    return offsets[i];
                }
            }

            return offsets[max];
        },

        abbr: function (mom) {
            return this.abbrs[this._index(mom)];
        },

        offset: function (mom) {
            logError("zone.offset has been deprecated in favor of zone.utcOffset");
            return this.offsets[this._index(mom)];
        },

        utcOffset: function (mom) {
            return this.offsets[this._index(mom)];
        }
    };

    /************************************
        Country object
    ************************************/

    function Country(country_name, zone_names) {
        this.name = country_name;
        this.zones = zone_names;
    }

    /************************************
        Current Timezone
    ************************************/

    function OffsetAt(at) {
        var timeString = at.toTimeString();
        var abbr = timeString.match(/\([a-z ]+\)/i);
        if (abbr && abbr[0]) {
            // 17:56:31 GMT-0600 (CST)
            // 17:56:31 GMT-0600 (Central Standard Time)
            abbr = abbr[0].match(/[A-Z]/g);
            abbr = abbr ? abbr.join('') : undefined;
        } else {
            // 17:56:31 CST
            // 17:56:31 GMT+0800 (台北標準時間)
            abbr = timeString.match(/[A-Z]{3,5}/g);
            abbr = abbr ? abbr[0] : undefined;
        }

        if (abbr === 'GMT') {
            abbr = undefined;
        }

        this.at = +at;
        this.abbr = abbr;
        this.offset = at.getTimezoneOffset();
    }

    function ZoneScore(zone) {
        this.zone = zone;
        this.offsetScore = 0;
        this.abbrScore = 0;
    }

    ZoneScore.prototype.scoreOffsetAt = function (offsetAt) {
        this.offsetScore += Math.abs(this.zone.utcOffset(offsetAt.at) - offsetAt.offset);
        if (this.zone.abbr(offsetAt.at).replace(/[^A-Z]/g, '') !== offsetAt.abbr) {
            this.abbrScore++;
        }
    };

    function findChange(low, high) {
        var mid, diff;

        while ((diff = ((high.at - low.at) / 12e4 | 0) * 6e4)) {
            mid = new OffsetAt(new Date(low.at + diff));
            if (mid.offset === low.offset) {
                low = mid;
            } else {
                high = mid;
            }
        }

        return low;
    }

    function userOffsets() {
        var startYear = new Date().getFullYear() - 2,
            last = new OffsetAt(new Date(startYear, 0, 1)),
            offsets = [last],
            change, next, i;

        for (i = 1; i < 48; i++) {
            next = new OffsetAt(new Date(startYear, i, 1));
            if (next.offset !== last.offset) {
                change = findChange(last, next);
                offsets.push(change);
                offsets.push(new OffsetAt(new Date(change.at + 6e4)));
            }
            last = next;
        }

        for (i = 0; i < 4; i++) {
            offsets.push(new OffsetAt(new Date(startYear + i, 0, 1)));
            offsets.push(new OffsetAt(new Date(startYear + i, 6, 1)));
        }

        return offsets;
    }

    function sortZoneScores(a, b) {
        if (a.offsetScore !== b.offsetScore) {
            return a.offsetScore - b.offsetScore;
        }
        if (a.abbrScore !== b.abbrScore) {
            return a.abbrScore - b.abbrScore;
        }
        if (a.zone.population !== b.zone.population) {
            return b.zone.population - a.zone.population;
        }
        return b.zone.name.localeCompare(a.zone.name);
    }

    function addToGuesses(name, offsets) {
        var i, offset;
        arrayToInt(offsets);
        for (i = 0; i < offsets.length; i++) {
            offset = offsets[i];
            guesses[offset] = guesses[offset] || {};
            guesses[offset][name] = true;
        }
    }

    function guessesForUserOffsets(offsets) {
        var offsetsLength = offsets.length,
            filteredGuesses = {},
            out = [],
            i, j, guessesOffset;

        for (i = 0; i < offsetsLength; i++) {
            guessesOffset = guesses[offsets[i].offset] || {};
            for (j in guessesOffset) {
                if (guessesOffset.hasOwnProperty(j)) {
                    filteredGuesses[j] = true;
                }
            }
        }

        for (i in filteredGuesses) {
            if (filteredGuesses.hasOwnProperty(i)) {
                out.push(names[i]);
            }
        }

        return out;
    }

    function rebuildGuess() {

        // use Intl API when available and returning valid time zone
        try {
            var intlName = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (intlName && intlName.length > 3) {
                var name = names[normalizeName(intlName)];
                if (name) {
                    return name;
                }
                logError("Moment Timezone found " + intlName + " from the Intl api, but did not have that data loaded.");
            }
        } catch (e) {
            // Intl unavailable, fall back to manual guessing.
        }

        var offsets = userOffsets(),
            offsetsLength = offsets.length,
            guesses = guessesForUserOffsets(offsets),
            zoneScores = [],
            zoneScore, i, j;

        for (i = 0; i < guesses.length; i++) {
            zoneScore = new ZoneScore(getZone(guesses[i]), offsetsLength);
            for (j = 0; j < offsetsLength; j++) {
                zoneScore.scoreOffsetAt(offsets[j]);
            }
            zoneScores.push(zoneScore);
        }

        zoneScores.sort(sortZoneScores);

        return zoneScores.length > 0 ? zoneScores[0].zone.name : undefined;
    }

    function guess(ignoreCache) {
        if (!cachedGuess || ignoreCache) {
            cachedGuess = rebuildGuess();
        }
        return cachedGuess;
    }

    /************************************
        Global Methods
    ************************************/

    function normalizeName(name) {
        return (name || '').toLowerCase().replace(/\//g, '_');
    }

    function addZone(packed) {
        var i, name, split, normalized;

        if (typeof packed === "string") {
            packed = [packed];
        }

        for (i = 0; i < packed.length; i++) {
            split = packed[i].split('|');
            name = split[0];
            normalized = normalizeName(name);
            zones[normalized] = packed[i];
            names[normalized] = name;
            addToGuesses(normalized, split[2].split(' '));
        }
    }

    function getZone(name, caller) {

        name = normalizeName(name);

        var zone = zones[name];
        var link;

        if (zone instanceof Zone) {
            return zone;
        }

        if (typeof zone === 'string') {
            zone = new Zone(zone);
            zones[name] = zone;
            return zone;
        }

        // Pass getZone to prevent recursion more than 1 level deep
        if (links[name] && caller !== getZone && (link = getZone(links[name], getZone))) {
            zone = zones[name] = new Zone();
            zone._set(link);
            zone.name = names[name];
            return zone;
        }

        return null;
    }

    function getNames() {
        var i, out = [];

        for (i in names) {
            if (names.hasOwnProperty(i) && (zones[i] || zones[links[i]]) && names[i]) {
                out.push(names[i]);
            }
        }

        return out.sort();
    }

    function getCountryNames() {
        return Object.keys(countries);
    }

    function addLink(aliases) {
        var i, alias, normal0, normal1;

        if (typeof aliases === "string") {
            aliases = [aliases];
        }

        for (i = 0; i < aliases.length; i++) {
            alias = aliases[i].split('|');

            normal0 = normalizeName(alias[0]);
            normal1 = normalizeName(alias[1]);

            links[normal0] = normal1;
            names[normal0] = alias[0];

            links[normal1] = normal0;
            names[normal1] = alias[1];
        }
    }

    function addCountries(data) {
        var i, country_code, country_zones, split;
        if (!data || !data.length) return;
        for (i = 0; i < data.length; i++) {
            split = data[i].split('|');
            country_code = split[0].toUpperCase();
            country_zones = split[1].split(' ');
            countries[country_code] = new Country(
                country_code,
                country_zones
            );
        }
    }

    function getCountry(name) {
        name = name.toUpperCase();
        return countries[name] || null;
    }

    function zonesForCountry(country, with_offset) {
        country = getCountry(country);

        if (!country) return null;

        var zones = country.zones.sort();

        if (with_offset) {
            return zones.map(function (zone_name) {
                var zone = getZone(zone_name);
                return {
                    name: zone_name,
                    offset: zone.utcOffset(new Date())
                };
            });
        }

        return zones;
    }

    function loadData(data) {
        addZone(data.zones);
        addLink(data.links);
        addCountries(data.countries);
        tz.dataVersion = data.version;
    }

    function zoneExists(name) {
        if (!zoneExists.didShowError) {
            zoneExists.didShowError = true;
            logError("moment.tz.zoneExists('" + name + "') has been deprecated in favor of !moment.tz.zone('" + name + "')");
        }
        return !!getZone(name);
    }

    function needsOffset(m) {
        var isUnixTimestamp = (m._f === 'X' || m._f === 'x');
        return !!(m._a && (m._tzm === undefined) && !isUnixTimestamp);
    }

    function logError(message) {
        if (typeof console !== 'undefined' && typeof console.error === 'function') {
            console.error(message);
        }
    }

    /************************************
        moment.tz namespace
    ************************************/

    function tz(input) {
        var args = Array.prototype.slice.call(arguments, 0, -1),
            name = arguments[arguments.length - 1],
            zone = getZone(name),
            out = moment.utc.apply(null, args);

        if (zone && !moment.isMoment(input) && needsOffset(out)) {
            out.add(zone.parse(out), 'minutes');
        }

        out.tz(name);

        return out;
    }

    tz.version = VERSION;
    tz.dataVersion = '';
    tz._zones = zones;
    tz._links = links;
    tz._names = names;
    tz._countries = countries;
    tz.add = addZone;
    tz.link = addLink;
    tz.load = loadData;
    tz.zone = getZone;
    tz.zoneExists = zoneExists; // deprecated in 0.1.0
    tz.guess = guess;
    tz.names = getNames;
    tz.Zone = Zone;
    tz.unpack = unpack;
    tz.unpackBase60 = unpackBase60;
    tz.needsOffset = needsOffset;
    tz.moveInvalidForward = true;
    tz.moveAmbiguousForward = false;
    tz.countries = getCountryNames;
    tz.zonesForCountry = zonesForCountry;

    /************************************
        Interface with Moment.js
    ************************************/

    var fn = moment.fn;

    moment.tz = tz;

    moment.defaultZone = null;

    moment.updateOffset = function (mom, keepTime) {
        var zone = moment.defaultZone,
            offset;

        if (mom._z === undefined) {
            if (zone && needsOffset(mom) && !mom._isUTC) {
                mom._d = moment.utc(mom._a)._d;
                mom.utc().add(zone.parse(mom), 'minutes');
            }
            mom._z = zone;
        }
        if (mom._z) {
            offset = mom._z.utcOffset(mom);
            if (Math.abs(offset) < 16) {
                offset = offset / 60;
            }
            if (mom.utcOffset !== undefined) {
                var z = mom._z;
                mom.utcOffset(-offset, keepTime);
                mom._z = z;
            } else {
                mom.zone(offset, keepTime);
            }
        }
    };

    fn.tz = function (name, keepTime) {
        if (name) {
            if (typeof name !== 'string') {
                throw new Error('Time zone name must be a string, got ' + name + ' [' + typeof name + ']');
            }
            this._z = getZone(name);
            if (this._z) {
                moment.updateOffset(this, keepTime);
            } else {
                logError("Moment Timezone has no data for " + name + ". See http://momentjs.com/timezone/docs/#/data-loading/.");
            }
            return this;
        }
        if (this._z) { return this._z.name; }
    };

    function abbrWrap(old) {
        return function () {
            if (this._z) { return this._z.abbr(this); }
            return old.call(this);
        };
    }

    function resetZoneWrap(old) {
        return function () {
            this._z = null;
            return old.apply(this, arguments);
        };
    }

    function resetZoneWrap2(old) {
        return function () {
            if (arguments.length > 0) this._z = null;
            return old.apply(this, arguments);
        };
    }

    fn.zoneName = abbrWrap(fn.zoneName);
    fn.zoneAbbr = abbrWrap(fn.zoneAbbr);
    fn.utc = resetZoneWrap(fn.utc);
    fn.local = resetZoneWrap(fn.local);
    fn.utcOffset = resetZoneWrap2(fn.utcOffset);

    moment.tz.setDefault = function (name) {
        if (major < 2 || (major === 2 && minor < 9)) {
            logError('Moment Timezone setDefault() requires Moment.js >= 2.9.0. You are using Moment.js ' + moment.version + '.');
        }
        moment.defaultZone = name ? getZone(name) : null;
        return moment;
    };

    // Cloning a moment should include the _z property.
    var momentProperties = moment.momentProperties;
    if (Object.prototype.toString.call(momentProperties) === '[object Array]') {
        // moment 2.8.1+
        momentProperties.push('_z');
        momentProperties.push('_a');
    } else if (momentProperties) {
        // moment 2.7.0
        momentProperties._z = null;
    }

    // INJECT DATA

    return moment;
}));

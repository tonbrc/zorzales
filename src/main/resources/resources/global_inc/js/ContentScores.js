//IMPORTANT! This library assumes that the following libraries have been loaded by the calling page:
//	javascript_library.js
//	ajax_functions.js
//	yui/build/yahoo/yahoo-min.js
//	yui/build/json/json-min.js
function ContentScoresClient(SessionID)
{
	//create a new ScoreControlConfig object
	this.CtrlCfg = new ScoreControlConfig();
	
	//declare an array for queueing score fecthes
	this.aFetchQueue = new Array();
	
	this.initControl = function(ContentID, ScoreID, Score)
	{	//was the score-id supplied?
		if(objectExists(ScoreID)==false)
		{	//no; add id to the fetch queue
			this.aFetchQueue[this.aFetchQueue.length] = ContentID;
			return;
		}
		
		//no need to fetch; set control state
		this.setControlState(ContentID, ScoreID, Score);
	}
	
	this.fetchScores = function()
	{	//fetch all scores waiting in queue
		if(this.aFetchQueue.length==0) return;
		
		//convert the fetch queue into a content-id list
		var cdlContentID = this.aFetchQueue.join(",");
		
		//encode form data for http post
		var sFormData = "SessionID="+ encodeURIComponent(SessionID);
		sFormData += "&cdlContentID="+ encodeURIComponent(cdlContentID);
		
		//clear the fetch queue
		this.aFetchQueue = new Array();
		
		var xmlhttp = newXmlHttp();
		if(!xmlhttp) return;
		
		//submit fetch queue form data to ajax post handler
		xmlhttp.open("POST", "/global_engine/ContentScores_getScores.asp", false);
		xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xmlhttp.send(sFormData);
		
		//exit if we did not receive an error-free response
		if(xmlhttp.status!=200 || xmlhttp.responseText=="") return;

		//the response should be a JSON string
		var jsonData
		try { //to parse the string into a js-object
			jsonData = YAHOO.lang.JSON.parse(xmlhttp.responseText.toString()); 
		} catch(e) { return; }
		
		var scores = jsonData.scores;
		
		for(var i=0; i<scores.length; i++)
		{	//update each score control
			var score = scores[i];
			
			//the score-style determines which score to use
			var nScore = null;
			switch(this.CtrlCfg.ScoreStyle) {
				case this.CtrlCfg.ScoreStyles.Skinned:
					nScore = score.decimal;
					break;
				case this.CtrlCfg.ScoreStyles.Bias:
					nScore = score.bias;
					break;
			}
			this.setControlState(score.cid, score.id, nScore);
		}
	}
	
	this.setControlState = function(ContentID, ScoreID, Score)
	{	//set voting control state
		var up = document.getElementById(ContentID +"up");
		var dn = document.getElementById(ContentID +"dn");

		//has the user already voted on this content?
		if(this.userHasVoted(ScoreID))
		{	//change titles on voting controls
			up.title = this.CtrlCfg.AlreadyVotedText;
			dn.title = this.CtrlCfg.AlreadyVotedText;
		} 
		else if(this.CtrlCfg.UserCanVote)
		{	//enable voting controls
			up.title = this.CtrlCfg.VoteUpText;
			dn.title = this.CtrlCfg.VoteDnText;
			
			var self = this;
			up.onclick = function() { return self.vote(ContentID,1); };
			dn.onclick = function() { return self.vote(ContentID,-1); };
			
			//swap voting images for enabled versions
			document.getElementById(ContentID +"upImg").src = this.CtrlCfg.Skin + "/up.png";
			document.getElementById(ContentID +"dnImg").src = this.CtrlCfg.Skin + "/dn.png";
		}
		
		//if score is null or the score element isn't being shown then we're done; exit
		if(isNaN(Score) ||
			this.CtrlCfg.ScoreStyle==this.CtrlCfg.ScoreStyles.None) return;
		
		var scoreElement = document.getElementById(ContentID +"score");
		if(!scoreElement) return;
		
		//update score based on score-style
		var iScore = 0;
		switch(this.CtrlCfg.ScoreStyle) {
			case this.CtrlCfg.ScoreStyles.Skinned:
				//convert score percentage into a 1-10 scale rating
				iScore = Math.round(CalcContentScore(Score, 10));
				
				//update score image
				document.getElementById(ContentID +"scoreImg").src = this.CtrlCfg.Skin +
					"/"+ iScore.toString() +".png";
				break;
			case this.CtrlCfg.ScoreStyles.Bias:
				//update score bias
				iScore = Math.round(Score);
				var sBias = Score.toString();
				if(iScore>0) {
					scoreElement.className = "ScoreControl_biasUp";
					sBias = "+"+ sBias; //add plus symbol to a positive bias
				} else if(iScore<0) {
					scoreElement.className = "ScoreControl_biasDn";
				} else {
					scoreElement.className = "";
				}
				
				scoreElement.innerHTML = sBias;
				break;
		}
		
		//empty the score element's tooltip text
		scoreElement.title = "";
	}
	
	this.confirmReset = function(FormData)
	{
		var self = this;
		YuiGenericDialog("ContentScores_confirmReset",
			"Are you sure you want to clear all votes?",
			function() { if(m_bYuiGenericDialogResult) self.reset(FormData); }
		);
	}
	
	this.reset = function(FormData)
	{
		if(objectExists(FormData)==false || isEmpty(FormData)) return false;
		
		var xmlhttp = newXmlHttp();
		if(!xmlhttp) return false;
		
		//encode form data for http post
		var sFormData = "SessionID="+ encodeURIComponent(SessionID) +"&"+ FormData;
		
		//submit form data to ajax post handler
		xmlhttp.open("POST", "/global_engine/ContentScores_reset.asp", false);
		xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xmlhttp.send(sFormData);
		
		//exit if we did not receive an error-free response
		if(xmlhttp.status!=200 || xmlhttp.responseText=="") return false;
		
		var ContentID = xmlhttp.responseText.toString();
		
		//disble reset funtionality
		var reset = document.getElementById(ContentID +"reset");
		reset.onclick = "return false;";
		reset.title = "Score has been reset.";
		document.getElementById(ContentID +"resetImg").src = this.CtrlCfg.Skin +"/resetX.png";
		
		//reset the control for this score
		this.initControl(ContentID);
		this.fetchScores();
	}
	
	this.vote = function(ContentID, value)
	{	//is voting enabled?
		if(!this.CtrlCfg.UserCanVote) return false;
		
		var xmlhttp = newXmlHttp();
		if(!xmlhttp) return false;
		
		//encode form data for http post
		var sFormData = "SessionID="+ encodeURIComponent(SessionID);
		sFormData += "&ContentID="+ encodeURIComponent(ContentID);
		sFormData += "&Vote="+ encodeURIComponent(value);
		
		//submit vote to ajax post handler
		xmlhttp.open("POST", "/global_engine/ContentScores_vote.asp", false);
		xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
		xmlhttp.send(sFormData);
		
		//exit if we did not receive an error-free response
		if(xmlhttp.status!=200 || xmlhttp.responseText=="") return false;
		
		//the response should be a score-id; exit if not
		var ScoreID = xmlhttp.responseText.toString();
		if(isNaN(ScoreID)) return false;
		
		//the vote was recorded; disable voting controls
		var up = document.getElementById(ContentID +"up");
		var dn = document.getElementById(ContentID +"dn");
		up.title = this.CtrlCfg.AlreadyVotedText;
		dn.title = this.CtrlCfg.AlreadyVotedText;
		up.onclick = function() { return false; };
		dn.onclick = function() { return false; };
		
		//swap voting images for disabled versions
		document.getElementById(ContentID +"upImg").src = this.CtrlCfg.Skin + "/upX.png";
		document.getElementById(ContentID +"dnImg").src = this.CtrlCfg.Skin + "/dnX.png";
		
		//update the cookie so the user cannot vote again this session
		this.addVoteCookie(ScoreID);
		
		return false;
	}
		
	this.getVoteCookie = function()
	{
		var RetVal = getCookie("csVotes");
		return RetVal.toString();
	}
	
	this.addVoteCookie = function(ScoreID)
	{
		if(ScoreID==0) return;
		
		var sVotes = this.getVoteCookie();
		
		if(this.userHasVoted(ScoreID, sVotes)) return;
		
		setCookie("csVotes", sVotes +"{"+ ScoreID +"}", "/");
	}
	
	this.userHasVoted = function(ScoreID, sInput)
	{
		if(!objectExists(sInput)) sInput = this.getVoteCookie();
		
		var rx = new RegExp("\\{"+ ScoreID +"\\}","gi");
		return rx.test(sInput);
	}
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// Data Structures															 //
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
function NewScoreControlConfig(){return new ScoreControlConfig();}

function ScoreControlConfig()
{
	//enum of skins
	this.Skins = new Object();
	this.Skins.Unknown = "";
	this.Skins.Hearts = "/global_graphics/skins/ScoreControl/Hearts";
	this.Skins.Stars = "/global_graphics/skins/ScoreControl/Stars";
	
	//enum of score styles
	this.ScoreStyles = new Object();
	this.ScoreStyles.None = 0;
	this.ScoreStyles.Bias = 1; // over/under zero
	this.ScoreStyles.Skinned = 2; // 1-10 images (i.e. 5-star)
	
	//public properties
	this.Skin = this.Skins.Unknown;
	this.ScoreStyle = this.ScoreStyles.Skinned;
	this.UserCanReset = false;
	this.UserCanVote = true;
	this.AlreadyVotedText = "Thank you for voting.";
	this.CannotVoteText = "Please sign in to vote.";
	this.ResetText = "Clear all votes on this item and reset score!";
	this.VoteUpText = "Vote Up";
	this.VoteDnText = "Vote Down";
	this.WaitText = "Loading...";
	
	this.DeSerialize = function(jsonString)
	{
		var DataObject
		try { //to parse the string into a js-object
			DataObject = YAHOO.lang.JSON.parse(jsonString); 
		} catch(e) { return; }
		
		this.Skin = DataObject.Skin;
		this.ScoreStyle = DataObject.ScoreStyle;
		this.UserCanReset = DataObject.UserCanReset;
		this.UserCanVote = DataObject.UserCanVote;
		this.AlreadyVotedText = DataObject.AlreadyVotedText;
		this.CannotVoteText = DataObject.CannotVoteText;
		this.ResetText = DataObject.ResetText;
		this.VoteUpText = DataObject.VoteUpText;
		this.VoteDnText = DataObject.VoteDnText;
		this.WaitText = DataObject.WaitText;
	}
	
	this.SerializeAtServer = function()
	{
		if(!IsServerContext()) return;
		
		var json = jsObject();
		json.Pair("Skin") = this.Skin;
		json.Pair("ScoreStyle") = this.ScoreStyle;
		json.Pair("UserCanReset") = this.UserCanReset;
		json.Pair("UserCanVote") = this.UserCanVote;
		json.Pair("AlreadyVotedText") = json.jsEncode(this.AlreadyVotedText);
		json.Pair("CannotVoteText") = json.jsEncode(this.CannotVoteText);
		json.Pair("ResetText") = json.jsEncode(this.ResetText);
		json.Pair("VoteUpText") = json.jsEncode(this.VoteUpText);
		json.Pair("VoteDnText") = json.jsEncode(this.VoteDnText);
		json.Pair("WaitText") = json.jsEncode(this.WaitText);
		
		var RetVal = json.jsString();
		
		json = null;
		
		return RetVal;
	}
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
// Static Helper Functions													 //
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
function CalcContentScore(decVal, iScale)
{
	if(decVal*1>.89) {
		return (1*iScale);
	} else if(decVal*1>.79) {
		return (.9*iScale);
	} else if(decVal*1>.69) {
		return (.8*iScale);
	} else if(decVal*1>.59) {
		return (.7*iScale);
	} else if(decVal*1>.49) {
		return (.6*iScale);
	} else if(decVal*1>.39) {
		return (.5*iScale);
	} else if(decVal*1>.29) {
		return (.4*iScale);
	} else if(decVal*1>.19) {
		return (.3*iScale);
	} else if(decVal*1>.09) {
		return (.2*iScale);
	} else if(decVal*1>=0) {
		return (.1*iScale);
	} else {
		return 0;
	}
}

function IsServerContext()
{
	return ((new String(typeof(Server))).toLowerCase()!='undefined');
}

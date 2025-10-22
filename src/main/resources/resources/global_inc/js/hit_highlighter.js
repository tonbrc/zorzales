// Highlights a text string by adding a <span> tag around all occurrences of the supplied search term
function doHitHighlight(bodyText, searchTerm) 
{
	highlightStartTag = "<span class='HitHighlight'>";
	highlightEndTag = "</span>";
	
	// find all occurences of the search term in the given text,
	// and add some "highlight" tags to them (we're not using a
	// regular expression search, because we want to filter out
	// matches that occur within HTML tags and script blocks, so
	// we have to do a little extra validation)
	var newText = "";
	var i = -1;
	var lcSearchTerm = searchTerm.toLowerCase();
	var lcBodyText = bodyText.toLowerCase();
	
	while (bodyText.length > 0) {
		i = lcBodyText.indexOf(lcSearchTerm, i+1);
		if (i < 0) {
			newText += bodyText;
			bodyText = "";
		} else {
			// skip anything inside an HTML tag
			if (bodyText.lastIndexOf(">", i) >= bodyText.lastIndexOf("<", i)) {
				// skip anything inside a <script> block or <object> or <Embed>
				if (lcBodyText.lastIndexOf("/script>", i) >= lcBodyText.lastIndexOf("<script", i) &&
					lcBodyText.lastIndexOf("/object>", i) >= lcBodyText.lastIndexOf("<object", i) &&
					lcBodyText.lastIndexOf("/embed>", i) >= lcBodyText.lastIndexOf("<embed", i)
					) {
					newText += bodyText.substring(0, i) + highlightStartTag + bodyText.substr(i, searchTerm.length) + highlightEndTag;
					bodyText = bodyText.substr(i + searchTerm.length);
					lcBodyText = bodyText.toLowerCase();
					i = -1;
				}
			}
		}
	}
	
	return newText;
}

function unHighlightDtSearchTerms() {
    // get all iframes
    $('iframe').each(function () {
        // for some external iframes we can't get content document
        // so just wrap into try catch to continue loop and logic
        try {
            // search for all items with class and remove highlight class
            $('.HitHighlight', $(this).contents()).removeClass('HitHighlight');
        } catch (e) {}
    });
    //search for all hightlight for this document
    $('.HitHighlight').removeClass('HitHighlight');
}


// This is a wrapper function for doHighlight() that has been customized for use with DtSearch.
function highlightDtSearchTerms(ContainerID, doc)
{
	if(!doc) doc = document;
	
	if(!ContainerID || typeof ContainerID == "undefined") {
		ContainerID = 'SpContent_Container';
	}
	
	var container = doc.getElementById(ContainerID);
	
	if(!container) container = doc.body;
	
	if(!container || typeof container.innerHTML == "undefined") return;
	
	var rx = new RegExp(/(\&|\?)hhSearchTerms=([^\&]+)/gi);
	var match = rx.exec(doc.location.search);
		
	if(!match || match.length<2) return;
	
	var searchText = urlDecode(match[2]);
	
	if(searchText.length==0) return;
	
	//strip "not", "+", "-" operators and double-quotes from search text
	searchText = searchText.replace(/\bnot\b|\b\+|\b-|\"/gi, "");
	
	//split the string on "and", "or" operators into an array of words and phrases
	var searchArray = searchText.split(/\band\b|\bor\b/gi);
	
	if(searchArray.length==0) return;
	
	var newHTML = container.innerHTML;
	for (var i = 0; i < searchArray.length; i++) {
		var searchTerm = searchArray[i];
		
		//strip leading and trailing whitespace from the search term
		searchTerm = searchTerm.replace(/^[\s]+/, "");
		searchTerm = searchTerm.replace(/[\s]+$/, "");
		
		newHTML = doHitHighlight(newHTML, searchTerm);}

	if (container.innerHTML.search(/<object/i) == -1 && container.innerHTML.search(/<embed/i) == -1) {
	    container.innerHTML = newHTML;
	}
    
    //Make sure we haven't added already...
	var existing = document.getElementById("HighliteRemover");
	if (existing == null) {
	    if (location.href.indexOf('hhSearchTerms=') > 0) {
	        //Add the 'Remover' here
	        var url = location.href.toLowerCase();
	        var newUrl = url.replace("hhsearchterms", "terms");
            
	        //infobox or calloutbox
	        $(container).prepend('<div id="HighliteRemover" class="calloutbox" style="text-align: center; margin-bottom: 10px;">If you are having trouble viewing this page, <a href="' + newUrl + '">click here to remove highlighting</a>.</div>');
	    }
	}
	
	return;
}

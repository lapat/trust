'use strict';

var sample_flag = {
	description : "test",
	history : [],
	id : "12AJhEHjabEHd0hYzfv7",
	offense : "Slander",
	source : "test.com",
	status : "FLAG PENDING",
	subject : "medical",
	subject_id : "1",
	text_selected : "state of Washington, established October 2, 1968. Covering more than 500,000 acres (200,000 ha), it features the rugged mountain peaks of the North Cascades Range, the most",
	time : 1538450438135,
	url : "https://en.wikipedia.org/wiki/Main_Page",
	user_id : "TFSbNu466jgeIefYxTyH1ADW8ol2",
	user_name : "Alex Morris",
	divId : ""
}

//when mouse up, send message to background.js with this position
document.addEventListener('mousedown', function (event, mousePos) {
	// console.log(event)
	var divId = getClosestDiv(event.path)
	// console.log('click on ', event, "button", event.button, "event", event, divId)

    if (event.button == 2) {
        var p = {clientX: event.pageX, clientY: event.pageY};
        var msg = {text: 'example', point: p, from: 'rightclick', parentNode: divId };
        // console.log('msg ', msg)
        chrome.runtime.sendMessage(msg, function(response) {
        	// console.log(response)
        });
    }
})



// on final load, initiate onpage flag setup
document.body.onload = function () {
	// console.log('onload ran')
	getData(function (data) {
		// console.log("data", data)
		var links = getAllLinks()
		// console.log(links)
		for ( var l = 0; l < links.length; l++ ) {
			setUrlStatus(links[l], data)
		}
	})

}

// Handlers for return messages from background.js
chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
	// console.log('message received', request)

	if ( request.actionType === "newFlag" ) {
	    addNewFlagForm (request.point, request.selectedText)
	}
	
	// else if ( request.actionType === "setFlags" ) {
		// console.log("setting flags", request)
	// 	addFlagsToPage(request)
	// }

	if ( request.actionType === "error" ) {
		// console.log(request)
	    alert(request.message)
	}

	if ( request.actionType === "search" ) {
		console.log('search request received', request.searchText)
	    searchAndScroll(request.searchText)
	}

});

function searchAndScroll (text) {

	getAllParagraphs (function (result) {
		console.log('found paragraphs', result)
		for ( var i = 0; i < result.length; i++ ) {
			console.log('checking if div', result[i], 'contains', text)
			if (result[i].textContent.includes(text)) {
				handleFound(result[i])
			}
		}
	}) 
	getAllSpans (function (result) {
		console.log('found spans', result)
		for ( var i = 0; i < result.length; i++ ) {
			console.log('checking if div', result[i], 'contains', text)
			if (result[i].textContent.includes(text)) {
				handleFound(result[i])
			}
		}
	}) 	

}

function handleFound (div) {
	highlightText(div)
	scrollToDiv(div)
}

function getAllParagraphs (cb) {
	cb(document.getElementsByTagName("p"))
}

function getAllSpans (cb) {
	cb(document.getElementsByTagName("span"))
}

function highlightText (div) {
	div.style.background = "yellow";
}

function scrollToDiv (div) {
	div.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
}

function setIcon (color, div) {
	// console.log('setIcon hit', color, div)
	var coords = div.getBoundingClientRect()
	// console.log('coords are', coords)
	insertFlagAtCoords(coords, color)
}


function setUrlStatus (div, listings) {
	var url = div.href

    // console.log('setFlag ran with url ', url)
    var rawUrl = getRawUrl(url)
    var domain = rawUrl.split("/")[0]
    // console.log("checking ", rawUrl, domain)
    var setflag = 0;

    // console.log('checking against data ', listings)
    // console.log('checking verified URLs')
    for ( var i = 0; i < listings.verified.length; i ++ ) {
        // console.log('checking domain ' + listings.verified[i])
        // console.log('currentDomain is ' + domain)
        if ( listings.verified[i] === domain ) {
            // if there's a match to a verified domain we stop here
            // console.log ('domain matches verified', listings.verified[i], domain)
            return setIcon('blue', div)
            setflag = 1;

        }

    }

    if ( setflag === 0 ) {
        // console.log('no verified URLs found, checking for banned domains')

        for ( var i = 0; i < listings.banned.length; i ++ ) {
            if ( listings.banned[i].domain === domain ) {
                // here we'll need to index through the urls to identify if this url is flagged or banned
                    for ( var u = 0; u < listings.banned[i].urls.length; u ++ ) {
                        if ( listings.banned[i].urls[u].url === rawUrl ) {
                            // here we'll need to index through the urls to identify if this url is flagged or banned

                            // console.log ('url matches banned', listings.banned[i], domain)
                            return setIcon('red', div)

                            // sendSetFlagsToView(listings.banned[i].urls[u].flags)

                            setflag = 1;
                        }

                    }
                // console.log ('domain is flagged but this URL didn\'t match a known banned site', listings.verified[i], rawUrl)
                return setIcon('yellow', div)
                setflag = 1;
            }

        }


        // console.log('no banned URLs found, checking for flagged domains')

        for ( var i = 0; i < listings.flagged.length; i ++ ) {

            // console.log ('checking domain', listings.flagged[i], domain)
            if ( listings.flagged[i].domain === domain ) {
                // here we'll need to index through the urls to identify if this url is flagged or banned
                    for ( var u = 0; u < listings.flagged[i].urls.length; u ++ ) {
                        if ( listings.flagged[i].urls[u].url === rawUrl ) {
                            // here we'll need to index through the urls to identify if this url is flagged or banned

                            // console.log ('url matches banned', listings.flagged[i].urls[u], rawUrl)
                            return setIcon('yellow', div)

                            // sendSetFlagsToView(listings.flagged[i].urls[u].flags)

                            setflag = 1;
                        }

                    }
                // console.log ('domain has open flags but this URL didn\'t match a known banned site', listings.verified[i], rawUrl)
                return setIcon('grey', div)
                setflag = 1;
            }

        }


        // console.log('no matching records found - setting to grey')
        setIcon('grey', div)
    }

}

// function addFlagsToPage (divId, flag) {
// 	var coords = document.querySelector(request.divId).getBoundingClientRect()
	console.log("coords", coords)
// }

function getRawUrl (rawUrl) {
    var url =  (rawUrl.split('?')[0]).split('//')[1] // remove get params and remove protocol header
    return url
}

function getAllLinks () {
	return document.links;
}


function getClosestDiv (path) {
	for ( var i = 0; i < path.length; i++ ) {
		if ( path[i].id != "" ) return path[i].id
	}

}

function adjustXCoord (xcoord) {
	var xcoord_adjusted = xcoord - 5
	// console.log('adjusted ' + xcoord + ' to ' + xcoord_adjusted)
	return xcoord_adjusted
}

function insertFlagAtCoords (coordinates, color) {
	// console.log('insert flag triggered', coordinates, color)

	// coordinates.x = adjustXCoord(coordinates.x)

	var coords = {
		"clientX" : coordinates.x,
		"clientY" : coordinates.y
	}

	var imagePath = chrome.extension.getURL('images/' + color + '.png')
	// console.log(imagePath)

	var img = document.createElement('img')
		img.src = imagePath
		img.className = "bc_box_tiny"
		img.id = "flag_" + Math.floor(Math.random() * 1000) + 1

	document.body.appendChild(img)

	// appendFormContents(form.id, "flag")
	setElementPosition(img.id, coords)
	showElement(img.id)
}

function addNewFlagForm (coordinates, selectedText) {
	// console.log('newFlagForm triggered')
	var box = document.createElement('div')
		// box.style.width = "200px"
		// box.style.height = "200px"
		// box.style.background = "white"
		// box.style.borderWidth = "0.5px"
		// box.style.border = "solid black"
		// box.style.color = "black"
		// box.style.display = "none"
		// box.style.position = "absolute"
		// box.style.zIndex = "10"
		box.className = "bc_box"
		// form.id = Math.random().toString(16);
		box.id = "testFlagForm"

	var form = document.createElement('div')
		form.className = "bc_form"
		form.style.color = "black"

	var headerDiv = document.createElement('div')
		headerDiv.className = "bc_header"

	var header = document.createElement('h3')
		header.className = "bc_header"
		header.innerHTML = "New Flag:"
		headerDiv.appendChild(header)

	var cancel = document.createElement('button')
		cancel.className = "bc_header cancel"
		cancel.innerHTML = "X"
		cancel.onclick = function() { BC_hideElement ("testFlagForm") }
		headerDiv.appendChild(cancel)

		form.appendChild(headerDiv)


	var selectedTextInput = document.createElement('textarea')
		selectedTextInput.className = "bc_input"
		selectedTextInput.id = "BC_nf_selectedText"
		if (selectedText != "undefined") {
			selectedTextInput.value = selectedText
		}
		selectedTextInput.placeholder = "Enter the offending text here"
		form.appendChild(selectedTextInput)

	var sourceUrl = document.createElement('input')
		sourceUrl.type = "text"
		sourceUrl.id = "BC_nf_sourceUrl"
		sourceUrl.className = "bc_input"
		sourceUrl.placeholder = "Enter a citation url to expedite approval"
		form.appendChild(sourceUrl)

	var offense = document.createElement('select')
		offense.className = "bc_input offense"
		offense.id = "BC_nf_offenseSelect"

	var offenseOptions = ["Slander","Fraud / Misleading","Offensive"]

		//Create and append the options
		for (var i = 0; i < offenseOptions.length; i++) {
		    var option = document.createElement("option")
		    option.value = offenseOptions[i]
		    option.text = offenseOptions[i]
		    offense.appendChild(option)
		}
		form.appendChild(offense)

	var subject = document.createElement('select')
		subject.className = "bc_input subject"
		subject.id = "BC_nf_subjectSelect"

	var subjectOptions = ["Medical","General Science","History"]

		//Create and append the options
		for (var i = 0; i < subjectOptions.length; i++) {
		    var option = document.createElement("option")
		    option.value = subjectOptions[i]
		    option.text = subjectOptions[i]
		    subject.appendChild(option)
		}
		form.appendChild(subject)

	var descriptionTextInput = document.createElement('textarea')
		descriptionTextInput.className = "bc_input bc_description"
		descriptionTextInput.id = "BC_nf_description"
		descriptionTextInput.placeholder = "Leave a comment (optional)"
		form.appendChild(descriptionTextInput)

	var submit = document.createElement('button')
		submit.id = "BC_nf_submitNewFlagForm"
		submit.className = "bc_input submit"
		submit.innerHTML = "Submit Flag"
		submit.onclick = BC_submitNewFlagForm
		form.appendChild(document.createElement("br"))
		form.appendChild(submit)

	// console.log( 'Appending new child form')

	// Append the Box
	box.appendChild(form)
	document.body.appendChild(box)

	// Add onclick listeners to the box
	// console.log(document.getElementById('BC_submitNewFlagForm'))

	// appendFormContents(form.id, "flag")
	setElementPosition(box.id, coordinates)
	showElement(box.id)
}

function BC_submitNewFlagForm () {
	alert('Thanks!')
	// console.log('submitted!')

	// temporarily hardcoding subject_id to 1 to avoid bugs
	var payload = {
		"source":document.getElementById("BC_nf_sourceUrl").value,
		"offense_type":document.getElementById("BC_nf_offenseSelect").value,
		"selected_text":document.getElementById("BC_nf_selectedText").value,
		"description":document.getElementById("BC_nf_description").value,
		"subject":document.getElementById("BC_nf_subjectSelect").value,
		"subject_id":"1"
	}

    var msg = {payload: payload, from: 'newFlag'};
    // console.log('msg ', msg)

    BC_hideElement ("testFlagForm")

    chrome.runtime.sendMessage(msg, function(response) {
    	// console.log(response)
    });

}


// function appendFormContents (id, type) {
// 	if ( type === "flag" ) {



// 	} else {

// 		var errorMessage = document.createElement('div')
// 			errorMessage.style.color = "red"
// 			errorMessage.innerHTML = "Failed to find popover type"
// 		document.getElementById( id ).appendChild(errorMessage)

// 	}

// }

function getData (cb) {
    chrome.storage.sync.get(['data'], function(result) {
        // console.log("data loaded", result.data)
        cb (result.data)
    });
}

function setElementPosition (id, position) {
	// console.log( 'setting element with id ' + id + " to position ", position )
	document.getElementById( id ).style.top = position.clientY.toString() + "px";
	document.getElementById( id ).style.left = position.clientX.toString() + "px";
}

function showElement(id) {
    document.getElementById(id).style.display = "block";
}

function BC_hideElement(id) {
    var element = document.getElementById(id)
    	element.style.display = "none";
	    element.parentNode.removeChild(document.getElementById(id));
}

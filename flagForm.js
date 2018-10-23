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

// //when mouse up, send message to background.js with this position
// document.addEventListener('mousedown', function (event, mousePos) {
// 	// console.log(event)
// 	var divId = getClosestDiv(event.path)
// 	// console.log('click on ', event, "button", event.button, "event", event, divId)

//     if (event.button == 2) {
//         var p = {clientX: event.pageX, clientY: event.pageY};
//         var msg = {text: 'example', point: p, from: 'rightclick', parentNode: divId };
//         // console.log('msg ', msg)
//         chrome.runtime.sendMessage(msg, function(response) {
//         	// console.log(response)
//         });
//     }
// })

// Handlers for return messages from background.js
chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
	// console.log('message received', request)

	if ( request.actionType === "error" ) {
		// console.log(request)
	    alert(request.message)
	}

});

// on final load, initiate onpage flag setup
window.onload = function() {
	console.log('onload ran')

	var text = decodeURIComponent(findGetParameter('text'))
	var url = getRawUrl(decodeURIComponent(findGetParameter('url')))

	console.log('found', url, text)

	document.getElementById('BC_nf_selectedText').value = text;
	document.getElementById('BC_nf_url').value = url;

	document.getElementById('BC_nf_submitNewFlagForm').addEventListener('click', BC_submitNewFlagForm)

}

function BC_submitNewFlagForm () {
	alert('Thanks!')
	// console.log('submitted!')

	// temporarily hardcoding subject_id to 1 to avoid bugs
	var payload = {
		"source":document.getElementById("BC_nf_sourceUrl").value,
		"url":document.getElementById("BC_nf_url").value,
		"offense_type":document.getElementById("BC_nf_offenseSelect").value,
		"selected_text":document.getElementById("BC_nf_selectedText").value,
		"description":document.getElementById("BC_nf_description").value,
		"subject":document.getElementById("BC_nf_subjectSelect").value,
		"subject_id":"1"
	}

    var msg = {payload: payload, from: 'newFlag'};
    console.log('sending new flag ', msg)

    chrome.runtime.sendMessage(msg, function(response) {
    	console.log(response)
    	window.close()
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

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    var items = window.location.search.substr(1).split('&');
    for (var index = 0; index < items.length; index++) {
        tmp = items[index].split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    }
    return result;
}

function getRawUrl (rawUrl) {
  console.log('getting raw url of ', rawUrl)
  var url =  (rawUrl.split('?')[0]).split('//')[1] // remove get params and remove protocol header
  return url
}

function removeWww(rawUrl){
  console.log('getting www-less url of ', rawUrl)
  var noWww = rawUrl.split('www.')[1]
  console.log('noWww', noWww)
  return noWww
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

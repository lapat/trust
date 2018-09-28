'use strict';
//when mouse up, send message to background.js with this position
document.addEventListener('mousedown', function (mousePos) {
	console.log('click on ', mousePos, "button", mousePos.button)

    if (mousePos.button == 2) {
        var p = {clientX: mousePos.pageX, clientY: mousePos.pageY};
        var msg = {text: 'example', point: p, from: 'rightclick'};
        console.log('msg ', msg)
        chrome.runtime.sendMessage(msg, function(response) {
        	// console.log(response)
        });
    }
})

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
	console.log('message received')
    addNewFlagForm (request.point, request.selectedText)
  }
);

function addNewFlagForm (coordinates, selectedText) {
	console.log('newFlagForm triggered')
	var box = document.createElement('div')
		box.style.width = "200px"
		box.style.height = "200px"
		box.style.background = "white"
		box.style.borderWidth = "0.5px"
		box.style.border = "solid black"
		box.style.color = "black"
		box.style.display = "none"
		box.style.position = "absolute"
		box.style.zIndex = "10"
		// form.id = Math.random().toString(16);
		box.id = "testFlagForm"

	var form = document.createElement('div')	
		form.style.color = "black"

	var header = document.createElement('h3')
		header.innerHTML = "New Flag:"
		form.appendChild(header)

	var selectedTextInput = document.createElement('input')
		selectedTextInput.type = "textarea"
		if (selectedText != "undefined") {
			selectedTextInput.value = selectedText
		}
		selectedTextInput.placeholder = "Enter the offending text here"
		form.appendChild(selectedTextInput)

	var sourceUrl = document.createElement('input')
		sourceUrl.type = "textarea"
		sourceUrl.placeholder = "Enter a citation url to expedite approval"
		form.appendChild(sourceUrl)	

	var subject = document.createElement('select')
		subject.id = "subjectSelect"

	var subjectOptions = ["Medical","General Science","History"]

		//Create and append the options
		for (var i = 0; i < subjectOptions.length; i++) {
		    var option = document.createElement("option")
		    option.value = subjectOptions[i]
		    option.text = subjectOptions[i]
		    subject.appendChild(option)
		}
		form.appendChild(subject)

	var submit = document.createElement('button')
		submit.onclick = "submitBreadCrumbsFlagForm()"
		submit.innerHTML = "Submit Flag"
		form.appendChild(document.createElement("br"))
		form.appendChild(submit)

	console.log( 'Appending new child form')

	box.appendChild(form)
	document.body.appendChild(box)
	// appendFormContents(form.id, "flag")
	setElementPosition(box.id, coordinates)
	showElement(box.id)
}

function submitBreadCrumbsFlagForm () {
	console.log('submitted!')
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

function setElementPosition (id, position) {
	console.log( 'setting element with id ' + id + " to position ", position )
	document.getElementById( id ).style.top = position.clientY.toString() + "px";
	document.getElementById( id ).style.left = position.clientX.toString() + "px";
}

function showElement(id) {
    document.getElementById(id).style.display = "block";
}

function hideElement(id) {
    document.getElementById(id).style.display = "none";
}
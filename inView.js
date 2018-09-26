'use strict';
//when mouse up, send message to background.js with this position
document.addEventListener('mousedown', function (mousePos) {
	console.log('click on ', mousePos, "button", mousePos.button)

    if (mousePos.button == 2) {
        var p = {clientX: mousePos.clientX, clientY: mousePos.clientY};
        var msg = {text: 'example', point: p, from: 'rightclick'};
        console.log('msg ', msg)
        chrome.runtime.sendMessage(msg, function(response) {
        	// console.log(response)
        });
    }
})

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
	console.log('message received')
    addNewFlagForm (request.point)
  }
);

function addNewFlagForm (coordinates) {
	console.log('newFlagForm triggered')
	var form = document.createElement('div')
		form.style.width = "100px"
		form.style.height = "100px"
		form.style.background = "black"
		form.innerHtml = "test"
		form.style.display = "none"
		form.style.position = "absolute"
		form.style.zIndex = "10"
		// form.id = Math.random().toString(16);
		form.id = "testFlagForm"

	console.log( 'Appending new child form')
	document.body.appendChild(form)
	setElementPosition(form.id, coordinates)
	showElement(form.id)
}

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
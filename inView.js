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
		form.style.background = "white"
		form.innerHtml = "test"
		form.style.display = "none"
		form.id = Math.random().toString(16);

	document.body.appendChild(form)
	setElementPosition(form.id, coordinates)
	showElement(form.id)
}

function setElementPosition (element, position) {
	document.getElementById(element).style.top = position.y;
	document.getElementById(element).style.left = position.x;
}

function showElement(element) {
    document.getElementById(element).style.display = "block";
}

function hideElement(element) {
    document.getElementById(element).style.display = "none";
}
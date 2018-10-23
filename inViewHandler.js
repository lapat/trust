'use strict';


// Handlers for return messages from background.js
chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
	// console.log('message received', request)

	if ( request.actionType === "search" ) {
		// console.log('search request received', request.searchText)
	    searchAndScroll(request.searchText)
	}
	if ( request.actionType === "highlight" ) {
		// console.log('search request received', request.searchText)
	    highlight(request.searchText)
	}

});
function highlight (text) {
	getAllParagraphs (function (result) {
		// console.log('found paragraphs', result)
		for ( var i = 0; i < result.length; i++ ) {
			// console.log('checking if div', result[i], 'contains', text)
			if (result[i].textContent.includes(text)) {
				highlightFound(result[i])
			}
		}
	}) 
	getAllSpans (function (result) {
		// console.log('found spans', result)
		for ( var i = 0; i < result.length; i++ ) {
			// console.log('checking if div', result[i], 'contains', text)
			if (result[i].textContent.includes(text)) {
				highlightFound(result[i])
			}
		}
	}) 		
}

function searchAndScroll (text) {

	getAllParagraphs (function (result) {
		// console.log('found paragraphs', result)
		for ( var i = 0; i < result.length; i++ ) {
			// console.log('checking if div', result[i], 'contains', text)
			if (result[i].textContent.includes(text)) {
				handleFound(result[i])
			}
		}
	}) 
	getAllSpans (function (result) {
		// console.log('found spans', result)
		for ( var i = 0; i < result.length; i++ ) {
			// console.log('checking if div', result[i], 'contains', text)
			if (result[i].textContent.includes(text)) {
				handleFound(result[i])
			}
		}
	}) 	

}
function highlightFound (div) {
	highlightText(div)
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


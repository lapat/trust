// This callback function is called when the content script has been 
// injected and returned its results
function onPageDetailsReceived(pageDetails)  { 
    document.getElementById('title').value = pageDetails.title; 
    document.getElementById('comment').value = pageDetails.comment; 
    document.getElementById('source').innerText = pageDetails.ssourcey; 
}

// Global reference to the status display SPAN
var statusDisplay = null;

// POST the data to the server using XMLHttpRequest
function addBookmark() {
    // Cancel the form submit
    event.preventDefault();

    // The URL to POST our data to
    var postUrl = 'http://54.147.234.158/s.php';

    // Set up an asynchronous AJAX POST request
    var xhr = new XMLHttpRequest();
    xhr.open('POST', postUrl, true);

    // Prepare the data to be POSTed by URLEncoding each field's contents
    var title = encodeURIComponent(document.getElementById('title').value);
    var comment = encodeURIComponent(document.getElementById('comment').value);
    var source = encodeURIComponent(document.getElementById('source').value);

    var params = 'title=' + title + 
                 '&comment=' + comment + 
                 '&source=' + source;

    // Replace any instances of the URLEncoded space char with +
    params = params.replace(/%20/g, '+');
	$.getJSON("tags.json", function(json) {
    	console.log(json); // this will show the info it in firebug console
	});
    // Set correct header for form data 
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    // Handle request state change events
    xhr.onreadystatechange = function() { 
        // If the request completed
        if (xhr.readyState == 4) {
        	console.log("6");
            statusDisplay.innerHTML = '';
            if (xhr.status == 200) {
                // If it was a success, close the popup after a short delay
                statusDisplay.innerHTML = 'Saved!';
                window.setTimeout(window.close, 1000);
            } else {
                // Show what went wrong
                statusDisplay.innerHTML = 'Error saving: ' + xhr.statusText;
            }
        }
    };

    // Send the request and set status
    xhr.send(params);
    statusDisplay.innerHTML = 'Saving...';
}

// When the popup HTML has loaded
window.addEventListener('load', function(evt) {
	console.log("1");
    
    // Cache a reference to the status display SPAN
    statusDisplay = document.getElementById('status-display');
    console.log("2");
    
    // Handle the bookmark form submit event with our comment function
    document.getElementById('comment').addEventListener('submit', comment);
    console.log("3");
    
    // Get the event page
    chrome.runtime.getBackgroundPage(function(eventPage) {
        console.log("4");
        // Call the getPageInfo function in the event page, passing in 
        // our onPageDetailsReceived function as the callback. This injects 
        // content.js into the current tab's HTML
        eventPage.getPageDetails(onPageDetailsReceived);
    });
});
chrome.tabs.query({'active': true, 'currentWindow': true, 'lastFocusedWindow': true}, function (tabs) {
    var url = tabs[0].url;
    console.log("Url found");
    console.log(url);
    jQuery.ajax({
    type: "POST",
    url: "http://54.147.234.158/q.php",
    data: {url: url},
    success: function(data) {
    	console.log("Flag Loaded:");
    	console.log(data);
        var comments = JSON.parse(data);
        console.log(comments);

    }
    });
});
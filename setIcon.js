chrome.tabs.query({'active': true, 'currentWindow': true, 'lastFocusedWindow': true}, function (tabs) {
    var url = tabs[0].url;
    console.log("Url found");
    console.log(url);
    jQuery.ajax({
    type: "POST",
    url: "http://54.147.234.158/scan.php",
    data: {url: url},
    success: function(data) {
    	console.log("Flag Loaded:");
    	console.log(data);
        var flag = data.trim();
        console.log(flag);
        if(flag==="blue"){
		chrome.browserAction.setIcon({
            path: "images/blue.png"
        });
        console.log("Set to blue");

        }else if(flag==="red"){
        chrome.browserAction.setIcon({
            path: "images/red.png"
        });
        console.log("Set to red");	
        
        }else if(flag==="yellow"){
        chrome.browserAction.setIcon({
            path: "images/yellow.png"
        });	
        console.log("Set to yellow");

    	}else{
        chrome.browserAction.setIcon({
            path: "images/grey.png"
        });	
        console.log("Set to grey");
    	}	
    }
    });
});
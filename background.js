// On page load, refresh icon to match flag
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, updatedTab) {setIcon();});
//chrome.browserAction.onClicked.addListener(function(tabId, changeInfo, updatedTab) {setIcon();});

chrome.browserAction.onClicked.addListener(function () {getContent();});

function setIcon(){
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
}

function getContent(){
	chrome.tabs.query({'active': true, 'currentWindow': true, 'lastFocusedWindow': true}, function (tabs) {
    var url = tabs[0].url;
    console.log("Url found");
    console.log(url);
    jQuery.ajax({
    type: "POST",
    url: "http://54.147.234.158/q.php",
    data: {url: url},
    success: function(data) {
    	console.log("Content Loaded:");
    	console.log(data);
        //var comments = JSON.parse(data);
        //console.log(comments);

    }
    });
});

}
















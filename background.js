// Sample data:
var sample_data = {
    "verified":
       [ "en.wikipedia.org", "alexmorris.com" ],
    "banned" :
       [
        {
        "domain" : "coinflashapp.com",  
        "urls" : [ "coinflashapp.com/124.html", "coinflashapp.com/1583.html" ] 
        },
        {
        "domain" : "www.breitbart.com", 
        "urls" : [ "breitbard.com/15333.html", "breaitbart.com/388.html" ]
        }
       ],
    "flagged" :
       [
        {
        "domain" : "dirkdiggler.com", 
        "urls" : [ "dirkdiggler.com/145.html", "dirkdiggler.com/14443.h5ml" ]
        },
        {
        "domain" : "thisisbullshit.com", 
        "urls" : [ "thisisbullshit.com/14335.html", "thisisbullshit.com/1433443.h5ml" ]
        }
       ]
}

// On new page load, refresh icon to match flag
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, updatedTab) {
    console.log('tab updated')
    console.log(updatedTab.url)
    newFocusHandler(updatedTab.url)

});

// On tab change, update icon
chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        var url = tabs[0].url;
        console.log(url)
        newFocusHandler(url)
    });
});

function newFocusHandler (url) {

    var pUrl = getFlag(url)
    console.log(pUrl)
    // setIcon(pUrl)

}

//chrome.browserAction.onClicked.addListener(function(tabId, changeInfo, updatedTab) {setIcon();});

// chrome.browserAction.onClicked.addListener(function () {getContent();});

// chrome.contextMenus.onClicked.addListener(onClickHandler);

// // Set up context menu tree at install time.
// chrome.runtime.onInstalled.addListener(function() {
//   // Create one test item for each context type.
//   var contexts = ["page","selection","link","editable","image","video",
//                   "audio"];
//   for (var i = 0; i < contexts.length; i++) {
//     var context = contexts[i];
//     var title = "Voting";
//     var id = chrome.contextMenus.create({"title": title, "contexts":[context],
//                                          "id": "context" + context});
//     console.log("'" + context + "' item:" + id);
//   }

//   // Create a parent item and two children.
//   chrome.contextMenus.create(
//       {"title": "Clap", "id":"clap"});
//   chrome.contextMenus.create(
//       {"title": "Report", "id": "report"});
//   console.log("parent child1 child2");

// });

function getFlag (currentUrl) {
    var rawUrl = currentUrl.split('?')[0] // remove get params
    var sUrl = rawUrl.split("/")
    var domain = sUrl[2]
    console.log(sUrl, domain)
    var setflag = 0;
    var listings = sample_data;

    console.log('checking verified URLs')
    for ( var i = 0; i < listings.verified.length; i ++ ) {
        console.log('checking domain ' + listings.verified[i])
        console.log('currentDomain is ' + domain)
        if ( listings.verified[i] === domain ) {
            // if there's a match to a verified domain we stop here 
            console.log ('domain matches verified', listings.verified[i], domain)
            return setIcon('blue')
            setflag = 1;

        }

    }

    if ( setflag === 0 ) {
        console.log('no verified URLs found, checking for flagged domains')

        for ( var i = 0; i < listings.banned.length; i ++ ) {
            if ( listings.banned[i].domain === domain ) {
                // here we'll need to index through the urls to identify if this url is flagged or banned
                    for ( var u = 0; u < listings.banned[i].urls.length; u ++ ) {
                        if ( listings.banned[i].urls[u] === rawUrl ) {
                            // here we'll need to index through the urls to identify if this url is flagged or banned
                            
                            console.log ('url matches banned', listings.verified[i], domain)
                            return setIcon('red')

                        }

                    } 
                console.log ('domain is flagged but this URL didn\'t match a known banned site', listings.verified[i], url)
                return setIcon('yellow')

            }

        }    
    }

}

function setIcon(flag){

    // if ( flag === "undefined" ) {
    //     return null
    // } 

    console.log('flag is ' + flag)
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

// function getContent(){
// 	chrome.tabs.query({'active': true, 'currentWindow': true, 'lastFocusedWindow': true}, function (tabs) {
//     var url = tabs[0].url;
//     console.log("Url found");
//     console.log(url);
//     jQuery.ajax({
//     type: "POST",
//     url: "http://54.147.234.158/q.php",
//     data: {url: url},
//     success: function(data) {
//     	console.log("Content Loaded:");
//     	console.log(data);
//         //var comments = JSON.parse(data);
//         //console.log(comments);

//     }
//     });
// });

// }

// function onClickHandler(info, tab) {
//   if (info.menuItemId == "clap") {
//     newClap(tab.url);

//   } else if (info.menuItemId == "report") {
//     newReport(tab.url);    

//   } else {
//     // Random debugging crap
//     console.log("item " + info.menuItemId + " was clicked");
//     console.log("info: " + JSON.stringify(info));
//     console.log("tab: " + JSON.stringify(tab));

//   }
// };

// function newClap (url) {
//     console.log("clap clicked for " + url);

// }


// function newReport (url) {
//     console.log("report clicked for " + url);
// }


















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
        "urls" : [ "www.breitbart.com/big-government/2018/09/14/donald-trump-jr-kimberly-guilfoyle-hit-campaign-trail-in-ohio-to-keep-state-red-in-2018/", "breaitbart.com/388.html" ]
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
        },
        {
        "domain" : "stackoverflow.com", 
        "urls" : [ "stackoverflow.com/questions/1979583/how-can-i-get-the-url-of-the-current-tab-from-a-google-chrome-extension" ]
        }
       ]
}

// init task - runs when chrome is opened and not after
chrome.runtime.onStartup.addListener(function () {
    console.log('chrome launched - syncing sample data')
    setData();
});

// On new page load, refresh icon to match flag
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, updatedTab) {
    setFlag(updatedTab.url)
});

// On tab change, update icon
chrome.tabs.onActivated.addListener(function(activeInfo) {
    chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
        setFlag(tabs[0].url)
    });
});

// chrome.browserAction.onClicked.addListener(function(tabId, changeInfo, updatedTab) {setIcon();});

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
//     // console.log("'" + context + "' item:" + id);
//   }

//   // Create a parent item and two children.
//   chrome.contextMenus.create(
//       {"title": "Clap", "id":"clap"});
//   chrome.contextMenus.create(
//       {"title": "Report", "id": "report"});
//   // console.log("parent child1 child2");

// });

function newFocusHandler (url) {
    var pUrl = setFlag(url)
}

function setFlag (currentUrl) {
    var rawUrl = getRawUrl(currentUrl) 
    var domain = rawUrl.split("/")[0]
    // console.log(rawUrl, domain)
    var setflag = 0;
    getData( function(listings) {
        // console.log('checking verified URLs')
        for ( var i = 0; i < listings.verified.length; i ++ ) {
            // console.log('checking domain ' + listings.verified[i])
            // console.log('currentDomain is ' + domain)
            if ( listings.verified[i] === domain ) {
                // if there's a match to a verified domain we stop here 
                // console.log ('domain matches verified', listings.verified[i], domain)
                return setIcon('blue')
                setflag = 1;

            }

        }

        if ( setflag === 0 ) {
            // console.log('no verified URLs found, checking for banned domains')

            for ( var i = 0; i < listings.banned.length; i ++ ) {
                if ( listings.banned[i].domain === domain ) {
                    // here we'll need to index through the urls to identify if this url is flagged or banned
                        for ( var u = 0; u < listings.banned[i].urls.length; u ++ ) {
                            if ( listings.banned[i].urls[u] === rawUrl ) {
                                // here we'll need to index through the urls to identify if this url is flagged or banned
                                
                                // console.log ('url matches banned', listings.banned[i], domain)
                                return setIcon('red')
                                setflag = 1;
                            }

                        } 
                    // console.log ('domain is flagged but this URL didn\'t match a known banned site', listings.verified[i], rawUrl)
                    return setIcon('yellow')
                    setflag = 1;
                }

            }    


            // console.log('no banned URLs found, checking for flagged domains')

            for ( var i = 0; i < listings.flagged.length; i ++ ) {

                // console.log ('checking domain', listings.flagged[i], domain)
                if ( listings.flagged[i].domain === domain ) {
                    // here we'll need to index through the urls to identify if this url is flagged or banned
                        for ( var u = 0; u < listings.flagged[i].urls.length; u ++ ) {
                            if ( listings.flagged[i].urls[u] === rawUrl ) {
                                // here we'll need to index through the urls to identify if this url is flagged or banned
                                
                                // console.log ('url matches banned', listings.flagged[i].urls[u], rawUrl)
                                return setIcon('yellow')
                                setflag = 1;
                            }

                        } 
                    // console.log ('domain has open flags but this URL didn\'t match a known banned site', listings.verified[i], rawUrl)
                    return setIcon('grey')
                    setflag = 1;
                }

            }   


            // console.log('no matching records found - setting to grey')
            setIcon('grey')        
        }
    });

}

function setIcon(flag){

    // if ( flag === "undefined" ) {
    //     return null
    // } 

    // console.log('flag is ' + flag)
    if(flag==="blue"){
        chrome.browserAction.setIcon({
            path: "images/blue.png"
        });
        // console.log("Set to blue");

    }else if(flag==="red"){
        chrome.browserAction.setIcon({
            path: "images/red.png"
        });
        // console.log("Set to red");  
        
    }else if(flag==="yellow"){
        chrome.browserAction.setIcon({
            path: "images/yellow.png"
        }); 
        // console.log("Set to yellow");

    }else{
        chrome.browserAction.setIcon({
            path: "images/grey.png"
        }); 
        // console.log("Set to grey");
    } 
}

function getRawUrl (rawUrl) {
    var url =  (rawUrl.split('?')[0]).split('//')[1] // remove get params and remove protocol header
    return url
}   

function setData () {
    // insert api call to fetch flag data here
    chrome.storage.sync.set({data: sample_data}, function() {
          console.log('Data set is ' + sample_data);
    });    
}

function getData (cb) {
    chrome.storage.sync.get(['data'], function(result) {
        cb (result.data)
    });    
}

function setDiscreteData () {
    // insert api call to fetch flag data here
    chrome.storage.sync.set({verified: sample_data.verified}, function() {
          console.log('Verified set is ' + sample_data.verified);
    });

    chrome.storage.sync.set({banned: sample_data.banned}, function() {
          console.log('Banned set is ' + sample_data.banned);
    });

    chrome.storage.sync.set({flagged: sample_data.flagged}, function() {
          console.log('Flagged set is ' + sample_data.flagged);
    });
}

function getVerified () {
    return chrome.storage.sync.get(['verified'], function(result) {
        console.log('retrieved verified data')
        return result
    });
}
function getBanned () {
    return chrome.storage.sync.get(['banned'], function(result) {
        console.log('retrieved banned data')
        return result
    });
}
function getFlagged () {
    return chrome.storage.sync.get(['flagged'], function(result) {
        console.log('retrieved flagged data')
        return result
    });
}


// // function getContent(){
// // 	chrome.tabs.query({'active': true, 'currentWindow': true, 'lastFocusedWindow': true}, function (tabs) {
// //     var url = tabs[0].url;
    // console.log("Url found");
    // console.log(url);
// //     jQuery.ajax({
// //     type: "POST",
// //     url: "http://54.147.234.158/q.php",
// //     data: {url: url},
// //     success: function(data) {
    	// console.log("Content Loaded:");
    	// console.log(data);
// //         //var comments = JSON.parse(data);
        // console.log(comments);

// //     }
// //     });
// // });

// // }

// // function onClickHandler(info, tab) {
// //   if (info.menuItemId == "clap") {
// //     newClap(tab.url);

// //   } else if (info.menuItemId == "report") {
// //     newReport(tab.url);    

// //   } else {
// //     // Random debugging crap
    // console.log("item " + info.menuItemId + " was clicked");
    // console.log("info: " + JSON.stringify(info));
    // console.log("tab: " + JSON.stringify(tab));

// //   }
// // };

// // function newClap (url) {
    // console.log("clap clicked for " + url);

// // }


// // function newReport (url) {
    // console.log("report clicked for " + url);
// // }


















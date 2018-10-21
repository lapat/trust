
console.log("background.js");

if (!mousePoint) {
  var mousePoint = {};
}

// Initialize Firebase

var config = {
  apiKey: "AIzaSyCvj82G5ClLtYQmOYC9W_dPzgeMMmPcS58",
  authDomain: "trust-f0fdc.firebaseapp.com",
  databaseURL: "https://trust-f0fdc.firebaseio.com",
  projectId: "trust-f0fdc",
  storageBucket: "trust-f0fdc.appspot.com",
  messagingSenderId: "802077806931"
};


// 1. Data storage setup
// init task - runs when chrome is opened and not after
chrome.runtime.onStartup.addListener(function () {
  runTimeTasks()
});

chrome.runtime.onInstalled.addListener(function(details){
  runTimeTasks()
});

function runTimeTasks () {
  // console.log('chrome launched - syncing sample data')
  // console.log("initializingApp")
  firebase.initializeApp(config);
  setData();
  configureContextMenus();
  chrome.contextMenus.onClicked.addListener(onClickHandler);

}

// 2. Right click menu setup
chrome.extension.onMessage.addListener(function(msg, sender, sendResponse) {
  // console.log(msg, sender, sendResponse)

  if (msg.from == 'rightclick') {
    //storing position
    mousePoint = msg.point;
    console.log('mouse head at ', mousePoint)

  }

  if ( msg.from == 'newFlag' ) {

    var payload = msg.payload;
    console.log('new Flag submit received', msg)

    callAPIForNewFlag(msg.payload)

    
  }

  if (msg.from == 'getFlags') {
    //storing position
    console.log('received getflags ', msg)
    sendResponse = sample_flags
    return sendResponse

  }

  if (msg.from == 'search') {
    //storing position
    console.log('received search request ', msg)
    sendResponse = "OK"

    var request = {
      'actionType' : 'search',
      'searchText' : msg.payload.searchText
    }

    sendMessageToCurrentTab(request)
    return sendResponse

  }

})

function callAPIForNewFlag (payload) {
    firebase.functions().httpsCallable('flag')(payload)
    .then( function(result) {
      console.log('flag submitted, returned:', result);
      setData()
    }).catch( function(error){

      console.log('flag submission error!: ' + exception)

      var payload = {
        'actionType' : 'error',
        'message' : exception.toString()
      }

      sendMessageToCurrentTab (payload)
    })
}

// Set up context menu tree at install time.
function configureContextMenus() {
  // Create one test item for each context type.
  var contexts = ["page","selection"];
  for (var i = 0; i < contexts.length; i++) {
    var context = contexts[i];
    var title = "Flag";
    var id = chrome.contextMenus.create({"title": title, "contexts":[context],
    "id": context});
  }

  // Create a parent item and two children.
  chrome.contextMenus.create(
    {"title": "GetInfo", "id":"getInfo"}
  );

}

function onClickHandler(info, tab) {
  // console.log('info click caught', info)

  if (info.menuItemId == "page") {
    newFlag(tab, info.selectionText);

  } else if (info.menuItemId == "getInfo") {
    getInfo(tab.url);

  } else if (info.menuItemId == "selection") {
    newFlag(tab, info.selectionText);

  } else {
    // Random debugging crap
    console.log("item " + info.menuItemId + " was clicked");
    console.log("info: " + JSON.stringify(info));
    console.log("tab: " + JSON.stringify(tab));

  }
};

function newFlag (tab, text) {

  console.log("new flag triggered from ", tab," for " + tab.url, "with text " + text, "current point is ", mousePoint, "sending to tab " + tab.index, tab);

  var payload = {
    "point" : mousePoint,
    "selectedText" : text,
    "actionType" : "newFlag"
  }
  
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

    var url = tabs[0].url

    var paramString = "url=" + encodeURIComponent(url) + "&text=" + encodeURIComponent(text)

    window.open("flagForm.html?" + paramString, "extension_popup", "width=300px,status=no,scrollbars=yes,resizable=no");
    // sendMessageToCurrentTab (payload)


  });

}

function sendMessageToCurrentTab (payload) {
  console.log('sendMessageToCurrentTab', payload)
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, payload, function(response) {
       console.log(response);
    });
  });
}

// function sendSetFlagsToView(flags) {
  //     console.log('sending set flags with ' + flags.count + " flags ")

  //     for (var l = 0; l < flags.length; l++ ){
  //         setFlagsInView(flags[l].flagId, flags[l].divId)
  //     }
  // }

  // function setFlagsInView (flagId, divId) {

  //     console.log("set flags triggered for flag" + flagId, "setting to " + divId);

  //       var payload = {
  //         "flagId" : flagId,
  //         "divId" : divId,
  //         "actionType" : "setFlags"
  //       }
  //     chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  //       chrome.tabs.sendMessage(tabs[0].id, payload, function(response) {
  //         // console.log(response);
  //       });
  //     });

// }

function sendFlag () {
  var payload = {
    "url":url,
    "subject_id":"12345",
    "description":text,
    "source":"test.com",
    "offense_type":"false information",
    "selected_text":text
  }

  firebase.functions().httpsCallable('flag')(payload)
  .then( function(result) {
    console.log(result);
  });

}

function getInfo (url) {
  console.log("getInfo clicked for " + url, "mousePoint at ", mousePoint);
}

// 3. Icon Logic

// On new page load, refresh icon to match flag
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, updatedTab) {
  setFlag(updatedTab.url)
});

// On tab change, update icon
chrome.tabs.onActivated.addListener(function(activeInfo) {
  updateFlagForCurrentTab ()
});

function updateFlagForCurrentTab () {
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    setFlag(tabs[0].url)
  });
}

function newFocusHandler (url) {
  var pUrl = setFlag(url)
}


function setFlag (currentUrl) {
  // console.log('setFlag ran with url ', currentUrl)
  var rawUrl = getRawUrl(currentUrl)
  var domain = rawUrl.split("/")[0]
  var domain = removeWww(domain);
   // console.log(rawUrl, domain)
  var setflag = 0;

  getData( function(listings) {
    // console.log('checking against data ', listings)

    listings=listings.data;
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
            if ( listings.banned[i].urls[u].url === rawUrl ) {
              // here we'll need to index through the urls to identify if this url is flagged or banned

               // console.log ('url matches banned', listings.banned[i], domain)

              return setIcon('red', listings.banned[i].urls[u].flagArray.length)

              // sendSetFlagsToView(listings.banned[i].urls[u].flags)

              setflag = 1;
            }

          }
          // console.log ('domain is flagged but this URL didn\'t match a known banned site', listings.verified[i], rawUrl)
          return setIcon('yellow')
          setflag = 1;
        }

      }


       // console.log('no banned URLs found, checking for flagged domains rawUrl:'+rawUrl)

      for ( var i = 0; i < listings.flagged.length; i ++ ) {

         // console.log ('checking domain', listings.flagged[i].domain, domain)
        if ( listings.flagged[i].domain === domain ) {
          // console.log("matched domain:",domain)
          // console.log("listings.flagged[i].urls:",listings.flagged[i].urls)
          // here we'll need to index through the urls to identify if this url is flagged or banned
          for ( var u = 0; u < listings.flagged[i].urls.length; u ++ ) {
            // console.log("checking url:",listings.flagged[i].urls[u].url)
            if ( listings.flagged[i].urls[u].url === rawUrl ) {
              // here we'll need to index through the urls to identify if this url is flagged or banned
              // console.log ('url matches flagged', listings.flagged[i].urls[u], rawUrl)
              return setIcon('yellow', listings.flagged[i].urls[u].flagArray.length)
              // sendSetFlagsToView(listings.flagged[i].urls[u].flags)
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

function highlightTextInView () {
  console.log('autoHighlighting ran')
  chrome.storage.local.get(["settings"] , function(settings){
    console.log('autoHighlighting: ', settings.settings.autoHighlighting) 
    var autoHighlighting = settings.settings.autoHighlighting
    if ( autoHighlighting === true ) {
      console.log ('autoHighlighting is true, checking flags for url')
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

        fetchFlagsForUrl(getRawUrl(tabs[0].url), function(flags) {
          console.log('flags retrieved, sending highlight calls')

          for (var i = 0; i < flags.length; i++ ) {
            var payload = {
                  "actionType" : "highlight",
                  "searchText" : flags[i].selectedText
                }
            console.log('highlight call 1: ', payload, "to", tabs[0].id )
            chrome.tabs.sendMessage(tabs[0].id, payload, function(response) {
              
              // console.log(response);
              

            });
          }
        })

  
      });
    }
  })
}

function setViewData (data) {

  var payload = {
    data : data
  }

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, payload, function(response) {
      // console.log(response);
    });
  });
}

function setIcon(flag, count){

  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

    console.log('flag is ' + flag, 'count is ' + count)
    if ( typeof count !== "undefined" ) {
      chrome.browserAction.setBadgeText({text: count.toString(), tabId: tabs[0].id });
      chrome.browserAction.setBadgeBackgroundColor({ color: [105, 105, 105, 105], tabId: tabs[0].id });
    } else {
      // chrome.browserAction.setBadgeText();
      console.log('badge should unset')

    }

  });

  if(flag==="blue"){
    chrome.browserAction.setIcon({
      path: "images/blue.png"
    });
    // console.log("Set to blue");

  }else if(flag==="red"){

    chrome.browserAction.setIcon({
      path: "images/red.png"
    });
    highlightTextInView ()
    // console.log("Set to red");

  }else if(flag==="yellow"){
    chrome.browserAction.setIcon({
      path: "images/yellow.png"
    });
    highlightTextInView ()
    // console.log("Set to yellow");

  }else{
    chrome.browserAction.setIcon({
      path: "images/grey.png"
    });
    ighlightTextInView ()
    // console.log("Set to grey");
  }
}

function getRawUrl (rawUrl) {
  console.log('getting raw url of ', rawUrl)
  var url =  (rawUrl.split('?')[0]).split('//')[1] // remove get params and remove protocol header
  return url
}

function removeWww(rawUrl){
  console.log('getting www-less url of ', rawUrl)
  var noWww = rawUrl.split('www.')[1]
  console.log('noWww', noWww)
  return noWww
}

function setData () {
  console.log('setdata running')
  firebase.functions().httpsCallable('getData')({})
  .then( function(result) {
    console.log('size of', JSON.stringify(result).length)
    console.log('fetched data and setting ', result);
    chrome.storage.local.set({data: result}, function() {
      updateFlagForCurrentTab ()
    });
  });
}

function getData (cb) {
  chrome.storage.local.get(['data'], function(result) {
    console.log("data loaded", result.data)
    cb (result.data)
  });
}

function fetchFlagsForUrl (url, cb) {
  console.log(url)

    //url == "www.breitbart.com/big-government/2018/10/06/kavanaugh-confirmed-possibly-most-conservative-supreme-court-since-1934/") {
    firebase.functions().httpsCallable('getShortDataForUrl')({'url' : url})
      .then( function(result) {
        console.log(result);
        flags = result.data

        if (flags.length) {
          cb (flags)
        } else {
          var arr = []
          cb(arr)
        }
        //chrome.storage.sync.set({data: result}, function() {
      });
}

function setDiscreteData () {
  // insert api call to fetch flag data here
  chrome.storage.local.set({verified: sample_data.verified}, function() {
    console.log('Verified set is ' + sample_data.verified);
  });

  chrome.storage.local.set({banned: sample_data.banned}, function() {
    console.log('Banned set is ' + sample_data.banned);
  });

  chrome.storage.local.set({flagged: sample_data.flagged}, function() {
    console.log('Flagged set is ' + sample_data.flagged);
  });
}


function getVerified () {
  return chrome.storage.local.get(['verified'], function(result) {
    console.log('retrieved verified data')
    return result
  });
}
function getBanned () {
  return chrome.storage.local.get(['banned'], function(result) {
    console.log('retrieved banned data')
    return result
  });
}
function getFlagged () {
  return chrome.storage.local.get(['flagged'], function(result) {
    console.log('retrieved flagged data')
    return result
  });
}

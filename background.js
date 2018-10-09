
console.log("background.js");
// Sample data:
// var sample_data = {
//   "verified":
//   [ "en.wikipedia.org", "alexmorris.com" ],
//   "banned" :
//   [
//     {
//       "domain" : "coinflashapp.com",
//       "urls" :
//       [{
//         "url":"coinflashapp.com/verified.html",
//         "flags" : []
//       },{
//         "url":"coinflashapp.com/verified2.html",
//         "flags" : []
//       }]
//     },
//     {
//       "domain" : "www.breitbart.com",
//       "urls" :
//       [{
//         "url":"www.breitbart.com/big-government/2018/09/14/donald-trump-jr-kimberly-guilfoyle-hit-campaign-trail-in-ohio-to-keep-state-red-in-2018/",
//         "flags" : [{
//           "flagId" : "abc123",
//           "divId" : "MainW"
//         },{
//           "flagId" : "abc124",
//           "divId" : "MainW"
//         }]
//       },{
//         "url":"www.breitbart.com/big-government/2018/10/06/kavanaugh-confirmed-possibly-most-conservative-supreme-court-since-1934/",
//         "flags" : [{
//           "flagId" : "abc123",
//           "divId" : "MainW"
//         },{
//           "flagId" : "abc124",
//           "divId" : "MainW"
//         }]
//       }]
//     }
//   ],
//   "flagged" :
//   [
//     {
//       "domain" : "dirkdiggler.com",
//       "urls" :
//       [{
//         "url":"dirkdiggler.com/big-government/2018/09/14/donald-trump-jr-kimberly-guilfoyle-hit-campaign-trail-in-ohio-to-keep-state-red-in-2018/",
//         "flags" : ["abc1238172, abc1247318"]
//       },{
//         "url":"dirkdiggler.com/38822.html",
//         "flags" : ["abc1239182, abc12498128"]
//       }]
//     },
//     {
//       "domain" : "thisisbullshit.com",
//       "urls" :
//       [{
//         "url":"thisisbullshit.com/big-government/2018/09/14/donald-trump-jr-kimberly-guilfoyle-hit-campaign-trail-in-ohio-to-keep-state-red-in-2018/",
//         "flags" : ["abc1238172, abc1247318"]
//       },{
//         "url":"thisisbullshit.com/38822.html",
//         "flags" : ["abc1239182, abc12498128"]
//       }]
//     },
//     {
//       "domain" : "stackoverflow.com",
//       "urls" :
//       [{
//         "url":"stackoverflow.com/someUrl.html",
//         "flags" : ["abc1238172, abc1247318"]
//       },{
//         "url":"stackoverflow.com/someUrl2.html",
//         "flags" : ["abc1239182, abc12498128"]
//       }]
//     }
//   ]
// }

// var sample_flags = {
//   "flags" : [{
//     "id" : "abc123",
//     "parentNode" : "MainW",
//     "selectedText" : "hysteria is the key to destruction"
//   }]
// }

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

    console.log('new Flag submit received')

    var payload = msg.payload;

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

      payload.url = tabs[0].url
      console.log(payload)
      callAPIForNewFlag(payload)

    });

  }

  if (msg.from == 'getFlags') {
    //storing position
    console.log('received getflags ', msg)
    sendResponse = sample_flags
    return sendResponse

  }

})

function callAPIForNewFlag (payload) {
  firebase.functions().httpsCallable('flag')(payload)
  .then( function(result) {
    console.log(result);
  });
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
  chrome.tabs.query({'active': true, 'lastFocusedWindow': true}, function (tabs) {
    setFlag(tabs[0].url)
  });
});

function newFocusHandler (url) {
  var pUrl = setFlag(url)
}

function removeWww(theDomain){
  if (theDomain.indexOf("www.") === 0){
    return theDomain.replace("www.", "")
  }else{
    return theDomain;
  }
}

function setFlag (currentUrl) {
  console.log('setFlag ran with url ', currentUrl)
  var rawUrl = getRawUrl(currentUrl)
  var domain = rawUrl.split("/")[0]
  var domain = removeWww(domain);
   console.log(rawUrl, domain)
  var setflag = 0;

  getData( function(listings) {
    console.log('checking against data ', listings)

    listings=listings.data;
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
       console.log('no verified URLs found, checking for banned domains')

      for ( var i = 0; i < listings.banned.length; i ++ ) {
        if ( listings.banned[i].domain === domain ) {
          // here we'll need to index through the urls to identify if this url is flagged or banned
          for ( var u = 0; u < listings.banned[i].urls.length; u ++ ) {
            if ( getRawUrl(listings.banned[i].urls[u].url) === rawUrl ) {
              // here we'll need to index through the urls to identify if this url is flagged or banned

               console.log ('url matches banned', listings.banned[i], domain)
              return setIcon('red', listings.banned[i].urls[u].flagArray.length)

              // sendSetFlagsToView(listings.banned[i].urls[u].flags)

              setflag = 1;
            }

          }
          console.log ('domain is flagged but this URL didn\'t match a known banned site', listings.verified[i], rawUrl)
          return setIcon('yellow')
          setflag = 1;
        }

      }


       console.log('no banned URLs found, checking for flagged domains rawUrl:'+rawUrl)

      for ( var i = 0; i < listings.flagged.length; i ++ ) {

         console.log ('checking domain', listings.flagged[i].domain, domain)
        if ( listings.flagged[i].domain === domain ) {
          console.log("matched domain:"+domain)
          console.log("listings.flagged[i].urls:"+listings.flagged[i].urls)
          // here we'll need to index through the urls to identify if this url is flagged or banned
          for ( var u = 0; u < listings.flagged[i].urls.length; u ++ ) {
            console.log("checking url:"+listings.flagged[i].urls[u].url)
            if ( getRawUrl(listings.flagged[i].urls[u].url) === rawUrl ) {
              // here we'll need to index through the urls to identify if this url is flagged or banned
              console.log ('url matches flagged', listings.flagged[i].urls[u], rawUrl)
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
  console.log('setdata running')
  firebase.functions().httpsCallable('getData')({})
  .then( function(result) {
    console.log('fetched data and setting ', result);
    chrome.storage.sync.set({data: result}, function() {
    });
  });
}

function getData (cb) {
  chrome.storage.sync.get(['data'], function(result) {
    console.log("data loaded", result.data)
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

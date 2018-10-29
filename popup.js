// TODO(DEVELOPER): Change the values below using values from the initialization snippet: Firebase Console > Overview > Add Firebase to your web app.
// Initialize Firebase
// chrome.extension.getBackgroundPage().console.log("credentials.js loaded");

var config = {
  apiKey: "AIzaSyCvj82G5ClLtYQmOYC9W_dPzgeMMmPcS58",
  authDomain: "trust-f0fdc.firebaseapp.com",
  databaseURL: "https://trust-f0fdc.firebaseio.com",
  projectId: "trust-f0fdc",
  storageBucket: "trust-f0fdc.appspot.com",
  messagingSenderId: "802077806931"
};
//if (!firebase.apps.length) {
//  console.log("initializingApp")
firebase.initializeApp(config);
//}

window.onload = function() {
  chrome.extension.getBackgroundPage().console.log("onLoad Worked");
  initApp();
  loadFlags();
  setNavListeners();
  setFactoid()
};

// Handlers for return messages from background.js
chrome.runtime.onMessage.addListener( function(request, sender, sendResponse) {
  console.log('message received', request)

  if ( request.actionType === "refresh" ) {
      refreshData()
  }

  if ( request.actionType === "error" ) {
    // console.log(request)
      displayError(request.message)
  }

});

function setFactoid () {
  getFactoid (function(result) {
    document.getElementById('footerFactoid').textContent = result.text
    document.getElementById('footerMoreInfoFactoid').href = result.link
  })
}

function getFactoid (cb) {
  var factoids = [{
    "text" : "Billionaire Ray Dalio credits his success to an open-minded approach to life.",
    "link" : "https://inside.bwater.com/publications/principles_excerpt"
  },{
    "text" : "Breacrumbs was created to provide a forum for open conversation. The more you know, the wiser you are.",
    "link" : "https://downloadbreadcrumbs.com"
  },{
    "text" : "A wise man knows that he knows nothing. - A.K.A. The Socratic Paradox",
    "link" : "https://en.wikipedia.org/wiki/I_know_that_I_know_nothing"
  }]

  var i = Math.floor(Math.random() * (factoids.length))

  cb( factoids[i] )
}

function displayError (message) {
  console.log('setting child', message)
  var id = randomString(16);
  var e = document.getElementById('error')
  var eDiv = document.createElement('div')
      eDiv.className = "errorMessage"
      eDiv.id = id
  var m = document.createElement('span')
      m.textContent = message
  var c = document.createElement('a')
      c.href = "#"
      c.textContent = "✕"
      c.onclick = function() { hideDiv(id) }
      eDiv.appendChild(m)
      eDiv.appendChild(c)

  e.appendChild(eDiv)

}

function hideDiv (id) {
  var element = document.getElementById(id)
      element.style.display = "none";
      element.parentNode.removeChild(document.getElementById(id));
}

function initApp() {
  chrome.extension.getBackgroundPage().console.log("initApp Called");
  // Listen for auth state changes.
  // [START authstatelistener]
  firebase.auth().onAuthStateChanged(function(user) {
    getUserData(user)

    if (user) {
      chrome.extension.getBackgroundPage().console.log("Got User");

      // User is signed in.
      var displayName = user.displayName;
      var email = user.email;
      var emailVerified = user.emailVerified;
      var photoURL = user.photoURL;
      var isAnonymous = user.isAnonymous;
      var uid = user.uid;
      var providerData = user.providerData;
      // [START_EXCLUDE]
      document.getElementById('quickstart-button').textContent = 'Sign out';
      // document.getElementById('quickstart-sign-in-status').textContent = 'Signed in';
      // document.getElementById('quickstart-account-details').textContent = JSON.stringify(user, null, '  ');
      // [END_EXCLUDE]
    } else {
      // Let's try to get a Google auth token programmatically.
      // [START_EXCLUDE]
      chrome.extension.getBackgroundPage().console.log("Could not get user");

      document.getElementById('quickstart-button').textContent = 'Google Login';
      // document.getElementById('quickstart-sign-in-status').textContent = 'Signed out';
      // document.getElementById('quickstart-account-details').textContent = 'null';
      // [END_EXCLUDE]
    }
    document.getElementById('quickstart-button').disabled = false;
  });
  // [END authstatelistener]

  addButtonListeners()
  addSettingsListeners()

}

function addButtonListeners() {
  document.getElementById('quickstart-button').addEventListener('click', startSignIn, false);
  document.getElementById('refresh-button').addEventListener('click', refreshData);
  document.getElementById('refresh-button').addEventListener('click', refreshData);
  document.getElementById('showRulesButton').addEventListener('click', showRules)
  // document.getElementById('showFAQButton').addEventListener('click', showFAQ)
  document.getElementById('breadcrumbIsFlag').addEventListener('click', showFlagRules)

}
function showFlagRules () {
  
  var rulesClass = document.getElementById('flagRules').className
  if (rulesClass.indexOf("hidden") !== -1 ) {
    // currently hidden, so show it
    document.getElementById('flagRules').className = rulesClass.split('hidden').join(' ')
  } else {
    // currently shown, so hide it
    document.getElementById('flagRules').className += "hidden"
  }

}

function showRules () {
  var rulesClass = document.getElementById('rules').className
  if (rulesClass.indexOf("hidden") !== -1 ) {
    // currently hidden, so show it
    document.getElementById('rules').className = rulesClass.split('hidden').join(' ')
  } else {
    // currently shown, so hide it
    document.getElementById('rules').className += "hidden"
  }
}
function showFAQ () {
  var rulesClass = document.getElementById('FAQ').className
  if (rulesClass.indexOf("hidden") !== -1 ) {
    // currently hidden, so show it
    document.getElementById('FAQ').className = rulesClass.split('hidden').join(' ')
  } else {
    // currently shown, so hide it
    document.getElementById('FAQ').className += "hidden"
  }
}

function refreshData () {
  console.log('refresh data called')
  window.location.reload() 

}

function getFlags (cb) {
  console.log('get flags ran')
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

    var url = getRawUrl(tabs[0].url)
    console.log('cb', cb)
    console.log(url)

    fetchFlagsForUrl(url, function (result){
      console.log('returned flags', result)      
      if ( flags.length > 0 ) {
        cb(flags)
      } else {
        var arr = []
        cb(arr)
      }
    })



  });

}

function getRawUrl (rawUrl) {
  var url =  (rawUrl.split('?')[0]).split('//')[1] // remove get params and remove protocol header
  return url
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

function loadFlags () {

  getFlags(function (flags) {
    // var flags = []
    console.log('flags', flags)

    if ( flags.length > 0 ) {
      document.getElementById('home').className += " hidden"
      document.getElementById('settings').className += " hidden"
      document.getElementById('newFlag').className += " hidden"
      showFlags(flags)
    } else {
      document.getElementById('flagContainer').className += " hidden"
      document.getElementById('settings').className += " hidden"
      document.getElementById('newFlag').className += " hidden"      
      showNoFlagsMessage()
    }

  })


}

function getUserData (  ) {
  // calls from navSettings to load the user data 
  console.log('get user called')
  firebase.functions().httpsCallable('getUser')()
    .then( function(result) {
      console.log('got user', result)
      setUserData(result)
      //chrome.storage.sync.set({data: result}, function() {
    });
}

function setUserData (user) {
  console.log('setting user info ', user)
  document.getElementById('userName').innerHTML = user.data.email
  document.getElementById('userScore').innerHTML = "(" + user.data.score + ")"
}

function unsetUserData () {
  console.log('unsetting user info ')
  document.getElementById('userName').innerHTML = "Not signed in"
  document.getElementById('userScore').innerHTML = ""
}

function addSettingsListeners() {
  document.getElementById('colorScheme').addEventListener("change", saveSettings)
  document.getElementById('autoHighlighting').addEventListener("change", saveSettings)
  document.getElementById('showPendingFlags').addEventListener("change", saveSettings)
}

function saveSettings () {

  console.log('save settings running')

  var settings = {
    "colorScheme" : document.getElementById('colorScheme').value, 
    "autoHighlighting" : document.getElementById('autoHighlighting').checked, 
    "showPendingFlags" : document.getElementById('showPendingFlags').checked
  }

  chrome.storage.local.set({ "settings": settings }, function(result){
      console.log('successfully saved settings', result)
  });
}

function getSettings () {
  chrome.storage.local.get(["settings"] , function(settings){
      console.log('loaded settings', settings)
      setSettings(settings)
  });
}

function setSettings (settings) {
  console.log('setting settings', settings)
  console.log('setting colorScheme ', settings.settings.colorScheme)
  document.getElementById('colorScheme').value = settings.settings.colorScheme
  document.getElementById('autoHighlighting').checked = settings.settings.autoHighlighting
  document.getElementById('showPendingFlags').checked = settings.settings.showPendingFlags
  
}

function setNavListeners() {
  document.getElementById('settings-button').addEventListener('click', navSettings)
  document.getElementById('home-button').addEventListener('click', navHome)
  document.getElementById('new-button').addEventListener('click', navNewFlag)
  document.getElementById('BC_nf_submitNewFlagForm').addEventListener('click', BC_submitNewFlagForm)
}

function navSettings () {
  // getUserData()
  console.log('nav to settings')
  getSettings()
  document.getElementById('home').className += " hidden"
  document.getElementById('flagContainer').className += " hidden"
  document.getElementById('newFlag').className += " hidden"
  document.getElementById('settings').className = document.getElementById('settings').className.split('hidden').join(' ')       
}

function navNewFlag () {
  console.log('nav to new flag')
  // document.getElementById('home').className += " hidden"
  document.getElementById('flagContainer').className += " hidden"
  document.getElementById('settings').className += " hidden"
  document.getElementById('newFlag').className = document.getElementById('newFlag').className.split('hidden').join(' ')       
}

function navFlagContainer () {
  console.log('nav to new flag')
  document.getElementById('home').className += " hidden"
  document.getElementById('newFlag').className += " hidden"
  document.getElementById('settings').className += " hidden"
  document.getElementById('flagContainer').className = document.getElementById('flagContainer').className.split('hidden').join(' ')       
}

function navHome () {
  console.log('nav to home')
  // loadFlags()
  if(document.getElementById('flagContainer').children.length > 0) {
    console.log('flagContainer has children - navigating to flagContainer')
    navFlagContainer()
  } else {
    console.log('flagContainer has no children - navigating to home')
    document.getElementById('settings').className += " hidden"
    document.getElementById('flagContainer').className += " hidden"
    document.getElementById('newFlag').className += " hidden"
    document.getElementById('home').className = document.getElementById('home').className.split('hidden').join(' ')       
  }
}

function showNoFlagsMessage () {
  document.getElementById('flagContainer').className = document.getElementById('flagContainer').className.split('hidden').join(' ') 
}

function returnRandomQuote () {
  var quote = {
    quote : "In vain have you acquired knowledge if you have not imparted it to others.",
    author : "Deuteronomy Rabbah"
  }
  return quote
}

function showFlags (flags) {

  // Retrieve Flag Container
  // flagContainer.className = "flagContainer"

  // check for show pending
  chrome.storage.local.get(["settings"] , function(settings){

    var showPendingFlags = settings.settings.showPendingFlags

    // Fill Flag Container
    console.log('flags**'+JSON.stringify(flags), "showPendingFlags is ", showPendingFlags)
    for ( var x = 0; x < flags.length; x++ ) {

      // Check if flag is already present
      var fCheck = document.getElementById("flagHeader_" + flags[x].flagId)

      if (fCheck != null) {
        // skip this flag as it's already loaded
      
      } else {

        if ( showPendingFlags === true || (showPendingFlags === false && flags[x].status != 'FLAG PENDING') ) {
          addFlagToFlagContainer(flags[x])
        } else {
          console.log('skipping flag ', flags[x], 'x is ', x, 'flags.length is', flags.length)
          if ( x === (flags.length - 1 ) ){
            navHome ()
          }
        }
      }

    }
  });  
}

function addFlagToFlagContainer (flag) {
  // If not, then add it
  var newFlag = document.createElement('div')
  newFlag.id = flag.flagId
  newFlag.className = "flagElement"
  var flagContainer = document.getElementById("flagContainer");

  var flagHeader = document.createElement('div')
      flagHeader.className = "flagHeader"

  var flagStatus = document.createElement('i')
      flagStatus.className = "fas fa-circle status_" + flag.status.split("FLAG ")[1]  

  var flagUsername = document.createElement('span')
      flagUsername.className = "flagUsername"
      flagUsername.textContent = "Username"

  var flagAge = document.createElement('span')
      flagAge.className = "flagAge"
      flagAge.textContent = "2 days old"

  var flagType = document.createElement("i")
      flagType.className = "fas fa-flag flagType"

      flagHeader.appendChild(flagStatus)
      flagHeader.appendChild(flagUsername)
      flagHeader.appendChild(flagAge)
      flagHeader.appendChild(flagType)    

  var flagBody = document.createElement('div')
      flagBody.className = "flagBody"

  var flagVoting = document.createElement('div')
      flagVoting.className = "flagVoting"

  var flagUpvote = document.createElement('i')
      flagUpvote.className = "fas fa-sort-up"    
      flagUpvote.id = "upvote_" + flag.flagId
      flagUpvote.onclick = function() { vote (flag.flagId, "upvote") }

  var flagDownvote = document.createElement('i')
      flagDownvote.className = "fas fa-sort-down"    
      flagDownvote.id = "downvote_" + flag.flagId
      flagDownvote.onclick = function() { vote (flag.flagId, "downvote") }

  var flagScore = document.createElement('span')
      flagScore.className = "flagScore"
      flagScore.id = "score_" + flag.flagId
      flagScore.textContent = "5"

      flagVoting.appendChild(flagUpvote)
      flagVoting.appendChild(flagScore)
      flagVoting.appendChild(flagDownvote)

  var flagText = document.createElement('span')
      flagText.className = "flagBodyText"
      flagText.textContent = "This is where the comment body will go when it's ready to go here."    

      flagBody.appendChild(flagVoting)
      flagBody.appendChild(flagText)

  var flagFooter = document.createElement('div')
      flagFooter.className = "flagFooter"

  var replyButton = document.createElement('span')
      replyButton.className = "flagActionButton"
      replyButton.textContent = "reply"
      replyButton.onclick = function() { reply (flag.flagId) }

  var infoButton = document.createElement('span')
      infoButton.className = "flagActionButton"
      infoButton.textContent = "info"

  var infoButtonContainer = document.createElement('a')
      infoButtonContainer.target = "_blank"
      infoButtonContainer.href = "https://downloadbreadcrumbs.com/#/getinfo?i=" + flag.flagId
      infoButtonContainer.innerHTML = infoButton.outerHTML

  var reportButton = document.createElement('span')
      reportButton.className = "flagActionButton"
      reportButton.textContent = "report"
      reportButton.onclick = function() { report (flag.flagId) }            

      flagFooter.appendChild(replyButton)
      flagFooter.appendChild(infoButtonContainer)
      flagFooter.appendChild(reportButton)

  newFlag.appendChild(flagHeader)
  newFlag.appendChild(flagBody)
  newFlag.appendChild(flagFooter)

  flagContainer.appendChild(newFlag)      

}

function report (id) {
  console.log('reported:', id)
}

function vote (id, action) {
  console.log('vote action triggered: ', action, id)
}

function moreInfo (div) {
  var id = div.parentNode.id
  var url = "https://downloadbreadcrumbs.com/#/getinfo?i=" + id
  window.open( url , '_newtab');
}

function setupFlags () {

}

/**
* Start the auth flow and authorizes to Firebase.
* @param{boolean} interactive True if the OAuth flow should request with an interactive mode.
*/
function startAuth(interactive) {
  chrome.extension.getBackgroundPage().console.log("Starting Auth");

  // Request an OAuth token from the Chrome Identity API.
  chrome.identity.getAuthToken({interactive: !!interactive}, function(token) {
    if (chrome.runtime.lastError && !interactive) {

      chrome.extension.getBackgroundPage().console.log('It was not possible to get a token programmatically.');
    } else if(chrome.runtime.lastError) {
      chrome.extension.getBackgroundPage().console.log('error:'+JSON.stringify(chrome.runtime.lastError));
    } else if (token) {
      // Authorize Firebase with the OAuth Access Token.
      var credential = firebase.auth.GoogleAuthProvider.credential(null, token);

      firebase.auth().signInAndRetrieveDataWithCredential(credential).catch(function(error) {
        // The OAuth token might have been invalidated. Lets' remove it from cache.
        if (error.code === 'auth/invalid-credential') {
          chrome.extension.getBackgroundPage().console.log('invalid credentials.');

          chrome.identity.removeCachedAuthToken({token: token}, function() {
            startAuth(interactive);
          });
        }
      });
    } else {
      chrome.extension.getBackgroundPage().console.log("The OAuth Token was null");
    }
  });
}


// send flag to background.js
function BC_submitNewFlagForm () {
  alert('Thanks!')
  navHome()
  // console.log('submitted!')
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) { 
    // temporarily hardcoding subject_id to 1 to avoid bugs
    var payload = {
      "url" : getRawUrl(tabs[0].url),
      "comment":document.getElementById("BC_nf_description").value,
      "isFlag" : document.getElementById("breadcrumbIsFlag").value
    }


    // console.log('calling new flag with', payload)

    var msg = {payload: payload, from: 'newFlag'};
    // console.log('msg ', msg)

    // BC_hideElement ("testFlagForm")

    chrome.runtime.sendMessage(msg, function(response) {
      // console.log(response)
    });
  
  })
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

function searchPageAndNav (text) {
 
  
  console.log('search request sent to background for text', text)

  // temporarily hardcoding subject_id to 1 to avoid bugs
  var payload = {
    "searchText": text
  }

    var msg = {payload: payload, from: 'search'};
    console.log('msg ', msg)

    // BC_hideElement ("testFlagForm")

    chrome.runtime.sendMessage(msg, function(response) {
      // console.log(response)
    });

}

/**
* Starts the sign-in process.
*/
function startSignIn() {
  chrome.extension.getBackgroundPage().console.log("start signIn");
  document.getElementById('quickstart-button').disabled = true;
  if (firebase.auth().currentUser) {
    firebase.auth().signOut();
    unsetUserData();
  } else {
    startAuth(true);
  }
}

function randomString(n) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < n; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}


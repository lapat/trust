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
};



function initApp() {
  chrome.extension.getBackgroundPage().console.log("initApp Called");
  // Listen for auth state changes.
  // [START authstatelistener]
  firebase.auth().onAuthStateChanged(function(user) {
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

      document.getElementById('quickstart-button').textContent = 'Sign in';
      // document.getElementById('quickstart-sign-in-status').textContent = 'Signed out';
      // document.getElementById('quickstart-account-details').textContent = 'null';
      // [END_EXCLUDE]
    }
    document.getElementById('quickstart-button').disabled = false;
  });
  // [END authstatelistener]

  document.getElementById('quickstart-button').addEventListener('click', startSignIn, false);
  document.getElementById('refresh-button').addEventListener('click', refreshData);
  document.getElementById('refresh-button').addEventListener('click', refreshData);
  addSettingsListeners();

}


function refreshData () {
  // console.log('refresh data called')
  getFlags(function(flags) {
    showFlags(flags)
  })
}

function getFlags (cb) {
  // console.log('get flags ran')
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

    var url = getRawUrl(tabs[0].url)
    console.log('cb', cb)
    console.log(url)

    fetchFlagsForUrl(url, function (result){
      if ( flags.length > 0 ) {
        cb(flags)
      } else {
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
  // console.log(url)

    //url == "www.breitbart.com/big-government/2018/10/06/kavanaugh-confirmed-possibly-most-conservative-supreme-court-since-1934/") {
    firebase.functions().httpsCallable('getShortDataForUrl')({'url' : url})
      .then( function(result) {
        // console.log(result);
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
    // console.log('flags', flags)

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

  firebase.functions().httpsCallable('getShortDataForUrl')({'url' : url})
    .then( function(result) {
      // console.log(result);
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

function addSettingsListeners() {
  document.getElementById('colorScheme').addEventListener("change", saveSettings)
  document.getElementById('autoHighlighting').addEventListener("change", saveSettings)
  document.getElementById('showPendingFlags').addEventListener("change", saveSettings)
}

function saveSettings () {

  // console.log('save settings running')

  var settings = {
    "colorScheme" : document.getElementById('colorScheme').value, 
    "autoHighlighting" : document.getElementById('autoHighlighting').checked, 
    "showPendingFlags" : document.getElementById('showPendingFlags').checked
  }

  chrome.storage.local.set({ "settings": settings }, function(result){
      // console.log('successfully saved settings', result)
  });
}

function getSettings () {
  chrome.storage.local.get(["settings"] , function(settings){
      // console.log('loaded settings', settings)
      setSettings(settings)
  });
}

function setSettings (settings) {
  // console.log('setting settings', settings)
  // console.log('setting colorScheme ', settings.settings.colorScheme)
  document.getElementById('colorScheme').value = settings.settings.colorScheme
  document.getElementById('autoHighlighting').checked = settings.settings.autoHighlighting
  document.getElementById('showPendingFlags').checked = settings.settings.showPendingFlags
  
}

function setNavListeners() {
  document.getElementById('_settings').addEventListener('click', navSettings)
  document.getElementById('_main').addEventListener('click', navHome)
  document.getElementById('_newFlag').addEventListener('click', navNewFlag)
  document.getElementById('BC_nf_submitNewFlagForm').addEventListener('click', BC_submitNewFlagForm)
}

function navSettings () {
  // getUserData()
  // console.log('nav to settings')
  getSettings()
  document.getElementById('home').className += " hidden"
  document.getElementById('flagContainer').className += " hidden"
  document.getElementById('newFlag').className += " hidden"
  document.getElementById('settings').className = document.getElementById('settings').className.split('hidden').join(' ')       
}

function navNewFlag () {
  // console.log('nav to new flag')
  document.getElementById('home').className += " hidden"
  document.getElementById('flagContainer').className += " hidden"
  document.getElementById('settings').className += " hidden"
  document.getElementById('newFlag').className = document.getElementById('newFlag').className.split('hidden').join(' ')       
}

function navFlagContainer () {
  // console.log('nav to new flag')
  document.getElementById('home').className += " hidden"
  document.getElementById('newFlag').className += " hidden"
  document.getElementById('settings').className += " hidden"
  document.getElementById('flagContainer').className = document.getElementById('flagContainer').className.split('hidden').join(' ')       
}

function navHome () {
  // console.log('nav to home')
  // loadFlags()
  if(document.getElementById('flagContainer').children.length > 0) {
    // console.log('flagContainer has children - navigating to flagContainer')
    navFlagContainer()
  } else {
    // console.log('flagContainer has no children - navigating to home')
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
    // console.log('flags**'+JSON.stringify(flags), "showPendingFlags is ", showPendingFlags)
    for ( var x = 0; x < flags.length; x++ ) {

      // Check if flag is already present
      var fCheck = document.getElementById("flagHeader_" + flags[x].flagId)

      if (fCheck != null) {
        // skip this flag as it's already loaded
      
      } else {

        if ( showPendingFlags === true || (showPendingFlags === false && flags[x].status != 'FLAG PENDING') ) {
          addFlagToFlagContainer(flags[x])
        } else {
          // console.log('skipping flag ', flags[x], 'x is ', x, 'flags.length is', flags.length)
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
      flagHeader.id = "flagHeader_" + flag.flagId
      flagHeader.className = "flagHeader"

  var flagFooter = document.createElement('div')
      flagFooter.id = flag.flagId
      flagFooter.className = "flagFooter"

  var flagText = document.createElement('i')
      flagText.innerHTML = '"' + flag.selectedText + '"'
      flagText.id = flag.flagId + "_div"
      flagText.className = "flagText"

  var searchButton = document.createElement('button')
      searchButton.innerHTML = "s"
      searchButton.className = "flagInfo"
      searchButton.value = flag.selectedText
      searchButton.onclick = function() { searchPageAndNav (this.value) }

  var moreInfoButton = document.createElement('button')
      moreInfoButton.innerHTML = "i"
      moreInfoButton.className = "flagInfo"
      moreInfoButton.onclick = function() { moreInfo (this) }

  var flagStatus = document.createElement('p')
      flagStatus.innerHTML = flag.status.split("FLAG ")[1]
      flagStatus.className = "flagStatus"

  var flagCategory = document.createElement('p')
      flagCategory.innerHTML = flag.flagSubject
      flagCategory.className = "flagSubject"

  var flagOffense = document.createElement('p')
      flagOffense.innerHTML = flag.offense
      flagOffense.className = "flagOffense"                

  // flagHeader.appendChild(status)
  flagHeader.appendChild(flagOffense)
  flagHeader.appendChild(flagCategory)

  flagFooter.appendChild(flagStatus)
  flagFooter.appendChild(searchButton)
  flagFooter.appendChild(moreInfoButton)

  newFlag.appendChild(flagHeader)
  newFlag.appendChild(flagText)
  newFlag.appendChild(flagFooter)

  flagContainer.appendChild(newFlag)
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
      "source":document.getElementById("BC_nf_sourceUrl").value,
      "offense_type":document.getElementById("BC_nf_offenseSelect").value,
      "selected_text":document.getElementById("BC_nf_selectedText").value,
      "description":document.getElementById("BC_nf_description").value,
      "subject":document.getElementById("BC_nf_subjectSelect").value,
      "subject_id":"1"
    }

      var msg = {payload: payload, from: 'newFlag'};
      // console.log('msg ', msg)

      // BC_hideElement ("testFlagForm")

      chrome.runtime.sendMessage(msg, function(response) {
        // console.log(response)
      });
  })
}

function getRawUrl (rawUrl) {
  // console.log('getting raw url of ', rawUrl)
  var url =  (rawUrl.split('?')[0]).split('//')[1] // remove get params and remove protocol header
  return url
}

function removeWww(rawUrl){
  // console.log('getting www-less url of ', rawUrl)
  var noWww = rawUrl.split('www.')[1]
  // console.log('noWww', noWww)
  return noWww
}

function searchPageAndNav (text) {
 
  
  // console.log('search request sent to background for text', text)

  // temporarily hardcoding subject_id to 1 to avoid bugs
  var payload = {
    "searchText": text
  }

    var msg = {payload: payload, from: 'search'};
    // console.log('msg ', msg)

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
  } else {
    startAuth(true);
  }
}

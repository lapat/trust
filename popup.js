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




/*[{
  "flagId" : "abc123",
  "status" : "FLAG PENDING",
  "selectedText" : "hysteria is the key to destruction",
  "offense" : "False Information"
},{
  "flagId" : "abc123",
  "status" : "FLAG PENDING",
  "selectedText" : "hysteria is the key to destruction",
  "offense" : "False Information"
},{
  "flagId" : "abc123",
  "status" : "FLAG PENDING",
  "selectedText" : "hysteria is the key to destruction",
  "offense" : "False Information"
}]
*/


/**
* initApp handles setting up the Firebase context and registering
* callbacks for the auth status.
*
* The core initialization is in firebase.App - this is the glue class
* which stores configuration. We provide an app name here to allow
* distinguishing multiple app instances.
*
* This method also registers a listener with firebase.auth().onAuthStateChanged.
* This listener is called when the user is signed in or out, and that
* is where we update the UI.
*
* When signed in, we also authenticate to the Firebase Realtime Database.
*/

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
}

function getFlags (cb) {
  // console.log('get flags ran')
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

    var url = getRawUrl(tabs[0].url)

    console.log(url)

    fetchFlagsForUrl(url, function (result){
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

function setNavListeners() {
  document.getElementById('_settings').addEventListener('click', navSettings)
  document.getElementById('_main').addEventListener('click', navHome)
  document.getElementById('_newFlag').addEventListener('click', navNewFlag)
  document.getElementById('BC_nf_submitNewFlagForm').addEventListener('click', BC_submitNewFlagForm)
}

function navSettings () {
  console.log('nav to settings')
  document.getElementById('home').className += " hidden"
  document.getElementById('flagContainer').className += " hidden"
  document.getElementById('newFlag').className += " hidden"
  document.getElementById('settings').className = document.getElementById('settings').className.split('hidden').join(' ')       
}

function navNewFlag () {
  console.log('nav to new flag')
  document.getElementById('home').className += " hidden"
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
  var flagContainer = document.getElementById("flagContainer");
  flagContainer.className = "flagContainer"
  console.log('flags**'+JSON.stringify(flags))
  for ( var x = 0; x < flags.length; x++ ) {

    var newFlag = document.createElement('div')
    newFlag.id = flags[x].flagId
    newFlag.className = "flagElement"

    var flagHeader = document.createElement('div')
        flagHeader.id = "flagHeader_" + flags[x].flagId
        flagHeader.className = "flagHeader"

    var flagFooter = document.createElement('div')
        flagFooter.id = flags[x].flagId
        flagFooter.className = "flagFooter"

    var flagText = document.createElement('i')
        flagText.innerHTML = '"' + flags[x].selectedText + '"'
        flagText.id = flags[x].flagId + "_div"
        flagText.className = "flagText"

    var searchButton = document.createElement('button')
        searchButton.innerHTML = "s"
        searchButton.className = "flagInfo"
        searchButton.value = flags[x].selectedText
        searchButton.onclick = function() { searchPageAndNav (this.value) }

    var moreInfoButton = document.createElement('button')
        moreInfoButton.innerHTML = "i"
        moreInfoButton.className = "flagInfo"
        moreInfoButton.onclick = function() { moreInfo (this) }

    var flagStatus = document.createElement('p')
        flagStatus.innerHTML = flags[x].status.split("FLAG ")[1]
        flagStatus.className = "flagStatus"

    var flagCategory = document.createElement('p')
        flagCategory.innerHTML = flags[x].flagSubject
        flagCategory.className = "flagSubject"

    var flagOffense = document.createElement('p')
        flagOffense.innerHTML = flags[x].offense
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

  // temporarily hardcoding subject_id to 1 to avoid bugs
  var payload = {
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
  } else {
    startAuth(true);
  }
}

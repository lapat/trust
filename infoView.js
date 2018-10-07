// TODO(DEVELOPER): Change the values below using values from the initialization snippet: Firebase Console > Overview > Add Firebase to your web app.
// Initialize Firebase
chrome.extension.getBackgroundPage().console.log("credentials.js loaded");

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

var sample_flags =  [{
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

      document.getElementById('quickstart-button').textContent = 'Sign-in with Google';
      // document.getElementById('quickstart-sign-in-status').textContent = 'Signed out';
      // document.getElementById('quickstart-account-details').textContent = 'null';
      // [END_EXCLUDE]
    }
    document.getElementById('quickstart-button').disabled = false;
  });
  // [END authstatelistener]

  document.getElementById('quickstart-button').addEventListener('click', startSignIn, false);
}

function getFlags () {
  return sample_flags;
}

function loadFlags () {

  var flags = getFlags()

  var flagContainer = document.getElementById("flagContainer");
      flagContainer.className = "flagContainer"

  for ( var x = 0; x < flags.length; x++ ) {

    var newFlag = document.createElement('div')
        newFlag.id = flags[x].flagId + "_div"
        newFlag.className = "flagElement"

    var flagTitle = document.createElement('i') 
        flagTitle.innerHTML = flags[x].selectedText
        flagTitle.id = flags[x].flagId + "_div"
        flagTitle.className = "flagElement"

    var moreInfoButton = document.createElement('button')
        moreInfoButton.innerHTML = "More Info"
        moreInfoButton.onclick = function() { moreInfo (flags[x].flagId) }

    var flagStatus = document.createElement('b')
        flagStatus.innerHTML = flags[x].status
        flagStatus.className = "flagStatus"

    newFlag.appendChild(flagTitle)
    newFlag.appendChild(moreInfoButton)
    newFlag.appendChild(flagStatus)
    flagContainer.appendChild(newFlag)

  }    

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


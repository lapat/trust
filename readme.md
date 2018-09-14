Current Feature List

# eTrust (Working Title) Chrome Extension:

This chrome extension allows users to access the core network and easily see which content has been flagged as incorrect by experts while browsing online. 

# Feature List
## Popup 
Most of the popup functionality will be essentially buttons which open a new tab of the website for the user 

- Clap / Upvote Current Page -> New tab on website
- Report / Flag Current Page -> New tab on website 
- More Info Re: Current Page -> New tab on website for the full information page showing all previous and current flags on the page
- Login - See API Call
- Logout - Clears chrome.storage.~userSession 
- Settings / Account -> Opens new tab for user to website view of their account settings page (may require login again on our website)

## Right Click
- Report / Flag (Current Selection) -> New tab on website showing the Report / Flag form with autofilled information. Users can report a link or a section of text from the page. 
- Clap (Current URL) -> See API Calls
- More Info (Current URL) -> New tab on website showing all previous flags related to a particular section of text or URL

## Icon
The icon of the plugin should respond to the current URL of the page as a user browses. 

- Number in top right corner to indicate total flags (regardless of status)
- Changes colour to indicate current status of URL 
- Blue -> Partner Organization 
- White -> No Current Ranking (Can have appealed flags, but the domain cannot have a single banned url)
- Yellow -> Current URL has at least one open flag, or the domain has a banned page
- Red -> This page has an unresolved flag or this domain has more than 10 banned pages

## API Calls
GetInfo - The extension will call the API and sync the full list of flagged / approved domains on a daily basis. The data will be stored in chrome.storage 

Login - Simple firebase login Auth

Clap / Upvote - Must be logged in, Sends simple upvote action for current page (enough upvotes eventually leads to partner status?)
# Screenwriter
## Write distraction-free screenplays in your desktop browser

<img width="1185" alt="Screenshot 2023-03-31 at 11 44 37" src="https://user-images.githubusercontent.com/140571/229086507-b4b63dd7-52ba-4c90-b97c-4dab1fc2bcbb.png">

Stores data as local storage, imports and exports txt files. Made for keyboard-intensive usage (see below).

Tested in newest Chrome only. Firefox should work, too. I don't care about Safari.

## Demo

**Try out the editor here: https://screenwriter.zeitpulse.com/**.

The data is stored in your browsers local storage.

## Keyboard Usage

 * `tab`: change the type of text in the current secion (text, charater for dialog, dialog text and annotation)
 * `shift` + `enter`: insert a new line in the current section
 * `meta`/`ctrl` + `backspace`: remove the current section
 * `meta`/`ctrl` + `enter`: insert a new section
 * `meta`/`ctrl` + `shift` + `arrow-down`: merge this section with next one
 * `meta`/`ctrl` + `shift` + `arrow-up`: merge this section with previous one
 * `meta`/`ctrl` + `shift` + `enter`: split this section here in two sections
 * `meta`/`ctrl` + `shift` + `U`: uppercase the section, downcase if everthing is uppercase
 * `ctrl` + `shift` + `Z`: recover last deletions

## Features

 * detects the beginning of a new scene; just write the whole line uppercase (meta/ctrl+shift+U)
 * auto suggests the next name of the character if you are in a dialog
 * exports screenplay as plain-text or json
 * imports screenplay from plain-text or json
 * auto-saves/downloads screenplay to local file every minute (beware, there is no real undo implemented - if a section is deleted, it may be gone)
 * cover page for printing
 * editing meta data
 * focus mode (inspired by iaWriter)
 
 <img width="879" alt="Screenshot 2023-04-01 at 11 56 29" src="https://user-images.githubusercontent.com/140571/229279371-9cdeae04-28af-41f7-9c47-fee3a34b21aa.png">
 
 * dark-mode
 
<img width="1189" alt="Screenshot 2023-03-31 at 11 46 53" src="https://user-images.githubusercontent.com/140571/229086759-31aa087d-cb28-443f-82c6-a36200b16a26.png">

## TODOs

 * faster cleanup of html/plain-text during text changes
 * index overview windows
 * https://pagedjs.org/posts/2020-04-15-starterkits-for-pagedjs/

## Build

    $ yarn install
    $ yarn build

## Watch / Development

    $ yarn watch

## Tests

    $ yarn test

## License

MIT

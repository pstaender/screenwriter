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
 * `meta` + `backspace`: remove the current section
 * `meta` + `enter`: insert a new section
 * `shift` + `arrow-down`: merge this section with next one
 * `meta` + `shift` + `U`: uppercase the section, downcase if everthing is uppercase

## Features

To detect the beginning of a new scene, you should write the whole line Uppercase (Meta+Shift+U).

The editor will suggest the next name of the character if you are in a dialog.

Other features:

 * exports screenplay as plain-text or json
 * imports screenplay from plain-text (using the same spacing-conventions) or json
 * auto-saves/downloads screenplay to local file every minute (beware, there is no real undo implemented - if a section is deleted, it's gone)
 * cover page for printing
 * editing meta data
 * focus mode (inspired by iaWriter)
 
 <img width="879" alt="Screenshot 2023-04-01 at 11 56 29" src="https://user-images.githubusercontent.com/140571/229279371-9cdeae04-28af-41f7-9c47-fee3a34b21aa.png">
 
 * enjoy dark-mode
 
<img width="1189" alt="Screenshot 2023-03-31 at 11 46 53" src="https://user-images.githubusercontent.com/140571/229086759-31aa087d-cb28-443f-82c6-a36200b16a26.png">

## TODOs

 * faster cleanup of html/plain-text during text changes
 * make spaces configurable in interface (via metaData)
 * consider word wrap in import
 * more undo
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

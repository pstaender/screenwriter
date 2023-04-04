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
 * `shift` + `enter`: insert a new line (line-break)
 * `enter`: break section into parts / insert new section below if at the end of the section / insert above if ath the beginning of the section
 * `meta`/`ctrl` + `backspace`: remove the current section
 * `meta`/`ctrl` + `shift` + `arrow-down`: merge this section with next one
 * `meta`/`ctrl` + `arrow-up`: Jump to previous section
 * `meta`/`ctrl` + `arrow-down`: Jump to next section
 * `meta`/`ctrl` + `shift` + `U`: uppercase the section, lowercase if everthing is uppercase
 * `meta`/`ctrl` + `0`: toggle focus mode

## Features

 * detects the beginning of a new scene; just write the whole line uppercase (meta/ctrl+shift+U)
 * auto suggests the next name of the character if you are in a dialog
 * exports screenplay as plain-text or json
 * imports screenplay from plain-text or json
 * auto-saves/downloads screenplay to local file every minute (beware, there is no real undo implemented - if a section is deleted/change it may be for good)
 * cover page for printing
 * editing meta data
 * focus mode (inspired by iaWriter)
 
 <img width="879" alt="Screenshot 2023-04-01 at 11 56 29" src="https://user-images.githubusercontent.com/140571/229279371-9cdeae04-28af-41f7-9c47-fee3a34b21aa.png">
 
 * dark-mode
 
<img width="1189" alt="Screenshot 2023-03-31 at 11 46 53" src="https://user-images.githubusercontent.com/140571/229086759-31aa087d-cb28-443f-82c6-a36200b16a26.png">

## A bit of markdown

You can use very limited markup/markdown:

 * starting with `//` is a comment, i.e. will not be printed and barely visible on screen
 * starting with `#`, `##`, `###` etc. uses headlines, similar to markdown
 * starting with `######` will force a page break on printing

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

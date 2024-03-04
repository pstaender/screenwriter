# Screenwriter
## Write distraction-free screenplays in your desktop browser

![status](https://github.com/pstaender/screenwriter/actions/workflows/specs.yml/badge.svg)

<img width="1185" alt="Screenshot 2023-03-31 at 11 44 37" src="https://user-images.githubusercontent.com/140571/229086507-b4b63dd7-52ba-4c90-b97c-4dab1fc2bcbb.png">

Stores data as local storage, imports and exports txt files. Made for keyboard-intensive usage (see below).

Tested in newest Chrome only. Firefox should work, too. I don't care about Safari.

## Demo

**Try out the editor here: https://screenwriter.zeitpulse.com/**.

To let the editor describes itself: https://screenwriter.zeitpulse.com/#demo

The data is stored in your browsers local storage.

## Keyboard Usage

  * `tab`: change the type of text in the current secion (text, charater for dialog, dialog text, dialog annotation and scene annotation)
  * `shift` + `enter`: inserts a new line (line-break)
  * `enter`: breaks section into parts / inserts new section below if at the end of the section / inserts above if at the beginning of the section
  * `⌘`/`ctrl` + `backspace`: removes section
  * `⌘`/`ctrl` + `shift` + `arrow-down`: merges this section with next one
  * `⌘`/`ctrl` + `arrow-up`: jumps to previous section
  * `⌘`/`ctrl` + `arrow-down`: jumps to next section
  * `⌘`/`ctrl` + `shift` + `U`: uppercases the section, lowercases if everthing is uppercase
  * `⌘`/`ctrl` + `shift` + `N`: New Document (clears current without extra warning)
  * `⌘`/`ctrl` + `shift` + `R`: Reloads document (recommended also as workaround when editor behaves erroneous)
  * `⌘`/`ctrl` + `shift` + `S`: downloads screenplay as txt or json file
  * `⌘`/`ctrl` + `shift` + `A`: copy complete screenplay as plain text to clipboard
  * `ctrl` + `shift` + `P`: exports file as pdf in print style
  * `⌘`/`ctrl` + `0`: toggles focus mode
  * `⌘`/`ctrl` + `shift` + `=`: Removes all empty sections (good for cleanup)
  * `⌘`/`ctrl` + `shift` + `,`: toggles suggestions for character names and scene introductions
  * `⌘`/`ctrl` + `.`: toggles TOC (tabel of content)
  * `⌘`/`ctrl` + `,`: show settings
  * `⌘`/`ctrl` + `\`: toggles version/history recovery
  * `ctrl` + `shift` + `G`: jumps to scene by number (`0` jumps to beginning of the document, numbers higher than existing scenes to the last scene, `e` to the end of the document) (this is not implemented in the standalone-app, yet)
## Features

 * detects the beginning of a new scene; just write the whole line uppercase (meta/ctrl+shift+U)
 * auto suggests the next name of the character if you are in a dialog
 * exports screenplay as plain-text or json
 * imports screenplay from plain-text or json
 * auto-saves/downloads screenplay to local file every minute (beware, there is no real 100%-undo implemented - if a section is deleted/changes it may be for good)
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
 * starting with `#######` (h7) will force a page break on printing

## TODOs

 * faster cleanup of html/plain-text during text changes
 * index overview windows
 * https://pagedjs.org/posts/2020-04-15-starterkits-for-pagedjs/

## Build

    $ npm install
    $ npm run build

## Watch / Development

    $ npm run watch / $ npm run tauri dev

## Tests

    $ npm run test

## License

MIT




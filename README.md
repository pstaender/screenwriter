# Screenwriter
## Helps you to write screenplays in your browser

<img width="1271" alt="Screenshot 2023-03-30 at 15 32 29" src="https://user-images.githubusercontent.com/140571/228852732-bc456510-52ac-4a39-bda3-ca0d435f3d50.png">

Stores data as local storage, imports and exports txt files. Made for keyboard-intensive usage (Tab, Cursors, Enter, CMD+Enter,  CMD+Backspace etc).

Tested in newest Chrome only.

## Demo

**Try out the editor here: https://screenwriter.zeitpulse.com/**.

The data is stored in your browsers local storage.

## Keyboard Usage

    * `Tab`: change the type of text in the current secion (text, charater for dialog, dialog text and annotation)
    * `Shift` + `Enter`: insert a new line in the current section
    * `meta`+`backspace`: remove the current section
    * `meta`+`enter`: insert a new section
    * `shift`+`arrow-down`: merge this section with next one

## Features

To detect the beginning of a new scene, you should start the line with `INT.` or `EXT.`.

The editor will suggest the next name of he character if you are in a dialog.

Besides that, you can:

    * export screenplay as plain text
    * import screenplay from plain text (using the same convetions)
    * enjoy dark-mode
    * auto-save screenplay to local file every minute (beware, there is no real undo implemented - if a section is deleted, it's gone)

## TODOs

    * more undo

## Build

    $ yarn install
    $ yarn build

## Watch / Development

    $ yarn watch

## Tests

    $ yarn test

## License

MIT

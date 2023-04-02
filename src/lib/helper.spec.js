import { expect, test } from '@jest/globals';
import { removeWordWrap } from "./helper"

let wrappedText = `
Lorem ipsum dolor sit amet, 
consectetur adipiscing elit, 
sed do eiusmod tempor 
incididunt ut labore et 
dolore 
magna aliqua. Ut
enim ad minim veniam, quis 
nostrud exercitation ullamco 
laboris nisi ut aliquip ex 
ea commodo consequat.
Duis aute irure dolor in 
reprehenderit in voluptate 
velit esse cillum dolore eu
fugiat nulla pariatur.
Excepteur sint occaecat 
cupidatat non proident,
sunt in culpa qui officia 
deserunt mollit anim id est 
laborum.`

let otherWrappedText = `Well take heart, 'cause you're never gonna
hafta hear it again. Because since I'm
never gonna do it again, you're never
gonna hafta hear me quack about how I'm
never gonna do it again.`

test(`reverseWordWrap`, () => {
    expect(removeWordWrap(otherWrappedText)).toEqual(
        `Well take heart, 'cause you're never gonna hafta hear it again. Because since I'm never gonna do it again, you're never gonna hafta hear me quack about how I'm never gonna do it again.`
    );
    let loremIpsum = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\nExcepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`
    expect(removeWordWrap(wrappedText.trim())).toEqual(loremIpsum.trim());
})

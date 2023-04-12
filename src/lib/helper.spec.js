import { expect, test } from '@jest/globals';
import { removeWordWrap, splitPositionForHtmlLikePlainText } from "./helper"

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


test(`splitHtmlLikePlainText`, () => {
    // 324 Afri\nka!
    let html = `Die Schwalben halten zwitschernd<br>hoch auf dem Turme Rat;<br>die Ält'ste spricht bedenklich:<br>„Der Herbst hat sich genaht.<br><br>Schon färben sich die Blätter,<br>die Felder werden leer;<br>bald tanzt kein einzig Mücklein<br>im Strahl der Sonne mehr.<br><br>„Seid ihr zur Reise fertig?"<br>Die Alten zwitschern: „Ja!"<br>Die Jungen fragen lustig:<br>„Wohin?"&nbsp; –&nbsp; „Nach Afrika!"<br><br>Nun schwirrt es durch die Lüfte,<br>verlassen ist das Nest;<br>doch alle hält die Liebe<br>an ihrer Heimat fest.<br><br>Wohl ist's viel hundert Meilen<br>von hier bis Afrika;<br>doch, kommt der Sommer wieder,<br>sind auch die Schwalben da.<br><br>Julius Sturm (1816-1886)`;
    // html via element.textContent
    let text = `Die Schwalben halten zwitscherndhoch auf dem Turme Rat;die Ält'ste spricht bedenklich:„Der Herbst hat sich genaht.Schon färben sich die Blätter,die Felder werden leer;bald tanzt kein einzig Mückleinim Strahl der Sonne mehr.„Seid ihr zur Reise fertig?"Die Alten zwitschern: „Ja!"Die Jungen fragen lustig:„Wohin?"  –  „Nach Afrika!"Nun schwirrt es durch die Lüfte,verlassen ist das Nest;doch alle hält die Liebean ihrer Heimat fest.Wohl ist's viel hundert Meilenvon hier bis Afrika;doch, kommt der Sommer wieder,sind auch die Schwalben da.Julius Sturm (1816-1886)`
    let actualSplitAt = splitPositionForHtmlLikePlainText(html, 324);
    expect(actualSplitAt).toEqual(386);
    expect(html.substring(0, actualSplitAt).endsWith('Nach Afri'))
})

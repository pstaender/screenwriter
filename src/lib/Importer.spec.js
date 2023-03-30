import { expect, jest, test } from '@jest/globals';
import { readFile } from 'fs/promises'

import { Importer } from './Importer';

let screenplayText = null;

beforeAll(async () => {
    screenplayText = (await readFile(new URL('../../spec/screenplay.txt', import.meta.url))).toString();
});

test('import of txt screenplay', () => {
    expect(Importer(screenplayText)).toEqual({
        sections: [
          {
            text: '                     JOHN',
            classification: 'dialogCharacter',
            html: 'JOHN'
          },
          {
            text: "          Well, one can't have everything.",
            classification: 'dialogText',
            html: "Well, one can't have everything."
          },
          {
            text: '                                               CUT TO:',
            classification: 'descriptionAnnotation',
            html: 'CUT TO:'
          },
          {
            text: "EXT. JOHN AND MARY'S HOUSE - CONTINUOUS",
            classification: 'description',
            html: "EXT. JOHN AND MARY'S HOUSE - CONTINUOUS"
          },
          {
            text: 'MIKE steps out of the car and walks up to the front door.\n' +
              'He rings the doorbell.',
            classification: 'description',
            html: 'MIKE steps out of the car and walks up to the front door.<br>He rings the doorbell.'
          },
          {
            text: '                                             BACK TO:',
            classification: 'descriptionAnnotation',
            html: 'BACK TO:'
          },
          {
            text: 'INT. KITCHEN - CONTINUOUS',
            classification: 'description',
            html: 'INT. KITCHEN - CONTINUOUS'
          },
          {
            text: '                     JOHN',
            classification: 'dialogCharacter',
            html: 'JOHN'
          },
          {
            text: '          Who on Earth could that be?',
            classification: 'dialogText',
            html: 'Who on Earth could that be?'
          },
          {
            text: '                     MARY',
            classification: 'dialogCharacter',
            html: 'MARY'
          },
          {
            text: "          I'll go and see.",
            classification: 'dialogText',
            html: "I'll go and see."
          },
          {
            text: 'Mary gets up and walks out. The front door lock CLICKS and\n' +
              "door CREAKS a little as it's opened.",
            classification: 'description',
            html: "Mary gets up and walks out. The front door lock CLICKS and<br>door CREAKS a little as it's opened."
          },
          {
            text: '                     MARY',
            classification: 'dialogCharacter',
            html: 'MARY'
          },
          {
            text: "          Well hello Mike! Come on in!\n          John, Mike's here!",
            classification: 'dialogText',
            html: "Well hello Mike! Come on in!<br>John, Mike's here!"
          },
          {
            text: '                     JOHN',
            classification: 'dialogCharacter',
            html: 'JOHN'
          },
          {
            text: '          Hiya Mike! What brings you here?',
            classification: 'dialogText',
            html: 'Hiya Mike! What brings you here?'
          }
        ],
        metaData: {
          Title: 'Example Screenplay',
          Author: 'Philipp Staender',
          Copyright: '2002'
        }
      })
})

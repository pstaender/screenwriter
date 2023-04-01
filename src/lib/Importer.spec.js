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
      title: 'Example Screenplay',
      author: 'Philipp Staender',
      Copyright: '2002'
    }
  })
})

test('import of external txt screenplay', async () => {
  let screenplay = (await readFile(new URL('../../spec/farpoint.txt', import.meta.url))).toString();
  let data = Importer(screenplay);
  expect(data).toEqual({
    sections: [
      {
        text: '                            FADE IN:',
        classification: 'descriptionAnnotation',
        html: 'FADE IN:'
      },
      {
        text: 'EXT. SPACE - STARSHIP (OPTICAL)',
        classification: 'description',
        html: 'EXT. SPACE - STARSHIP (OPTICAL)'
      },
      {
        text: 'The U.S.S. Enterprise NCC 1701-D traveling at warp speed\n' +
          'through space.',
        classification: 'description',
        html: 'The U.S.S. Enterprise NCC 1701-D traveling at warp speed<br>through space.'
      },
      {
        text: '                PICARD V.O.',
        classification: 'dialogCharacter',
        html: 'PICARD V.O.'
      },
      {
        text: "        Captain's log, stardate 42353.7.\n" +
          '        Our destination is planet Cygnus\n' +
          '        IV, beyond which lies the great\n' +
          '        unexplored mass of the galaxy.',
        classification: 'dialogText',
        html: "Captain's log, stardate 42353.7.<br>Our destination is planet Cygnus<br>IV, beyond which lies the great<br>unexplored mass of the galaxy."
      },
      {
        text: 'OTHER INTRODUCTORY ANGLES (OPTICAL)',
        classification: 'description',
        html: 'OTHER INTRODUCTORY ANGLES (OPTICAL)'
      },
      {
        text: 'on the gigantic new Enterprise NCC 1701-D.',
        classification: 'description',
        html: 'on the gigantic new Enterprise NCC 1701-D.'
      },
      {
        text: '                PICARD V.O.',
        classification: 'dialogCharacter',
        html: 'PICARD V.O.'
      },
      {
        text: '        My orders are to examine Farpoint,\n' +
          '        a starbase built there by the\n' +
          '        inhabitants of that world.\n' +
          '        Meanwhile ...',
        classification: 'dialogText',
        html: 'My orders are to examine Farpoint,<br>a starbase built there by the<br>inhabitants of that world.<br>Meanwhile ...'
      },
      {
        text: 'INT. ENGINE ROOM',
        classification: 'description',
        html: 'INT. ENGINE ROOM'
      },
      {
        text: 'Huge, with a giant wall diagram showing the immensity\n' +
          'of this Galaxy Class starship.',
        classification: 'description',
        html: 'Huge, with a giant wall diagram showing the immensity<br>of this Galaxy Class starship.'
      },
      {
        text: '                PICARD V.O.',
        classification: 'dialogCharacter',
        html: 'PICARD V.O.'
      },
      {
        text: 'continuing',
        classification: 'dialogAnnotation',
        html: 'continuing'
      },
      {
        text: '        ... I am becoming better\n' +
          '        acquainted with my new command,\n' +
          '        this Galaxy Class U.S.S.\n' +
          '        Enterprise.',
        classification: 'dialogText',
        html: '... I am becoming better<br>acquainted with my new command,<br>this Galaxy Class U.S.S.<br>Enterprise.'
      }
    ],
    metaData: {
      title: 'STAR TREK: THE NEXT GENERATION\n"Encounter at Farpoint"',
      author: 'D.C. Fontana and Gene Roddenberry',
      description: '<center>FINAL DRAFT</center>\n<center>April 13, 1987</center>',
      spacesDialogCharacter: 16,
      spacesDialog: 8,
      spacesAnnotation: 20
    }
  })
})

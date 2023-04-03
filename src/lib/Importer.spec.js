import { expect, jest, test } from '@jest/globals';
import { readFile } from 'fs/promises'

import { Importer } from './Importer';

test('import of txt screenplay', async () => {
  let screenplayText = (await readFile(new URL('../../spec/screenplay.txt', import.meta.url))).toString();
  expect(Importer(screenplayText)).toEqual({
    sections: [
      {
        text: '                     JOHN',
        classification: 'dialogCharacter',
        html: 'JOHN'
      },
      {
        text: "Well, one can't have everything.",
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
        text: 'Who on Earth could that be?',
        classification: 'dialogText',
        html: 'Who on Earth could that be?'
      },
      {
        text: '                     MARY',
        classification: 'dialogCharacter',
        html: 'MARY'
      },
      {
        text: "I'll go and see.",
        classification: 'dialogText',
        html: "I'll go and see."
      },
      {
        text: "Mary gets up and walks out. The front door lock CLICKS and door CREAKS a little as it's opened.",
        classification: 'description',
        html: "Mary gets up and walks out. The front door lock CLICKS and door CREAKS a little as it's opened."
      },
      {
        text: '                     MARY',
        classification: 'dialogCharacter',
        html: 'MARY'
      },
      {
        text: "Well hello Mike! Come on in!\nJohn, Mike's here!",
        classification: 'dialogText',
        html: "Well hello Mike! Come on in!<br>John, Mike's here!"
      },
      {
        text: '                     JOHN',
        classification: 'dialogCharacter',
        html: 'JOHN'
      },
      {
        text: 'Hiya Mike! What brings you here?',
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
        text: 'FADE IN:',
        classification: 'descriptionAnnotation',
        html: 'FADE IN:'
      },
      {
        text: 'EXT. SPACE - STARSHIP (OPTICAL)',
        classification: 'description',
        html: 'EXT. SPACE - STARSHIP (OPTICAL)'
      },
      {
        text: 'The U.S.S. Enterprise NCC 1701-D traveling at warp speed through space.',
        classification: 'description',
        html: 'The U.S.S. Enterprise NCC 1701-D traveling at warp speed through space.'
      },
      {
        text: '                PICARD V.O.',
        classification: 'dialogCharacter',
        html: 'PICARD V.O.'
      },
      {
        text: "Captain's log, stardate 42353.7.\nOur destination is planet Cygnus IV, beyond which lies the great unexplored mass of the galaxy.",
        classification: 'dialogText',
        html: "Captain's log, stardate 42353.7.<br>Our destination is planet Cygnus IV, beyond which lies the great unexplored mass of the galaxy."
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
        text: 'My orders are to examine Farpoint, a starbase built there by the inhabitants of that world.\nMeanwhile ...',
        classification: 'dialogText',
        html: 'My orders are to examine Farpoint, a starbase built there by the inhabitants of that world.<br>Meanwhile ...'
      },
      {
        text: 'INT. ENGINE ROOM',
        classification: 'description',
        html: 'INT. ENGINE ROOM'
      },
      {
        text: 'Huge, with a giant wall diagram showing the immensity of this Galaxy Class starship.',
        classification: 'description',
        html: 'Huge, with a giant wall diagram showing the immensity of this Galaxy Class starship.'
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
        text: '... I am becoming better acquainted with my new command, this Galaxy Class U.S.S.\nEnterprise.',
        classification: 'dialogText',
        html: '... I am becoming better acquainted with my new command, this Galaxy Class U.S.S.<br>Enterprise.'
      }
    ],
    metaData: {
      title: 'STAR TREK: THE NEXT GENERATION\n"Encounter at Farpoint"',
      author: 'D.C. Fontana and Gene Roddenberry',
      description: '<center>FINAL DRAFT</center>\n<center>April 13, 1987</center>',
      spacesDialogCharacter: 16,
      spacesDialog: 8
    }
  })
})

test('throw exception on tab content', () => {
  expect(() => Importer(`	this string contains a tab character`)).toThrow('Detected TAB character. Please convert all tabs to spaces before import.');
})

test('import another external plain text script', async () => {
  let screenplay = (await readFile(new URL('../../spec/titanic.txt', import.meta.url))).toString();
  expect(Importer(screenplay).sections).toEqual([
    {
      text: 'EXT. THE BOTTOM OF THE SEA',
      classification: 'description',
      html: 'EXT. THE BOTTOM OF THE SEA'
    },
    {
      text: 'A pale, dead-flat lunar landscape. It gets brighter, lit from above, as MIR ONE enters FRAME and drops to the seafloor in a downblast from its thrusters. It hits bottom after its two hour free-fall with a loud BONK.',
      classification: 'description',
      html: 'A pale, dead-flat lunar landscape. It gets brighter, lit from above, as MIR ONE enters FRAME and drops to the seafloor in a downblast from its thrusters. It hits bottom after its two hour free-fall with a loud BONK.'
    },
    {
      text: '                                                     CUT TO:',
      classification: 'descriptionAnnotation',
      html: 'CUT TO:'
    },
    {
      text: 'INT. MIR ONE',
      classification: 'description',
      html: 'INT. MIR ONE'
    },
    {
      text: 'Lovett and Bodine jerk awake at the landing.',
      classification: 'description',
      html: 'Lovett and Bodine jerk awake at the landing.'
    },
    {
      text: '                      ANATOLY',
      classification: 'dialogCharacter',
      html: 'ANATOLY'
    },
    {
      text: 'heavy Russian accent',
      classification: 'dialogAnnotation',
      html: 'heavy Russian accent'
    },
    {
      text: 'We are here.',
      classification: 'dialogText',
      html: 'We are here.'
    },
    {
      text: 'EXT. / INT. MIR ONE AND TWO',
      classification: 'description',
      html: 'EXT. / INT. MIR ONE AND TWO'
    },
    {
      text: 'MINUTES LATER: THE TWO SUBS',
      classification: 'description',
      html: 'MINUTES LATER: THE TWO SUBS'
    },
    {
      text: 'Skim over the seafloor to the sound of sidescan sonar and the THRUM of big thrusters.',
      classification: 'description',
      html: 'Skim over the seafloor to the sound of sidescan sonar and the THRUM of big thrusters.'
    },
    {
      text: 'The featureless gray clay of the bottom unrolls in the lights of the subs. Bodine is watching the sidescan sonar display, where the outline of a huge pointed object is visible. Anatoly lies prone, driving the sub, his face pressed to the center port.',
      classification: 'description',
      html: 'The featureless gray clay of the bottom unrolls in the lights of the subs. Bodine is watching the sidescan sonar display, where the outline of a huge pointed object is visible. Anatoly lies prone, driving the sub, his face pressed to the center port.'
    },
    {
      text: '                      BODINE',
      classification: 'dialogCharacter',
      html: 'BODINE'
    },
    {
      text: "Come left a little. She's right in front of us, eighteen meters. Fifteen. \n" +
        'Thirteen... you should see it.',
      classification: 'dialogText',
      html: "Come left a little. She's right in front of us, eighteen meters. Fifteen.<br>Thirteen... you should see it."
    },
    {
      text: '                      ANATOLY',
      classification: 'dialogCharacter',
      html: 'ANATOLY'
    },
    {
      text: "Do you see it? I don't see it... \nthere!",
      classification: 'dialogText',
      html: "Do you see it? I don't see it...<br>there!"
    },
    {
      text: 'Out of the darkness, like a ghostly apparition, the bow of the ship appears. Its knife-edge prow is coming straight at us, seeming to plow the bottom sediment like ocean waves. It towers above the seafloor, standing just as it landed 84 years ago.',
      classification: 'description',
      html: 'Out of the darkness, like a ghostly apparition, the bow of the ship appears. Its knife-edge prow is coming straight at us, seeming to plow the bottom sediment like ocean waves. It towers above the seafloor, standing just as it landed 84 years ago.'
    },
    {
      text: 'THE TITANIC',
      classification: 'description',
      html: 'THE TITANIC'
    },
    {
      text: 'Or what is left of her. Mir One goes up and over the bow railing, intact except for an overgrowth of "rusticles" draping it like mutated Spanish moss.',
      classification: 'description',
      html: 'Or what is left of her. Mir One goes up and over the bow railing, intact except for an overgrowth of "rusticles" draping it like mutated Spanish moss.'
    },
    {
      text: "TIGHT ON THE EYEPIECE MONITOR of a video camcorder. Brock Lovett's face fills the BLACK AND WHITE FRAME.",
      classification: 'description',
      html: "TIGHT ON THE EYEPIECE MONITOR of a video camcorder. Brock Lovett's face fills the BLACK AND WHITE FRAME."
    },
    {
      text: '                                                   FADE OUT:',
      classification: 'descriptionAnnotation',
      html: 'FADE OUT:'
    },
    {
      text: '                          THE END',
      classification: 'description',
      html: 'THE END'
    }
  ]);
})

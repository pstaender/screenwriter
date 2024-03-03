import { readFile } from 'node:fs/promises';

(async () => {
    let shortcuts = JSON.parse(await readFile('./src/keyboardShortcuts.json', 'utf8'));
    let text = [];
    for(let shortcut in shortcuts) {
        text.push(`  * ${shortcut}: ${shortcuts[shortcut]}`);
    }
    let readme = await readFile('./README.md', 'utf8');
    readme = readme.replace(/(## Keyboard Usage)(.*?)[\s\S]+?(## )/m, `$1\n\n${text.join('\n')}\n$3`);
    console.log(readme);
})();

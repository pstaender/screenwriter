import './Editor.scss';

import { useEffect, useState } from "react";
import { SceneSection } from './SceneSection';
import { sha256Hash } from '../lib/helper';
import { Toc } from './Toc';
import { useInterval } from 'usehooks-ts';
import { ScreenwriterDemo } from '../lib/Demo';

export function Editor({ seed, currentIndex, showDocumentHistory } = {}) {

    function randomID() {
        return sha256Hash(crypto.randomUUID().replace(/-/g, '')).substring(0, 8);
    }

    function emptySection({ html, id, classification, chooseEditingLevel } = {}) {
        return [{
            id: id || randomID(),
            key: randomID(),
            current: true,
            html: html || null,
            classification: classification || null,
            chooseEditingLevel: chooseEditingLevel || false
        }]
    }

    function sectionsCurrentScreenplayViaLocalStorageOrPlainText() {
        let lastScreenPlay = {};
        try {
            lastScreenPlay = localStorage.getItem('currentScreenplay') ? JSON.parse(localStorage.getItem('currentScreenplay')) : {};
        } catch (e) {
            if (!e.message.match(/JSON/)) {
                throw e;
            }
            lastScreenPlay = {};
        }
        if (lastScreenPlay.sections) {
            console.debug(`Loading screenplay from local storage`);
            // let importedSections = Importer(lastScreenPlay);
            if (lastScreenPlay.sections.constructor !== Array) {
                console.error(`lastScreenPlay.sections is not an array (there is something broken). We reset the local storage here`)
                console.error(lastScreenPlay.sections)
                localStorage.setItem('lastImportFile', '');
                localStorage.setItem('currentScreenplay', '{}')
                return [];
            }

            return [...lastScreenPlay.sections.map((s, i) => {
                return {
                    current: currentIndex ? i === currentIndex : i === 0,
                    id: s.id || randomID(),
                    key: randomID(),
                    html: s.html,
                    classification: s.classification
                }
            })];
        } else {
            // empty section
            return emptySection();
        }
    }

    function resetDocumentAndStartDemo() {
        document.querySelector('body').classList.remove('dark-mode')
        document.querySelector('body').classList.remove('focus')
        document.querySelector('#screenwriter > .focus')?.classList?.remove('focus')
        // clear document
        setSections([{
            html: ''
        }])
        setPlayDemo(true)
        setIsLocked(true)
    }

    const [sections, setSections] = useState([])
    const [showToc, setShowToc] = useState(false);
    const [playDemo, setPlayDemo] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    useEffect(() => {
        // changing seed forces reload
        setSections(sectionsCurrentScreenplayViaLocalStorageOrPlainText())
    }, [seed])

    useEffect(() => {
        if (window.__TAUR__) {
            return;
        }
        if (window.location.hash === '#demo') {
            resetDocumentAndStartDemo()
        } else {
            setPlayDemo(false)
            setIsLocked(false)
        }
    }, [window.location.hash])

    useInterval(() => {
        if (Math.random() > 0.5) {
            return;
        }
        if (sections && sections.length > 0) {
            ScreenwriterDemo({sections, appendNewSection})
        }

    }, playDemo ? 30 : null)

    function setAllSectionToNotCurrent(sections) {
        return sections.map(s => {
            s.current = false;
            s.cursorToEnd = false;
            return s;
        })
    }

    function setCurrentSectionById(id) {
        return setSections([...sections.map(s => {
            s.current = s.id === id;
            return s;
        })])
    }

    function appendNewSection(sections) {
        setSections([...setAllSectionToNotCurrent(sections), ...emptySection()])
    }

    function prependNewSection(sections) {
        setSections([...emptySection(), ...setAllSectionToNotCurrent(sections)])
    }

    function insertNewSectionAtIndex(index, { html, id, classification } = {}) {
        setSections([...setAllSectionToNotCurrent(sections.slice(0, index)), ...emptySection({ html, id, classification, chooseEditingLevel: true }), ...setAllSectionToNotCurrent(sections.slice(index))])
    }

    function updateSectionById(id, {html, current} = {}) {
        let index = sections.indexOf(sections.filter(s => s.id === id)[0])
        if (!index || !sections[index]) {
            // console.error(`Section ${id} not found`);
            return;
        }
        if (html !== sections[index].html) {
            sections[index].html = html;
        }
        
        setSections([...sections])
    }

    function insertNewSectionAfterId(currentID, { html, id, classification } = {}) {
        if (html) {
            // trim
            html = html.replace(/^<br>/g, '').replace(/<br>$/g, '')
        }
        let index = sections.indexOf(sections.filter(s => s.id === currentID)[0])
        insertNewSectionAtIndex(index + 1, { html, id, classification });
    }

    function insertNewSectionBeforeId(currentID, { html, id, classification } = {}) {
        let index = sections.indexOf(sections.filter(s => s.id === currentID)[0])
        insertNewSectionAtIndex(index, { html, id, classification });
    }

    function handleKeyDown(ev) {
        if ((ev.ctrlKey || ev.metaKey) && ev.key === '.') {
            setShowToc(!showToc);
        }
        if ((ev.ctrlKey || ev.metaKey) && ev.key === '=') {
            // clear empty sections
            setSections(sections.filter((s => !!s.html)))
        }
        if (ev.target?.contentEditable !== 'true') {
            return;
        }
    }

    function getNext(id) {
        return sections[sections.indexOf(sections.filter(s => s.id === id)[0]) + 1] || null;
    }

    function getPrev(id) {
        return sections[sections.indexOf(sections.filter(s => s.id === id)[0]) - 1] || null;
    }

    function findSectionById(id) {
        return sections[sections.indexOf(sections.filter(s => s.id === id)[0])];
    }

    function goNext({ id, insert } = {}) {
        let i = sections.indexOf(sections.filter(s => s.id === id)[0])
        let nextIndex = i + 1;
        if (nextIndex >= sections.length) {
            if (insert) {
                appendNewSection(sections)
            }
        } else {
            let _sections = setAllSectionToNotCurrent(sections);
            _sections[i].current = false;
            _sections[nextIndex].current = true;
            setSections([..._sections])
        }
        localStorage.setItem('lastIndexOfCurrent', nextIndex);
    }

    function goPrev({ id, insert, cursorToEnd } = {}) {
        let i = sections.indexOf(sections.filter(s => s.id === id)[0])
        let nextIndex = i - 1;
        if (nextIndex < 0) {
            if (insert) {
                prependNewSection(sections)
            }
        } else {
            let _sections = setAllSectionToNotCurrent(sections);
            _sections[i].current = false;
            _sections[nextIndex].current = true;
            _sections[nextIndex].cursorToEnd = cursorToEnd || false;
            setSections([..._sections])
        }
        localStorage.setItem('lastIndexOfCurrent', nextIndex);
    }

    function removeSection(id) {
        setSections([...sections.filter(s => s.id !== id)])
    }

    return <>
        <div id="screenwriter-editor" onKeyDown={handleKeyDown} className={isLocked || showDocumentHistory ? 'locked' : ''}>
            {sections.map((section, i) => (
                <SceneSection current={section.current} key={section.key} id={section.id} next={sections[i + 1]} prev={sections[i + 1]} removeSection={removeSection} goNext={goNext} goPrev={goPrev} getNext={getNext} getPrev={getPrev} index={i} sectionsLength={sections.length} html={section.html} classification={section.classification} cursorToEnd={section.cursorToEnd} setCurrentSectionById={setCurrentSectionById} insertNewSectionAfterId={insertNewSectionAfterId} insertNewSectionBeforeId={insertNewSectionBeforeId} findSectionById={findSectionById} randomID={randomID} chooseEditingLevel={section.chooseEditingLevel || false} sections={sections} updateSectionById={updateSectionById} />
            ))}
        </div>
        {sections && sections.length > 0 && (<Toc sections={sections} show={showToc} setShow={setShowToc}></Toc>)}
    </>;
}

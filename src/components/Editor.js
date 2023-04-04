import './Editor.scss';

import { useEffect, useState } from "react";
import { SceneSection } from './SceneSection';
import { getCursorPosition, sha256Hash } from '../lib/helper';

export function Editor({ seed, currentIndex } = {}) {

    function randomID() {
        return sha256Hash(crypto.randomUUID().replace(/-/g, '')).substring(0, 8);
    }

    function emptySection({ html, id, classification } = {}) {
        return [{ id: id || randomID(), current: true, html: html || null, classification: classification || null }]
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
            return [...lastScreenPlay.sections.map((s, i) => {
                return {
                    current: currentIndex ? i === currentIndex : i === 0,
                    id: s.id || randomID(),
                    html: s.html,
                    classification: s.classification
                }
            })];
        } else {
            // empty section
            return emptySection();
        }
    }

    const [sections, setSections] = useState([])

    useEffect(() => {
        // changing seed forces reload
        setSections(sectionsCurrentScreenplayViaLocalStorageOrPlainText())
    }, [seed])

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
        setSections([...setAllSectionToNotCurrent(sections.slice(0, index)), ...emptySection({ html, id, classification }), ...setAllSectionToNotCurrent(sections.slice(index))])
    }

    function insertNewSectionAfterId(currentID, { html, id, classification } = {}) {
        let index = sections.indexOf(sections.filter(s => s.id === currentID)[0])
        insertNewSectionAtIndex(index + 1, { html, id, classification });
    }

    function insertNewSectionBeforeId(currentID, { html, id, classification } = {}) {
        let index = sections.indexOf(sections.filter(s => s.id === currentID)[0])
        insertNewSectionAtIndex(index, { html, id, classification });
    }

    function handleKeyDown(ev) {
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

    return <div id="screenwriter-editor" onKeyDown={handleKeyDown}>
        {sections.map((section, i) => (
            <SceneSection current={section.current} key={section.id} id={section.id} next={sections[i + 1]} prev={sections[i + 1]} removeSection={removeSection} goNext={goNext} goPrev={goPrev} getNext={getNext} getPrev={getPrev} index={i} sectionsLength={sections.length} html={section.html} classification={section.classification} cursorToEnd={section.cursorToEnd} setCurrentSectionById={setCurrentSectionById} insertNewSectionAfterId={insertNewSectionAfterId} insertNewSectionBeforeId={insertNewSectionBeforeId} findSectionById={findSectionById} randomID={randomID} />
        ))}
    </div>;
}

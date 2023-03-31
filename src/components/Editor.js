import './Editor.scss';

import { useState } from "react";
import { SceneSection } from './SceneSection';

export function Editor() {

    function id() {
        return crypto.randomUUID();
    }

    function emptySection() {
        return [{ id: id(), current: true, html: null, classification: null }]
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
            console.debug(`Loading last used screenplay`);
            // let importedSections = Importer(lastScreenPlay);
            return [...lastScreenPlay.sections.map((s, i) => {
                return {
                    current: i === 0,
                    id: id(),
                    html: s.html,
                    classification: s.classification
                }
            })];
        } else {
            // empty section
            return emptySection();
        }
    }

    const [sections, setSections] = useState(sectionsCurrentScreenplayViaLocalStorageOrPlainText())

    function setAllSectionToNotCurrent(sections) {
        return sections.map(s => {
            s.current = false;
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

    function handleKeyDown(ev) {
        if (ev.target?.contentEditable !== 'true') {
            return;
        }
        if (ev.key === 'Enter' && !ev.shiftKey) {
            let _sections = sections;
            let i = _sections.indexOf(sections.filter(s => s.current)[0])
            // TODO: always insert
            if (ev.metaKey) {
                if (ev.target.closest('section').dataset.index) {
                    let index = Number(ev.target.closest('section').dataset.index);
                    setSections([...setAllSectionToNotCurrent(sections.slice(0, index)), ...emptySection(), ...setAllSectionToNotCurrent(sections.slice(index))])
                }
            } else {
                if (_sections[i]) {
                    goNext({id: _sections[i].id})
                }
            }
            if (i + 1 === _sections.length) {
                appendNewSection(_sections)
            }
        }
    }

    function getNext(id) {
        return sections[sections.indexOf(sections.filter(s => s.id === id)[0]) + 1] || null;
    }

    function getPrev(id) {
        return sections[sections.indexOf(sections.filter(s => s.id === id)[0]) - 1] || null;
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
    }

    function goPrev({ id, insert } = {}) {
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
            _sections[nextIndex].cursorToEnd = true;
            setSections([..._sections])
        }
    }

    function removeSection(id) {
        setSections([...sections.filter(s => s.id !== id)])
    }


    return <div id="screenwriter-editor" onKeyDown={handleKeyDown}>
        {sections.map((section, i) => (
            <SceneSection current={section.current} key={section.id} id={section.id} next={sections[i + 1]} prev={sections[i + 1]} removeSection={removeSection} goNext={goNext} goPrev={goPrev} getNext={getNext} getPrev={getPrev} index={i} sectionsLength={sections.length} html={section.html} classification={section.classification} cursorToEnd={section.cursorToEnd || false} setCurrentSectionById={setCurrentSectionById}/>
        ))}
    </div>;
}

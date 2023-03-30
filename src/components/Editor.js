import './Editor.scss';

import { useEffect, useRef, useState } from "react";
import { SceneSection } from './SceneSection';

export function Editor() {


    function id() {
        return new Date().getTime()
    }
    // const currentRef = useRef(null);

    const [sections, setSections] = useState([
        {id: id(), current: true}
    ])

    function setAllSectionToNotCurrent(sections) {
        return sections.map(s => {
            s.current = false;
            return s;
        })
    }

    function appendNewSection(sections) {
        setSections([...setAllSectionToNotCurrent(sections),...[{ id: id(), current: true }]])
    }

    function prependNewSection(sections) {
        setSections([...[{ id: id(), current: true }], ...setAllSectionToNotCurrent(sections)])
    }

    function handleKeyDown(ev) {
        if (ev.key === 'Enter' && !ev.shiftKey) {
            let _sections = sections;
            let i = _sections.indexOf(sections.filter(s => s.current)[0])
            // TODO: always insert
            if (i + 1 === _sections.length) {
                appendNewSection(_sections)
            }
        }
    }

    function goNext({id} = {}) {
        let i = sections.indexOf(sections.filter(s => s.id === id)[0])
        let nextIndex = i+1;
        if (nextIndex >= sections.length) {
            appendNewSection(sections)
        } else {
            let _sections = setAllSectionToNotCurrent(sections);
            _sections[i].current = false;
            _sections[nextIndex].current = true;
            setSections([..._sections])
        }
    }

    function goPrev({id} = {}) {
        let i = sections.indexOf(sections.filter(s => s.id === id)[0])
        let nextIndex = i-1;
        if (nextIndex < 0) {
            prependNewSection(sections)
        } else {
            let _sections = setAllSectionToNotCurrent(sections);
            _sections[i].current = false;
            _sections[nextIndex].current = true;
            setSections([..._sections])
        }
    }

    function removeSection({id} = {}) {
        setSections([...sections.filter(s => s.id !== id)])
    }

    return <div id="screenwriter-editor" onKeyDown={handleKeyDown}>
        {sections.map((section, i) => (
            <SceneSection current={section.current} key={section.id} id={section.id} next={sections[i+1]} prev={sections[i+1]} removeSection={removeSection} goNext={goNext} goPrev={goPrev} index={i} sectionsLength={sections.length} />
        ))}
    </div>;
}

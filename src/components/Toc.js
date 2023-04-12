import { useEffect, useState } from 'react';
import './Toc.scss';
export function Toc({ sections, show, setShow } = {}) {

    // const [sceneIntros, setSceneIntros] = useState([])

    function sectionFromEvent(ev) {
        return document.getElementById(ev.target.href.replace(/^.+?#/, ''));
    }
    function handleMouseEnter(ev) {
        sectionFromEvent(ev).scrollIntoView(sectionFromEvent(ev))
    }
    function handleClick(ev) {
        setShow(false)
        let el = sectionFromEvent(ev)
        setTimeout(() => {
            el.click()
            el.focus()
        }, 200)   
    }

    useEffect(() => {
        if (!show || !sections) {
            return;
        }
        let current = sections.filter(s => s.current)[0]
        if (current) {
            document.querySelector('.toc-overview ul li a.current')?.scrollIntoView({
                // behavior: 'smooth',
                block: "center"//, inline: "nearest"
            })
        }
    }, [show])

    return <>{show && (<div className="toc-overview">
        <ul>
            {sections && sections.map((section, i) => (
                <>
                {section.html && section.html.trim() && (!section.classification || section.classification === 'description') && section.html === section.html.toLocaleUpperCase() && (
                    <li key={section.id}>
                    <a href={`#${section.id}`} className={section.current ? 'current' : ''} onMouseEnter={handleMouseEnter} onClick={handleClick}>
                        {section.html}
                    </a>
                </li>
                )}
                </>
                
            ))}
        </ul>
    </div>
    )
    }
    </>
}

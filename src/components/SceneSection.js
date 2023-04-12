
import { useEffect, useRef, useState } from "react";
import { getCursorPosition, moveCursor, moveCursorToEnd, stripHTMLTags } from "../lib/helper";

import { SuggestionBox } from './SuggestionBox.js'

export function SceneSection({ current, goNext, goPrev, getNext, getPrev, findSectionById, insertNewSectionAfterId, insertNewSectionBeforeId, removeSection, id, index, sectionsLength, html, classification, setCurrentSectionById, cursorToEnd, randomID, chooseEditingLevel, sections } = {}) {

    const inputRef = useRef(null);

    const editingLevels = [
        'description',
        'dialogCharacter',
        'dialogText',
        'dialogAnnotation',
        'descriptionAnnotation',
    ];

    const [editingLevel, setEditingLevel] = useState(classification || 'description');
    const [isCurrent, setIsCurrent] = useState(current);
    const [htmlContent, setHtmlContent] = useState(html || null)
    const [cssClasses, setCSSClasses] = useState(null);
    const [allowToShowSuggestionBox, setAllowToShowSuggestionBox] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchTextForSuggestionBox, setSearchTextForSuggestionBox] = useState(null);
    const [keyPressed, setKeyPressed] = useState(null);

    useEffect(() => {
        if (current) {
            inputRef.current.focus();
            let s = window.getSelection();
            let r = document.createRange();
            r.setStart(inputRef.current, 0);
            r.setEnd(inputRef.current, 0);
            s.removeAllRanges();
            s.addRange(r);
        }
        if (inputRef?.current) {
            if (inputRef.current.innerHTML) {
                cleanupContenteditableMarkup();
                if (cursorToEnd) {
                    moveCursor(inputRef.current, inputRef.current.textContent.trim().length)
                }
            }
            // timeout prevents changing content before undo is completly done
            setTimeout(() => {
                if (inputRef.current && inputRef.current.textContent.trim() === '' && isCurrent && chooseEditingLevel && !inputRef.current.dataset.chooseEditingLevel) {
                    // store on data element, to prevent multiple chooseEditingLevel
                    inputRef.current.dataset.chooseEditingLevel = 'editingLevelAlreadyChoosen';
                    let previousSection = inputRef.current?.closest('section')?.previousElementSibling
                    if (previousSection) {
                        if (previousSection.classList.contains('dialogCharacter')) {
                            return setEditingLevel('dialogText');
                        }
                        if (previousSection.classList.contains('dialogAnnotation')) {
                            return setEditingLevel('dialogText');
                        }
                        if (previousSection.classList.contains('dialogText')) {
                            let sibling = previousSection;
                            let names = [];

                            // find last relevant character name
                            while (sibling && names.length <= 2) {
                                if (sibling.classList.contains('dialogCharacter')) {
                                    names.push(sibling.querySelector('.edit-field').textContent.trim().replace(/\s*\(.*$/, '').toLocaleUpperCase());
                                }
                                names = [...new Set(names)]
                                sibling = sibling.previousElementSibling
                            }

                            // remove first
                            names.shift()

                            if (names.length >= 1) {
                                let name = names.shift();
                                inputRef.current.dataset.chooseEditingLevel = name
                                setHtmlContent(name)
                                inputRef.current.textContent.trim()
                                setTimeout(() => {
                                    try {
                                        moveCursorToEnd(inputRef.current)
                                    } catch (e) {
                                        // TypeError: Failed to execute 'setStart' on 'Range': parameter 1 is not of type 'Node'.
                                    }
                                }, 100)
                            }
                            return setEditingLevel('dialogCharacter');
                        }
                    }
                }
            }, 50);

        }

    }, [inputRef, current]);

    function updateCSSClasses() {
        let addCss = additionalTextClass();
        setCSSClasses([
            isCurrent ? 'selected' : '',
            addCss,
            editingLevel,
            (contentFromElementOrProperty() && contentFromElementOrProperty().toLocaleUpperCase() === contentFromElementOrProperty() && stripHTMLTags(contentFromElementOrProperty()).trim() && !addCss) ? 'uppercase' : '',
        ])
    }

    function pushMementos(step) {
        let maxDataLength = 6000;
        let mementos = JSON.parse(localStorage.getItem('mementos') || '[]')
        mementos.push(step)
        while (JSON.stringify(mementos).length > maxDataLength) {
            mementos.shift()
        }
        localStorage.setItem('mementos', JSON.stringify(mementos))
    }

    function popMementos() {
        let mementos = JSON.parse(localStorage.getItem('mementos') || '[]')
        let latestStep = mementos.pop()
        localStorage.setItem('mementos', JSON.stringify(mementos))
        return latestStep;
    }

    function getContentFromEvent(ev) {
        return ev.target.querySelector('.edit-field') ? ev.target.querySelector('.edit-field').textContent : ev.target.textContent;
    }

    function handleKeyUp(ev) {
        updateCSSClasses()
        const content = getContentFromEvent(ev);
        if (content && allowToShowSuggestionBox && content.trim() !== searchTextForSuggestionBox) {
            setSearchTextForSuggestionBox(content.trim())
            setTimeout(() => {
                setShowSuggestions(true);
            }, 200)
        }
    }

    function handleKeyDown(ev) {
        setKeyPressed({ ...ev });
        const content = getContentFromEvent(ev);
        if (ev.target?.contentEditable !== 'true') {
            return;
        }

        let cursorIsAtEndOfSection = getCursorPosition(ev.target) >= content.trim().length;
        let cursorIsAtBeginOfSection = getCursorPosition(ev.target) < 1;
        if (ev.key === 'Tab') {
            const direction = ev.shiftKey ? -1 : 1;
            ev.preventDefault();
            let nextLevel = editingLevels[editingLevels.indexOf(editingLevel) + direction];

            if (inputRef.current.dataset.chooseEditingLevel && inputRef.current.dataset.chooseEditingLevel !== 'false') {
                inputRef.current.dataset.chooseEditingLevel = '';
                inputRef.current.textContent = '';
            }

            if (inputRef.current.dataset.chooseEditingLevel && direction === 1 && editingLevel === 'dialogCharacter') {

                nextLevel = 'dialogAnnotation'
            }
            setEditingLevel(nextLevel || editingLevels[0]);
            if (inputRef.current?.dataset.chooseEditingLevel && inputRef.current?.dataset.chooseEditingLevel === inputRef.current.textContent) {
                // delete suggested name/text
                inputRef.current.textContent = '';
            }
            if (ev.shiftKey && !nextLevel) {
                setEditingLevel(editingLevels[editingLevels.length - 1]);
            }
            let cursorPos = getCursorPosition(ev.target);
            setTimeout(() => {
                try {
                    moveCursor(ev.target, cursorPos)
                } catch (_) {
                    // TypeError: Failed to execute 'setStart' on 'Range': parameter 1 is not of type 'Node'.
                }
            }, 110);
            cleanupContenteditableMarkup()
        }
        if (ev.key === 'Backspace' && (ev.metaKey || ev.ctrlKey || inputRef.current.textContent.trim() === '')) {
            ev.preventDefault();
            if (index >= sectionsLength - 1) {
                goPrev({ id })
            } else {
                goNext({ id })
            }
            // only remove if some elements still exists
            if (document.querySelectorAll('#screenwriter-editor > section').length > 1) {
                if (inputRef.current.innerHTML?.trim()) {
                    pushMementos({
                        html: inputRef.current.innerHTML,
                        id,
                        editingLevel,
                        classification: editingLevel,
                        prev: getPrev(id)?.id,
                        next: getNext(id)?.id,
                    });
                }
                goPrev({ id, cursorToEnd: true })
                removeSection(id)
                return
            } else if (inputRef.current) {
                inputRef.current.textContent = '';
            }
        }
        // control SuggestionBox
        if (showSuggestions && !ev.metaKey && !ev.ctrlKey && !ev.shiftKey && (ev.key === 'Enter' || ev.key === 'Escape')) {
            // this will be handeld by SuggestionBox, see useEffect
            if (ev.key === 'Escape') {
                setShowSuggestions(false)
                return
            }
            if (ev.key === 'Enter' && cursorIsAtEndOfSection) {
                ev.preventDefault();
                return
            }

        }
        if ((ev.key === 'ArrowRight' && cursorIsAtEndOfSection) ||
            (ev.key === 'ArrowDown' && (ev.metaKey || ev.ctrlKey))) {
            ev.preventDefault();
            if (ev.shiftKey && (ev.metaKey || ev.ctrlKey)) {
                // merge next section into this
                let editField = ev.target.closest('section').nextElementSibling?.querySelector('.edit-field')
                if (editField && editField.innerHTML) {
                    let lengthOfText = inputRef.current.textContent.trim().length;
                    inputRef.current.innerHTML += ' ' + editField.textContent.trim().replace(/\n/g, '<br>');
                    moveCursor(inputRef.current, lengthOfText)
                    let nextID = getNext(id).id;
                    if (nextID) {
                        removeSection(nextID)
                        return;
                    }
                }
            }
            goNext({ id, insert: (ev.metaKey || ev.ctrlKey) });
            return;
        }
        else if (ev.key === 'ArrowUp' && !ev.shiftKey && (ev.metaKey || ev.ctrlKey)) {
            goPrev({ id, insert: index <= 1 });
            return;
        }
        else if ((ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') && !allowToShowSuggestionBox && cursorIsAtBeginOfSection) {
            ev.preventDefault();
            goPrev({ id, insert: (ev.metaKey || ev.ctrlKey), cursorToEnd: !ev.metaKey && !ev.ctrlKey });
            return;
        }
        else if ((ev.key === 'ArrowRight' || ev.key === 'ArrowDown') && cursorIsAtEndOfSection && !allowToShowSuggestionBox) {
            goNext({ id, insert: (ev.metaKey || ev.ctrlKey), cursorToEnd: false });
            return;
        }
        else if ((ev.key === 'Backspace') && cursorIsAtBeginOfSection) {
            ev.preventDefault();
            // merge previous section into this
            let editField = ev.target.closest('section').previousElementSibling?.querySelector('.edit-field')
            if (editField && editField.innerHTML) {
                inputRef.current.innerHTML = editField.textContent.trim().replace(/\n/g, '<br>') + ' ' + inputRef.current.innerHTML.replace(/\n/g, '<br>');
                let nextID = getPrev(id).id;
                moveCursor(inputRef.current, editField.textContent.length)
                if (nextID) {
                    removeSection(nextID)
                    return;
                }
            }
            return;
        }
        else if (ev.key === 'Enter' && ev.shiftKey) {
            // do nothing, let create a new line
        }
        else if (
            (ev.key === 'Enter')
        ) {
            ev.preventDefault();
            if (cursorIsAtEndOfSection) {
                insertNewSectionAfterId(id)
            } else if (cursorIsAtBeginOfSection) {
                insertNewSectionBeforeId(id)
            } else {
                let splitUpAt = getCursorPosition(inputRef.current);
                if (splitUpAt > 0) {
                    let partRight = inputRef.current.textContent.substring(splitUpAt)
                    let partLeft = inputRef.current.textContent.substring(0, splitUpAt);
                    if (partLeft && partRight) {
                        inputRef.current.textContent = partLeft.trim();
                        insertNewSectionAfterId(id, { html: partRight.trim() })
                    }
                    return
                }

            }
        } else if ((ev.metaKey || ev.ctrlKey) && (ev.shiftKey) && ev.key === 'u') {
            let text = inputRef.current.textContent.toLocaleUpperCase()
            if (text === inputRef.current.textContent) {
                text = inputRef.current.textContent.toLocaleLowerCase()
            }
            inputRef.current.textContent = text;
        } else if ((ev.ctrlKey || ev.metaKey) && ev.key === '.') {
            document.getElementById('toggle-show-hide-suggestion-box').click()
        } else if (ev.ctrlKey && ev.key === 'G') {
            // GOTO scene
            let previous = inputRef.current.closest('section')

            let scenes = [];
            document.querySelectorAll('#screenwriter-editor > section.uppercase.description').forEach((el) => {
                scenes.push(Number(el.getAttribute('data-index')))
            })

            let sceneNumberBefore = null;

            while (previous) {
                if (previous.classList.contains('description') && previous.classList.contains('uppercase')) {
                    sceneNumberBefore = previous.getAttribute('data-index');
                    break;
                }
                previous = previous.previousElementSibling;
            }

            let nearestScene = previous ? scenes.indexOf(Number(sceneNumberBefore)) + 1 : ''

            let jumpTo = prompt(`Which number of scene jump to?`, nearestScene || '1')
            let jumpToSceneNumber = scenes[Number(jumpTo) - 1];

            if (!jumpTo) {
                return;
            }
            function selectSection(el) {

                if (!el) {
                    return;
                }
                //setCurrentSectionById(el.querySelector('div').dataset['id']);
                el.querySelector('div') ? el.querySelector('div').focus() : el.focus();

            }
            if (jumpTo === '0') {
                // jump to 1st element
                selectSection(
                    document.querySelector(`#screenwriter-editor > section:first-child`)
                )
            }
            else if (jumpToSceneNumber) {
                // jump to specified section
                selectSection(
                    document.querySelector(`#screenwriter-editor > section.uppercase.description[data-index="${jumpToSceneNumber}"]`)
                )

            } else if (jumpTo.trim().toLocaleLowerCase().startsWith('e')) {
                // jump to last element
                selectSection(
                    document.querySelector(`#screenwriter-editor > section:last-child`)
                )
            } else if (Number(jumpTo) > 1) {
                // jump to last scene
                selectSection(
                    document.querySelector(`#screenwriter-editor > section.uppercase.description[data-index="${scenes.at(-1)}"]`)
                )
            }
            return;
        } else if ((ev.metaKey || ev.ctrlKey) && ev.key === 'z') {
            let beforeLastUndo = inputRef.current.textContent
            setTimeout(() => {
                if (!inputRef.current || beforeLastUndo !== inputRef.current.textContent) {
                    // something has changed, so the browser did some undo stuff…
                    return;
                }
                let lastDeletedText = popMementos();
                if (lastDeletedText) {
                    let sectionWithIDAlreadyExists = !!(lastDeletedText.id && findSectionById(lastDeletedText.id));
                    const options = {
                        html: lastDeletedText.html,
                        // prevent inserting of duplicate ids
                        id: sectionWithIDAlreadyExists ? randomID() : lastDeletedText.id,
                        classification: lastDeletedText.classification,
                        editingLevel: lastDeletedText.editingLevel,
                    };
                    if (lastDeletedText.prev && findSectionById(lastDeletedText.prev)) {
                        insertNewSectionAfterId(lastDeletedText.prev, options);
                    } else if (lastDeletedText.next && findSectionById(lastDeletedText.next)) {
                        insertNewSectionBeforeId(lastDeletedText.next, options);
                    } else {
                        insertNewSectionAfterId(id, options)
                    }
                }
            }, 50);

        }
        updateCSSClasses()
    }

    function cleanupContenteditableMarkup() {
        function removeAllTagsExceptBr(html) {
            html = html.replace(/(<br>|<br(\s+.+?)*>)/ig, '---BRLINEBREAK---');
            const div = document.createElement("div");
            div.innerHTML = html;
            return div.textContent.replace(/---BRLINEBREAK---/g, '<br>')
        }

        function trimLineBreaks(html) {
            return html.replace(/^\s*<br>/ig, '').replace(/<br>\s*$/ig, '')
        }
        inputRef.current.innerHTML = trimLineBreaks(removeAllTagsExceptBr(inputRef.current.innerHTML))
    }

    function handleFocus(ev) {
        if (isCurrent) {
            return;
        }

        setIsCurrent(true);
        localStorage.setItem('lastIndexOfCurrent', index);
        setCurrentSectionById(id);
        if (ev.type !== 'Click') {
            cleanupContenteditableMarkup();
        }
        if (allowToShowSuggestionBox) {
            setTimeout(() => {
                setShowSuggestions(true);
            }, 500);
        }


    }

    function handleBlur() {
        setIsCurrent(false);
        inputRef.current.dataset.chooseEditingLevel = '';
        cleanupContenteditableMarkup();
        setTimeout(() => {
            setShowSuggestions(false);
        }, 200);
    }

    function handleClick(ev) {
        if (ev.target === ev.currentTarget) {
            // clicked only on section, not the div[contenteditable] inside
            ev.target.querySelector('div').click()
            handleFocus(ev)
        }
    }

    function additionalTextClass() {
        if (!inputRef.current?.textContent) {
            return;
        }
        let hLevel = inputRef.current.textContent.match(/^(#{1,7})?.*$/)
        if (hLevel && hLevel[1]) {
            return `h${hLevel[1].length}`;
        }
        // not sure we need this… use h6 instead
        if (/^\*\*[^\*]+.*\*\*$/.test(inputRef.current.textContent)) {
            return 'strong';
        }
        if (/^\/\//.test(inputRef.current.textContent)) {
            return 'comment';
        }
        return null;
    }

    // this is require for initial loading, when `inputRef.current` is not set, yet
    function contentFromElementOrProperty() {
        return inputRef.current ? inputRef.current.textContent : html;
    }

    useEffect(() => {
        if (htmlContent !== null) {
            inputRef.current.innerHTML = htmlContent;
        }
    }, [htmlContent])

    useEffect(() => {
        let content = inputRef.current?.textContent
        if (content !== null &&
            (((editingLevel === 'description' && content === content.toLocaleUpperCase()) || editingLevel === 'dialogCharacter'))
        ) {
            setAllowToShowSuggestionBox(localStorage.getItem('showSuggestionBox') === 'true');
        } else {
            setAllowToShowSuggestionBox(false);
        }
    }, [editingLevel, inputRef, keyPressed])

    useEffect(() => {
        updateCSSClasses()
        if (isCurrent && inputRef.current && localStorage.getItem('autoScrollToCurrentElement') === 'true') {
            inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
        }
        if (isCurrent && allowToShowSuggestionBox) {
            setShowSuggestions(true);
        }
    }, [isCurrent, editingLevel])

    useEffect(() => {
        if (!cssClasses) {
            updateCSSClasses()
        }
    }, [cssClasses])

    return <>
        <section className={(cssClasses ? [...cssClasses, allowToShowSuggestionBox && showSuggestions ? 'with-suggestions' : ''] : []).filter(e => !!e)?.join(' ')} data-index={index + 1} data-choose-editing-level={chooseEditingLevel} onClick={handleClick}>
            <div contentEditable={true} onFocus={handleFocus} onBlur={handleBlur} ref={inputRef} className={['edit-field', editingLevel].join(' ')} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} data-id={id}>
            </div>
            {allowToShowSuggestionBox && showSuggestions && (
                <SuggestionBox keyPressed={keyPressed} sections={sections} editingLevel={editingLevel} searchText={searchTextForSuggestionBox} setShowSuggestions={setShowSuggestions} setHtmlContent={setHtmlContent} insertNewSectionAfterId={insertNewSectionAfterId} sectionId={id} goNext={goNext}>
                </SuggestionBox>
            )}
        </section>

    </>

}

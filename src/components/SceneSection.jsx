
import { useEffect, useRef, useState } from "react";
import { getCursorPosition, moveCursor, moveCursorToEnd, splitPositionForHtmlLikePlainText, stripHTMLTags } from "../lib/helper";

import { SuggestionBox } from './SuggestionBox'
import { popMementos, pushRedo, popRedo, addMemento } from '../lib/mementos.js';

export function SceneSection({ current, goNext, goPrev, getNext, getPrev, findSectionById, insertNewSectionAfterId, insertNewSectionBeforeId, removeSection, id, index, sectionsLength, html, classification, setCurrentSectionById, cursorToEnd, randomID, chooseEditingLevel, sections, updateSectionById } = {}) {

    const inputRef = useRef(null);

    const editingLevels = [
        'description',
        'character',
        'dialog',
        'parenthetical',
        'transition',
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
                        if (previousSection.classList.contains('character')) {
                            return setEditingLevel('dialog');
                        }
                        if (previousSection.classList.contains('parenthetical')) {
                            return setEditingLevel('dialog');
                        }
                        if (previousSection.classList.contains('dialog')) {
                            let sibling = previousSection;
                            let names = [];

                            // find last relevant character name
                            while (sibling && names.length <= 2) {
                                if (sibling.classList.contains('character')) {
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
                            return setEditingLevel('character');
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

    function redoLastStep() {
        let lastRedo = popRedo();
        while (lastRedo && !lastRedo.html.trim()) {
            lastRedo = popRedo();
        }

        if (!lastRedo) {
            return;
        }
        let section = document.querySelector(`section[id="${lastRedo.id}"] > .edit-field`)

        if (!section) {
            return;
        }
        //addMemento('delete', { html: inputRef.current.textContent, id, editingLevel, getPrev, getNext })
        addMemento('onRedo', { html: section.innerHTML, id: lastRedo.id, editingLevel: lastRedo.editingLevel, getPrev, getNext })
        updateSectionById(lastRedo.id, { html: lastRedo.html })
        section.innerHTML = lastRedo.html;
        section.dataset.excludeFromMemento = true;
        section.focus()
    }

    async function openJumpToScene() {
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


        // if (window.__TAURI__) {
        //     await ask(message)
        // } else {
        //     prompt(message, defaultValue)
        // }

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
    }

    function undoLastStep() {
        let memento = popMementos();
        while (memento) {
            if (memento.action === 'delete') {
                let sectionWithIDAlreadyExists = !!(memento.id && findSectionById(memento.id));
                const options = {
                    html: memento.html,
                    // prevent inserting of duplicate ids
                    id: sectionWithIDAlreadyExists ? randomID() : memento.id,
                    classification: memento.classification,
                    editingLevel: memento.editingLevel,
                };
                if (memento.prev && findSectionById(memento.prev)) {
                    insertNewSectionAfterId(memento.prev, options);
                } else if (memento.next && findSectionById(memento.next)) {
                    insertNewSectionBeforeId(memento.next, options);
                } else {
                    insertNewSectionAfterId(id, options)
                }
                break;
            } else {
                if (memento.id) {
                    let section = document.querySelector(`section[id="${memento.id}"] > .edit-field`)
                    if (!section) {
                        break;
                    }
                    if (section && (section.innerHTML.trim() !== memento.html.trim() && section.textContent.trim() !== memento.html.trim())) {
                        pushRedo({
                            html: section.innerHTML,
                            id: memento.id,
                            editingLevel: memento.editingLevel,
                            // classification: editingLevel,
                            action: 'undo',
                        })
                        section.innerHTML = memento.html;
                        // prevents to set undo on next blur
                        section.dataset.excludeFromMemento = true;
                        section.focus()
                        updateSectionById(memento.id, { html: memento.html })
                        break;
                    }
                }
            }
            memento = popMementos();
        }
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

            if (inputRef.current.dataset.chooseEditingLevel && direction === 1 && editingLevel === 'character') {

                nextLevel = 'parenthetical'
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
                    addMemento('delete', { html: inputRef.current.innerHTML, id, editingLevel, getPrev, getNext })
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
                    inputRef.current.innerHTML += '<br>' + editField.innerHTML
                    moveCursor(inputRef.current, inputRef.current.textContent.trim().length)
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
                inputRef.current.innerHTML = editField.innerHTML + '<br>' + inputRef.current.innerHTML;
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
                    let splitHtmlAt = splitPositionForHtmlLikePlainText(inputRef.current.innerHTML, splitUpAt);
                    let partRight = inputRef.current.innerHTML.substring(splitHtmlAt)
                    let partLeft = inputRef.current.innerHTML.substring(0, splitHtmlAt)
                    if (partLeft && partRight) {
                        inputRef.current.innerHTML = partLeft;
                        insertNewSectionAfterId(id, { html: partRight })
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
        } else if ((ev.ctrlKey || ev.metaKey) && ev.shiftKey && ev.key === ',') {
            document.getElementById('toggle-show-hide-suggestion-box').click()
        } else if ((ev.ctrlKey && ev.key === 'G')) {
            openJumpToScene();
            return;
        } else if ((ev.metaKey || ev.ctrlKey) && ev.key === 'z') {
            ev.preventDefault();
            if (ev.shiftKey) {
                redoLastStep()
            } else {
                undoLastStep()
            }

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

        if (inputRef.current.dataset.excludeFromMemento) {
            inputRef.current.dataset.excludeFromMemento = false;
        } else {
            inputRef.current.dataset.innerHTMLBeforeFocus = inputRef.current.innerHTML;
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
        if (inputRef.current.dataset.excludeFromMemento) {
            inputRef.current.dataset.excludeFromMemento = false;
        } else {
            addMemento('onBlur', { html: inputRef.current.dataset.innerHTMLBeforeFocus || inputRef.current.textContent, id, editingLevel, getPrev, getNext })
            inputRef.current.dataset.innerHTMLBeforeFocus = null;
        }
        setIsCurrent(false);
        inputRef.current.dataset.chooseEditingLevel = '';
        cleanupContenteditableMarkup();
        updateSectionById(id, { html: inputRef.current.innerHTML })
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
        let content = inputRef.current?.textContent
        if (content !== null &&
            (((editingLevel === 'description' && content === content.toLocaleUpperCase()) || editingLevel === 'character'))
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

    useEffect(() => {
        if (inputRef?.current) {
            inputRef.current.innerHTML = html
            updateCSSClasses();
        }
    }, [html, inputRef])

    useEffect(() => {
        if (htmlContent !== null && inputRef.current) {
            inputRef.current.innerHTML = htmlContent;
            updateCSSClasses();
        }
    }, [htmlContent, inputRef])

    return <section className={(cssClasses ? [...cssClasses, allowToShowSuggestionBox && showSuggestions ? 'with-suggestions' : ''] : []).filter(e => !!e)?.join(' ')} data-index={index + 1} data-choose-editing-level={chooseEditingLevel} onClick={handleClick} id={id}>
        <div contentEditable={true} onFocus={handleFocus} onBlur={handleBlur} ref={inputRef} className={['edit-field', editingLevel].join(' ')} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} data-id={id}>
        </div>
        {allowToShowSuggestionBox && showSuggestions && (
            <SuggestionBox keyPressed={keyPressed} sections={sections} editingLevel={editingLevel} searchText={searchTextForSuggestionBox} setShowSuggestions={setShowSuggestions} setHtmlContent={setHtmlContent} insertNewSectionAfterId={insertNewSectionAfterId} sectionId={id} goNext={goNext}>
            </SuggestionBox>
        )}
    </section>


}

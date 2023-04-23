import { useEffect, useState } from 'react';
import './StatusLog.scss';
export function StatusLog({statusLog, setStatusLog} = {}) {
    let showInSecs = 3;
    const [fadeOut, setFadeOut] = useState(false);
    useEffect(() => {
        setTimeout(() => {
            setFadeOut(true)
        }, (showInSecs * 1000))
        setTimeout(() => {
            setStatusLog(null)
        }, (showInSecs * 1000) + 500)
    }, [statusLog])
    return (<div className={['status-log',statusLog.level || 'normal',  fadeOut ? 'fade-out' : ''].join(' ')}>
        {statusLog.message}
    </div>)
}

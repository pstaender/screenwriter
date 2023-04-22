import { useEffect } from 'react';
import './StatusLog.scss';
export function StatusLog({statusLog, setStatusLog} = {}) {
    useEffect(() => {
        setTimeout(() => {
            setStatusLog(null)
        }, 5000)
    }, [statusLog])
    return (<div className={['status-log',statusLog.level || 'normal'].join(' ')}>
        {statusLog.message}
    </div>)
}

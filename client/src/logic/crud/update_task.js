import env from '../../env';
import { UpdateType } from '../../default'
import { formatBodyToSend, handleUpdatedData } from './json_handler'
import { getViewQuery } from './url_handler';

import moment from 'moment';

const updateTask = (
    task,
    data,
    updateType,
    taskRepo,
    repetitionRepo,
    isLoading,
    setIsLoading,
    datePointer
) => {
    const user = JSON.parse(localStorage.getItem("disciplan_user"));

    const createUrlForUpdateTask = (viewQuery) => {
        let url = `http://${env.BACKEND_SERVER}/tasks/`;

        switch (updateType) {
            case UpdateType.ALL_TASKS:
            case UpdateType.FROM_ONE_TASK:
            case UpdateType.ONLY_ONE_TASK:
                url += `update/g/${task.id}/?type=${updateType}&`;
                break;
            default:
                url += `update/s/${task.id}/?`;
        }

        url += viewQuery;
        return url;
    }

    const updateInfo = async (viewQuery) => {
        var url = createUrlForUpdateTask(viewQuery);

        await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
                'Authorization': user.token
            },
            body: formatBodyToSend(data.info)
        })
            .then(response => {
                if (response.ok)
                    return response.json();
                throw new Error('Failed: UPDATE INFO');
            })
            .then(json => handleUpdatedData(json, taskRepo, repetitionRepo))
            .then(() => setIsLoading(false))
            .catch(error => console.log(error.message));
    }

    const createUrlForHandlingRepetition = (viewQuery) => {
        var url = `http://${env.BACKEND_SERVER}/tasks/`;

        if (!task.repetition_group) {
            url += `add/r/${task.id}/`;
        } else url += `update/r/${task.id}/`;

        url += `?` + viewQuery;
        return url;
    }

    const updateOrAddRepe = async (viewQuery) => {
        var url = createUrlForHandlingRepetition(viewQuery);

        await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
                'Authorization': user.token
            },
            body: JSON.stringify(data.repetition)
        })
            .then(response => {
                if (response.ok)
                    return response.json();
                throw new Error('Failed: UPDATE INFO');
            })
            .then(json => handleUpdatedData(json, taskRepo, repetitionRepo))
            .then(() => setIsLoading(false))
            .catch(error => console.log(error.message));
    }

    if (!isLoading)
        setIsLoading(true)

    let viewQuery = getViewQuery(datePointer);

    if (data.info !== null)
        updateInfo(viewQuery);
    if (data.repetition !== null)
        updateOrAddRepe(viewQuery);
}

export default updateTask;
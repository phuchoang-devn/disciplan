import env from '../../env';
import { UpdateType } from '../../default'
import { handleUpdatedData } from './json_handler'
import { getViewQuery } from './url_handler';

const deleteTask = async (
    task,
    updateType,
    taskRepo,
    repetitionRepo,
    loading,
    setLoading,
    datePointer
) => {
    const user = JSON.parse(localStorage.getItem("disciplan_user"));

    var url = createUrl(task, updateType, datePointer);

    if (!loading)
        setLoading(true);

    await fetch(url, {
        method: "DELETE",
        headers: {
            'Authorization': user.token
        }
    })
        .then(response => {
            if (response.ok)
                return response.json();
            throw new Error('Failed: DELETE TASK');
        })
        .then(json => handleUpdatedData(json, taskRepo, repetitionRepo))
        .then(() => setLoading(false))
        .catch(error => console.log(error.message));

}

function createUrl(task, updateType, datePointer) {
    let url = `http://${env.BACKEND_SERVER}/tasks/`;

    switch (updateType) {
        case UpdateType.ALL_TASKS:
        case UpdateType.FROM_ONE_TASK:
        case UpdateType.ONLY_ONE_TASK:
            let viewQuery = getViewQuery(datePointer);

            url += `delete/g/${task.id}/?type=${updateType}&` + viewQuery;
            break;
        default:
            url += `delete/s/${task.id}/`;
    }

    return url;
}

export default deleteTask;
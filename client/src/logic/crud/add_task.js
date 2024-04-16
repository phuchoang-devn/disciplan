import env from '../../env';
import { formatBodyToSend, handleAddedData } from './json_handler'
import { getViewQuery } from './url_handler';

const addTask = async (
    data,
    taskRepo,
    repetitionRepo,
    loading,
    setLoading,
    datePointer
) => {
    const user = JSON.parse(localStorage.getItem("disciplan_user"));

    var url = createUrl(data, datePointer);
    var body = createBody(data);

    if (!loading)
        setLoading(true);

    await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
            'Authorization': user.token
        },
        body: formatBodyToSend(body)
    })
        .then(response => {
            if (response.ok)
                return response.json();
            throw new Error('Failed: ADD TASK');
        })
        .then(json => handleAddedData(json, taskRepo, repetitionRepo))
        .then(() => setLoading(false))
        .catch(error => console.log(error.message));

}

function createUrl(newData, currentDate) {
    let url = `http://${env.BACKEND_SERVER}/tasks/`;

    if (!!newData.repetition) {
        let viewQuery = getViewQuery(currentDate);
        url += `add/g/?` + viewQuery;
    } else
        url += "add/s/";

    return url;
}

function createBody(newData) {
    if (!!newData.repetition)
        return {
            task_in: newData.info,
            repetition_in: newData.repetition
        };
    else return newData.info;     
}

export default addTask;
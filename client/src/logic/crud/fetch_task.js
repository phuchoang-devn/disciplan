import env from '../../env';

const fetchTasks = async (
    viewStart,
    viewEnd,
    listOfUnfetchedDates,
    handleSuccessfulFetchTasks
) => {
    const user = JSON.parse(localStorage.getItem("disciplan_user"));

    let url = "http://" + env.BACKEND_SERVER + "/tasks/period/?from=" +
        viewStart.format('YYYY-MM-DD') + "&to=" + viewEnd.format('YYYY-MM-DD');

    return await fetch(url, {
        headers: {
            'Authorization': user.token
        }
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Failed: GET TASKS');
        })
        .then(json =>
            handleSuccessfulFetchTasks(listOfUnfetchedDates, json)
        )
        .catch(error =>
            console.log(error.message)
        );
}

export default fetchTasks
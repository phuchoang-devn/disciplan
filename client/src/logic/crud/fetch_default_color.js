import env from '../../env';

const fetchDefaultColorForTaskAndTag = async (handleSuccessfulFetchDefaultColors) => {
    const user = JSON.parse(localStorage.getItem("disciplan_user"));

    await fetch("http://" + env.BACKEND_SERVER + "/users/default-color", {
        headers: {
            'Authorization': user.token
        }
    })
        .then(response => {
            if (response.ok)
                return response.json();
            throw new Error('Failed: GET default color');
        })
        .then(json =>
            handleSuccessfulFetchDefaultColors(json)
        )
        .catch(error =>
            console.log(error.message)
        );
}

export default fetchDefaultColorForTaskAndTag
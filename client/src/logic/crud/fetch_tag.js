import env from '../../env';

const fetchAllTags = async (handleSuccessfulFetchTags) => {

    const user = JSON.parse(localStorage.getItem("disciplan_user"));

    await fetch("http://" + env.BACKEND_SERVER + "/tags/all", {
        headers: {
            'Authorization': user.token
        }
    })
        .then(response => {
            if (response.ok)
                return response.json();
            throw new Error('Failed: GET all tags');
        })
        .then(json =>
            handleSuccessfulFetchTags(json)
        )
        .catch(error =>
            console.log(error.message)
        );
}

export default fetchAllTags
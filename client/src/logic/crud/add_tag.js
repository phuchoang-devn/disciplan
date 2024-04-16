import env from '../../env';

const addTag = async (
    data,
    setTagRepo,
    isLoading,
    setIsLoading,
    setCheckedTags
) => {
    const user = JSON.parse(localStorage.getItem("disciplan_user"));

    if (!isLoading)
        setIsLoading(true);

    await fetch(`http://${env.BACKEND_SERVER}/tags/add/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
            'Authorization': user.token
        },
        body: JSON.stringify(data)
    })
        .then(res => {
            if (res.ok)
                return res.json();
            
            throw new Error('Failed: ADD TAG');
        })
        .then(json => {
            setTagRepo(data => [...data, json]);
            setCheckedTags(data => [...data, json.id]);
        })
        .then(() => setIsLoading(false))
        .catch(error => console.log(error.message));
}

export default addTag;
import env from '../../env';

const updateTag = async (
    taskRepo,
    tagId,
    data,
    setTagRepo,
    loading,
    setLoading
) => {
    const user = JSON.parse(localStorage.getItem("disciplan_user"));

    const handleSuccess = (updatedTag) => {
        setTagRepo(repo =>
            [...repo.filter(tag => tag.id !== tagId), updatedTag]
        )

        taskRepo.current = taskRepo.current.map(task => {
            task.tags = task.tags.map(tag =>
                (tag.id === tagId) ? updatedTag : tag
            );
            return task;
        })
    }

    if (!loading)
        setLoading(true);

    await fetch(`http://${env.BACKEND_SERVER}/tags/update/${tagId}/`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json; charset=UTF-8",
            'Authorization': user.token
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (response.ok)
                return response.json();
            else {
                throw new Error('Failed: UPDATE TAG');
            }
        })
        .then(handleSuccess)
        .then(() => setLoading(false))
        .catch(error => console.log(error.message));
}

export default updateTag;
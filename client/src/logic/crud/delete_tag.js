import env from '../../env';

const deleteTag = async (
    taskRepo,
    id,
    setTagRepo,
    loading,
    setLoading,
    setCheckedTags
) => {
    const user = JSON.parse(localStorage.getItem("disciplan_user"));

    const handleSuccess = () => {
        setTagRepo(data => data.filter(tag => tag.id !== id));

        setCheckedTags(data => data.filter(tagId => tagId !== id));

        taskRepo.current = taskRepo.current.map(task => {
            task.tags = task.tags.filter(tag => tag.id !== id);
            return task;
        })
    }

    if (!loading) setLoading(true);

    await fetch(`http://${env.BACKEND_SERVER}/tags/delete/${id}`, {
        method: "DELETE",
        headers: {
            'Authorization': user.token
        },
    })
        .then(response => {
            if (response.ok)
                handleSuccess();
            else throw new Error('Failed: DELETE TAG')
        })
        .then(() => setLoading(false))
        .catch(error => console.log(error.message));
}

export default deleteTag;
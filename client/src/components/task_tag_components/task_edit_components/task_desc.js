const TaskDescription = (props) => {
    const { description, setDescription} = props;

    return (

        <div className="task-edit__desc-container">
            <textarea
                className="task-edit__desc text-input"
                placeholder="Description"
                defaultValue={description}
                onChange={e => setDescription(e.target.value)}
            ></textarea >
        </div>
    )
}

export default TaskDescription;
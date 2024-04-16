import { AiFillEdit } from "react-icons/ai";

const TaskName = (props) => {
    const { taskName, setTaskName } = props;

    return (
        <div className="task-edit__name">
            <div className="task-edit__edit-icon">
                <AiFillEdit />
            </div>

            <input
                className="task-edit__name-input text-input"
                type="text"
                placeholder="Task Name"
                defaultValue={taskName}
                onChange={e =>
                    setTaskName(e.target.value)
                } />
        </div>
    )
}

export default TaskName;
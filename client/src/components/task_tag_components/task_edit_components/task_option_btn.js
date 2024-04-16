import { FaXmark } from "react-icons/fa6";
import { FaArchive } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";

const TaskOptionButtons = (props) => {
    const {
        setTaskEdit,
        handleSubmit,
        isArchived,
        setIsArchived
    } = props;

    return (
        <>
            <div onClick={() => setTaskEdit(undefined)}>
                <FaXmark />
            </div>

            <div className="task-edit__save"
                onClick={() => handleSubmit()}>
                <FaCheck />
            </div>

            <div onClick={() =>setIsArchived(value => !value)}
                style={{
                    color: isArchived ? "#eb8f34" : "black",
                    fontSize: isArchived ? "40px" : "32px"
                }}>
                <FaArchive />
            </div>
        </>
    )
}

export default TaskOptionButtons;
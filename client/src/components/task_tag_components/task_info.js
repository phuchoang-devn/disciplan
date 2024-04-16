import "../../css/task_info.css"
import { TaskContext } from "../home.js";
import deleteTask from "../../logic/crud/delete_task.js"
import { FormEditType } from "../../default.js";

import { MdModeEditOutline } from "react-icons/md";
import { FaXmark } from "react-icons/fa6";
import { IoTrashBinSharp } from "react-icons/io5";
import { useContext, memo } from "react";

import moment from 'moment';


const TaskInfo = (props) => {
    const { task } = props;

    const [taskRepo,
        repetitionRepo,
        setTaskInfo,
        setTaskEdit,
        isLoading,
        setIsLoading,
        datePointer,
        defaultColorForTaskAndTag,
        updateType,
        setFunctionHandleUpdateType
    ] = useContext(TaskContext);

    const repetitionOfTask = (task.repetition_group) ?
        repetitionRepo.current.filter(repe =>
            repe.id === task.repetition_group)[0]
        : undefined;

    const handleDelete = () => {
        if (!!repetitionOfTask && !updateType) {
            setFunctionHandleUpdateType(() =>
                (updateType) => sendDataToServerAndCloseInfo(updateType)
            );
            return
        }
        sendDataToServerAndCloseInfo(updateType);
    }

    function sendDataToServerAndCloseInfo(updateType) {
        deleteTask(task, updateType, taskRepo, repetitionRepo, isLoading, setIsLoading, datePointer);
        setTaskInfo(undefined);
    }

    return (
        <div
            className="task-info-container"
            onMouseDown={() =>
                setTaskInfo(undefined)
            }
            style={{
                background: "radial-gradient(#000000BF, " + task.color + "BF)"
            }}>

            <div
                className="task-info"
                onMouseDown={(e) =>
                    e.stopPropagation()
                }>

                <div className="task-info__header">
                    <div className="task-info__meta">
                        <div className="task-info__name">{task.name}</div>
                        {
                            (task.date_start === task.date_end) ?
                                <div><b>{moment(task.date_start).format("D MMM YYYY")}</b></div>
                                : <div><b>{moment(task.date_start).format("D MMM YYYY")} - {moment(task.date_end).format("D MMM YYYY")}</b></div>
                        }
                        {
                            task.time_start ?
                                <div><b>{moment(task.time_start, "HH:mm:ss").format("HH:mm")} - {moment(task.time_end, "HH:mm:ss").format("HH:mm")}</b></div>
                                : null
                        }
                        {
                            repetitionOfTask ?
                                <div>Every {repetitionOfTask.frequency} {repetitionOfTask.frequency_unit}</div>
                                : null
                        }
                        {
                            task.description ?
                                <div className="task-info__desc">{task.description}</div>
                                : null
                        }
                    </div>

                    <div className="task-info__option">
                        <div onClick={() => setTaskInfo(undefined)}><FaXmark /></div>

                        <div onClick={() => {
                            setTaskInfo(undefined);
                            setTaskEdit({
                                type: FormEditType.UPDATE,
                                task: task,
                                repe: repetitionOfTask
                            });
                        }}><MdModeEditOutline /></div>

                        <div onClick={() => handleDelete()}><IoTrashBinSharp /></div>
                    </div>
                </div>

                <div className="task-info-footer">
                    <div className="task-info__tag-container">
                        {
                            task.tags ?
                                task.tags.map((tag) => (
                                    <div key={tag.id}
                                        className="task-info__tag"
                                        style={{
                                            backgroundColor: tag.color
                                        }}><b>#{tag.name}</b></div>
                                ))
                                : null
                        }
                    </div>
                    <div className="task-info__status-bar">
                        <div
                            className="task-info__status-completed"
                            style={{
                                width: task.status + "%",
                                backgroundColor: defaultColorForTaskAndTag.current[task.priority]
                            }}>
                            {
                                (task.status >= 50) ?
                                    <div className="task-info__status-titleOver50"><b>{task.status}%</b></div>
                                    : null
                            }
                        </div>
                        {
                            (task.status < 50) ?
                                <div className="task-info__status-titleUnder50"><b>{task.status}%</b></div>
                                : null
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default memo(TaskInfo);
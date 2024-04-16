import { TaskContext } from '../../home';
import weekMouseDownOnTaskHandler from '../../../logic/event_handling/week_mouse_down_task';
import { HomeWeekContext } from '../home_week';

import moment from 'moment';
import { useContext, memo } from "react";


const WeekTask = (props) => {
    const {
        isMovingTask,
        columnIndex,

        // in pixel, if task is a moving-task
        // in percent, if task is a normal task
        topToColumnRect,

        heightToColumnRectInPercent,
        task,
        updateTasksInSameDayColumn,
        dateOfColumn
    } = props;

    const [
        taskRepo, 
        repetitionRepo, 
        setTaskInfo, 
        , 
        isLoading, 
        setIsLoading, 
        datePointer, 
        defaultColorForTaskAndTag,
        ,
        setFunctionHandleUpdateType,
        setFunctionHandleCancelUpdate
    ] = useContext(TaskContext);

    const [
        ,,,
        setMovingTask,
        setPointerToLastWeek,
        setPointerToNextWeek,
        setDatePointer
    ] = useContext(HomeWeekContext);

    return (
        <div className="week-task noselect"
            onMouseDown={isMovingTask ?
                null :
                weekMouseDownOnTaskHandler(
                    columnIndex,
                    topToColumnRect,
                    heightToColumnRectInPercent,
                    task,
                    setMovingTask,
                    dateOfColumn,
                    updateTasksInSameDayColumn,
                    setTaskInfo,
                    taskRepo, 
                    repetitionRepo, 
                    isLoading, 
                    setIsLoading, 
                    datePointer,
                    setFunctionHandleUpdateType,
                    setFunctionHandleCancelUpdate,
                    setPointerToLastWeek,
                    setPointerToNextWeek,
                    setDatePointer
                )
            }
            style={{
                top: isMovingTask ? topToColumnRect + "px" : topToColumnRect + "%",
                height: heightToColumnRectInPercent + "%",
                width: isMovingTask ? "98%" : "90%",
                zIndex: isMovingTask ? 1 : "unset",
                backgroundColor: task.color
            }}>

            <div className="week-task__header">
                <div><b>{task.name}</b></div>
                <div className="week-task__header-time">
                    {moment(task.time_start, "HH:mm:ss").format("HH:mm")} - {moment(task.time_end, "HH:mm:ss").format("HH:mm")}
                </div>
            </div>
            <div className="week-task__footer">
                <div className="week-task__tag-container">
                    {
                        task.tags.map(tag => (
                            <div key={tag.id}
                                className="week-task__tag"
                                style={{
                                    backgroundColor: tag.color
                                }}>#{tag.name}</div>
                        ))
                    }
                </div>
                <div className="week-task__status-bar">
                    <div
                        className="week-task__status-completed"
                        style={{
                            width: task.status + "%",
                            backgroundColor: defaultColorForTaskAndTag.current[task.priority]
                        }}>
                        {
                            (task.status >= 50) ?
                                <div className="week-task__status-titleOver50"><b>{task.status}%</b></div>
                                : null
                        }
                    </div>
                    {
                        (task.status < 50) ?
                            <div className="week-task__status-titleUnder50"><b>{task.status}%</b></div>
                            : null
                    }
                </div>
            </div>
        </div>
    )
}

export default memo(WeekTask);
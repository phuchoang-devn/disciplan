import { TaskContext } from '../../home';
import WeekTask from './week_task';
import { HomeWeekContext } from '../home_week';
import WeekHandleAddingTask from '../../../logic/event_handling/week_add_task';
import WeekAddingTask from './week_adding_task';
import { UNDEFINED_ADDING_TASK, UNDEFINED_MOVEDIN_TASK } from '../../../default';

import moment from 'moment';
import { useState, useEffect, useContext, memo } from "react";


const WeekdayColumn = (props) => {
    const {
        columnIndex,
        tasks,
        dateOfColumn
    } = props;

    const [
        , , ,
        setTaskEdit,
        , , ,
        defaultColor
    ] = useContext(TaskContext);

    const [
        updateTasks,
        ,
        movingTask
    ] = useContext(HomeWeekContext);

    const [addingTask, setAddingTask] = useState(UNDEFINED_ADDING_TASK);

    const [movedinTask, setMovedinTask] = useState(UNDEFINED_MOVEDIN_TASK);

    useEffect(() => {
        if (!movingTask.isMoving) {
            setMovedinTask(UNDEFINED_MOVEDIN_TASK);
            return
        }

        let isMovingTaskFromThisColumn = (dateOfColumn === movingTask.dateStartOfTask);
        if (isMovingTaskFromThisColumn)
            removeTaskFromColumn(movingTask.modifiedTaskToDisplay);

        let isMovingTaskToThisColumn = (columnIndex === movingTask.indexOfCurrentColumn);
        if (isMovingTaskToThisColumn)
            setMovedinTask({
                isMovedIn: true,
                taskInfo: movingTask.modifiedTaskToDisplay,
                topInPixel: movingTask.topInPixel,
                heightInPercent: movingTask.heightInPercent
            });
        else if (movedinTask.isMovedIn)
            setMovedinTask(UNDEFINED_MOVEDIN_TASK);
    }, [movingTask])

    const removeTaskFromColumn = (taskToRemove) => {
        updateTasks(
            columnIndex,
            oldTasks => oldTasks.filter(
                task => task.id !== taskToRemove.id
            )
        );
    }

    const calcTopAndHeight = (task) => {
        let result = {};

        let timeStartOfTask = moment(task.time_start, "HH:mm:ss");
        let timeEndOfTask = moment(task.time_end, "HH:mm:ss");
        let dayStart = moment("00:00:00", "HH:mm:ss");

        result.topToColumnRectInPercent = timeStartOfTask.diff(dayStart, 'minutes') * 100 / (24 * 60);
        result.heightToColumnRectInPercent = timeEndOfTask.diff(timeStartOfTask, 'minutes') * 100 / (24 * 60);

        return result;
    }

    return (
        <div
            className="week-column"
            onMouseDown={
                WeekHandleAddingTask(
                    dateOfColumn,
                    defaultColor,
                    setAddingTask,
                    setTaskEdit
                )
            }>

            <div className="week-column__task-container">
                {
                    movedinTask.isMovedIn ?
                        <WeekTask
                            isMovingTask={true}
                            topToColumnRect={movedinTask.topInPixel}
                            heightToColumnRectInPercent={movedinTask.heightInPercent}
                            task={movedinTask.taskInfo}
                        />
                        : null
                }
                {
                    addingTask.isAdding ?
                        <WeekAddingTask
                            addingTask={addingTask}
                            defaultColor={defaultColor}
                        />
                        : null
                }
                {
                    tasks ?
                        tasks.map(task => {
                            let taskPositionAndSize = calcTopAndHeight(task);

                            return <WeekTask
                                key={task.id}
                                isMovingTask={false}
                                columnIndex={columnIndex}
                                topToColumnRect={taskPositionAndSize.topToColumnRectInPercent}
                                heightToColumnRectInPercent={taskPositionAndSize.heightToColumnRectInPercent}
                                task={task}
                                updateTasksInSameDayColumn={updateTasks}
                                dateOfColumn={dateOfColumn}
                            />
                        })
                        : null
                }
            </div>
        </div>
    )
}

export default memo(WeekdayColumn);
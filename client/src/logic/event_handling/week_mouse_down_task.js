import WeekMovingHandler from "./week_move_task";
import WeekOpeningTaskInfoHandler from "./week_open_task_info";
import updateTask from "../crud/update_task";
import { UNDEFINED_MOVING_TASK } from "../../default";

const weekMouseDownOnTaskHandler = (
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
) => {

    return initialEvent => {
        initialEvent.stopPropagation()

        const initialTaskRect = initialEvent.target.getBoundingClientRect();
        const daytimeRect = document.getElementById("week__daytime-list").getBoundingClientRect();
        const timelineContainer = document.getElementById("week__timeline-container");

        var isMouseDown = true;

        const movingTaskHandler =
            new WeekMovingHandler(
                daytimeRect,
                timelineContainer,
                initialEvent.clientY,
                dateOfColumn,
                task,
                topToColumnRect,
                heightToColumnRectInPercent,
                columnIndex,
                setPointerToLastWeek,
                setPointerToNextWeek);

        const updateMovingTask = () => {
            let updatedMovingTask = movingTaskHandler.getUpdatedMovingTask();
            setMovingTask(updatedMovingTask);
        }

        const openingTaskInfoHandler = new WeekOpeningTaskInfoHandler(updateMovingTask, setTaskInfo);

        const isMouseOutsideOfTask = (mouseX, mouseY) => {
            return mouseX < initialTaskRect.left
                || mouseX > initialTaskRect.right
                || mouseY < initialTaskRect.top
                || mouseY > initialTaskRect.bottom;
        }

        const handleChangeAfterMoving = () => {
            if (movingTaskHandler.isPositionNotChanged(task))
                handleNoChange();
            else handleRelevantTasksAndSendDataToServer();
        }

        const handleRelevantTasksAndSendDataToServer = () => {
            if (!!task.repetition_group) {
                setFunctionHandleCancelUpdate(() => () => handleNoChange());
                setFunctionHandleUpdateType(() => (updateType) => sendDataToServer(updateType));
            } else { 
                sendDataToServer(undefined);
                setMovingTask(UNDEFINED_MOVING_TASK);
            }
        }

        function handleNoChange() {
            if(movingTaskHandler.isViewInOtherWeek)
                setDatePointer(dateOfColumn);
            else updateTasksInSameDayColumn(columnIndex, data => [...data, task]);

            setMovingTask(UNDEFINED_MOVING_TASK);
        }

        function sendDataToServer(updateType) {
            let newTask = movingTaskHandler.getNewTask(task);
            let info = {
                name: newTask.name,
                description: newTask.description,
                priority: newTask.priority,
                date_start: newTask.date_start,
                time_start: newTask.time_start,
                date_end: newTask.date_end,
                time_end: newTask.time_end,
                status: newTask.status,
                color: newTask.color,
                notification: newTask.notification,
                is_archived: newTask.is_archived,
                tags: newTask.tags.map(tag => tag.id)
            };

            let data = {
                info: info,
                repetition: null
            };

            updateTask(task, data, updateType, taskRepo, repetitionRepo, isLoading, setIsLoading, datePointer);
            setMovingTask(UNDEFINED_MOVING_TASK);
        }

        const killEvent = () => {
            openingTaskInfoHandler.removeTimeout();

            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            timelineContainer.removeEventListener('scroll', handleScroll);
        }

        const handleMouseMove = (event) => {
            if (!isMouseDown)
                return

            if (openingTaskInfoHandler.isAlive()) {
                if (isMouseOutsideOfTask(event.clientX, event.clientY))
                    killEvent();
                return
            }

            movingTaskHandler.updateTaskPosition(event.clientX, event.clientY);
            updateMovingTask();
        }

        const handleScroll = (event) => {
            if (!isMouseDown || openingTaskInfoHandler.isAlive())
                return

            movingTaskHandler.updateTimelineScrollTop(event.target.scrollTop);
            updateMovingTask();
        }

        const handleMouseUp = () => {
            isMouseDown = false;

            if (openingTaskInfoHandler.isAlive())
                openingTaskInfoHandler.openTaskInfo(task);
            else {
                handleChangeAfterMoving();
            }

            killEvent();
        }

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        timelineContainer.addEventListener('scroll', handleScroll);
    }
}

export default weekMouseDownOnTaskHandler;
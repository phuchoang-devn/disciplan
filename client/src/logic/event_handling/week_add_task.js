import { UNDEFINED_ADDING_TASK } from '../../default';

import moment from 'moment';

const WeekHandleAddingTask = (
    dateOfColumn,
    defaultColor,
    setAddingTask,
    setTaskEdit
) => {

    return (initialEvent) => {
        let isMouseDown = true;

        const timelineContainer = document.getElementById("week__timeline-container");
        const timelineRect = timelineContainer.getBoundingClientRect();
        const firstColumnRect = initialEvent.target.getBoundingClientRect();
        const pixelsFor5MinUnit = firstColumnRect.height / (24 * 12);

        let currentColumnRect = firstColumnRect;
        let currentClientY = initialEvent.clientY;
        let timeStartToAdd = undefined;
        let timeEndToAdd = undefined;

        const updateChange = () => {
            let startToTopInUnit = calcStartToTopInUnit();
            let endToTopInUnit = calcEndToTopInUnit();

            if (startToTopInUnit === endToTopInUnit)
                return

            setValueToRender(startToTopInUnit, endToTopInUnit);
        }

        const calcStartToTopInUnit = () => {
            return Math.round(
                (initialEvent.clientY - firstColumnRect.top) / pixelsFor5MinUnit
            );
        }

        const calcEndToTopInUnit = () => {
            let result = Math.round(
                (currentClientY - currentColumnRect.top) / pixelsFor5MinUnit
            );

            const MIN = 0;
            const MAX = 24 * 12;
            return Math.min(Math.max(result, MIN), MAX);
        }

        const setValueToRender = (startToTopInUnit, endToTopInUnit) => {

            handleTaskLessThan15Min(startToTopInUnit, endToTopInUnit);
            let isMouseDragingDown = handleDragDirection(startToTopInUnit, endToTopInUnit);

            if (!isMouseDragingDown) {
                let temp = startToTopInUnit;
                startToTopInUnit = endToTopInUnit;
                endToTopInUnit = temp;
            }

            endToTopInUnit = capEndAt23h55(endToTopInUnit);

            let heightInPixel = (endToTopInUnit - startToTopInUnit) * pixelsFor5MinUnit;
            timeStartToAdd = formatTimeToDisplay(startToTopInUnit);
            timeEndToAdd = formatTimeToDisplay(endToTopInUnit);
            setAddingTask(previousState => {
                return {
                    ...previousState,
                    isAdding: true,
                    topInPixel: startToTopInUnit * pixelsFor5MinUnit,
                    heightInPixel: heightInPixel,
                    timeStart: timeStartToAdd,
                    timeEnd: timeEndToAdd
                }
            });
        }

        const handleTaskLessThan15Min = (startToTopInUnit, endToTopInUnit) => {
            let isLess = (Math.abs(startToTopInUnit - endToTopInUnit) < 3);

            setAddingTask(previousState => {
                return {
                    ...previousState,
                    isLessThan15Min: isLess
                }
            });
        }

        const handleDragDirection = (startToTopInUnit, endToTopInUnit) => {
            let isDown = (startToTopInUnit < endToTopInUnit);

            setAddingTask(previousState => {
                return {
                    ...previousState,
                    isMouseDragingDown: isDown
                }
            });

            return isDown;
        }

        const capEndAt23h55 = (endToTopInUnit) => {
            return Math.min(endToTopInUnit, 24 * 12 - 1);
        }

        const formatTimeToDisplay = (distanceToTopInUnit) => {
            let hour = parseInt(distanceToTopInUnit / 12);
            let minute = (distanceToTopInUnit % 12) * 5;

            return `${(hour < 10) ? "0" + hour : hour}`
                + `:${(minute < 10) ? "0" + minute : minute}`;
        }

        const scrollTimelineContainer = () => {
            if (currentClientY < timelineRect.top) {
                timelineContainer.scrollTo({
                    top: currentClientY - currentColumnRect.top,
                    left: 0,
                    behavior: "auto",
                });
            }

            let relativeYToColumn = currentClientY - currentColumnRect.top;
            if (
                // 5 and 10 are the number of pixels
                // We just need 2 small numbers, but the second is bigger than the first one.
                (currentClientY >= timelineRect.bottom - 5)
                && (relativeYToColumn <= firstColumnRect.height)
            ) {
                timelineContainer.scrollTo({
                    top: relativeYToColumn - timelineRect.height + 10,
                    left: 0,
                    behavior: "auto",
                });
            }
        }

        const renderAddTaskWindow = () => {
            setTaskEdit({
                type: "add",
                task: {
                    name: "",
                    description: "",
                    priority: "medium",
                    date_start: moment(dateOfColumn).format("YYYY-MM-DD"),
                    date_end: moment(dateOfColumn).format("YYYY-MM-DD"),
                    time_start: `${timeStartToAdd}:00`,
                    time_end: `${timeEndToAdd}:00`,
                    status: 0,
                    notification: null,
                    is_archived: false,
                    tags: [],
                    color: defaultColor.current["medium"],
                    repetition_group: null
                }
            });
        }

        const removeAllListener = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            timelineContainer.removeEventListener('scroll', handleScroll);
        }

        const handleMouseMove = (event) => {
            if (!isMouseDown)
                return

            currentClientY = event.clientY;
            updateChange();
            scrollTimelineContainer();
        }

        const handleScroll = () => {
            if (!isMouseDown)
                return

            currentColumnRect = initialEvent.target.getBoundingClientRect();
            updateChange();
            scrollTimelineContainer();
        }

        const handleMouseUp = () => {
            isMouseDown = false;
            setAddingTask(UNDEFINED_ADDING_TASK);

            if (timeStartToAdd && timeEndToAdd)
                renderAddTaskWindow();

            removeAllListener();
        }

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        timelineContainer.addEventListener('scroll', handleScroll);
    }
}

export default WeekHandleAddingTask

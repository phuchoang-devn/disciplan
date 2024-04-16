import moment from 'moment';

class WeekMovingHandler {

    SCROLL_SPEED = 5;
    intervalToSetView = undefined;
    trackOfDiffOfViewInWeek = 0;

    constructor(
        daytimeRect,
        timelineContainer,
        mousePositionY,
        dateOfInitialColumn,
        task,
        topToColumnRect,
        heightToColumnRectInPercent,
        indexOfCurrentColumnOfTask,
        setPointerToLastWeek,
        setPointerToNextWeek
    ) {
        this.daytimeRect = daytimeRect;
        this.timelineContainer = timelineContainer;
        this.timelineContainerRect = timelineContainer.getBoundingClientRect();
        this.PIXELS_FOR_5MIN_UNIT = daytimeRect.height / (12 * 24);
        this.taskColumnWidth = (document.body.clientWidth - daytimeRect.width) / 7;

        this.newTask = JSON.parse(JSON.stringify(task));
        this.indexOfCurrentColumnOfTask = indexOfCurrentColumnOfTask;
        this.dateOfInitialColumn = dateOfInitialColumn;
        this.dayDiffOfChange = 0;
        this.TASK_DURATION_IN_MINUTE = moment(task.time_end, "HH:mm:ss").diff(moment(task.time_start, "HH:mm:ss"), 'minutes');

        this.mousePositionY = mousePositionY;
        this.heightToColumnRectInPercent = heightToColumnRectInPercent;
        this.taskStartPositionY = daytimeRect.height * topToColumnRect / 100;
        this.taskEndPostitionY = this.taskStartPositionY + daytimeRect.height * heightToColumnRectInPercent / 100;

        this.timelineScrollTop = timelineContainer.scrollTop;
        this.isScrollTopLock = this.taskStartPositionY < this.timelineScrollTop;
        this.isScrollDownLock = this.taskEndPostitionY > this.timelineScrollTop + this.timelineContainerRect.height;

        this.setPointerToLastWeek = setPointerToLastWeek;
        this.setPointerToNextWeek = setPointerToNextWeek;
    }

    updateTimelineScrollTop = (value) => {
        this.updateTaskPositionY(value - this.timelineScrollTop);
        this.timelineScrollTop = value;
        this.scrollContainer();
    }

    updateTaskPosition = (newMousePositionX, newMousePositionY) => {
        let deltaMouseY = newMousePositionY - this.mousePositionY;
        this.updateTaskPositionY(deltaMouseY);
        this.mousePositionY = newMousePositionY;

        let distanceToDaytimeRect = parseInt((newMousePositionX - this.daytimeRect.width) / this.taskColumnWidth);
        let indexOfNewColumnOfTask = Math.min(Math.max(distanceToDaytimeRect, 0), 6);

        this.changeViewToOtherWeek(newMousePositionX);

        this.dayDiffOfChange += (indexOfNewColumnOfTask - this.indexOfCurrentColumnOfTask);
        this.indexOfCurrentColumnOfTask = indexOfNewColumnOfTask;

        this.scrollContainer();
    }

    updateTaskPositionY = (deltaY) => {
        this.taskStartPositionY += deltaY;
        this.taskEndPostitionY += deltaY;
    }

    changeViewToOtherWeek = (newMousePositionX) => {
        if (newMousePositionX <= this.daytimeRect.right) {
            if (typeof this.intervalToSetView === "undefined")
                this.intervalToSetView = setInterval(() => {
                    this.dayDiffOfChange -= 7;
                    this.setPointerToLastWeek();
                    this.trackOfDiffOfViewInWeek--;
                }, 1000);
            // 10 is the number of pixels and it is just random. We need there a number bigger than 0. 
        } else if (newMousePositionX >= this.timelineContainerRect.right - 10) {
            if (typeof this.intervalToSetView === "undefined")
                this.intervalToSetView = setInterval(() => {
                    this.dayDiffOfChange += 7;
                    this.setPointerToNextWeek();
                    this.trackOfDiffOfViewInWeek++;
                }, 1000);
        } else if (typeof this.intervalToSetView !== "undefined") {
            clearInterval(this.intervalToSetView);
            this.intervalToSetView = undefined;
        }
    }

    scrollContainer = () => {
        let diffTimelineTopMinusTaskTop = this.timelineScrollTop - this.taskStartPositionY;
        if (this.isScrollTopLock && diffTimelineTopMinusTaskTop < 0) {
            this.isScrollTopLock = false;
        } else if (!this.isScrollTopLock && diffTimelineTopMinusTaskTop > 0) {
            this.timelineContainer.scrollTo({
                top: this.timelineScrollTop - diffTimelineTopMinusTaskTop / this.SCROLL_SPEED,
                left: 0,
                behavior: "auto",
            });
        }

        let diffTaskBottomMinusTimelineBottom = this.taskEndPostitionY - this.timelineContainerRect.height - this.timelineScrollTop;
        if (this.isScrollDownLock && diffTaskBottomMinusTimelineBottom < 0) {
            this.isScrollDownLock = false;
        } else if (!this.isScrollDownLock && diffTaskBottomMinusTimelineBottom > 0){
            this.timelineContainer.scrollTo({
                top: this.timelineScrollTop + diffTaskBottomMinusTimelineBottom / this.SCROLL_SPEED,
                left: 0,
                behavior: "auto",
            });
        }
    }

    getUpdatedMovingTask = () => {
        let topInPixel;
        let daytimeRectHeightMinus5Min = this.daytimeRect.height * (24 * 60 - 5) / (24 * 60);

        if ((this.taskStartPositionY >= 0)
            && (this.taskEndPostitionY <= daytimeRectHeightMinus5Min)) {
            let modifiedTaskStartY = this.keepTaskInTimelineViewport();
            let yStartInUnit = Math.round(modifiedTaskStartY / this.PIXELS_FOR_5MIN_UNIT);
            let hourStart = parseInt(yStartInUnit / 12);
            let minuteStart = (yStartInUnit % 12) * 5;

            this.newTask.time_start = `${(hourStart < 10) ? "0" + hourStart : hourStart}`
                + `:${(minuteStart < 10) ? "0" + minuteStart : minuteStart}`
                + `:00`;
            this.newTask.time_end = moment(this.newTask.time_start, "HH:mm:ss").add(this.TASK_DURATION_IN_MINUTE, "minutes").format("HH:mm:ss");
            topInPixel = yStartInUnit * this.PIXELS_FOR_5MIN_UNIT;

        } else if (this.taskStartPositionY < 0) {
            this.newTask.time_start = "00:00:00";
            this.newTask.time_end = moment("00:00:00", "HH:mm:ss").add(this.TASK_DURATION_IN_MINUTE, "minutes").format("HH:mm:ss");
            topInPixel = 0;

        } else if (this.taskEndPostitionY > daytimeRectHeightMinus5Min) {
            this.newTask.time_end = "23:55:00";
            this.newTask.time_start = moment(this.newTask.time_end, "HH:mm:ss")
                .add(-this.TASK_DURATION_IN_MINUTE, "minutes")
                .format("HH:mm:ss");
            topInPixel = this.daytimeRect.height * (100 - this.heightToColumnRectInPercent - 5 / (24 * 60) * 100) / 100;
        }

        return {
            isMoving: true,
            dateStartOfTask: this.dateOfInitialColumn,
            indexOfCurrentColumn: this.indexOfCurrentColumnOfTask,
            modifiedTaskToDisplay: this.newTask,
            topInPixel: topInPixel,
            heightInPercent: this.heightToColumnRectInPercent
        }
    }

    keepTaskInTimelineViewport = () => {
        if (!this.isScrollTopLock && this.taskStartPositionY < this.timelineScrollTop)
            return this.timelineScrollTop;

        if (!this.isScrollDownLock && this.taskEndPostitionY > this.timelineScrollTop + this.timelineContainerRect.height)
            return this.taskStartPositionY - (this.taskEndPostitionY - this.timelineScrollTop - this.timelineContainerRect.height);

        return this.taskStartPositionY;
    }

    isPositionNotChanged = (oldTask) => {
        return (this.dayDiffOfChange === 0)
            && (oldTask.time_start === this.newTask.time_start);
    }

    isViewInOtherWeek = () => {
        return this.trackOfDiffOfViewInWeek !== 0;
    }

    getNewTask = (oldTask) => {
        this.newTask.date_start = moment(oldTask.date_start, 'YYYY-MM-DD')
            .add(this.dayDiffOfChange, 'days')
            .format('YYYY-MM-DD');
        this.newTask.date_end = moment(oldTask.date_end, 'YYYY-MM-DD')
            .add(this.dayDiffOfChange, 'days')
            .format('YYYY-MM-DD');

        return this.newTask;
    }
}

export default WeekMovingHandler;
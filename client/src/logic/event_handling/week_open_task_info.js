class WeekOpeningTaskInfoHandler {
    aliveStatus = true;

    constructor(updateMovingTask, setTaskInfo) {
        this.updateTaskInfo = (task) =>
            setTaskInfo(task);

        this.setIsAlive = setTimeout(() => {
            this.aliveStatus = false;
            updateMovingTask();
        }, 500);
    }

    removeTimeout = () => {
        clearTimeout(this.setIsAlive);
    }

    isAlive = () => {
        return this.aliveStatus;
    }

    openTaskInfo = (task) => {
        console.log(task);
        this.removeTimeout();
        this.updateTaskInfo(task);
    }
}

export default WeekOpeningTaskInfoHandler;
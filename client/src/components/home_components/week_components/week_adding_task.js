const WeekAddingTask = (props) => {

    const { addingTask, defaultColor } = props;

    return (
        <div
            className="week-adding-task"
            style={{
                top: addingTask.topInPixel + "px",
                height: addingTask.heightInPixel + "px",
                backgroundColor: defaultColor.current["medium"]
            }}>
            <div
                draggable="false"
                className="week-adding-task__time noselect"
                style={{
                    position: "absolute",
                    transform: addingTask.isLessThan15Min ? "translateY(-100%)" : "unset",
                    bottom: (addingTask.isMouseDragingDown && !addingTask.isLessThan15Min) ? 0 : "unset"
                }}>
                <b>{addingTask.timeStart} - {addingTask.timeEnd}</b>
            </div>
        </div>
    )
}

export default WeekAddingTask;
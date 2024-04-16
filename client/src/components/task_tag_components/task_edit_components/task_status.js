const TaskStatus = (props) => {
    const {
        status,
        setStatus
    } = props;

    const handleMovingThumb = () => {
        let isMouseDown = true;
        const statusbar = document.getElementById("task-edit-status-bar");

        const handleMouseMove = (event) => {
            if (!isMouseDown)
                return

            let newValue = Math.round((event.clientX - statusbar.offsetLeft) / statusbar.offsetWidth * 100);
            newValue = Math.min(Math.max(newValue, 0), 100);
            setStatus(newValue);
        }

        function handleMouseUp() {
            isMouseDown = false;

            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    return (
        <div className="task-edit__status">
            <div type="button"
                id="task-edit-status-bar" // this is used for staus bar interaction
                className="task-edit__status-bar">

                <div type="button"
                    className="task-edit__status-completed"
                    style={{ width: status + "%" }}>
                    {
                        (status >= 50) ?
                            <div type="button"
                                className="task-edit__status-titleOver50 noselect">
                                <b>Completed {status}%</b>
                            </div>
                            : null
                    }
                </div>

                <button
                    className="task-edit__status-thumb"
                    onMouseDown={handleMovingThumb}
                ></button>

                {
                    (status < 50) ?
                        <div type="button"
                            className="task-edit__status-titleUnder50 noselect">
                            <b>Completed {status}%</b>
                        </div>
                        : null
                }
            </div>
        </div>
    )
}

export default TaskStatus;
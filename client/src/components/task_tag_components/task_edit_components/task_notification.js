import { AscendingList } from "../../../default";

import { PiBellSimpleFill } from "react-icons/pi";
import { FaXmark } from "react-icons/fa6";


const TaskNotification = (props) => {
    const {
        notificationTimeIndex,
        setNotificationTimeIndex,
        notificationTimeUnit,
        setNotificationTimeUnit
    } = props;

    return (
        <div className="task-edit__notification task-edit__expand ">
            {
                !notificationTimeIndex ?
                    <div
                        type="button"
                        className="task-edit__expand-button noselect"
                        onClick={() =>
                            setNotificationTimeIndex(1)
                        }>
                        <div className="task-edit__expand-icon">
                            <PiBellSimpleFill />
                        </div>
                        <span>Add notification</span>
                    </div>
                    :
                    <>
                        <div
                            type="button"
                            className="task-edit__expand-button noselect"
                            style={{ backgroundColor: "#8e0000" }}
                            onClick={() =>
                                setNotificationTimeIndex(null)
                            }>
                            <div className="task-edit__expand-icon">
                                <FaXmark />
                            </div>
                            <span>Clear notification</span>
                        </div>

                        <div className="task-edit__notification-edit">
                            <input
                                className='task-edit__notification-number text-input'
                                type="number"
                                min="1"
                                value={notificationTimeIndex}
                                onChange={e =>
                                    setNotificationTimeIndex(e.target.value)
                                } />

                            {
                                AscendingList.TIME_UNIT_FOR_NOTIFICATION.map(timeUnit => (
                                    <div
                                        key={timeUnit}
                                        className='task-edit__notification-timeunit noselect'
                                        style={
                                            (timeUnit === notificationTimeUnit) ?
                                                {
                                                    color: "white",
                                                    backgroundColor: "var(--main-color)",
                                                    border: "unset",
                                                    boxShadow: "0 0 2px black"
                                                }
                                                : 
                                                {
                                                    color: "black",
                                                    backgroundColor: "white",
                                                    border: "1px solid black",
                                                    boxShadow: "unset"
                                                }
                                        }
                                        onClick={() =>
                                            setNotificationTimeUnit(timeUnit)
                                        }>
                                        <b>{timeUnit}</b>
                                    </div>
                                ))
                            }
                        </div>
                    </>

            }
        </div>
    )
}

export default TaskNotification;
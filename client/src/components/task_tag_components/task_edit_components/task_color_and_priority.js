import { AscendingList } from "../../../default";

import { GrPowerReset } from "react-icons/gr";


const TaskColorAndPriority = (props) => {
    const {
        priority,
        setPriority,
        taskColor,
        setTaskColor,
        defaultColorForTaskAndTag,
    } = props;

    return (
        <div className='task-edit__priority-color'>
            {
                AscendingList.PRIORITY.map(prio => (
                    <div
                        key={prio}
                        className='task-edit__priority noselect'
                        style={{
                            backgroundColor: (prio === priority) ? defaultColorForTaskAndTag.current[prio] + "BF" : "unset"
                        }}
                        onClick={() => {
                            setPriority(prio);

                            if (taskColor === defaultColorForTaskAndTag.current[priority])
                                setTaskColor(defaultColorForTaskAndTag.current[prio]);
                        }}
                    ><b>{prio}</b></div>
                ))
            }

            <input
                className="task-edit__color-input"
                type="color"
                value={taskColor}
                onChange={(e) =>
                    setTaskColor(e.target.value)
                } />

            <div className="task-edit__color-reset"
                style={{
                    backgroundColor: defaultColorForTaskAndTag.current[priority]
                }}
                onClick={() => {
                    setTaskColor(defaultColorForTaskAndTag.current[priority])
                }}>
                <GrPowerReset />
            </div>
        </div>
    )
}

export default TaskColorAndPriority;
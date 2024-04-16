import { AscendingList, TimeUnitForRepetition } from "../../../default";

import { FaPlus } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import DatePicker from "react-datepicker";
import moment from 'moment';


const TaskRepetition = (props) => {
    const {
        dateStart,
        hasRepetition,
        setHasRepetition,
        repetitionEnd,
        setRepetitionEnd,
        taskFrequency,
        setTaskFrequency,
        frequencyUnit,
        mainFrequencyUnit,
        setMainFrequencyUnit,
        subFrequencyUnitForMonth,
        setSubFrequencyUnitForMonth,
        getAllValuesForSubFrequency
    } = props;

    return (
        <div className="task-edit__repe task-edit__expand">
            {
                !hasRepetition ?
                    <div
                        type="button"
                        className="task-edit__expand-button noselect"
                        onClick={() =>
                            setHasRepetition(data => !data
                            )}>
                        <div className="task-edit__expand-icon">
                            <FaPlus />
                        </div>
                        <span>Add Repetition</span>
                    </div>
                    :
                    <>
                        <div
                            type="button"
                            className="task-edit__expand-button noselect"
                            style={{ backgroundColor: "#8e0000" }}
                            onClick={() =>
                                setHasRepetition(data => !data)
                            }>
                            <div className="task-edit__expand-icon">
                                <FaXmark />
                            </div>
                            <span>Clear Repetition</span>
                        </div>

                        <div className="task-edit__repe-edit">
                            <div className="task-edit__repe-end">
                                <div className="task-edit__repe-end-title" > End </div>
                                <DatePicker
                                    className="task-edit__date-input text-input"
                                    selected={new Date(repetitionEnd)}
                                    dateFormat="MMMM d, yyyy"
                                    onChange={e =>
                                        setRepetitionEnd(moment(e).format("YYYY-MM-DD"))
                                    } />
                            </div>

                            <div className="task-edit__repe-freq">
                                <span>Every</span>

                                <input type="number"
                                    min="1"
                                    className="task-edit__repe-freq-number text-input"
                                    value={taskFrequency}
                                    onChange={e =>
                                        setTaskFrequency(e.target.value)
                                    } />
                                    
                                <div className="task-edit__dropdown">
                                    <input
                                        type="button"
                                        className='task-edit__dropdown-button'
                                        defaultValue={mainFrequencyUnit} />
                                    <div className="task-edit__dropdown-content">
                                        {
                                            AscendingList.TIME_UNIT_FOR_REPETITION.map((value, index) => (
                                                <div
                                                    key={index}
                                                    onClick={() => {
                                                        frequencyUnit.current = value;
                                                        setMainFrequencyUnit(value);
                                                    }}
                                                ><b>{value}</b></div>
                                            ))
                                        }
                                    </div>
                                </div>

                                {
                                    (mainFrequencyUnit === TimeUnitForRepetition.MONTH) ?
                                        <div className="task-edit__dropdown">
                                            <input
                                                type="button"
                                                className='task-edit__dropdown-button'
                                                value={subFrequencyUnitForMonth} />

                                            <div className="task-edit__dropdown-content">
                                                {
                                                    getAllValuesForSubFrequency(dateStart).map(
                                                        (value, index) => (
                                                            <div
                                                                key={index}
                                                                onClick={() => {
                                                                    frequencyUnit.current = value[0];
                                                                    setSubFrequencyUnitForMonth(value[1]);
                                                                }}
                                                            ><b>{value[1]}</b></div>
                                                        )
                                                    )
                                                }
                                            </div>
                                        </div>
                                        : null
                                }
                            </div>
                        </div>
                    </>
            }

        </div>
    )
}

export default TaskRepetition;
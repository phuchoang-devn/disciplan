import DatePicker from "react-datepicker";
import moment from 'moment';

const TaskTime = (props) => {
    const {
        dateStart,
        setDateStart,
        dateEnd,
        setDateEnd,
        timeStart,
        setTimeStart,
        timeEnd,
        setTimeEnd
    } = props;

    const timeMomentAt23h55 = moment("23h55", "HH:mm");

    return (
        <>
            <div className="task-edit__time">
                <div className="task-edit__time-title"> Start </div>

                <div className="task-edit__time-input">
                    <DatePicker
                        className="task-edit__date-input text-input"
                        selected={new Date(dateStart)}
                        dateFormat="MMMM d, yyyy"
                        onChange={value => setDateStart(moment(value).format("YYYY-MM-DD"))}
                    />

                    <input
                        type="time"
                        className="task-edit__daytime-input text-input"
                        defaultValue={timeStart}
                        onChange={e => setTimeStart(e.target.value + ":00")}
                    ></input>
                </div>
            </div>

            <div className="task-edit__time">
                <div className="task-edit__time-title"> End </div>

                <div className="task-edit__time-input">
                    <DatePicker
                        className="task-edit__date-input text-input"
                        selected={new Date(dateEnd)}
                        dateFormat="MMMM d, yyyy"
                        onChange={value => setDateEnd(moment(value).format("YYYY-MM-DD"))}
                    />

                    <input
                        type="time"
                        className="task-edit__daytime-input text-input"
                        defaultValue={timeEnd}
                        onChange={event => {
                            let isAfter23h55 = moment(event.target.value, "HH:mm").isAfter(timeMomentAt23h55);
                            let time = isAfter23h55 ? "23:55" : event.target.value;
                            setTimeEnd(time + ":00");
                        }}
                    ></input>
                </div>
            </div>
        </>
    )
}

export default TaskTime;
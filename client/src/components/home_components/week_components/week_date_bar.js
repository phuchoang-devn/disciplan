import moment from 'moment';

import { FaCaretLeft } from "react-icons/fa";
import { FaCaretRight } from "react-icons/fa6";

const WeekdayAndRightLeftButtons = (props) => {

    const {
        setPointerToLastWeek,
        setPointerToNextWeek,
        datesInDisplayedWeek
    } = props;

    return (
        <div className="week-date-bar">

            <div className="week-previous-next">
                <div onClick={setPointerToLastWeek}
                    className="week-previous-next__btn">
                    <FaCaretLeft />
                </div>
                <div onClick={setPointerToNextWeek}
                    className="week-previous-next__btn">
                    <FaCaretRight />
                </div>
            </div>

            {
                datesInDisplayedWeek.map(weekday => {
                    let today = moment(new Date());
                    weekday = moment(weekday);

                    let isWeekdayToday = (today.format('MM/DD/YYYY') === weekday.format('MM/DD/YYYY'));

                    return (
                        <div
                            key={weekday.day()}
                            className="week-date-bar__day"
                            style={{
                                backgroundColor: isWeekdayToday ? "#8c0200" : "transparent",
                                color: isWeekdayToday ? "white" : "black"
                            }}>

                            <div className="week-date-bar__weekday noselect">
                                <b>{weekday.format('ddd').toUpperCase()}</b>
                            </div>

                            <div className="week-date-bar__date-num noselect">
                                <b>{weekday.date()}</b>
                            </div>

                        </div>
                    )
                })
            }
        </div>
    )
}

export default WeekdayAndRightLeftButtons
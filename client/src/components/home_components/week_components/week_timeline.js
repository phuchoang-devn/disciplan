import WeekdayColumn from "./weekday_column";
import { HomeWeekContext } from "../home_week";
import { useContext } from "react";

const WeekTimeline = (props) => {

    const { sortedTasksByWeekday } = props;

    const [
        ,
        datesInDisplayedWeek,
    ] = useContext(HomeWeekContext);

    const calcMarginTopForNumberInDayTime = (hourIndex) => {
        let marginTop = 100;

        if (hourIndex === 1)
            marginTop = 110;
        else if (hourIndex === 24)
            marginTop = 90;

        return marginTop + "px";
    }

    const formatHourToDisplay = (hourIndex) => {
        if (hourIndex < 10)
            return "0" + hourIndex + ":00";

        return hourIndex + ":00";
    }

    return (
        <div
            id="week__timeline-container" //ID for Task Movement Logic
            className="week-timeline-container"
        >
            <div
                id="week__daytime-list" //ID for Task Movement Logic
            >
                {
                    [...Array(24)].map((x, index) => {
                        index += 1;

                        let mt = calcMarginTopForNumberInDayTime(index);
                        let hourDisplay = formatHourToDisplay(index);

                        return (
                            <div
                                key={index}
                                className="week-daytime noselect"
                                style={{
                                    marginTop: mt
                                }}>
                                <b>{hourDisplay}</b>
                            </div>
                        )
                    })
                }
            </div>

            {
                [...Array(7)].map((x, index) => (
                    <WeekdayColumn
                        key={index}
                        columnIndex={index}
                        tasks={sortedTasksByWeekday[index]}
                        dateOfColumn={datesInDisplayedWeek[index]}
                    />
                ))
            }

        </div>
    )
}

export default WeekTimeline;
import "../../css/home_week.css"
import { TaskContext } from "../home.js";
import WeekdayAndRightLeftButtons from "./week_components/week_date_bar.js";
import TimezoneAndLongtermBar from "./week_components/week_longterm_task_bar.js";
import WeekTimeline from "./week_components/week_timeline.js";
import { UNDEFINED_MOVING_TASK } from "../../default.js";

import moment from 'moment';

import { useState, useEffect, useContext, createContext, memo } from "react";
import { useOutletContext } from "react-router-dom";

export const HomeWeekContext = createContext();

const HomeWeek = () => {
    const [datesInDisplayedWeek, setDatesInDisplayedWeek] = useState([]);

    const [
        taskRepo,
        , , ,
        isLoading,
        ,
        datePointer
    ] = useContext(TaskContext);

    const [
        setDatePointer,
        setDateOnNavbar,
        checkedPrioritiesForView,
        checkedTagsForView
    ] = useOutletContext();

    const [longtermTasksInWeek, setLongtermTasksInWeek] = useState([]);
    const [sortedTasksByWeekday, setSortedTasksByWeekday] = useState([
        [], [], [], [], [], [], []
    ]);

    const [movingTask, setMovingTask] = useState(UNDEFINED_MOVING_TASK);

    useEffect(() => {

        let datesInPointedWeek = calcDatesInPointedWeek();
        setDatesInDisplayedWeek(datesInPointedWeek);

        let monthYearOfView = formatMonthYearOfView(datesInPointedWeek);
        setDateOnNavbar(monthYearOfView);
    }, [datePointer]);

    const calcDatesInPointedWeek = () => {
        let prevMondayOfPointer = new Date(datePointer);
        prevMondayOfPointer.setDate(datePointer.getDate() - (datePointer.getDay() + 6) % 7);

        let datesInPointedWeek = [prevMondayOfPointer];
        for (let i = 0; i < 6; i++) {
            var nextDay = new Date(datesInPointedWeek[i]);
            nextDay.setDate(nextDay.getDate() + 1);
            datesInPointedWeek.push(nextDay);
        }
        return datesInPointedWeek;
    }

    const formatMonthYearOfView = (datesInPointedWeek) => {
        let monthYearOfMonday = extractMonthAndYearOfDate(datesInPointedWeek[0]);
        let monthYearOfView = monthYearOfMonday;

        if (datesInPointedWeek[0].getMonth() !== datesInPointedWeek[6].getMonth()) {
            let monthYearOfSunday = extractMonthAndYearOfDate(datesInPointedWeek[6]);
            monthYearOfView += (" - " + monthYearOfSunday);
        }
        return monthYearOfView;
    }

    const extractMonthAndYearOfDate = (date) => {
        return date.toLocaleString('default', { month: 'short', year: "numeric" });
    }

    useEffect(() => {
        if (isLoading) return

        let foundTasks = findWeekTasksInRepo();
        setSortedTasksByWeekday(foundTasks);

        let foundLongtermTasks = findLongtermTasksInRepo();
        setLongtermTasksInWeek(foundLongtermTasks);
    }, [datesInDisplayedWeek,
        isLoading,
        checkedPrioritiesForView,
        checkedTagsForView])

    const findWeekTasksInRepo = () => {
        let foundTasksOfWeek = [];

        datesInDisplayedWeek.forEach(date => {
            let foundTasks = taskRepo.current.filter(task =>
                conditionToFindTasksForDate(task, date)
            );

            foundTasksOfWeek.push(foundTasks);
        });

        return foundTasksOfWeek;
    }

    const conditionToFindTasksForDate = (task, date) => {
        let hasSameDate = (task.date_start === moment(date).format('YYYY-MM-DD'));
        let isDateNotNull = (task.time_start !== null);
        let hasCheckedPriorityToView = checkedPrioritiesForView.includes(task.priority);
        let hasNoTagAndNoTagChoosen = (
            checkedTagsForView.includes(-1)
            && task.tags.length === 0
        );
        let hasChoosenTagToView = (task.tags.filter(tag =>
            checkedTagsForView.includes(tag.id)
        ).length !== 0);
        let isNotTheMovingTask = !movingTask.isMoving || (task.id !== movingTask.modifiedTaskToDisplay.id);

        return hasSameDate
            && isDateNotNull
            && hasCheckedPriorityToView
            && (hasNoTagAndNoTagChoosen || hasChoosenTagToView)
            && isNotTheMovingTask;
    }

    const findLongtermTasksInRepo = () => {
        return taskRepo.current.filter(task => (
            moment(task.date_start).isSameOrAfter(datesInDisplayedWeek[0], 'day')
            && moment(task.date_start).isSameOrAfter(datesInDisplayedWeek[6], 'day')
        ));
    }

    const setPointerToLastWeek = () => {
        setDatePointer(oldPointer =>
            new Date(new Date(oldPointer).getTime() - 7 * 24 * 60 * 60 * 1000)
        );
    }

    const setPointerToNextWeek = () => {
        setDatePointer(oldPointer =>
            new Date(new Date(oldPointer).getTime() + 7 * 24 * 60 * 60 * 1000)
        );
    }

    const updateTasksForOneDayInWeek = (indexOfWeekday, updateTasksFunction) => {
        let newSortedTasksInWeek = sortedTasksByWeekday;
        let updatedTasksOfDay = updateTasksFunction(sortedTasksByWeekday[indexOfWeekday]);
        newSortedTasksInWeek[indexOfWeekday] = updatedTasksOfDay;
        setSortedTasksByWeekday(newSortedTasksInWeek);
    }

    return (
        <div className="home-week-container">

            <WeekdayAndRightLeftButtons
                setPointerToLastWeek={setPointerToLastWeek}
                setPointerToNextWeek={setPointerToNextWeek}
                datesInDisplayedWeek={datesInDisplayedWeek}
            />

            <HomeWeekContext.Provider
                value={[
                    updateTasksForOneDayInWeek,
                    datesInDisplayedWeek,
                    movingTask,
                    setMovingTask,
                    setPointerToLastWeek,
                    setPointerToNextWeek,
                    setDatePointer
                ]}>
                <TimezoneAndLongtermBar />

                <WeekTimeline
                    sortedTasksByWeekday={sortedTasksByWeekday}
                />
            </HomeWeekContext.Provider>
        </div>
    )
}

export default memo(HomeWeek);
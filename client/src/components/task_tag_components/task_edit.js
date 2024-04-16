import "../../css/task_edit.css"
import { TaskContext } from "../home.js";
import updateTask from "../../logic/crud/update_task.js"
import addTask from "../../logic/crud/add_task.js"
import TaskName from "./task_edit_components/task_name.js";
import TaskTime from "./task_edit_components/task_time.js";
import TaskDescription from "./task_edit_components/task_desc.js";
import TaskColorAndPriority from "./task_edit_components/task_color_and_priority.js";
import TaskNotification from "./task_edit_components/task_notification.js";
import {
    FormEditType,
    AscendingList,
    TimeUnitForRepetition,
    SubFrequencyUnitForMonth,
    TimeUnitForNotification,
} from "../../default.js";

import moment from 'moment';
import { useState, useContext, useRef, memo } from "react";

import "react-datepicker/dist/react-datepicker.css";
import TaskRepetition from "./task_edit_components/task_repetition.js";
import TaskOptionButtons from "./task_edit_components/task_option_btn.js";
import TaskTag from "./task_edit_components/task_tag.js";
import TaskStatus from "./task_edit_components/task_status.js";


const TaskEdit = (props) => {
    const { taskEdit, tagsRepo } = props;

    const [
        taskRepo,
        repetitionRepo,
        ,
        setTaskEdit,
        isLoading,
        setIsLoading,
        datePointer,
        defaultColorForTaskAndTag,
        updateType,
        setFunctionHandleUpdateType
    ] = useContext(TaskContext);

    const [taskName, setTaskName] = useState(taskEdit.task.name);
    const [description, setDescription] = useState(taskEdit.task.description);
    const [priority, setPriority] = useState(taskEdit.task.priority);
    const [dateStart, setDateStart] = useState(taskEdit.task.date_start);
    const [dateEnd, setDateEnd] = useState(taskEdit.task.date_end);
    const [timeStart, setTimeStart] = useState(taskEdit.task.time_start);
    const [timeEnd, setTimeEnd] = useState(taskEdit.task.time_end);
    const [status, setStatus] = useState(taskEdit.task.status);

    // time-index: 5 and time-unit: day --> time: 5 days
    let newNotificationTime;
    const [notificationTimeIndex, setNotificationTimeIndex] = useState(taskEdit.task.notification);
    const [notificationTimeUnit, setNotificationTimeUnit] = useState(TimeUnitForNotification.MINUTE);

    const [isArchived, setIsArchived] = useState(taskEdit.task.is_archived);
    const [selectedTagIds, setSelectedTagIds] = useState(taskEdit.task.tags.map(tag => tag.id));
    const [taskColor, setTaskColor] = useState(taskEdit.task.color);

    const [hasRepetition, setHasRepetition] = useState(!!taskEdit.task.repetition_group);
    const [repetitionEnd, setRepetitionEnd] = useState(
        !!taskEdit.task.repetition_group ?
            taskEdit.repe.repetition_end
            : taskEdit.task.date_start
    );

    // Number and Unit of Frequency (Example... number: 5 and unit: week)
    const [taskFrequency, setTaskFrequency] = useState(
        !!taskEdit.task.repetition_group ?
            taskEdit.repe.frequency : 1
    );
    // frequency-unit contain main- and sub-frequency.
    // main-frequency-unit: day, week, month, year
    // sub-frequency: order_of_week (3. Monday of month) or last_week_month (last Sunday of month)
    const frequencyUnit = useRef(
        !!taskEdit.task.repetition_group ?
            taskEdit.repe.frequency_unit :
            TimeUnitForRepetition.DAY
    );
    const [mainFrequencyUnit, setMainFrequencyUnit] = useState(
        AscendingList.TIME_UNIT_FOR_REPETITION.includes(frequencyUnit.current) ?
            frequencyUnit.current
            : TimeUnitForRepetition.MONTH
    );
    const [subFrequencyUnitForMonth, setSubFrequencyUnitForMonth] = useState(
        !AscendingList.TIME_UNIT_FOR_REPETITION.includes(frequencyUnit.current) ?
            calcSubFrequencyUnit(frequencyUnit.current, dateStart)
            : calcSubFrequencyUnit(SubFrequencyUnitForMonth.MONTHLY, dateStart)
    );

    function calcSubFrequencyUnit(frequencyUnit, date) {
        date = moment(date, "YYYY-MM-DD");
        let messageToDisplay;

        switch (frequencyUnit) {
            case SubFrequencyUnitForMonth.ORDER_OF_WEEK:
                messageToDisplay = formatOrderOfWeek(date);
                break;

            case SubFrequencyUnitForMonth.LAST_WEEK_MONTH:
                messageToDisplay = formatLastInMonth(date);
                break;

            case SubFrequencyUnitForMonth.MONTHLY:
                messageToDisplay = `Monthly on ${date.date()}.`;
                break;
        }

        return messageToDisplay;
    }

    function formatOrderOfWeek(momentDate) {
        let weekday = momentDate.format("dddd");
        let order = parseInt((momentDate.date() - 1) / 7 + 1);

        if (order === 5)
            return undefined;
        return `Monthly on ${order}. ${weekday}`;
    }

    function formatLastInMonth(momentDate) {
        let numberDatesInMonth = momentDate.daysInMonth();
        let order = parseInt((momentDate.date() - 1) / 7 + 1);

        let isNotTheLast = (order <= 3) || (momentDate.date() + 7 <= numberDatesInMonth);
        if (isNotTheLast)
            return undefined;

        let weekday = momentDate.format("dddd");

        return `Monthly on last ${weekday}`;
    }

    function getAllValuesForSubFrequency(date) {
        date = moment(date, "YYYY-MM-DD");

        let returnValue = [
            [SubFrequencyUnitForMonth.MONTHLY, `Monthly on ${date.date()}.`]
        ];

        let orderInMonth = calcSubFrequencyUnit(SubFrequencyUnitForMonth.ORDER_OF_WEEK, date);
        if (orderInMonth)
            returnValue.push([
                SubFrequencyUnitForMonth.ORDER_OF_WEEK,
                orderInMonth
            ]);

        let lastInMonth = calcSubFrequencyUnit(SubFrequencyUnitForMonth.LAST_WEEK_MONTH, date);
        if (lastInMonth)
            returnValue.push([
                SubFrequencyUnitForMonth.LAST_WEEK_MONTH,
                lastInMonth
            ]);

        return returnValue;
    }

    function convertTimeIntoMinute(timeIndex, timeUnit) {
        return (timeIndex === null) ? timeIndex :
            (timeUnit === TimeUnitForNotification.MINUTE) ? timeIndex :
                (timeUnit === TimeUnitForNotification.HOUR) ? timeIndex * 60 :
                    (timeUnit === TimeUnitForNotification.DAY) ? timeIndex * 60 * 24 :
                        timeIndex * 60 * 24 * 7;
    }

    const handleSubmit = () => {
        newNotificationTime = convertTimeIntoMinute(notificationTimeIndex, notificationTimeUnit);

        let isTaskInfoChanged = checkChangeInTaskInfo();
        let isRepetitionChanged = checkChangeInRepetition();

        if (isUpdateRelevantToExistingTasks(isTaskInfoChanged)) {
            setFunctionHandleUpdateType(() =>
                (updateType) => sendDataToServerAndCloseEdit(isTaskInfoChanged, isRepetitionChanged, updateType)
            );
            return
        }

        sendDataToServerAndCloseEdit(isTaskInfoChanged, isRepetitionChanged, updateType);
    }

    function checkChangeInTaskInfo() {
        var oldTagIds = taskEdit.task.tags.map(tag => tag.id);

        return taskName !== taskEdit.task.name
            || description !== taskEdit.task.description
            || priority !== taskEdit.task.priority
            || dateStart !== taskEdit.task.date_start
            || dateEnd !== taskEdit.task.date_end
            || timeStart !== taskEdit.task.time_start
            || timeEnd !== taskEdit.task.time_end
            || status !== taskEdit.task.status
            || newNotificationTime !== taskEdit.task.notification
            || isArchived !== taskEdit.task.is_archived
            || taskColor !== taskEdit.task.color
            || oldTagIds.filter(id => !selectedTagIds.includes(id)).length !== 0
            || selectedTagIds.filter(id => !oldTagIds.includes(id)).length !== 0;
    }

    function checkChangeInRepetition() {
        if (!!taskEdit.task.repetition_group !== hasRepetition)
            return true;
        else return !!taskEdit.task.repetition_group
            && (taskEdit.repe.repetition_end !== repetitionEnd
                || taskEdit.repe.frequency !== taskFrequency
                || taskEdit.repe.frequency_unit !== frequencyUnit.current);
    }

    function isUpdateRelevantToExistingTasks(isTaskInfoChanged) {
        return (taskEdit.type === FormEditType.UPDATE)
            && isTaskInfoChanged
            && !!taskEdit.task.repetition_group
            && !updateType;
    }

    function createDataToServer(isTaskInfoChanged, isRepetitionChanged) {
        let info = isTaskInfoChanged ?
            {
                name: taskName,
                description: description,
                priority: priority,
                date_start: dateStart,
                time_start: timeStart,
                date_end: dateEnd,
                time_end: timeEnd,
                status: status,
                color: taskColor,
                notification: newNotificationTime,
                is_archived: isArchived,
                tags: selectedTagIds
            }
            : null

        let repetition = isRepetitionChanged ?
            {
                repetition_end: repetitionEnd,
                frequency: taskFrequency,
                frequency_unit: frequencyUnit.current
            }
            : null

        return {
            info: info,
            repetition: repetition
        }
    }

    function sendDataToServerAndCloseEdit(isTaskInfoChanged, isRepetitionChanged, updateType) {
        if (isTaskInfoChanged || isRepetitionChanged) {
            var data = createDataToServer(isTaskInfoChanged, isRepetitionChanged);

            switch (taskEdit.type) {
                case FormEditType.UPDATE:
                    updateTask(taskEdit.task, data, updateType, taskRepo, repetitionRepo, isLoading, setIsLoading, datePointer);
                    break;

                case FormEditType.ADD:
                    addTask(data, taskRepo, repetitionRepo, isLoading, setIsLoading, datePointer);
                    break;
            }
        }

        setTaskEdit(undefined);
    }

    return (
        <div
            className="task-edit-container"
            onMouseDown={() =>
                setTaskEdit(undefined)
            }
            style={{
                background: "radial-gradient(#000000BF, " + taskColor + "BF)"
            }}>

            <div className="task-edit" onMouseDown={e => e.stopPropagation()}>
                <div className="task-edit__header">
                    <div className="task-edit__header__link">
                        <TaskName taskName={taskName} setTaskName={setTaskName} />

                        <TaskTime
                            dateStart={dateStart}
                            setDateStart={setDateStart}
                            dateEnd={dateEnd}
                            setDateEnd={setDateEnd}
                            timeStart={timeStart}
                            setTimeStart={setTimeStart}
                            timeEnd={timeEnd}
                            setTimeEnd={setTimeEnd}
                        />

                        <TaskDescription
                            description={description}
                            setDescription={setDescription}
                        />

                        <TaskColorAndPriority
                            priority={priority}
                            setPriority={setPriority}
                            taskColor={taskColor}
                            setTaskColor={setTaskColor}
                            defaultColorForTaskAndTag={defaultColorForTaskAndTag}
                        />

                        <TaskNotification
                            notificationTimeIndex={notificationTimeIndex}
                            setNotificationTimeIndex={setNotificationTimeIndex}
                            notificationTimeUnit={notificationTimeUnit}
                            setNotificationTimeUnit={setNotificationTimeUnit}
                        />

                        <TaskRepetition
                            dateStart={dateStart}
                            hasRepetition={hasRepetition}
                            setHasRepetition={setHasRepetition}
                            repetitionEnd={repetitionEnd}
                            setRepetitionEnd={setRepetitionEnd}
                            taskFrequency={taskFrequency}
                            setTaskFrequency={setTaskFrequency}
                            frequencyUnit={frequencyUnit}
                            mainFrequencyUnit={mainFrequencyUnit}
                            setMainFrequencyUnit={setMainFrequencyUnit}
                            subFrequencyUnitForMonth={subFrequencyUnitForMonth}
                            setSubFrequencyUnitForMonth={setSubFrequencyUnitForMonth}
                            getAllValuesForSubFrequency={getAllValuesForSubFrequency}
                        />
                    </div >

                    <div className="task-edit__header__right">
                        <TaskOptionButtons
                            setTaskEdit={setTaskEdit}
                            handleSubmit={handleSubmit}
                            isArchived={isArchived}
                            setIsArchived={setIsArchived}
                        />
                    </div>
                </div>

                <div className="task-edit__footer">
                    <TaskTag
                        tagsRepo={tagsRepo}
                        selectedTagIds={selectedTagIds}
                        setSelectedTagIds={setSelectedTagIds}
                    />

                    <TaskStatus
                        status={status}
                        setStatus={setStatus}
                    />
                </div>
            </div >
        </div >
    )
}

export default memo(TaskEdit);
import '../css/home.css';
import env from '../env';
import { Priority } from '../default';
import TaskInfo from "./task_tag_components/task_info";
import TaskEdit from "./task_tag_components/task_edit";
import TagEdit from './task_tag_components/tag_edit';
import HomeNavBar from './home_components/home_nav-bar';
import HomeOptionSidebar from './home_components/home_option_sidebar';
import UpdateForGroupWindow from './task_tag_components/task_group_behavior'
import fetchAllTags from '../logic/crud/fetch_tag';
import fetchDefaultColorForTaskAndTag from '../logic/crud/fetch_default_color';
import fetchTasks from '../logic/crud/fetch_task';

import moment from 'moment';
import { useState, useEffect, useRef, createContext, useMemo, memo } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export const TaskContext = createContext();
export const SidebarContext = createContext();

const Home = (props) => {
    const { loggedIn, email } = props

    const [datePointer, setDatePointer] = useState(new Date());
    const datePointerAtStart = useMemo(() => new Date(), []);
    const datesOfFetchedData = useRef([]);
    const [dateOnNavbar, setDateOnNavbar] = useState("");

    const taskRepo = useRef([]);
    const repetitionRepo = useRef([]);
    const [tagRepo, setTagRepo] = useState([]);
    const defaultColorForTaskAndTag = useRef({});

    const [taskInfo, setTaskInfo] = useState(undefined);
    const [taskEdit, setTaskEdit] = useState(undefined);
    const [tagEdit, setTagEdit] = useState(undefined);

    const [isOptionSidebarOpen, setIsOptionSidebarOpen] = useState(false);
    const [checkedPrioritiesForView, setCheckedPrioritiesForView] = useState([
        Priority.LOW,
        Priority.MEDIUM,
        Priority.HIGH,
        Priority.CRITICAL
    ]);
    const [checkedTagsForView, setCheckedTagsForView] = useState([]);

    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    const [functionHandleCancelUpdate, setFunctionHandleCancelUpdate] = useState(undefined); // contain function to handle Cancel button
    const [functionHandleUpdateType, setFunctionHandleUpdateType] = useState(undefined); // contain function to handle OK button
    const [updateType, setUpdateType] = useState(undefined);

    const user = JSON.parse(localStorage.getItem("disciplan_user"));

    useEffect(() => {
        if (!loggedIn || !user) {
            navigate("/login");
            return
        }

        fetchAllTags(handleSuccessfulFetchTags);
        fetchDefaultColorForTaskAndTag(handleSuccessfulFetchDefaultColors);
    }, [loggedIn])

    const handleSuccessfulFetchTags = (JSONtags) => {
        setTagRepo(JSONtags);

        const VALUE_FOR_NO_TAG = -1;
        var tagIds = [...JSONtags.map(tag => tag.id), VALUE_FOR_NO_TAG];
        setCheckedTagsForView(tagIds);
    }

    const handleSuccessfulFetchDefaultColors = (jsonResponse) => {
        defaultColorForTaskAndTag.current = jsonResponse;
    }

    useEffect(() => {
        if (!loggedIn || !user) return

        let listOfUnfetchedDates = calcUnfetchedDates();

        if (listOfUnfetchedDates.length !== 0) {
            if (!isLoading)
                setIsLoading(true);

            let viewStartAndEnd = calcViewStartAndEnd(listOfUnfetchedDates);
            fetchTasks(
                viewStartAndEnd[0],
                viewStartAndEnd[1],
                listOfUnfetchedDates,
                handleSuccessfulFetchTasks
            );
        }
    }, [datePointer])

    const calcUnfetchedDates = () => {
        let diff = moment(datePointer).diff(moment(datePointerAtStart), 'days');
        let startDateToFetch = ((diff > 0) ? diff + 1 : diff) - env.MAX_VIEW_RADIUS;
        let fetchLength = 2 * env.MAX_VIEW_RADIUS + 1;
        let listOfNeededDates = Array.from({ length: fetchLength }, (_, i) => i + startDateToFetch);
        return listOfNeededDates.filter(x => !datesOfFetchedData.current.includes(x));
    }

    const calcViewStartAndEnd = (listOfUnfetchedDates) => {
        return new Array(
            moment(datePointer).add(Math.min(...listOfUnfetchedDates), 'days'),
            moment(datePointer).add(Math.max(...listOfUnfetchedDates), 'days')
        )
    }

    const handleSuccessfulFetchTasks = async (listOfUnfetchedDates, json) => {
        datesOfFetchedData.current = [...datesOfFetchedData.current, ...listOfUnfetchedDates];

        await updateTaskAndRepetitonRepo(json)
            .then(isFetchFinished => {
                if (isFetchFinished)
                    setIsLoading(!isFetchFinished);
                else throw new Error("Error saving fetched Data");
            })
            .catch(error =>
                console.log(error.message)
            )
    }

    const updateTaskAndRepetitonRepo = async (jsonResponse) => {
        taskRepo.current = taskRepo.current.concat(jsonResponse.tasks);
        repetitionRepo.current = repetitionRepo.current.concat(jsonResponse.repetitions);
        return true;
    }

    const logOut = () => {
        localStorage.removeItem("disciplan_user");
        props.setLoggedIn(false);
        sessionStorage.clear();
        navigate("/login");
    }

    const setViewToToday = () => {
        if (moment(datePointer).format('YYYY-MM-DD') !== moment(new Date()).format('YYYY-MM-DD'))
            setDatePointer(new Date());
    }

    const handlePriortyChechbox = (priority) => {
        if (checkedPrioritiesForView.includes(priority))
            setCheckedPrioritiesForView(data =>
                data.filter(pri => pri !== priority)
            );
        else setCheckedPrioritiesForView(data =>
            [...data, priority]
        );
    }

    return (
        <div className='home-container'>
            {
                typeof functionHandleUpdateType !== "undefined" ?
                    <UpdateForGroupWindow
                        functionHandleCancelUpdate={functionHandleCancelUpdate}
                        setFunctionHandleCancelUpdate={setFunctionHandleCancelUpdate}
                        functionHandleUpdateType={functionHandleUpdateType}
                        setFunctionHandleUpdateType={setFunctionHandleUpdateType}
                        updateType={updateType}
                        setUpdateType={setUpdateType} />
                    : null
            }

            <HomeNavBar
                isOptionSidebarOpen={isOptionSidebarOpen}
                dateOnNavbar={dateOnNavbar}
                isLoading={isLoading}
                email={email}
                handleLogOutButton={logOut}
                handleTodayButton={setViewToToday}
                setIsOptionSidebarOpen={setIsOptionSidebarOpen}
            />

            <SidebarContext.Provider
                value={[
                    setIsOptionSidebarOpen,
                    defaultColorForTaskAndTag,
                    checkedPrioritiesForView,
                    handlePriortyChechbox,
                    checkedTagsForView,
                    setCheckedTagsForView,
                    setTagEdit,
                    tagRepo
                ]}>
                {
                    isOptionSidebarOpen ?
                        <HomeOptionSidebar />
                        : null
                }
            </SidebarContext.Provider>

            {
                tagEdit ?
                    <TagEdit
                        taskRepo={taskRepo}
                        tagEdit={tagEdit}
                        setTagEdit={setTagEdit}
                        tagRepo={tagRepo}
                        setTagRepo={setTagRepo}
                        setCheckedTags={setCheckedTagsForView}
                        isLoading={isLoading}
                        setIsLoading={setIsLoading}
                        defaultColorForTaskAndTag={defaultColorForTaskAndTag} />
                    : null
            }

            <TaskContext.Provider
                value={[
                    taskRepo,
                    repetitionRepo,
                    setTaskInfo,
                    setTaskEdit,
                    isLoading,
                    setIsLoading,
                    datePointer,
                    defaultColorForTaskAndTag,
                    updateType,
                    setFunctionHandleUpdateType,
                    setFunctionHandleCancelUpdate
                ]}>
                {
                    (!!taskInfo) ?
                        <TaskInfo
                            task={taskInfo} />
                        : null
                }
                {
                    taskEdit ?
                        <TaskEdit
                            taskEdit={taskEdit}
                            tagsRepo={tagRepo} />
                        : null
                }

                <Outlet context={[
                    setDatePointer,
                    setDateOnNavbar,
                    checkedPrioritiesForView,
                    checkedTagsForView
                ]} />
            </TaskContext.Provider>
        </div>
    )
}

export default memo(Home);
import NavBarDropDown from "./navbar_components/navbar_dropdown";

import { HiOutlineMenu } from "react-icons/hi";
import { FaHourglassEnd } from "react-icons/fa6";

const HomeNavBar = (props) => {
    const {
        isOptionSidebarOpen, 
        setIsOptionSidebarOpen, 
        dateOnNavbar,
        isLoading,
        email,
        handleLogOutButton,
        handleTodayButton
    } = props;

    return (
        <div className="home-nav">

            <div className='home-nav__start'>
                <div className='home-nav__option-icon'
                    style={{
                        visibility: isOptionSidebarOpen ? "hidden" : "visible"
                    }}
                    onClick={() => setIsOptionSidebarOpen(data => !data)}>
                    <HiOutlineMenu />
                </div>
                <span className='home-nav__brand noselect'>Disciplan</span>
            </div>

            <div className='home-nav__task-button-group'>
                <div className='home-nav__current-view noselect'><b>{dateOnNavbar}</b></div>
                <div type="button"
                    className='home-nav-btn noselect'
                    onClick={handleTodayButton}>
                    <b>Today</b>
                </div>

                <NavBarDropDown
                    btn_name="View"
                    is_email={false}
                    link_content={[
                        ["Day", "/day"],
                        ["Week", "/week"],
                        ["Month", "/month"],
                        ["Year", "/year"],
                        ["Tasks", "/tasks"],
                    ]}
                    btn_content={[]}
                />
            </div>

            <div className='home-nav__system-button-group'>
                <div className='home-nav__loading-icon'
                    style={{
                        visibility: isLoading ? "visible" : "hidden"
                    }}>
                    <FaHourglassEnd />
                </div>
                <NavBarDropDown
                    btn_name={email}
                    is_email={true}
                    link_content={[
                        ["Settings", "1"],
                    ]}
                    btn_content={[
                        ["Logout", handleLogOutButton]
                    ]}
                />
            </div>
        </div>
    )
}

export default HomeNavBar
import SidebarPriority from "./sidebar_components/sidebar_priority_container";
import SidebarTagContainer from "./sidebar_components/sidebar_tag_container";
import { SidebarContext } from "../home";

import { useContext } from "react";
import { FaXmark } from "react-icons/fa6";

const HomeOptionSidebar = () => {

    const [
        setIsOptionSidebarOpen
    ] = useContext(SidebarContext);

    return (
        <div className='home-option'>

            <div className='home-option__start'>
                <div className='home-option__close-icon'
                    onClick={() => setIsOptionSidebarOpen(data => !data)}>
                    <FaXmark />
                </div>
                <span className='home-option__brand noselect'>Disciplan</span>
            </div>

            <div className='home-option__priority-and-tag'>
                <SidebarPriority />
                <SidebarTagContainer />
            </div>
        </div>
    )
}

export default HomeOptionSidebar
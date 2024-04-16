import { Priority } from "../../../default"
import { SidebarContext } from "../../home";

import { useContext } from "react";

const SidebarPriority = () => {

    const [
        ,
        defaultColorForTaskAndTag,
        checkedPrioritiesForView,
        handlePriortyChechbox
    ] = useContext(SidebarContext);

    return (
        <div className='home-option__priority-container'>
            {
                Object.entries(Priority).map(([key, value]) => {
                    let isActive = checkedPrioritiesForView.includes(value);
                    return (
                        <div
                            key={key}
                            className='home-option__priority'
                            style={
                                isActive ?
                                {
                                    backgroundColor: defaultColorForTaskAndTag.current[value]
                                }
                                :
                                {
                                    backgroundColor: "unset",
                                    borderColor: "black"
                                }
                            }
                            onClick={() =>
                                handlePriortyChechbox(value)
                            }>
                            <span className="noselect"><b>{value.charAt(0).toUpperCase() + value.slice(1)}</b></span>
                        </div>
                    )
                }
                )
            }
        </div>
    )
}

export default SidebarPriority
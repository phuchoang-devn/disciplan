import { SidebarContext } from "../../home";
import { FormEditType } from "../../../default";

import { useContext } from "react";
import { PiPlusSquareFill } from "react-icons/pi";
import { FaInfoCircle } from "react-icons/fa";
import { BsFillEyeFill } from "react-icons/bs";
import { BsFillEyeSlashFill } from "react-icons/bs";

const SidebarTagContainer = () => {

    const NO_TAG = -1;

    const [
        ,
        defaultColorForTaskAndTag,
        ,
        ,
        checkedTagsForView,
        setCheckedTagsForView,
        setTagEdit,
        tagRepo
    ] = useContext(SidebarContext);

    const handleOnCheckAction = (targetTagId) => {
        if (checkedTagsForView.includes(targetTagId))
            setCheckedTagsForView(data =>
                data.filter(tagId => tagId !== targetTagId)
            );
        else setCheckedTagsForView(data =>
            [...data, targetTagId]
        );
    }

    return (
        <div className='home-option__tag-container'>
            <div className='home-option__no-tag noselect'
                onClick={() =>
                    handleOnCheckAction(NO_TAG)
                }>
                <div style={{
                    color: checkedTagsForView.includes(NO_TAG) ? "var(--main-color)" : "var(--error-color)"
                }}>
                    <b>No Tag</b>
                </div>

                <div className="home-option__no-tag-icon"
                    style={{
                        color: checkedTagsForView.includes(NO_TAG) ? "var(--main-color)" : "var(--error-color)"
                    }}>
                    {
                        checkedTagsForView.includes(NO_TAG) ?
                            <BsFillEyeFill />
                            : <BsFillEyeSlashFill />
                    }
                </div>
            </div>


            {
                tagRepo.map(tag => {
                    let isActive = checkedTagsForView.includes(tag.id)

                    return (
                        <div
                            key={tag.id}
                            className='home-option__tag'
                            style={
                                isActive ?
                                    {
                                        backgroundColor: tag.color
                                    }
                                    :
                                    {
                                        backgroundColor: "unset",
                                        border: "1px solid black"
                                    }
                            }
                            onClick={() =>
                                handleOnCheckAction(tag.id)
                            }>
                            <span className="home-option__tag-name noselect"><b>#{tag.name}</b></span>

                            <div className='home-option__tag-info-icon'
                                style={
                                    isActive ?
                                        null
                                        : {
                                            color: tag.color
                                        }
                                }
                                onClick={(event) => {
                                    event.stopPropagation();

                                    setTagEdit({
                                        type: FormEditType.UPDATE,
                                        tag: tag
                                    })
                                }}>
                                <FaInfoCircle />
                            </div>
                        </div>
                    )
                })
            }

            <div className='home-option__tag-add noselect'
                onClick={() => setTagEdit({
                    type: "add",
                    tag: {
                        name: "",
                        color: defaultColorForTaskAndTag.current["tag"]
                    }
                })}>
                <div className='home-option__tag-add-icon'><PiPlusSquareFill /></div>
                <span><b>Add New Tag</b></span>
            </div>
        </div>
    )
}

export default SidebarTagContainer
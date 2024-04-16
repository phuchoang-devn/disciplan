import "../../css/tag_edit.css"
import addTag from '../../logic/crud/add_tag.js'
import deleteTag from "../../logic/crud/delete_tag.js";
import updateTag from "../../logic/crud/update_tag.js";
import { FormEditType } from "../../default.js";

import { useState } from "react";

import { FaXmark } from "react-icons/fa6";
import { FaCheck } from "react-icons/fa";
import { AiFillEdit } from "react-icons/ai";
import { GrPowerReset } from "react-icons/gr";
import { IoTrashBinSharp } from "react-icons/io5";


const TagEdit = (props) => {
    const {
        taskRepo,
        tagEdit,
        setTagEdit,
        tagRepo,
        setTagRepo,
        setCheckedTags,
        isLoading,
        setIsLoading,
        defaultColorForTaskAndTag
    } = props;

    const [tagName, setTagName] = useState(tagEdit.tag.name);
    const [tagColor, setTagColor] = useState(tagEdit.tag.color);

    const lastChoosenColor =
        (tagEdit.type === FormEditType.UPDATE) ?
            tagEdit.tag.color
            : defaultColorForTaskAndTag.current["tag"];

    const [errorMessage, setErrorMessage] = useState(undefined);

    const handleAddUpdate = () => {
        if (tagName === "") {
            setErrorMessage("Tag name cannot be empty!");
            return
        } else if (isChangedForUpdate()) {
            setTagEdit(undefined);
            return
        } else if (isAddedNameExist()) {
            setErrorMessage("This name have been used!");
            return
        }

        handleNewData();
        setTagEdit(undefined);
    }

    function isChangedForUpdate() {
        return (tagEdit.type === FormEditType.UPDATE)
            && (tagName === tagEdit.tag.name)
            && (tagColor === tagEdit.tag.color);
    }

    function isAddedNameExist() {
        return (tagEdit.type === FormEditType.ADD)
            && tagRepo.map(tag => tag.name).includes(tagName);
    }

    function handleNewData() {
        var data = {
            name: tagName,
            color: tagColor
        };

        if (tagEdit.type === FormEditType.ADD)
            addTag(data, setTagRepo, isLoading, setIsLoading, setCheckedTags);
        else updateTag(taskRepo, tagEdit.tag.id, data, setTagRepo, isLoading, setIsLoading);
    }

    function handleDelete() {
        deleteTag(taskRepo, tagEdit.tag.id, setTagRepo, isLoading, setIsLoading, setCheckedTags);
        setTagEdit(undefined);
    }

    return (
        <div className="tag-edit-container"
            onMouseDown={() =>
                setTagEdit(undefined)
            }
            style={{
                background: "radial-gradient(#000000BF, " + tagColor + "BF)"
            }}>

            <div
                className="tag-edit"
                onMouseDown={e =>
                    e.stopPropagation()
                }
                style={{
                    border: !!errorMessage ? "0.25rem solid var(--error-color)" : "unset"
                }}>

                <div className="tag-edit__link-section">
                    <div className="tag-edit__start">
                        <div className="tag-edit__start-icon"><AiFillEdit /></div>
                        <div className="tag-edit__name-and-error">
                            <div className="tag-edit__error"><b>{errorMessage}</b></div>
                            <input className="tag-edit__name text-input"
                                type="text"
                                placeholder="Tag Name"
                                defaultValue={tagName}
                                onChange={e => setTagName(e.target.value)} />
                        </div>
                    </div>

                    <div className="tag-edit__color">
                        <input
                            className="tag-edit__color-input"
                            type="color"
                            value={tagColor}
                            onChange={(e) =>
                                setTagColor(e.target.value)
                            } />
                        <div className="tag-edit__color-reset"
                            style={{
                                backgroundColor: lastChoosenColor
                            }}
                            onClick={() => setTagColor(lastChoosenColor)}>
                            <GrPowerReset />
                        </div>
                    </div>
                </div>

                <div className="tag-edit__option">
                    <div onClick={() => setTagEdit(undefined)}><FaXmark /></div>
                    <div className="task-edit__save"
                        onClick={() => handleAddUpdate()}><FaCheck /></div>
                    {
                        tagEdit.type === FormEditType.UPDATE ?
                            <div onClick={() => handleDelete()}><IoTrashBinSharp /></div>
                            : null
                    }
                </div>
            </div>
        </div>
    )
}

export default TagEdit;
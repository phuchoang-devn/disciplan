import { FaTag } from "react-icons/fa";
import { HiMiniXCircle } from "react-icons/hi2";

const TaskTag = (props) => {
    const {
        tagsRepo,
        selectedTagIds,
        setSelectedTagIds,
    } = props;

    return (
        <div className="task-edit__tag-edit">
            <div className="task-edit__tag-icon"><FaTag /></div>

            <div className="task-edit__tag-container">
                {
                    selectedTagIds.map(id => {
                        let tag = tagsRepo.filter(tag => tag.id === id)[0];
                        return (
                            tag ?
                                <div key={id}
                                    className="task-edit__selected-tag noselect"
                                    style={{ backgroundColor: tag.color }}>
                                    <span><b>#{tag.name}</b></span>
                                    <div className="task-edit__remove-tag-btn"
                                        onClick={() => {
                                            let newValue = selectedTagIds.filter(addedId => addedId !== id);
                                            setSelectedTagIds(newValue);
                                        }}><HiMiniXCircle /></div>
                                </div>
                                : null
                        )
                    })
                }
                <div className='task-edit__dropdown'>
                    {
                        (tagsRepo.length > selectedTagIds.length) ?
                            <>
                                <input type="button" className='task-edit__dropdown-button' value="Add Tag" />
                                <div className="task-edit__dropdown-content">
                                    {
                                        tagsRepo.filter(tag => !selectedTagIds.includes(tag.id)).map(
                                            tag => (
                                                <div className="noselect"
                                                    key={tag.id}
                                                    onClick={() => setSelectedTagIds(added => [...added, tag.id])}
                                                    style={{ backgroundColor: tag.color }}
                                                ><b>#{tag.name}</b></div>
                                            )
                                        )
                                    }
                                </div>
                            </>
                            : null
                    }
                </div>
            </div>
        </div>
    )
}

export default TaskTag;
import "../../css/task_group_behavior.css"
import { UpdateType } from '../../default'

import { memo } from "react";

const UpdateForGroupWindow = (props) => {
    const {
        functionHandleCancelUpdate,
        setFunctionHandleCancelUpdate,
        functionHandleUpdateType,
        setFunctionHandleUpdateType,
        updateType,
        setUpdateType
    } = props;

    const RadioElement = (props) => {
        return (
            <div className="update-type__input-container">
                <input
                    type="radio"
                    name="updateType"
                    value={props.updateType}
                    onChange={event => setUpdateType(event.target.value)}
                    checked={updateType === props.updateType} />
                <span>{props.content}</span>
            </div>
        )
    }

    const handleCancel = () => {
        setFunctionHandleUpdateType(undefined);
        setUpdateType(undefined);

        if (!!functionHandleCancelUpdate) {
            functionHandleCancelUpdate();
            setFunctionHandleCancelUpdate(undefined);
        }
    }

    return (
        <div className="update-type-container"
            onMouseDown={event => {
                handleCancel();
                event.stopPropagation();
            }}>
            <div className="update-type-edit"
                onMouseDown={e => e.stopPropagation()}>
                <span className="update-type__title"><b>Apply on...</b></span>

                <div>
                    <RadioElement
                        updateType={UpdateType.ONLY_ONE_TASK}
                        content={"Only This Task"}
                    />
                    <RadioElement
                        updateType={UpdateType.FROM_ONE_TASK}
                        content={"This Task and All behind"}
                    />
                    <RadioElement
                        updateType={UpdateType.ALL_TASKS}
                        content={"All Tasks"}
                    />
                </div>

                <div className="update-type__btn-group">
                    <button
                        className="update-type__btn update-type__btn-x"
                        onClick={() => handleCancel()}>Cancel</button>
                        
                    <button
                        className="update-type__btn update-type__btn-o"
                        onClick={() => {
                            if (!!updateType) {
                                functionHandleUpdateType(updateType);
                                setUpdateType(undefined);
                                setFunctionHandleUpdateType(undefined);
                            }
                        }}>OK</button>
                </div>
            </div>
        </div>
    )
}

export default memo(UpdateForGroupWindow)
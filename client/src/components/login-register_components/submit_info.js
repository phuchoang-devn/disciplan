import '../../css/submit_info.css';

import { IoIosWarning } from "react-icons/io";
import { FaHourglassEnd } from "react-icons/fa6";

const SubmitInfo = (props) => {
    const { submitInfo, isError, setUndefinedToClose } = props;

    return (
        <div className="submit-info-container">
            <div
                className='submit-info-indicator'
                style={{
                    borderColor: isError ? "var(--error-color)" : "var(--secondary-color)"
                }}>
                {
                    isError ?
                        <div
                            className='submit-info-icon'
                            style={{
                                color: "var(--error-color)"
                            }}>
                            <IoIosWarning />
                            <span><b>Upsss!!!</b></span>
                        </div>
                        :
                        <div
                            className='submit-info-icon'
                            style={{
                                color: "var(--main-color)"
                            }}>
                            <FaHourglassEnd />
                            <span><b>Congratulation!!!</b></span>
                        </div>
                }

                <div className='submit-info-message'>{submitInfo}</div>

                <button
                    className='submit-info-close'
                    style={{
                        backgroundColor: isError ? "var(--error-color)" : "var(--main-color)"
                    }}
                    onClick={() => {
                        setUndefinedToClose(undefined);
                    }}><b>Close</b>
                </button>
            </div>
        </div>
    )
}

export default SubmitInfo
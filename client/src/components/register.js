import '../css/login-register.css';
import env from "../env"
import SubmitInfo from './login-register_components/submit_info';

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Register = () => {
    const [newEmail, setNewEmal] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [infoMessage, setInfoMessage] = useState(undefined);
    const [isSuccess, setIsSuccess] = useState(false);

    const navigate = useNavigate();

    const handleRegister = () => {
        setIsSuccess(false);
        setInfoMessage(undefined);

        let isInvalid = checkInvalidInput();
        if (isInvalid) return

        let formData = createFormData();
        register(formData);
    }

    const checkInvalidInput = () => {
        if (newEmail === "" || newPassword === "") {
            setInfoMessage("Ops!!! Your Email or Password is still empty!");
            setIsSuccess(false);
            return true;
        }
        if (confirmPass !== newPassword) {
            setInfoMessage("Ops!!! Failed to comfirm password!");
            setIsSuccess(false);
            return true;
        }
        return false;
    }

    const createFormData = () => {
        let formData = new FormData();
        formData.append("email", newEmail);
        formData.append("password", newPassword);
        return formData;
    }

    async function register(data) {
        await fetch("http://" + env.BACKEND_SERVER + "/users/register", {
            method: 'POST',
            body: data
        })
            .then(response =>
                checkAndHandleResponseStatus(response)
            )
            .then(json => {
                if (json) 
                    throw new Error(json.detail);
            })
            .catch(error =>
                handleError(error)
            );
    }

    const checkAndHandleResponseStatus = (response) => {
        if (response.ok) {
            setInfoMessage("Yeah!!! Your account is already created! \n Now check your Email to active it!");
            setIsSuccess(true);
        } else if (response.status === 400)
            return response.json();
    }

    const handleError = (error) => {
        console.log(error);

        if (error.message === "Failed to fetch")
            setInfoMessage("Wait a second! Server is restarting!");
        else setInfoMessage(error.message);
    }


    return (
        <div className='login-register-container'>

            {
                typeof infoMessage !== "undefined" ?
                    <SubmitInfo
                        submitInfo={infoMessage}
                        isError={!isSuccess}
                        setUndefinedToClose={setInfoMessage}
                    />
                    : null
            }

            <h1 className='login-register-brandname'>Disciplan</h1>

            <div className='register-form'>
                <button
                    onClick={() =>
                        navigate("/login")
                    }><b>Go to Login</b>
                </button>

                <div className='register-separate-line'></div>

                <input
                    type="text"
                    placeholder="Enter Email"
                    onChange={ev => setNewEmal(ev.target.value)}
                    name="email" />
                <input
                    type="password"
                    placeholder="Enter Password"
                    onChange={ev => setNewPassword(ev.target.value)}
                    name="pwd" />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    onChange={ev => setConfirmPass(ev.target.value)}
                    name="conf-pwd" />

                <button
                    id='register-submit'
                    onClick={() =>
                        handleRegister()
                    }><b>Register</b>
                </button>
            </div>
        </div>
    )
}

export default Register
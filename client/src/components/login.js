import '../css/login-register.css';
import env from "../env"
import SubmitInfo from './login-register_components/submit_info';

import { useState } from "react";
import { useNavigate } from "react-router-dom";



const Login = (props) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState(undefined);

    const navigate = useNavigate();

    const handleLogIn = () => {
        setLoginError(undefined);

        let isInvalid = checkInvalidInput();
        if(isInvalid) return

        let formData = createFormData(email, password);
        verifyData(formData);
    }

    const checkInvalidInput = () => {
        if (email === "" || password === "") {
            setLoginError("Your Email or Password is still empty!");
            return true;
        }
        return false;
    }

    const createFormData = () => {
        let formData = new FormData();
        formData.append("username", email);
        formData.append("password", password);
        return formData;
    }

    async function verifyData(data) {
        await fetch("http://" + env.BACKEND_SERVER + "/users/token", {
            method: 'POST',
            body: data
        })
            .then(response =>
                checkResponseStatus(response)
            )
            .then(json =>
                handleOKStatus(json)
            )
            .catch(error =>
                handleError(error)
            );
    }

    const checkResponseStatus = (response) => {
        if (response.ok)
            return response.json();
        else if (response.status === 401)
            throw new Error('Incorrect username or password');
    }

    const handleOKStatus = (json) => {
        let token = json.token_type + " " + json.access_token;
        localStorage.setItem("disciplan_user", JSON.stringify({ email, token }));

        props.setLoggedIn(true);
        props.setEmail(email);

        navigate("/week");
    }

    const handleError = (error) => {
        if (error.message === "Failed to fetch")
            setLoginError("Wait a second! Server is restarting!");
        else setLoginError(error.message);
    }

    return (
        <div className='login-register-container'>

            {
                typeof loginError !== "undefined" ?
                    <SubmitInfo
                        submitInfo={loginError}
                        isError={true}
                        setUndefinedToClose={setLoginError}
                    />
                    : null
            }

            <h1 className='login-register-brandname'>Disciplan</h1>

            <div className='login-form'>
                <input
                    type="text"
                    placeholder="Enter Email"
                    onChange={ev => setEmail(ev.target.value)}
                    name="email" />
                <input
                    type="password"
                    placeholder="Enter Password"
                    onChange={ev => setPassword(ev.target.value)}
                    name="pwd" />
                <button onClick={() => handleLogIn()}><b>Log In</b></button>

                <div className='login-separate-line'></div>

                <button
                    id='login-new-account'
                    onClick={() => {
                        navigate("/register");
                    }}><b>Create new account</b>
                </button>
            </div>
        </div>
    )
}

export default Login
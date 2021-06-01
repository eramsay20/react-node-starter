import React, { useState } from 'react';
import { login } from '../../store/session';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import './LoginForm.css';

function LoginFormPage() {
    const dispatch = useDispatch();

    // try to load user info from state
    const user = useSelector(state => state.session.user);

    // controlled form inputs & error msgs for user login
    const [credential, setCredential] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState([]);

    if (user) return <Redirect to="/" />

    const handleSubmit = (e) => {
        e.preventDefault(); // prevent default on btn click
        setErrors([]); // wipe any existing err msg upon resubmit

        return dispatch(login({ credential, password }))
                .catch(async (res) => {
                    const data = await res.json();
                    if (data && data.errors) setErrors(data.errors);
                });
    }

    const demoLogin = () => {
        let credential = 'demo@user.io';
        let password = 'password';
        dispatch(login({ credential, password }))
    }

    return (
        <div className='login-form-container'>
            <form className='login-form' onSubmit={handleSubmit}>
                <ul>
                    {errors.map((error, idx) => <li key={idx}>{error}</li>)}
                </ul>
                <label className='login-form-label'> Username or Email </label>
                <input className='login-form-item' type="text" required value={credential} onChange={(e) => setCredential(e.target.value)}/>
                <label className='login-form-label'> Password </label>
                <input className='login-form-item' type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                <div className='buffer'></div>
                <button className='login-form-button' type='submit'>Log In</button>
                <button className='login-form-button' onClick={() => demoLogin()} >Demo Login</button>
            </form>
        </div>
    );
}

export default LoginFormPage;
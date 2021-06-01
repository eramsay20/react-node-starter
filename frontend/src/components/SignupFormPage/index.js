import React, { useState } from 'react';
import { signup } from '../../store/session';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect } from 'react-router-dom';
import './SignupForm.css'

function SignupFormPage() {
    const dispatch = useDispatch();

    // load user info from state if exists
    const user = useSelector(state => state.session.user);

    // controlled form inputs & error msgs for user login
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState([]);

    if (user) return <Redirect to="/" />

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === confirmPassword) {
            setErrors([]);
            return dispatch(signup({ email, username, password }))
                .catch(async (res) => {
                    const data = await res.json();
                    if (data && data.errors) setErrors(data.errors);
                });
        }
        return setErrors(['Confirm Password field must be the same as the Password field']);
    };

    return (
        <div className='signup-form-container'>
            <form className='signup-form' onSubmit={handleSubmit}>
                <ul>
                    {errors.map((error, idx) => <li key={idx}>{error}</li>)}
                </ul>
                <label className='signup-form-label'> Email </label>
                <input className='signup-form-item' type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                
                <label className='signup-form-label'> Username </label>
                <input className='signup-form-item' type="text" required value={username} onChange={(e) => setUsername(e.target.value)} />
                
                <label className='signup-form-label'> Password </label>
                <input className='signup-form-item' type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                

                <label className='signup-form-label'> Confirm Password </label>
                <input className='signup-form-item' type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

                <div className='buffer'></div>
                <button className='signup-form-button' type="submit">Sign Up</button>
            </form>
        </div>
    );
}

export default SignupFormPage;
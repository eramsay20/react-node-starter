import React from 'react';
import { NavLink } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/session'
import './Navigation.css';

function Navigation({ isLoaded }) {
    const dispatch = useDispatch();
    const user = useSelector(state => state.session.user);

    const handleLogout = (e) => {
        e.preventDefault();
        dispatch(logout());
    };

    let links;
    if (user) {
        links = (
            <div className='nav-bar-session-links'>
                <NavLink className='nav-link' to={`#`} onClick={handleLogout}>Log Out</NavLink>
            </div>
        );
    } else {
        links = (
            <div className='nav-bar-session-links'>
                <NavLink className='nav-link' to="/login">Log In</NavLink>
                <NavLink className='nav-link' to="/signup">Sign Up</NavLink>
            </div>
        );
    }

    return (
        <div className='nav-bar-container'>
            <div></div>
            <NavLink className='nav-link' exact to="/">Home</NavLink>
            <NavLink className='nav-link' to="#"></NavLink>
            {isLoaded && links}
            <div></div>
        </div>
    );
}

export default Navigation;
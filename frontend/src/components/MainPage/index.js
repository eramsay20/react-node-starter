import React from 'react';
// import { useDispatch, useSelector } from 'react-redux';
import Navigation from '../Navigation/index';
import './MainPage.css';

function MainPage({ isLoaded }) {
    // const dispatch = useDispatch();
    // const user = useSelector(state => state.session.user);

    return (
        <>
            <Navigation isLoaded={isLoaded}/>
            <div className='main-page-container'>
                <div className='banner'>ADD BANNER</div>
                <div className='content'>ADD CONTENT</div>
            </div>
        </>
    );
}

export default MainPage;
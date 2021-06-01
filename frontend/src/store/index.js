import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

const rootReducer = combineReducers({
    //... add reducers here
})

let enhancer;
if (process.env.NODE_ENV === 'production') {
    enhancer = applyMiddleware(thunk); // if prod env, only apply thunk mw
} else { // if dev env...
    const logger = require('redux-logger').default; // init redux logger
    const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose; // store comp enhancer
    enhancer = composeEnhancers(applyMiddleware(thunk, logger)); //pass logger/thunk mw and apply
}

// helper function to build the redux store with defined reducers, state and mw
const configureStore = (preloadedState) => {
    return createStore(rootReducer, preloadedState, enhancer);
};

export default configureStore;
import { csrfFetch } from './csrf';

const SET_USER = 'session/setUser';
const REMOVE_USER = 'session/removeUser';

const setUser = (user) => {
    return { type: SET_USER, payload: user };
};

const removeUser = () => {
    return { type: REMOVE_USER };
};

export const restoreUser = () => async dispatch => {
    const response = await csrfFetch('/api/session');
    const data = await response.json();
    dispatch(setUser(data.user));
    return response;
};

export const login = (submission) => async (dispatch) => {
    const { credential, password } = submission; // deconstruct creds and pw from user obj submission
    const response = await csrfFetch('/api/session', {
        method: 'POST',
        body: JSON.stringify({ credential, password }),
    });
    const data = await response.json(); // return obj with user obj inside
    console.log(data)
    dispatch(setUser(data.user)); // sets inner User obj
    return response; 
};

export const signup = (submission) => async (dispatch) => {
    const { username, email, password } = submission;
    const response = await csrfFetch("/api/users", {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
    });
    const data = await response.json();
    console.log(data)
    dispatch(setUser(data.user));
    return response;
};

export const logout = () => async (dispatch) => {
    const response = await csrfFetch('/api/session', {
        method: 'DELETE',
    });
    dispatch(removeUser());
    return response;
};

const initialState = { user: null }; // default user session == null

const sessionReducer = (state = initialState, action) => {
    let newState;
    switch (action.type) {
        case SET_USER:
            newState = {...state };
            newState.user = action.payload;
            return newState;
        case REMOVE_USER:
            newState = {...state}; 
            newState.user = null;
            return newState;
        default:
            return state;
    }
};

export default sessionReducer;
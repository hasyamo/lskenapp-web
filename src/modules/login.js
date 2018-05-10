import axios from 'axios';
import { routerActions } from 'react-router-redux'
import { baseURL } from '../config'

const client = axios.create({
    mode: 'cros'
});

/* ActionType Constants */
const LOGIN_REQUEST = 'LOGIN_REQUEST';
const LOGIN_FAILURE = 'LOGIN_FAILURE';
const LOGIN_SUCCESS = 'LOGIN_SUCCESS';

/* Action Creator */
export const loginActions = {
    loginRequest : (loginId) => ({ type: LOGIN_REQUEST, loginId: loginId }),
    loginFailure : (msg)     => ({ type: LOGIN_FAILURE, errorMessage: msg }),
    loginSuccess : (loginId, json) => ({ type: LOGIN_SUCCESS, data: json }),
}

loginActions.login = (userId) => (dispatch) => {

    if (userId.length === 0) {
        dispatch(loginActions.loginFailure("ユーザIDを入力してください。"));
        return undefined;
    }
    // 最初のdispatch: API呼び出しが開始されたと知らせる
    dispatch(loginActions.loginRequest(userId));

    // Thunkミドルウェアから呼び出された関数は、dispatchメソッドのreturn値として値をreturnできる。
    /*
    return fetch(`${baseURL}/v1.0/users/${userId}`, {
        mode: 'cros',
    })
    .then(response => {
        return response.json()
    })
    */
    return client.get(`${baseURL}/v1.0/users/${userId}`)
    .then(response => {
        return response.data;
    })
    .then(json => {
        // 何度でもdispatchできる。
        // API呼び出しの結果としてアプリケーションの状態が更新される。
        if (json.userName) {
            dispatch(loginActions.loginSuccess(userId, json));
            dispatch(routerActions.push("/messages"));
        } else {
            dispatch(loginActions.loginFailure('ユーザIDに誤りがあります。'));
        }
    })
    .catch(error => {
        // ネットワーク呼び出し中に起きたエラーのキャッチもできる。
        dispatch(loginActions.loginFailure('ユーザIDに誤りがあります。'));
    })
};


/* Reducers */
const initialState = {
    isFetching: false,
    didInvalidate:false,
    errorMessage: '',
};
export const loginReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOGIN_REQUEST:
            return Object.assign({}, initialState, {
                isFetching: true
            });
        case LOGIN_FAILURE:
            return Object.assign({}, initialState, {
                isFetching: false,
                errorMessage: action.errorMessage
            });
        case LOGIN_SUCCESS:
            return Object.assign({}, initialState, {
                isFetching: false,
                data: action.data
            });
        default:
            return state;
    }
}


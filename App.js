
import React, { Component } from 'react';
import { Provider } from 'react-redux';

import Home from './app/home' //Import the app/index.js file
import store from './app/store'; //Import the store

export default class App extends Component {
    render() {
        return (
            <Provider store={store}>
                <Home />
            </Provider>
        );
    }
}
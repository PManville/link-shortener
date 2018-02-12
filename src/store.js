import { createStore, combineReducers, applyMiddleware } from 'redux';
import { createLogger } from 'redux-logger';
import axios from 'axios';

const getresult = () => {
	var newState = [];
	try {
		var result = localStorage.getItem('urls');
		if (result === null ){
			result = newState;
			localStorage.setItem('urls', JSON.stringify(result));
		}
		return JSON.parse(result);
	}
	catch(err){
		return newState;
	}
}

export const urlInitialState = {
	urls: getresult(),
	lastValues: []
};

export const uiInitialState = {
	isNew: false,
	isLoading: false,
	shortyUrl: "http://localhost:8080/link/",
	hoverText: null,
	inputText: null,
	newUrl: {
		shortcode: '',
		originalurl: ''
	},
	lastValues: []
};


const urlReducer = (state = urlInitialState, action) => {
	switch(action.type){
		case "ADDURL":
			state = {
				...state,
				urls: action.payload,
				lastValues: [...state.lastValues, action.payload]
			}
			break;
		case "CLEARHISTORY":
			state = {
				...state,
				urls: [],
				lastValues: [...state.lastValues, action.payload]
			}
	}
	return state;
};

const uiReducer = (state = uiInitialState, action) => {
	switch(action.type){
		case "LOADING":
			state = {
				...state,
				isLoading: action.payload,
				lastValues: [...state.lastValues, action.payload]
			}
			break;
		case "NEWEFFECT":
			state = {
				...state,
				isNew: action.payload,
				lastValues: [...state.lastValues, action.payload]
			}
			break;
		case "CHANGEHOVERTEXT":
			state = {
				...state,
				hoverText: action.payload,
				lastValues: [...state.lastValues, action.payload]
			}
			break;
		case "CHANGEINPUTTEXT":
			state = {
				...state,
				inputText: action.payload,
				lastValues: [...state.lastValues, action.payload]
			}
			break;
		case "CHANGENEWURL":
			state = {
				...state,
				newUrl: action.payload,
				lastValues: [...state.lastValues, action.payload]
			}
			break;
	}
	return state;
}

const store = createStore(
	combineReducers({urlReducer, uiReducer}),
	{}
);

store.subscribe(() => {
	console.log("State Changed!", store.getState())
})

export default store;
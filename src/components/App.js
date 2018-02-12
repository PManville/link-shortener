import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import LinkItem from './LinkItem';

class App extends React.Component {


	componentDidMount() {
		setInterval(
			() => {
				// Gets the latest info for each URL every minute
				for(let i = 0; i < this.props.urlReducer.urls.length ; i++){
					this.apiGet(this.props.urlReducer.urls[i], i, false);
				}
			}, 6000
		);
	}
		

	compareDates(timeStamp) {
		// Checks how many seconds difference between now and timeStamp and returns the result
	    var outputNumber, outputText, plural = '', now = new Date(),
	     secondsPast = (now.getTime() - timeStamp.getTime() ) / 1000;
	    if(secondsPast < 3600){
	        outputNumber = parseInt(secondsPast/60);
	        outputText = ' minute';
	    }
	    else if(secondsPast < 86400){
	        outputNumber = parseInt(secondsPast/3600);
	        outputText = ' hour';
	    }
	    else if(secondsPast < 2592000){
	        outputNumber = parseInt(secondsPast/86400);
	        outputText = ' day';
	    }
	    else if(secondsPast < 31104000){
	        outputNumber = parseInt(secondsPast/2592000);
	        outputText = ' month';
	    }
	    else if(secondsPast >= 31104000){
	        outputNumber = parseInt(secondsPast/31104000);
	        outputText = ' year';
	    }
	    if (outputNumber != 1){
	    	plural = 's';
	    }
	    // e.g "10" + " day" + "s" + " ago";
	    return outputNumber + outputText + plural + " ago";
	}		    


	apiGet(thisUrl, index, isNew){
		// Gets the stats from each shortcode
		var time, visits, startDate, lastVisited, difference, offset = 0;
		this.props.loading(true);
		fetch(this.props.uiReducer.shortyUrl + thisUrl.shortcode + "/info", {
			method: "GET"
		})
		.then(response => {
			return response.json()
		})
		.then(data => {
			this.props.loading(false);
			visits = data.redirectCount;
			startDate = data.startDate;
			try{
				
				if (data.lastSeenDate){
					// Calculate how old the lastSeenDate is
					lastVisited = this.compareDates(new Date(data.lastSeenDate));
				}
			}catch(err){
			}
		})
		.then(data => {
			// Creates dummy URLs object
			var urlsAll = [ ...this.props.urlReducer.urls ];
			var urlNew = {
						shortcode: thisUrl.shortcode,
						originalurl: thisUrl.originalurl,
						visits: visits,
						startDate: startDate,
						lastVisited: lastVisited
					};
			console.log(urlNew);
			// Insert this URL into dummy URLs object, if it already exists replace old URL
			urlsAll[index] = urlNew;
			// Passes dummy URLs object to the store
			this.props.addUrl(urlsAll);
			try {
				localStorage.setItem('urls', JSON.stringify(this.props.urlReducer.urls))
			}catch(err){
				console.log("Storage Failed")
			}
			if(isNew){
				this.props.newEffect(true);
				setTimeout(() => {
					this.props.newEffect(false);
				}, 2400);
			}
		})
		.catch(() => console.log("GET /stats failed"))
	}


	apiPost(){
		// Posts data from inputText to create new URL
		fetch(this.props.uiReducer.shortyUrl + "shorten", {
			method: "POST",
			headers: {
				'content-type': 'application/json'
			},
			body: `{
			  "url": "${this.props.uiReducer.inputText}"
			}`
		})
		.then(response => { 
			return response.json()
		})
		.then(data => {
			this.props.changeNewUrl({
					shortcode: data.shortcode,
					originalurl: this.props.uiReducer.inputText
				});
			this.props.changeInputText(null);
			this.apiGet(this.props.uiReducer.newUrl, this.props.urlReducer.urls.length, true);
		})
		.catch(() => console.log("POST failed"));
	}


	valueChange(value){
		// Updates inputText when URL is typed into input box
		this.props.changeInputText(value)
	}


	clearHistory(){
		// Clear links from store & localstorage;
		this.props.clearHistory();
		localStorage.removeItem('urls');
	}


	submitEffect(){
		// Makes submit button red if there is text in the URL input box
		try {
			if(this.props.uiReducer.inputText.length > 0){
				return ' active';
			}
		}catch(err){}
		return '';
	}

	isLoading(){
		try {
			if(this.props.uiReducer.isLoading){
				return ' loading';
			}
		}catch(err){}
		return '';
	}

	getClearHistory(){
		if(this.props.urlReducer.urls.length === 0){
			return ' hidden';
		}
		return '';
	}

	render() {
		return (
			<div className="root-inner">
				<input key={0} id="copyBox"></input>
				<section key={1} className="header-section">
					<h1>Shortener</h1>
				</section>
				<section key={2} className={"button-section" + this.isLoading()}>
					<input placeholder="Enter your URL here" value={this.props.uiReducer.inputText || ''} onChange={(e) => this.valueChange(e.target.value)}></input>
					<input type="submit" value="Shorten" className={"button" + this.submitEffect()} onClick={() => this.apiPost()}></input>
				</section>
				<section key={3} className={"info-section" + this.getClearHistory()}>
					<div className="col-1">Link</div>
					<div className="col-2">Visits</div>
					<div className="col-3">Last visited</div>
				</section>
				<section key={4} className="link-section">
					{this.props.urlReducer.urls.map((url, i) => {
						return <LinkItem key={i} i={this.props.urlReducer.urls.length - i - 1} />
					})}
				</section>
				<section key={5} className={"previous-section" + this.getClearHistory()}>
					<div className="clear-history" onClick={() => this.clearHistory()}>Clear history</div>
				</section>	
			</div>
		)
	}
}

			

const mapStateToProps = (state) => {
	return {
		urlReducer: state.urlReducer,
		uiReducer: state.uiReducer
	}
}

const mapDispatchToProps = (dispatch) => {
	return {
		addUrl: (amount) => {
			dispatch({
				type: "ADDURL",
				payload: amount
			})
		},
		clearHistory: () => {
			dispatch({
				type: "CLEARHISTORY"
			})
		},
		loading: (amount) => {
			dispatch({
				type: "LOADING",
				payload: amount
			})
		},
		newEffect: (amount) => {
			dispatch({
				type: "NEWEFFECT",
				payload: amount
			})
		},
		changeInputText: (amount) => {
			dispatch({
				type: "CHANGEINPUTTEXT",
				payload: amount
			})
		},
		changeNewUrl: (amount) => {
			dispatch({
				type: "CHANGENEWURL",
				payload: amount
			})
		}
	}
}

export default connect(mapStateToProps, mapDispatchToProps)(App);



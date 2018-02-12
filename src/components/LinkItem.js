import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';



class LinkItem extends React.Component {


	copyLink(i){
		// Copy link text to clipboard using dummy input element
		document.getElementById("copyBox").value = this.props.uiReducer.shortyUrl + this.props.urlReducer.urls[i].shortcode;
		document.getElementById("copyBox").select();
		document.execCommand("Copy");
		this.props.changeHoverText(i);
		setTimeout(() => {
			this.props.changeHoverText(null);
		}, 1200)
	}


	newSection(thisKey){
		// Make red effect appear on section
		if(this.props.uiReducer.isNew && thisKey == 1){
			return ' new';
		}
		return '';
	};


	getOriginalurl(i){
		// Truncates originalurl if it's above 50 characters
		var link = this.props.urlReducer.urls[i].originalurl;
		if(link.length > 50){
			return link.substr(0, 50) + '...';
		}
		return link;
	};


	hoverText(i){
		// Changes text temporarily to read 'Copied' when a link is click
		if (this.props.uiReducer.hoverText == i){
			return 'Copied!';
		}
		return 'Click to copy';
	};


	render(){
		var thisKey = (this.props.urlReducer.urls.length - this.props.i);
		return (
			<div key={thisKey - 1} className={"link-item" + this.newSection(thisKey)}>
				<div className="col-1 links">
					<div  onClick={() => this.copyLink(this.props.i)} className="top-section">
						<div className="short-link">{this.props.uiReducer.shortyUrl}<span>{this.props.urlReducer.urls[this.props.i].shortcode}</span></div>
						<div className="hover-text">{this.hoverText(this.props.i)}</div>
					</div>
					<div className="long-link">{this.getOriginalurl(this.props.i)}</div>
				</div>
				<div className="col-2 visits">{this.props.urlReducer.urls[this.props.i].visits}</div>
				<div className="col-3 last-visited">{this.props.urlReducer.urls[this.props.i].lastVisited}</div>
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
		changeHoverText: (amount) => {
			dispatch({
				type: "CHANGEHOVERTEXT",
				payload: amount
			})
		}
	}
}


LinkItem.propTypes = {
	i: PropTypes.number,
}


export default connect(mapStateToProps, mapDispatchToProps)(LinkItem);
const Alexa = require('alexa-sdk');
const GlobalText = require('./globalText');
const Statements = require('./statements');

const states = {
	introMode : 'introMode',
	gameMode : 'gameMode',
	resolutionMode : 'resolutionMode'
};

const APP_ID = "amzn1.ask.skill.a2357136-45d2-4764-b3b0-cbe0703479b6";
const permissionArray = ['read::alexa:device:all:address'];

//TODO: For a new user this.attributes['paths'] should equal this and then all mutations should occur on this.attributes['paths'];
const paths = ['Bob May', 'Christy Benner', 'Tyler Quick'];

const newSessionHandlers = {

     // This will either start a new game if there is no optionId or take you to where you left off
    'NewSession': function() {
        if(!this.attributes['returningUser']){
        	this.attributes['returningUser'] = true;
        	this.handler.state = states.introMode;
        	this.emitWithState('Welcome'); 
        } else {
        	this.handler.state = states.introMode;
        	this.emitWithState('ContinueGame');
        }
        
    },

    'LaunchRequest': function(){
    	this.emit('NewSession');
    }
};


const introHandler = Alexa.CreateStateHandler(states.introMode, {

	/*
		TODO: Not sure why this is needed in this section but not deleting until make sure it's not needed.
	 	'NewSession': function () {
        this.emit('NewSession'); 
    },*/

    /* TODO: Need graceful handling of these for audio and actual handling for pause and resume.
    AMAZON.CancelIntent
	AMAZON.LoopOffIntent
	AMAZON.LoopOnIntent
	AMAZON.NextIntent
	AMAZON.PreviousIntent
	AMAZON.RepeatIntent
	AMAZON.ShuffleOffIntent
	AMAZON.ShuffleOnIntent
	AMAZON.StartOverIntent
	*/

    'ContinueGame' : function(){
    	this.emit(':ask', GlobalText.returnWelcomeText, GlobalText.returnWelcomeFallBack);
    },

    'ContinueIntent' :function(){
    	this.handler.state = states.gameMode;
    	this.emitWithState('ContinueGame');
    },

    'LaunchRequest': function(){
    	this.handler.state = states.introMode;
    	this.emit('NewSession');
    },

    'Welcome' : function(){
    	this.attributes['paths'] = paths;
		this.attributes['optionId'] = 0;
    	this.emit(':ask', GlobalText.newWelcomeText, GlobalText.newWelcomeRepromptText);
    },

    'AMAZON.StartOverIntent': function(){
    	this.attributes['paths'] = paths;
		this.attributes['optionId'] = 0;
    	this.handler.state = states.gameMode;
        this.emitWithState('StartGame');
    },

    'AMAZON.ResumeIntent' : function(){

    },

    'AMAZON.PauseIntent' : function(){

    },

	'AMAZON.YesIntent': function() {
		if(this.attributes['helpAsk'] === 1){
			this.attributes['helpAsk'] = 0;
			this.emit(':ask', GlobalText.helpText, GlobalText.helpTextRepromptText);
		} else {
			this.handler.state = states.gameMode;
        	this.emitWithState('StartGame');
		}
    },

    'AMAZON.RepeatIntent' : function(){
    	this.emit(':ask', GlobalText.helpText, GlobalText.helpTextRepromptText);
    },

    'BeginIntent' : function(){
    	this.handler.state = states.gameMode;
       	this.emitWithState('StartGame');
    },

    'InstructionsIntent' : function(){
    	this.emit(':ask', GlobalText.helpText, GlobalText.helpTextRepromptText);
    },

	'AMAZON.NoIntent': function() {
		if(!this.attributes['refused'] || this.attributes['refused'] === 0){
			this.attributes['refused'] = 1;
			this.attributes['helpAsk'] = 1;
			this.emit(':ask', GlobalText.suggestText, GlobalText.suggestRepromptText);
		} else {
			this.response.speak(GlobalText.goodbyeText);
        	this.emit(':responseReady');
		}
    }, 

    'AMAZON.StopIntent':function(){
    	this.response.speak(GlobalText.goodbyeText);
        this.emit(':responseReady');
    },

    'Amazon.CancelIntent':function(){
    	this.response.speak(GlobalText.goodbyeText);
        this.emit(':responseReady');
    },

	'AgainIntent' : function(){
    	this.emit(':ask', GlobalText.helpText, GlobalText.helpTextRepromptText);
	},

	'GoIntent' : function(){
		this.handler.state = states.gameMode;
       	this.emitWithState('StartGame');
	}, 

	'AMAZON.HelpIntent' : function(){
    	this.emit(':ask', GlobalText.helpText, GlobalText.helpTextRepromptText);
	},

	'SessionEndedRequest': function () {
        this.emit(':saveState', true);
    },

    'Unhandled': function() {
        this.emit(':ask', GlobalText.unhandled, GlobalText.unhandled);
    }

});

const gameHandler = Alexa.CreateStateHandler(states.gameMode, {

	'StartGame' : function(){
       	this.attributes['optionId'] = 'text0';
        this.emit(':ask', Statements.TextOptions['text0'], Statements.TextOptions['repromptText0']);
	},

	'ContinueGame' : function(){
		this.emit(':ask', Statements.TextOptions[this.attributes['optionId']], Statements.TextOptions[this.attributes['optionId']]);
	},

	'LaunchRequest': function(){
    	this.emit('NewSession');
    },

	'OptionOneIntent' : function(){
		var statement = '';
		switch(this.attributes['optionId']){
			case 'text0':
				this.attributes['optionId'] = 'text1';
				this.emit(':ask', Statements.TextOptions['text1'], Statements.TextOptions['repromptText1']);
				break;
			case 'text1':
				this.attributes['optionId'] = 'text3';
				this.emit(':ask', Statements.TextOptions['text3'], Statements.TextOptions['repromptText3']);
				break;
			case 'text2':
				this.attributes['optionId'] = 'text3';
				this.emit(':ask', Statements.TextOptions['text3'], Statements.TextOptions['repromptText3']);
				break;
			case 'text3':
				this.attributes['optionId'] = 'text0';
				this.handler.state = states.introMode;
				this.emit(':tell', Statements.TextOptions['text7']);
				break;
			case 'text4a':
				this.attributes['optionId'] = 'text5';
				this.emit(':ask', Statements.TextOptions['text5'], Statements.TextOptions['repromptText4a']);
				break;
			case 'text4b':
				this.attributes['optionId'] = 'text5';
				this.emit(':ask', Statements.TextOptions['text5'], Statements.TextOptions['repromptText5']);
				break;
			case 'text5':
				this.attributes['optionId'] = 'text0';
				this.handler.state = states.introMode;
				this.emit(':tell', Statements.TextOptions['text7']);
				break;
			case 'text9':
				this.attributes['optionId'] = 'text12';
				this.emit(':ask', Statements.TextOptions['text12'], Statements.TextOptions['repromptText12']);
				break;
			case 'text10':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text35'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text11':
				this.attributes['optionId'] = 'text56';
				this.emit(':ask', Statements.TextOptions['text56'], Statements.TextOptions['repromptText56']);
				break;
			case 'text12':
				this.attributes['optionId'] = 'text14';
				this.emit(':ask', Statements.TextOptions['text14'], Statements.TextOptions['repromptText14']);
				break;
			case 'text13':
				this.attributes['optionId'] = 'text15';
				this.emit(':ask', Statements.TextOptions['text15'], Statements.TextOptions['repromptText15']);
				break;
			case 'text14':
				this.attributes['optionId'] = 'text16';
				this.emit(':ask', Statements.TextOptions['text16'], Statements.TextOptions['repromptText16']);
				break;
			case 'text14b':
				this.attributes['optionId'] = 'text16b';
				this.emit(':ask', Statements.TextOptions['text16b'], Statements.TextOptions['repromptText16b']);
				break;
			case 'text15':
				this.attributes['optionId'] = 'text19';
				this.emit(':ask', Statements.TextOptions['text19'], Statements.TextOptions['repromptText19']);
				break;
			case 'text15b':
				this.attributes['optionId'] = 'text19b';
				this.emit(':ask', Statements.TextOptions['text19b'], Statements.TextOptions['repromptText19b']);
				break;
			case 'text16':
				this.attributes['optionId'] = 'text18';
				this.emit(':ask', Statements.TextOptions['text8'], Statements.TextOptions['repromptText18']);
				break;
			case 'text16b':
				this.attributes['optionId'] = 'text18';
				this.emit(':ask', Statements.TextOptions['text18'], Statements.TextOptions['repromptText18']);
				break;
			case 'text17':
				this.attributes['optionId'] = 'text18';
				this.emit(':ask', Statements.TextOptions['text18'], Statements.TextOptions['repromptText18']);
				break;
			case 'text17b':
				this.attributes['optionId'] = 'text18';
				this.emit(':ask', Statements.TextOptions['text18'], Statements.TextOptions['repromptText18']);
				break;
			case 'text18': 
				this.attributes['optionId'] = 'text21';
				this.emit(':ask', Statements.TextOptions['text21'], Statements.TextOptions['repromptText21']);
				break;
			case 'text19':
				this.attributes['optionId'] = 'text18';
				this.emit(':ask', Statements.TextOptions['text18'], Statements.TextOptions['repromptText0']);
				break;
			case 'text19b':
				this.attributes['optionId'] = 'text18';
				this.emit(':ask', Statements.TextOptions['text18'], Statements.TextOptions['repromptText18']);
				break;
			case 'text20':
				this.attributes['optionId'] = 'text18';
				this.emit(':ask', Statements.TextOptions['text18'], Statements.TextOptions['repromptText18']);
				break;
			case 'text20b':
				this.attributes['optionId'] = 'text18';
				this.emit(':ask', Statements.TextOptions['text18'], Statements.TextOptions['repromptText18']);
				break;
			case 'text21':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text23'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text22':
				this.attributes['optionId'] = 'text29';
				this.emit(':ask', Statements.TextOptions['text29'], Statements.TextOptions['repromptText29']);
				break;
			case 'text24':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text25'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text26':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text27'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text29':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text33'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text30':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text31'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text36':
				this.attributes['optionId'] = 'text37';
				this.emit(':ask', Statements.TextOptions['text37'], Statements.TextOptions['repromptText37']);
				break;
			case 'text37':
				this.attributes['optionId'] = 'text43';
				this.emit(':ask', Statements.TextOptions['text43'], Statements.TextOptions['repromptText43']);
				break;
			case 'text38':
				this.attributes['optionId'] = 'text39';
				this.emit(':ask', Statements.TextOptions['text39'], Statements.TextOptions['repromptText39']);
				break;
			case 'text39':
				this.attributes['optionId'] = 'text41b';
				this.emit(':ask', Statements.TextOptions['text41b'], Statements.TextOptions['repromptText41b']);
				break;
			case 'text40':
				this.attributes['optionId'] = 'text41';
				this.emit(':ask', Statements.TextOptions['text41'], Statements.TextOptions['repromptText41']);
				break;
			case 'text41':
				this.attributes['optionId'] = 'text48';
				this.emit(':ask', Statements.TextOptions['text48'], Statements.TextOptions['repromptText48']);
				break;
			case 'text41b':
				this.attributes['optionId'] = 'text48';
				this.emit(':ask', Statements.TextOptions['text48'], Statements.TextOptions['repromptText48']);
				break;
			case 'text42':
				this.attributes['optionId'] = 'text48';
				this.emit(':ask', Statements.TextOptions['text48'], Statements.TextOptions['repromptText48']);
				break;
			case 'text42b':
				this.attributes['optionId'] = 'text48';
				this.emit(':ask', Statements.TextOptions['text48'], Statements.TextOptions['repromptText48']);
				break;
			case 'text43':
				this.attributes['optionId'] = 'text45';
				this.emit(':ask', Statements.TextOptions['text45'], Statements.TextOptions['repromptText45']);
				break;
			case 'text44':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text46'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text45':
				this.attributes['optionId'] = 'text42b';
				this.emit(':ask', Statements.TextOptions['text42b'], Statements.TextOptions['repromptText42b']);
				break;
			case 'text45b':
				this.attributes['optionId'] = text47a;
				this.emit(':ask', Statements.TextOptions['text47a'], Statements.TextOptions['repromptText47a']);
				break;
			case 'text47a' :
				this.attributes['optionId'] = 'text48';
				this.emit(':ask', Statements.TextOptions['text48'], Statements.TextOptions['repromptText48']);
				break;
			case 'text47b' :
				this.attributes['optionId'] = 'text48';
				this.emit(':ask', Statements.TextOptions['text48'], Statements.TextOptions['repromptText48']);
				break;
			case 'text48':
				this.attributes['optionId'] = 'text49a';
				this.emit(':ask', Statements.TextOptions['text49a'], Statements.TextOptions['repromptText49a']);
				break;
			case 'text49a':
				this.attributes['optionId'] ='text50';
				this.emit(':ask', Statements.TextOptions['text50'], Statements.TextOptions['repromptText50']);
				break;
			case 'text49b':
				this.attributes['optionId'] ='text50';
				this.emit(':ask', Statements.TextOptions['text50'], Statements.TextOptions['repromptText50']);
				break;
			case 'text50':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text54'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text51':
				this.attributes['optionId'] = 'text52';
				this.emit(':ask', Statements.TextOptions['text52'], Statements.TextOptions['repromptText52']);
				break;
			case 'text52':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text54'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text56':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text62'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text57':
				this.attributes['optionId'] = 'text58';
				this.emit(':ask', Statements.TextOptions['text58'], Statements.TextOptions['repromptText58']);
				break;
			case 'text58':
				this.attributes['optionId'] = 'text63';
				this.emit(':ask', Statements.TextOptions['text63'], Statements.TextOptions['repromptText63']);
				break;
			case 'text59':
				this.attributes['optionId'] ='text67';
				this.emit(':ask', Statements.TextOptions['text67'], Statements.TextOptions['repromptText67']);
				break;
			case 'text60':
				this.attributes['optionId'] ='text59';
				this.emit(':ask', Statements.TextOptions['text59'], Statements.TextOptions['repromptText59']);
				break;
			case 'text61':
				this.attributes['optionId'] = 'text57';
				this.emit(':ask', Statements.TextOptions['text57'], Statements.TextOptions['repromptText57']);
				break;
			case 'text63':
				this.attributes['optionId'] = 'text65';
				this.emit(':ask', Statements.TextOptions['text65'], Statements.TextOptions['repromptText65']);
				break;
			case 'text64':
				this.attributes['optionId'] = 'text65';
				this.emit(':ask', Statements.TextOptions['text65'], Statements.TextOptions['repromptText65']);
				break;
			case 'text65': 
				this.attributes['optionId'] = 'text72';
				this.emit(':ask', Statements.TextOptions['text72'], Statements.TextOptions['repromptText72']);
				break;
			case 'text66':
				this.attributes['optionId'] = 'text81';
				this.emit(':ask', Statements.TextOptions['text81'], Statements.TextOptions['repromptText81']);
				break;
			case 'text67':
				this.attributes['optionId'] = 'text65';
				this.emit(':ask', Statements.TextOptions['text65'], Statements.TextOptions['repromptText65']);
				break;
			case 'text68':
				this.attributes['optionId'] = 'text65';
				this.emit(':ask', Statements.TextOptions['text65'], Statements.TextOptions['repromptText65']);
				break;
			case 'text69':
				this.attributes['optionId'] = 'text70';
				this.emit(':ask', Statements.TextOptions['text70'], Statements.TextOptions['repromptText70']);
				break;
			case 'text70':
				this.attributes['optionId'] = 'text65';
				this.emit(':ask', Statements.TextOptions['text65'], Statements.TextOptions['repromptText65']);
				break;
			case 'text71':
				this.attributes['optionId'] = 'text65';
				this.emit(':ask', Statements.TextOptions['text65'], Statements.TextOptions['repromptText65']);
				break;
			case 'text72':
				this.attributes['optionId'] = 'text74';
				this.emit(':ask', Statements.TextOptions['text74'], Statements.TextOptions['repromptText74']);
				break;
			case 'text73':
				this.attributes['optionId'] = 'text66';
				this.emit(':ask', Statements.TextOptions['text66'], Statements.TextOptions['repromptText66']);
				break;
			case 'text75':
				this.attributes['optionId'] = 'text76';
				this.emit(':ask', Statements.TextOptions['text76'], Statements.TextOptions['repromptText76']);
				break;
			case 'text77':
				this.attributes['optionId'] = 'text66';
				this.emit(':ask', Statements.TextOptions['text66'], Statements.TextOptions['repromptText66']);
				break;
			case 'text76':
				this.attributes['optionId'] = 'text78';
				this.emit(':ask', Statements.TextOptions['text78'], Statements.TextOptions['repromptText78']);
				break;
			case 'text78':
				this.attributes['optionId'] = 'text66';
				this.emit(':ask', Statements.TextOptions['text66'], Statements.TextOptions['repromptText66']);
				break;
			case 'text79':
				this.attributes['optionId'] = 'text80';
				this.emit(':ask', Statements.TextOptions['text80'], Statements.TextOptions['repromptText80']);
				break;
			case 'text80':
				this.attributes['optionId'] = 'text80';
				this.emit(':ask', Statements.TextOptions['text80'], Statements.TextOptions['repromptText80']);
				break;
			case 'text81':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text83'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text84':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text85'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text86':
				this.attributes['optionId'] = 'text87';
				this.emit(':ask', Statements.TextOptions['text87'], Statements.TextOptions['repromptText87']);
				break;
			case 'text87':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text89'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text90':
				this.attributes['optionId'] = 'text91';
				this.emit(':ask', Statements.TextOptions['text91'], Statements.TextOptions['repromptText91']);
				break;
			case 'text91':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text96'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text92':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text93'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text94':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text95'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
		}
	},

	'OptionTwoIntent' : function(){
		var statement = "";
		switch(this.attributes['optionId']){
			case 'text0':
				this.attributes['optionId'] = 'text2';
				this.emit(':ask', Statements.TextOptions['text2'], Statements.TextOptions['repromptText0']);
				break;
			case 'text1':
				this.attributes['optionId'] = 'text4a';
				this.emit(':ask', Statements.TextOptions['text4a'], Statements.TextOptions['repromptText4a']);
				break;
			case 'text2':
				this.attributes['optionId'] = 'text4b';
				this.emit(':ask', Statements.TextOptions['text4b'], Statements.TextOptions['repromptText4b']);
				break;
			case 'text3':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions.investigatePaths + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case "text4a":
				this.attributes['optionId'] = 'text0';
				this.handler.state = states.introMode;
				this.emitWithState(':tell', Statements.TextOptions['text6a']);
				break;
			case 'text4b':
				this.attributes['optionId'] = 'text0';
				this.handler.state = states.introMode;
				this.emitWithState(':tell', Statements.TextOptions['text6a']);
				break;
			case 'text5':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions.investigatePaths + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text9':
				this.attributes['optionId'] = 'text13';
				this.emit(':ask', Statements.TextOptions['text13'], Statements.TextOptions['repromptText13']);
				break;
			case 'text10':
				this.attributes['optionId'] = 'text36';
				this.emit(':ask', Statements.TextOptions['text36'], Statements.TextOptions['repromptText36']);
				break;
			case 'text11':
				this.attributes['optionId'] = 'text57';
				this.emit(':ask', Statements.TextOptions['text57'], Statements.TextOptions['repromptText57']);
				break;
			case 'text12':
				this.attributes['optionId'] = 'text15';
				this.emit(':ask', Statements.TextOptions['text15'], Statements.TextOptions['repromptText15']);
				break;
			case 'text13':
				this.attributes['optionId'] = 'text15b';
				this.emit(':ask', Statements.TextOptions['text15b'], Statements.TextOptions['repromptText15b']);
				break;
			case 'text14':
				this.attributes['optionId'] = 'text17';
				this.emit(':ask', Statements.TextOptions['text17'], Statements.TextOptions['repromptText17']);
				break;
			case 'text14b':
				this.attributes['optionId'] = 'text17b';
				this.emit(':ask', Statements.TextOptions['text17b'], Statements.TextOptions['repromptText17b']);
				break;
			case 'text15':
				this.attributes['optionId'] = 'text20';
				this.emit(':ask', Statements.TextOptions['text20'], Statements.TextOptions['repromptText20']);
				break;
			case 'text15b':
				this.attributes['optionId'] = 'text20b';
				this.emit(':ask', Statements.TextOptions['text20b'], Statements.TextOptions['repromptText20b']);
				break;
			case 'text16':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions.investigatePaths + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text16b':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions.investigatePaths + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text17':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions.investigatePaths + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text17b':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions.investigatePaths + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text18':
				this.attributes['optionId'] = 'text22';
				this.emit(':ask', Statements.TextOptions['text22'], Statements.TextOptions['repromptText22']);
				break;
			case 'text19':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions.investigatePaths + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text19b':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions.investigatePaths + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text20':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions.investigatePaths + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text20b':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions.investigatePaths + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text21':
				this.attributes['optionId'] = 'text24';
				this.emit(':ask', Statements.TextOptions['text24'], Statements.TextOptions['repromptText24']);
				break;
			case 'text22':
				this.attributes['optionId'] = 'text29';
				this.emit(':ask', Statements.TextOptions['text29'], Statements.TextOptions['repromptText29']);
				break;
			case 'text24':
				this.attributes['optionId'] = 'text26';
				this.emit(':ask', Statements.TextOptions['text26'], Statements.TextOptions['repromptText26']);
				break;
			case 'text26':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text28'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text29':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text34'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text30':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text32'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text36':
				this.attributes['optionId'] = 'text38';
				this.emit(':ask', Statements.TextOptions['text38'], Statements.TextOptions['repromptText38']);
				break;
			case 'text37':
				this.attributes['optionId'] = 'text44';
				this.emit(':ask', Statements.TextOptions['text44'], Statements.TextOptions['repromptText44']);
				break;
			case 'text38':
				this.attributes['optionId'] = 'text40';
				this.emit(':ask', Statements.TextOptions['text40'], Statements.TextOptions['repromptText40']);
				break;
			case 'text39':
				this.attributes['optionId'] = 'text42b';
				this.emit(':ask', Statements.TextOptions['text42b'], Statements.TextOptions['repromptText41b']);
				break;
			case 'text40':
				this.attributes['optionId'] = 'text42';
				this.emit(':ask', Statements.TextOptions['text42'], Statements.TextOptions['repromptText42']);
				break;
			case 'text41':
				this.attributes['optionId'] = 'text8';
				this.emit(':ask', Statements.investigatePaths + getOpenPaths(), Statements.investigatePaths + getOpenPathsRepromptText());
				break;		
			case 'text41b':
				this.attributes['optionId'] = 'text8';
				this.emit(':ask', Statements.investigatePaths + getOpenPaths(), Statements.investigatePaths + getOpenPathsRepromptText());
				break;
			case 'text42':
				this.attributes['optionId'] = 'text8';
				this.emit(':ask', Statements.investigatePaths + getOpenPaths(), Statements.investigatePaths + getOpenPathsRepromptText());
				break;
			case 'text42b':
				this.attributes['optionId'] = 'text8';
				this.emit(':ask', Statements.investigatePaths + getOpenPaths(), Statements.investigatePaths + getOpenPathsRepromptText());
				break;
			case 'text43':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text46'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text44':
				this.attributes['optionId'] = text45b;
				this.emit(':ask', Statements.TextOptions[text45b], Statements.TextOptions['repromptText45b']);
				break;
			case 'text45':
				this.attributes['optionId'] = 'text42b';
				this.emit(':ask', Statements.TextOptions['text42b'], Statements.TextOptions['repromptText42b']);
				break;
			case text45b:
				this.attributes['optionId'] = text47b;
				this.emit(':ask', Statements.TextOptions[text47b], Statements.TextOptions['repromptText47b']);
				break;
			case 'text47':
				this.attributes['optionId'] = 'text8';
				this.emit(':ask', Statements.investigatePaths + getOpenPaths(), Statements.investigatePaths + getOpenPathsRepromptText());
				break;
			case text47b : 
				this.attributes['optionId'] = 'text8';
				this.emit(':ask', Statements.investigatePaths + getOpenPaths(), Statements.investigatePaths + getOpenPathsRepromptText());
				break;
			case 'text48':
				this.attributes['optionId'] = 'text49b';
				this.emit(':ask', Statements.TextOptions['text49b'], Statements.TextOptions['repromptText49b']);
				break;
			case 'text49a':
				this.attributes['optionId'] = 'text51';
				this.emit(':ask', Statements.TextOptions['text51'], Statements.TextOptions['repromptText51']);
				break;
			case 'text49b':
				this.attributes['optionId'] = 'text51';
				this.emit(':ask', Statements.TextOptions['text51'], Statements.TextOptions['repromptText51']);
				break;
			case 'text50':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text55'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text51':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text53'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text52':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text55'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text56':
				this.attributes['optionId'] = 'text61';
				this.emit(':ask', Statements.TextOptions['text61'], Statements.TextOptions['repromptText61']);
				break;
			case 'text57':
				this.attributes['optionId'] = 'text59';
				this.emit(':ask', Statements.TextOptions['text59'], Statements.TextOptions['repromptText59']);
				break;
			case 'text58':
				this.attributes['optionId'] = 'text64';
				this.emit(':ask', Statements.TextOptions['text64'], Statements.TextOptions['repromptText64']);
				break;
			case 'text59':
				this.attributes['optionId'] = 'text68';
				this.emit(':ask', Statements.TextOptions['text68'], Statements.TextOptions['repromptText68']);
				break;
			case 'text60':
				this.attributes['optionId'] = 'text69';
				this.emit(':ask', Statements.TextOptions['text69'], Statements.TextOptions['repromptText69']);
				break;
			case 'text61':
				this.attributes['optionId'] = 'text8';
				this.emit(':ask', Statements.investigatePaths + getOpenPaths(), Statements.investigatePaths + getOpenPathsRepromptText());
				break;
			case 'text63':
				this.attributes['optionId'] = 'text66';
				this.emit(':ask', Statements.TextOptions['text66'], Statements.TextOptions['repromptText66']);
				break;
			case 'text64':
				this.attributes['optionId'] = 'text66';
				this.emit(':ask', Statements.TextOptions['text66'], Statements.TextOptions['repromptText66']);
				break;
			case 'text65':
				this.attributes['optionId'] = 'text73';
				this.emit(':ask', Statements.TextOptions['text73'], Statements.TextOptions['repromptText73']);
				break;
			case 'text66': 
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text82'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text67':
				this.attributes['optionId'] = 'text66';
				this.emit(':ask', Statements.TextOptions['text66'], Statements.TextOptions['repromptText66']);
				break;
			case 'text68':
				this.attributes['optionId'] = 'text66';
				this.emit(':ask', Statements.TextOptions['text66'], Statements.TextOptions['repromptText66']);
				break;
			case 'text69':
				this.attributes['optionId'] = 'text71';
				this.emit(':ask', Statements.TextOptions['text71'], Statements.TextOptions['repromptText70']);
				break;
			case 'text70':
				this.attributes['optionId'] = 'text66';
				this.emit(':ask', Statements.TextOptions['text66'], Statements.TextOptions['repromptText66']);
				break;
			case 'text71':
				this.attributes['optionId'] = 'text66';
				this.emit(':ask', Statements.TextOptions['text66'], Statements.TextOptions['repromptText66']);
				break;
			case 'text72':
				this.attributes['optionId'] = 'text75';
				this.emit(':ask', Statements.TextOptions['text75'], Statements.TextOptions['repromptText75']);
				break;
			case 'text73':
				this.attributes['optionId'] = 'text8';
				this.emit(':ask', Statements.investigatePaths + getOpenPaths(), Statements.investigatePaths + getOpenPathsRepromptText());
				break;
			case 'text74':
				this.attributes['optionId'] = 'text8';
				this.emit(':ask', Statements.investigatePaths + getOpenPaths(), Statements.investigatePaths + getOpenPathsRepromptText());
				break;
			case 'text75':
				this.attributes['optionId'] = 'text77';
				this.emit(':ask', Statements.TextOptions['text77'], Statements.TextOptions['repromptText77']);
				break;
			case 'text76':
				this.attributes['optionId'] = 'text79';
				this.emit(':ask', Statements.TextOptions['text79'], Statements.TextOptions['repromptText79']);
				break;
			case 'text77':
				this.attributes['optionId'] = 'text8';
				this.emit(':ask', Statements.investigatePaths + getOpenPaths(), Statements.investigatePaths + getOpenPathsRepromptText());
				break;
			case 'text78':
				this.attributes['optionId'] = 'text8';
				this.emit(':ask', Statements.investigatePaths + getOpenPaths(), Statements.investigatePaths + getOpenPathsRepromptText());
				break;
			case 'text79':
				this.attributes['optionId'] = 'text66';
				this.emit(':ask', Statements.TextOptions['text66'], Statements.TextOptions['repromptText66']);
				break;
			case 'text80':
				this.attributes['optionId'] = 'text66';
				this.emit(':ask', Statements.TextOptions['text66'], Statements.TextOptions['repromptText66']);
				break;
			case 'text81':
				this.attributes['optionId'] = 'text84';
				this.emit(':ask', Statements.TextOptions['text84'], Statements.TextOptions['repromptText84']);
				break;
			case 'text84':
				this.attributes['optionId'] = 'text86';
				this.emit(':ask', Statements.TextOptions['text86'], Statements.TextOptions['repromptText86']);
				break;
			case 'text86':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text88'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
			case 'text87':
				this.attributes['optionId'] = 'text90';
				this.emit(':ask', Statements.TextOptions['text90'], Statements.TextOptions['repromptText90']);
				break;
			case 'text90':
				this.attributes['optionId'] = 'text92';
				this.emit(':ask', Statements.TextOptions['text92'], Statements.TextOptions['repromptText92']);
				break;
			case 'text92':
				this.attributes['optionId'] = 'text94';
				this.emit(':ask', Statements.TextOptions['text94'], Statements.TextOptions['repromptText86']);
				break;
			case 'text94':
				this.attributes['optionId'] = 'text8';
				statement = Statements.TextOptions['text96'] + getOpenPaths();
				this.emit(':ask', statement, getOpenPathsRepromptText());
				break;
		}
	},

	'OptionThreeIntent' : function(){
		switch(this.attributes['optionId']){
			case 'text57': 
				this.attributes['optionId'] = 'text60';
				this.emit(':ask', Statements.TextOptions['text60'], Statements.TextOptions['repromptText60']);
				break;
			default:
				var textId = this.attributes['optionId'].replace('text', '');
				var repromptText = "repromptText" + textId;
				this.emit(":ask", Statements.TextOptions[repromptText], Statements.TextOptions[repromptText]);
				break;
		}
	},

	'InstructionsIntent' : function(){
    	this.emit(':ask', GlobalText.helpText, GlobalText.helpTextRepromptText);
    },

	'AMAZON.ResumeIntent':function(){

	},

	'Amazon.PauseIntent':function(){

	},

	'InvestigateIntent' : function(){
		if(this.attributes['optionId'] === 'text8'){
			var name = this.event.request.intent.slots.Paths.value;
			if(name === 'Bob May' && this.attributes['Bob May'] !== 'text1'){
				this.attributes['optionId'] = 'text9';
				this.attributes['Bob May'] = 'text1';
				this.emit(':ask', Statements.TextOptions['text9'], Statements.TextOptions[repromptText9]);
			} else if(name === 'Christy Benner' && this.attributes['Christy Benner'] !== 'text1'){
				this.attributes['optionId'] = 'text10';
				this.attributes['Christy Benner'] = 'text1';
				this.emit(':ask', Statements.TextOptions['text10'], Statements.TextOptions[repromptText10]);
			}else if(name === 'Tyler Quick' && this.attributes['Tyler Quick'] !== 'text1'){
				this.attributes['optionId'] = 'text11';
				this.attributes['Tyler Quick'] = 'text1';
				this.emit(':ask', Statements.TextOptions['text11'], Statements.TextOptions[repromptText11]);
			} else {
				this.emit(':ask', Statements.investigatePaths + getOpenPaths(), Statements.investigatePaths + getOpenPathsRepromptText());
			}
		}else {
			this.emit(':ask', Statements.TextOptions['repromptText' + this.attributes['optionId']], Statements.TextOptions['repromptText' + this.attributes['optionId']]);
		}
	},

	'MakeAnAccusationIntent' : function(){
		this.handler.state = states.resolutionMode;
		this.emitWithState('Accusation');
	},

	'AgainIntent' : function(){
		this.emit('InstructionsIntent');
	},

	'GoIntent' : function(){
		this.emit(':ask', Statements.TextOption[this.attributes['optionId']], Statements.TextOptions['repromptText' + this.attributes['optionId']]);
	},

	'AMAZON.NextIntent' : function(){
		var optionId = this.attributes['optionId'].replace('text', '');
		var repromptTextOption = "repromptText"+ optionId;
		this.emit(':ask', Statements.TextOptions[repromptTextOption], Statements.TextOptions[repromptTextOption]);
	},

	'AMAZON.RepeatIntent' : function(){
		this.emit('RepeatOptionsIntent');
	},

	'RepeatSceneIntent': function(){
		var optionId = this.attributes['optionId'].replace('text', '');
		var repromptTextOption = "repromptText"+ optionId;
		this.emit(':ask', Statements.TextOptions[this.attributs['optionId']], Statements.TextOptions[repromptTextOption]);
	},

	'RepeatOptionsIntent': function(){
		this.emit(':ask', GlobalText.repeatText, GlobalText.repeatRepromptText);
	},

	'AMAZON.StartOverIntent': function(){
		
		//Resets the attributes to 0 to start a new game;
		this.handler.state = states.introMode;
		this.emitWithState('Welcome');
	},

	'AMAZON.HelpIntent' : function(){
		this.emit('InstructionsIntent');
	},

    'AMAZON.StopIntent':function(){
    	this.response.speak(GlobalText.goodbyeText);
        this.emit(':responseReady');
    },

	'AMAZON.CancelIntent':function(){
    	this.response.speak(GlobalText.goodbyeText);
        this.emit(':responseReady');
    },

	'SessionEndedRequest': function () {
        this.emit(':saveState', true);
    },

    'Unhandled' : function(){
    	this.emit(':ask', GlobalText.unhandled, GlobalText.unhandled);
    }
});

const resolutionHandler = Alexa.CreateStateHandler(states.resolutionMode, {

	'Accusation' : function(){
		this.attributes['optionId'] = 200;
		this.emit(':ask', Statements.TextOptions['text200'], Statements.TextOptions['text200']);
	},

	'LaunchRequest': function(){
    	this.emit('NewSession');
    },

	'SessionEndedRequest': function () {
        this.emit(':saveState', true);
    },

    'AMAZON.ResumeIntent':function(){

	},

	'Amazon.PauseIntent':function(){

	},

	'InstructionsIntent' : function(){
    	this.emit(':ask', GlobalText.helpText, GloblText.helpTextRepromptText);
    },

    'AccuseIntent' : function() {
    	var name = this.event.request.intent.slots.Suspect.value;
    	var guessOption = '';
    	for(key in this.attributes){
			this.attributes[key] = 'text0';
		}
		 
    	if(name === 'Kelly Purry'){
    		this.handler.state = states.introMode;
    		this.emitWithState(':ask', Statements.TextOptions['text111'], Statements.TextOptions['repromptText111']);
    	} else {
    		this.handler.state = states.introMode;
    		var repromptText = GlobalText.gameEndText;
    		switch(name) {
    			case 'Tyler Quick' : 
    				guessOption = Statements.TextOptions['text109'];
    				break;
    			case 'Tim Hoodleston' : 
    				guessOption = Statements.TextOptions['text110'];
    				break;
    			case 'Yawnkay East' :
    				guessOption = Statements.TextOptions['text100'];
    				break;
    			case 'Bob May' :
    				guessOption = Statements.TextOptions['text102'];
    				break;
    			case 'Me' :
    				guessOption = Statements.TextOptions['text101'];
    				break;
    			case 'Grey Korea' :
    				guessOption = Statements.TextOptions['text104'];
    				break;
    			case 'Tangerine Tulip' :
    				guessOption = Statements.TextOptions['text103'];
    				break;
    			case 'Mim May' :
    				guessOption = Statements.TextOptions['text105'];
    				break;
    			case 'Christy Benner' :
    				guessOption = Statements.TextOptions['text107'];
    				break;
    			case 'Sikh Meriano' :
    				guessOption = Statements.TextOptions['text106'];
    				break;
    			case 'The Bodyguard' :
    				guessOption = Statements.TextOptions['text108'];
    				break;
    			default	:
    				this.handler.state = states.gameMode;
    				guessOption = GlobalText.unhandled;
    				repromptText = GlobalText.unhandled;
    				break;
    		}
    		this.emitWithState(':ask', guessOption, repromptText);
    	}
    },

    'AMAZON.NoIntent': function() {
        this.response.speak(GlobalText.goodbyeText);
        this.emit(':responseReady');
    },

    'Amazon.CancelIntent':function(){
    	this.response.speak(GlobalText.goodbyeText);
        this.emit(':responseReady');
    },

    'AMAZON.YesIntent': function() {
        this.handler.state = states.gameMode;
        this.attributes['optionId'] = 'text0';
        this.emitWithState(':ask', Statements.TextOption['text0'], Statements.TextOptions['text0']);
    },

    'AMAZON.HelpIntent' : function(){
		this.emit(':ask', GlobalText.helpText, GloblText.helpTextRepromptText);
	},

    'AMAZON.StopIntent':function(){
    	this.response.speak(GlobalText.goodbyeText);
        this.emit(':responseReady');
    },

    'AgainIntent' : function(){
		this.emit(':ask', GlobalText.helpText, GloblText.helpTextRepromptText);
	},

	'GoIntent' : function(){
		this.emit(':ask', Statements.TextOptions['text200'], Statements.TextOptions['repromptText200']);
	},

	'AMAZON.RepeatIntent' : function(){
		this.emit('GoIntent');
	},

    'Unhandled' : function(){
    	this.emit(':ask', GlobalText.unhandled, GlobalText.unhandled);
    }
});

exports.handler = function(event, context, callback){
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.dynamoDBTableName = 'YawnkayEastTest'; 
    alexa.registerHandlers(newSessionHandlers, introHandler, gameHandler, resolutionHandler);
    alexa.execute();
};

function getOpenPaths(){
	var openPaths = [];
	if(this.attributes['BobMay'] === 0){
		openPaths.push('Bob May');
	} 
	if(this.attributes['ChristyBenner'] === 0){
		openPaths.push('Christy Benner');
	}
	if(this.attributes['TylerQuick'] === 0){
		openPaths.push('Tyler Quick');
	}
	return openPaths.join(' or ');
}

function getOpenPathsRepromptText(){
	return "Please say " + getOpenPaths();
}



const Alexa = textrequire('alexa-sdk');
const GlobalText = textrequire('./GlobalText');
const Statements = textrequire('./Statements');

const states = {
	introMode : 'introMode',
	gameMode : 'gameMode',
	resolutionMode : 'resolutionMode'
};

const APP_ID = "amzn1.ask.skill.a2357136-45d2-4764-b3b0-cbe0703479b6";
const permissionArray = ['read::alexa:device:all:address'];

const newSessionHandlers = {

     // This will either start a new game if there is no optionId or take you to where you left off
    'NewSession': function() {
        if(!this.attributes['optionId'] || this.attributes['optionId'] === '' || this.attributes['optionId'] === text0){
        	this.handler.state = states.introMode;
        	for(key in this.attributes){
				this.attributes[key] = text0;
			}
        	this.emitWithState(':ask', GlobalText.newWelcomeText, GlobalText.newWelcomeFallBack); 
        } else {
        	this.handler.state = states.gameMode;
        	this.emitWithState(':ask', Statements.TextOption[this.attributes['optionId']], Statements.TextOptions[this.attributes['optionId']]);
        }
        
    },

    'LaunchRequest': function(){
    	this.handler.state = states.introMode;
    	this.emitWithState('NewSession');
    }
};


const introHandler = Alexa.CreateStateHandler(states.introMode, {

	//TODO: this isnt right
	'NewSession': function () {
        this.emit('NewSession'); 
    },

	'AMAZON.YesIntent': function() {
        this.handler.state = states.gameMode;
        this.attributes['optionId'] = text0;
        this.emitWithState(':ask', Statements.TextOption[0], Statements.TextOptions[0]);
    },

    'AMAZON.RepeatIntent' : function(){
    	this.emit(':ask', GlobalText.helpText, GlobalText.helpTextFallBack);
    },

	'AMAZON.NoIntent': function() {
        this.response.speak(GlobalText.refuseText);
        this.emit(':responseReady');
    }, 

    'AMAZON.StopIntent':function(){
    	this.emit('AMAZON.NoIntent');
    },

    'Amazon.CancelIntent':function(){
    	this.emit('AMAZON.StopIntent');
    },

	'AgainIntent' : function(){
		this.emit('AMAZON.HelpIntent');
	},

	'GoIntent' : function(){
		this.emit('AMAZON.YesIntent');
	}, 

	'ResumeIntent' : function(){
		this.emit('GoIntent');
	},

	'AMAZON.HelpIntent' : function(){
		this.emit(':ask', GlobalText.helpText, GlobalText.helpTextFallBack);
	},

	'SessionEndedRequest': function () {
        this.emit(':saveState', true);
    },

    'Unhandled': function() {
        this.emit(':ask', GlobalText.unhandled, GlobalText.unhandled);
    }

});

const gameHandler = Alexa.CreateStateHandler(states.guessMode, {


	'OptionOneIntent' : function(){
		this.getOptionOneText(this.attribute['optionId']);
	},


	'OptionTwoIntent' : function(){
		//Characters.Characters[this.attribute['currentName']].optionBIntent(this.attribute['optionId']);
		this.getOptionTwoText(this.attribute['optionId']);
	},

	'OptionThreeIntent' : function(){
		//Characters.Characters[this.attribute['currentName']].optionCIntent(this.attribute['optionId']);
		this.getOptionThreeText(this.attribute['optionId']);
	},

	'InvestigateIntent' : function(){
		if(this.attribute['optionId'] === text8){
			let name = this.event.request.intent.slots.Paths.value;
			if(name === 'Bob May' && this.attribute['BobMay'] !== text1){
				this.attribute['optionId'] = text9;
				this.attribute['BobMay'] = text1;
				this.emit(':ask', Statements.TextOptions[text9], Statements.TextOptions[fallback9]);
			} else if(name === 'Christy Benner' && this.attribute['ChristyBenner'] !== text1){
				this.attribute['optionId'] = text10;
				this.attribute['ChristyBenner'] = text1;
				this.emit(':ask', Statements.TextOptions[text10], Statements.TextOptions[fallback10]);
			}else if(name === 'Tyler Quick' && this.attribute['TylerQuick'] !== text1){
				this.attribute['optionId'] = text11;
				this.attribute['TylerQuick'] = text1;
				this.emit(':ask', Statements.TextOptions[text11], Statements.TextOptions[fallback11]);
			} else {
				this.emit(':ask', Statements.investigatePaths + getOpenPaths(), Statements.investigatePaths + getOpenPathsFallBack());
			}
		}else {
			this.emit(':ask', Statements.TextOptions[fallback + this.attribute['optionId']], Statements.TextOptions[fallback + this.attribute['optionId']]);
		}
	},

	'MakeAnAccusationIntent' : function(){
		this.handler.state = states.resolutionMode;
		this.attributes['optionId'] = 200;
		this.emitWithState(':ask', Statements.TextOptions[text200], Statements.TextOptions[text200]);
	},

	'AgainIntent' : function(){
		this.emit('AMAZON.HelpIntent');
	},

	'GoIntent' : function(){
		this.emit(':ask', Statements.TextOption[this.attribute['optionId']], Statements.TextOptions[fallback + this.attribute['optionId']]);
	},

	'ResumeIntent' : function(){
		this.emit('GoIntent');
	},

	'AMAZON.NextIntent' : function(){
		let fallbackOption = "fallback"+this.attribute['optionId'];
		this.emit(':ask', Statements.TextOptions[fallbackOption], Statements.TextOptions[fallbackOption]);
	},

	'AMAZON.RepeatIntent' : function(){
		let fallbackOption = "fallback"+this.attribute['optionId'];
		this.emit(':ask', Statements.TextOptions[fallbackOption], Statements.TextOptions[fallbackOption]);
	}

	'AMAZON.StartOverIntent': function(){
		
		//Resets the attributes to 0 to start a new game;
		//TODO: Make sure this works before deleting commented out code;
		for(key in this.attributes){
			this.attributes[key] = text0;
		}
		//TODO: Delete these lines if the above works
		/*
		this.attributes['mimMay'] = text0;
		this.attributes['christyBenner'] = text0;
		this.attributes['tylerQuick'] = text0;
		this.attributes['kellyPurry'] = text0;
		this.attributes['bobMay'] = text0;
		this.attributes['tangerineTulip'] = text0;
		this.attributes['optionId'] = text0;
		this.attributes['currentName'] = text'';*/
		this.handler.state = states.introMode;
		this.emitWithState('NewSession');
	},

	'AMAZON.HelpIntent' : function(){
		this.emit(':ask', GlobalText.helpText, GlobalTexthelp.TextFallBack);
	},

    'AMAZON.StopIntent':function(){
    	this.response.speak(GlobalText.refuseText);
        this.emit(':responseReady');
    },

	'Amazon.CancelIntent':function(){
    	this.emit('AMAZON.StopIntent');
    },

	'SessionEndedRequest': function () {
        this.emit(':saveState', true);
    },

    'Unhandled' : function(){
    	this.emit(':ask', GlobalText.unhandled, GlobalText.unhandled);
    }
});

const resolutionHandler = Alexa.CreateStateHandler(states.resolutionMode, {


	'SessionEndedRequest': function () {
        this.emit(':saveState', true);
    },

    'AccuseIntent' : function() {
    	let name = this.event.request.intent.slots.Suspect.value;
    	let guessOption = '';
    	for(key in this.attributes){
			this.attributes[key] = text0;
		}
		 
    	if(name === 'Kelly Purry'){
    		this.handler.state = states.introMode;
    		this.emitWithState(':ask', Statements.TextOptions[text111], Statements.TextOptions[fallBackText111]);
    	} else {
    		this.handler.state = states.introMode;
    		switch(name) {
    			case 'Tyler Quick' : 
    				guessOption = Statements.TextOptions[text109];
    			case 'Tim Hoodleston' : 
    				guessOption = Statements.TextOptions[text110];
    			case 'Yanke East' :
    				guessOption = Statements.TextOptions[text100];
    			case 'Bob May' :
    				guessOption = Statements.TextOptions[text102];
    			case 'Me' :
    				guessOption = Statements.TextOptions[text101];
    			case 'Grey Korea' :
    				guessOption = Statements.TextOptions[text104];
    			case 'Tangerine Tulip' :
    				guessOption = Statements.TextOptions[text103];
    			case 'Mim May' :
    				guessOption = Statements.TextOptions[text105];
    			case 'Christy Benner' :
    				guessOption = Statements.TextOptions[text107];
    			case 'Sikh Meriano' :
    				guessOption = Statements.TextOptions[text106];
    			case 'Bodyguard' :
    				guessOption = Statements.TextOptions[text108];
    			default	
    				guessOption = Statements.TextOptions[text101];
    		}
    		this.emitWithState(':ask', guessOption, GlobalText.gameEndText);
    	}
    },

    'AMAZON.NoIntent': function() {
        this.response.speak(GlobalText.refuseText);
        this.emit(':responseReady');
    },

    'Amazon.CancelIntent':function(){
    	this.emit('AMAZON.StopIntent');
    },

    'AMAZON.YesIntent': function() {
        this.handler.state = states.gameMode;
        this.attributes['optionId'] = text0;
        this.emitWithState(':ask', Statements.TextOption[0], Statements.TextOptions[0]);
    },

    'AMAZON.HelpIntent' : function(){
		this.emit(':ask', GlobalText.helpText, GloblText.helpTextFallBack);
	},

    'AMAZON.StopIntent':function(){
    	this.response.speak(GlobalText.refuseText);
        this.emit(':responseReady');
    },

    'AgainIntent' : function(){
		this.emit('AMAZON.HelpIntent');
	},

	'GoIntent' : function(){
		this.emit(':ask', Statements.TextOptions[text200], Statements.TextOptions[fallback200]);
	},

	'AMAZON.RepeatIntent' : function(){
		this.emit('GoIntent');
	}

    'ResumeIntent' : function(){
		this.emit('GoIntent');
	},

    'Unhandled' : function(){
    	this.emit(':ask', GlobalText.unhandled, GlobalText.unhandled);
    }
});

exports.handler = function(event, context, callback){
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.dynamoDBTableName = 'YankeStory'; 
    alexa.registerHandlers(newSessionHandlers, introHandler, gameHandler, resolutionHandler);
    alexa.execute();
};

const getOptionOneText = function(optionId){
	switch(optionId){
		case text0:
			this.attributes['optionId'] = text1;
			this.emit(':ask', Statements.TextOptions[text1], Statements.TextOptions[fallback1]);
		case text1:
			this.attributes['optionId'] = text3;
			this.emit(':ask', Statements.TextOptions[text3], Statements.TextOptions[fallback3]);
		case text2:
			this.attributes['optionId'] = text3;
			this.emit(':ask', Statements.TextOptions[text3], Statements.TextOptions[fallback3]);
		case text3:
			this.attributes['optionId'] = text0;
			this.handler.state = states.introMode;
			this.emit(':tell', Statements.TextOptions[text7]);
		case text4a:
			this.attributes['optionId'] = text5;
			this.emit(':ask', Statements.TextOptions[text5], Statements.TextOptions[fallback4a]);
		case text4b:
			this.attributes['optionId'] = text5;
			this.emit(':ask', Statements.TextOptions[text5], Statements.TextOptions[fallback5]);
		case text5:
			this.attributes['optionId'] = text0;
			this.handler.state = states.introMode;
			this.emit(':tell', Statements.TextOptions[text7]);
		case text9:
			this.attributes['optionId'] = text12;
			this.emit(':ask', Statements.TextOptions[text12], Statements.TextOptions[fallback12]);
		case text10:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text35] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text11:
			this.attributes['optionId'] = text56;
			this.emit(':ask', Statements.TextOptions[text56], Statements.TextOptions[fallback56]);
		case text12:
			this.attributes['optionId'] = text14;
			this.emit(':ask', Statements.TextOptions[text14], Statements.TextOptions[fallback14]);
		case text13:
			this.attributes['optionId'] = text15;
			this.emit(':ask', Statements.TextOptions[text15], Statements.TextOptions[fallback15]);
		case text14:
			this.attributes['optionId'] = text16;
			this.emit(':ask', Statements.TextOptions[text16], Statements.TextOptions[fallback16]);
		case text14b:
			this.attributes['optionId'] = text16b;
			this.emit(':ask', Statements.TextOptions[text16b], Statements.TextOptions[fallback16b]);
		case text15:
			this.attributes['optionId'] = text19;
			this.emit(':ask', Statements.TextOptions[text19], Statements.TextOptions[fallback19]);
		case text15b:
			this.attributes['optionId'] = text19b;
			this.emit(':ask', Statements.TextOptions[text19b], Statements.TextOptions[fallback19b]);
		case text16:
			this.attributes['optionId'] = text18;
			this.emit(':ask', Statements.TextOptions[text8], Statements.TextOptions[fallback18]);
		case text16b:
			this.attributes['optionId'] = text18;
			this.emit(':ask', Statements.TextOptions[text18], Statements.TextOptions[fallback18]);
		case text17:
			this.attributes['optionId'] = text18;
			this.emit(':ask', Statements.TextOptions[text18], Statements.TextOptions[fallback18]);
		case text17b:
			this.attributes['optionId'] = text18;
			this.emit(':ask', Statements.TextOptions[text18], Statements.TextOptions[fallback18]);
		case text18: 
			this.attributes['optionId'] = text21;
			this.emit(':ask', Statements.TextOptions[text21], Statements.TextOptions[fallback21]);
		case text19:
			this.attributes['optionId'] = text18;
			this.emit(':ask', Statements.TextOptions[text18], Statements.TextOptions[fallback0]);
		case text19b:
			this.attributes['optionId'] = text18;
			this.emit(':ask', Statements.TextOptions[text18], Statements.TextOptions[fallback18]);
		case text20:
			this.attributes['optionId'] = text18;
			this.emit(':ask', Statements.TextOptions[text18], Statements.TextOptions[fallback18]);
		case text20b:
			this.attributes['optionId'] = text18;
			this.emit(':ask', Statements.TextOptions[text18], Statements.TextOptions[fallback18]);
		case text21:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text23] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text22:
			this.attributes['optionId'] = text29;
			this.emit(':ask', Statements.TextOptions[text29], Statements.TextOptions[fallback29]);
		case text24:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text25] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text26:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text27] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text29:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text33] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text30:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text31] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text36:
			this.attributes['optionId'] = text37;
			this.emit(':ask', Statements.TextOptions[text37], Statements.TextOptions[fallback37]);
		case text37:
			this.attributes['optionId'] = text43;
			this.emit(':ask', Statements.TextOptions[text43], Statements.TextOptions[fallback43]);
		case text38:
			this.attributes['optionId'] = text39;
			this.emit(':ask', Statements.TextOptions[text39], Statements.TextOptions[fallback39]);
		case text39:
			this.attributes['optionId'] = text41b;
			this.emit(':ask', Statements.TextOptions[text41b], Statements.TextOptions[fallback41b]);
		case text40:
			this.attributes['optionId'] = text41;
			this.emit(':ask', Statements.TextOptions[text41], Statements.TextOptions[fallback41]);
		case text41:
			this.attributes['optionId'] = text48;
			this.emit(':ask', Statements.TextOptions[text48], Statements.TextOptions[fallback48]);
		case text41b:
			this.attributes['optionId'] = text48;
			this.emit(':ask', Statements.TextOptions[text48], Statements.TextOptions[fallback48]);
		case text42:
			this.attributes['optionId'] = text48;
			this.emit(':ask', Statements.TextOptions[text48], Statements.TextOptions[fallback48]);
		case text42b:
			this.attributes['optionId'] = text48;
			this.emit(':ask', Statements.TextOptions[text48], Statements.TextOptions[fallback48]);
		case text43:
			this.attributes['optionId'] = text45;
			this.emit(':ask', Statements.TextOptions[text45], Statements.TextOptions[fallback45]);
		case text44:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text46] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text45:
			this.attributes['optionId'] = text42b;
			this.emit(':ask', Statements.TextOptions[text42b], Statements.TextOptions[fallback42b]);
		case text45b:
			this.attributes['optionId'] = text47a;
			this.emit(':ask', Statements.TextOptions[text47a], Statements.TextOptions[fallback47a]);
		case text47a :
			this.attributes['optionId'] = text48;
			this.emit(':ask', Statements.TextOptions[text48], Statements.TextOptions[fallback48]);
		case text47b :
			this.attributes['optionId'] = text48;
			this.emit(':ask', Statements.TextOptions[text48], Statements.TextOptions[fallback48]);
		case text48:
			this.attributes['optionId'] = text49a;
			this.emit(':ask', Statements.TextOptions[text49a], Statements.TextOptions[fallback49a]);
		case text49a:
			this.attributes['optionId'] =text50;
			this.emit(':ask', Statements.TextOptions[text50], Statements.TextOptions[fallback50]);
		case text49b:
			this.attributes['optionId'] =text50;
			this.emit(':ask', Statements.TextOptions[text50], Statements.TextOptions[fallback50]);
		case text50:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text54] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text51:
			this.attributes['optionId'] = text52;
			this.emit(':ask', Statements.TextOptions[text52], Statements.TextOptions[fallback52]);
		case text52:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text54] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text56:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text62] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text57:
			this.attributes['optionId'] = text58;
			this.emit(':ask', Statements.TextOptions[text58], Statements.TextOptions[fallback58]);
		case text58:
			this.attributes['optionId'] = text63;
			this.emit(':ask', Statements.TextOptions[text63], Statements.TextOptions[fallback63]);
		case text59:
			this.attributes['optionId'] =text67;
			this.emit(':ask', Statements.TextOptions[text67], Statements.TextOptions[fallback67]);
		case text60:
			this.attributes['optionId'] =text59;
			this.emit(':ask', Statements.TextOptions[text59], Statements.TextOptions[fallback59]);
		case text61:
			this.attributes['optionId'] = text57;
			this.emit(':ask', Statements.TextOptions[text57], Statements.TextOptions[fallback57]);
		case text63:
			this.attributes['optionId'] = text65;
			this.emit(':ask', Statements.TextOptions[text65], Statements.TextOptions[fallback65]);
		case text64:
			this.attributes['optionId'] = text65;
			this.emit(':ask', Statements.TextOptions[text65], Statements.TextOptions[fallback65]);
		case text65: 
			this.attributes['optionId'] = text72;
			this.emit(':ask', Statements.TextOptions[text72], Statements.TextOptions[fallback72]);
		case text66:
			this.attributes['optionId'] = text81;
			this.emit(':ask', Statements.TextOptions[text81], Statements.TextOptions[fallback81]);
		case text67:
			this.attributes['optionId'] = text65;
			this.emit(':ask', Statements.TextOptions[text65], Statements.TextOptions[fallback65]);
		case text68:
			this.attributes['optionId'] = text65;
			this.emit(':ask', Statements.TextOptions[text65], Statements.TextOptions[fallback65]);
		case text69:
			this.attributes['optionId'] = text70;
			this.emit(':ask', Statements.TextOptions[text70], Statements.TextOptions[fallback70]);
		case text70:
			this.attributes['optionId'] = text65;
			this.emit(':ask', Statements.TextOptions[text65], Statements.TextOptions[fallback65]);
		case text71:
			this.attributes['optionId'] = text65;
			this.emit(':ask', Statements.TextOptions[text65], Statements.TextOptions[fallback65]);
		case text72:
			this.attributes['optionId'] = text74;
			this.emit(':ask', Statements.TextOptions[text74], Statements.TextOptions[fallback74]);
		case text73:
			this.attributes['optionId'] = text66;
			this.emit(':ask', Statements.TextOptions[text66], Statements.TextOptions[fallback66]);
		case text75:
			this.attributes['optionId'] = text76;
			this.emit(':ask', Statements.TextOptions[text76], Statements.TextOptions[fallback76]);
		case text77:
			this.attributes['optionId'] = text66;
			this.emit(':ask', Statements.TextOptions[text66], Statements.TextOptions[fallback66]);
		case text76:
			this.attributes['optionId'] = text78;
			this.emit(':ask', Statements.TextOptions[text78], Statements.TextOptions[fallback78]);
		case text78:
			this.attributes['optionId'] = text66;
			this.emit(':ask', Statements.TextOptions[text66], Statements.TextOptions[fallback66]);
		case text79:
			this.attributes['optionId'] = text80;
			this.emit(':ask', Statements.TextOptions[text80], Statements.TextOptions[fallback80]);
		case text80:
			this.attributes['optionId'] = text80;
			this.emit(':ask', Statements.TextOptions[text80], Statements.TextOptions[fallback80]);
		case text81:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text83] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text84:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text85] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text86:
			this.attributes['optionId'] = text87;
			this.emit(':ask', Statements.TextOptions[text87], Statements.TextOptions[fallback87]);
		case text87:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text89] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text90:
			this.attributes['optionId'] = text91;
			this.emit(':ask', Statements.TextOptions[text91], Statements.TextOptions[fallback91]);
		case text91:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text96] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text92:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text93] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text94:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text95] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
	}
}

const getOptionTwoText = function(optionId){
	switch(optionId){
		case text0:
			this.attributes['optionId'] = text2;
			this.emit(':ask', Statements.TextOptions[text2], Statements.TextOptions[fallback0]);
		case text1:
			this.attributes['optionId'] = text4a;
			this.emit(':ask', Statements.TextOptions[text1], Statements.TextOptions[fallback4a]);
		case text2:
			this.attributes['optionId'] = text4b;
			this.emit(':ask', Statements.TextOptions[text4b], Statements.TextOptions[fallback4b]);
		case text3:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions.investigatePaths + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text4a:
			this.attributes['optionId'] = text0;
			this.handler.state = states.introMode;
			this.emitWithState(':tell', Statements.TextOptions[text6a]);
		case text4b:
			this.attributes['optionId'] = text0;
			this.handler.state = states.introMode;
			this.emitWithState(':tell', Statements.TextOptions[text6a]);
		case text5:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions.investigatePaths + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text9:
			this.attributes['optionId'] = text13;
			this.emit(':ask', Statements.TextOptions[text13], Statements.TextOptions[fallback13]);
		case text10:
			this.attributes['optionId'] = text36;
			this.emit(':ask', Statements.TextOptions[text36], Statements.TextOptions[fallback36]);
		case text11:
			this.attributes['optionId'] = text57;
			this.emit(':ask', Statements.TextOptions[text57], Statements.TextOptions[fallback57]);
		case text12:
			this.attributes['optionId'] = text15;
			this.emit(':ask', Statements.TextOptions[text15], Statements.TextOptions[fallback15]);
		case text13:
			this.attributes['optionId'] = text15b;
			this.emit(':ask', Statements.TextOptions[text15b], Statements.TextOptions[fallback15b]);
		case text14:
			this.attributes['optionId'] = text17;
			this.emit(':ask', Statements.TextOptions[text17], Statements.TextOptions[fallback17]);
		case text14b:
			this.attributes['optionId'] = text17b;
			this.emit(':ask', Statements.TextOptions[text17b], Statements.TextOptions[fallback17b]);
		case text15:
			this.attributes['optionId'] = text20;
			this.emit(':ask', Statements.TextOptions[text20], Statements.TextOptions[fallback20]);
		case text15b:
			this.attributes['optionId'] = text20b;
			this.emit(':ask', Statements.TextOptions[text20b], Statements.TextOptions[fallback20b]);
		case text16:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions.investigatePaths + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text16b:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions.investigatePaths + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text17:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions.investigatePaths + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text17b:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions.investigatePaths + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text18:
			this.attributes['optionId'] = text22;
			this.emit(':ask', Statements.TextOptions[text22], Statements.TextOptions[fallback22]);
		case text19:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions.investigatePaths + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text19b:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions.investigatePaths + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text20:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions.investigatePaths + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text20b:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions.investigatePaths + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text21:
			this.attributes['optionId'] = text24;
			this.emit(':ask', Statements.TextOptions[text24], Statements.TextOptions[fallback24]);
		case text22:
			this.attributes['optionId'] = text29;
			this.emit(':ask', Statements.TextOptions[text29], Statements.TextOptions[fallback29]);
		case text24:
			this.attributes['optionId'] = text26;
			this.emit(':ask', Statements.TextOptions[text26], Statements.TextOptions[fallback26]);
		case text26:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text28] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text29:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text34] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text30:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text32] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text36:
			this.attributes['optionId'] = text38;
			this.emit(':ask', Statements.TextOptions[text38], Statements.TextOptions[fallback38]);
		case text37:
			this.attributes['optionId'] = text44;
			this.emit(':ask', Statements.TextOptions[text44], Statements.TextOptions[fallback44]);
		case text38:
			this.attributes['optionId'] = text40;
			this.emit(':ask', Statements.TextOptions[text40], Statements.TextOptions[fallback40]);
		case text39:
			this.attributes['optionId'] = text42b;
			this.emit(':ask', Statements.TextOptions[text42b], Statements.TextOptions[fallback41b]);
		case text40:
			this.attributes['optionId'] = text42;
			this.emit(':ask', Statements.TextOptions[text42], Statements.TextOptions[fallback42]);
		case text41:
			this.attributes['optionId'] = text8;
			this.emit(':ask', Statements.investigatePaths + getOpenPaths(), Statements.investigatePaths + getOpenPathsFallBack());
		case text41b:
			this.attributes['optionId'] = text8;
			this.emit(':ask', Statements.investigatePaths + getOpenPaths(), Statements.investigatePaths + getOpenPathsFallBack());
		case text42:
			this.attributes['optionId'] = text8;
			this.emit(':ask', Statements.investigatePaths + getOpenPaths(), Statements.investigatePaths + getOpenPathsFallBack());
		case text42b:
			this.attributes['optionId'] = text8;
			this.emit(':ask', Statements.investigatePaths + getOpenPaths(), Statements.investigatePaths + getOpenPathsFallBack());
		case text43:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text46] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text44:
			this.attributes['optionId'] = text45b;
			this.emit(':ask', Statements.TextOptions[text45b], Statements.TextOptions[fallback45b]);
		case text45:
			this.attributes['optionId'] = text42b;
			this.emit(':ask', Statements.TextOptions[text42b], Statements.TextOptions[fallback42b]);
		case text45b:
			this.attributes['optionId'] = text47b;
			this.emit(':ask', Statements.TextOptions[text47b], Statements.TextOptions[fallback47b]);
		case text47:
			this.attributes['optionId'] = text8;
			this.emit(':ask', Statements.investigatePaths + getOpenPaths(), Statements.investigatePaths + getOpenPathsFallBack());
		case text47b : 
			this.attributes['optionId'] = text8;
			this.emit(':ask', Statements.investigatePaths + getOpenPaths(), Statements.investigatePaths + getOpenPathsFallBack());
		case text48:
			this.attributes['optionId'] = text49b;
			this.emit(':ask', Statements.TextOptions[text49b], Statements.TextOptions[fallback49b]);
		case text49a:
			this.attributes['optionId'] = text51;
			this.emit(':ask', Statements.TextOptions[text51], Statements.TextOptions[fallback51]);
		case text49b:
			this.attributes['optionId'] = text51;
			this.emit(':ask', Statements.TextOptions[text51], Statements.TextOptions[fallback51]);
		case text50:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text55] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text51:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text53] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text52:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text55] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text56:
			this.attributes['optionId'] = text61;
			this.emit(':ask', Statements.TextOptions[text61], Statements.TextOptions[fallback61]);
		case text57:
			this.attributes['optionId'] = text59;
			this.emit(':ask', Statements.TextOptions[text59], Statements.TextOptions[fallback59]);
		case text58:
			this.attributes['optionId'] = text64;
			this.emit(':ask', Statements.TextOptions[text64], Statements.TextOptions[fallback64]);
		case text59:
			this.attributes['optionId'] = text68;
			this.emit(':ask', Statements.TextOptions[text68], Statements.TextOptions[fallback68]);
		case text60:
			this.attributes['optionId'] = text69;
			this.emit(':ask', Statements.TextOptions[text69], Statements.TextOptions[fallback69]);
		case text61:
			this.attributes['optionId'] = text8;
			this.emit(':ask', Statements.investigatePaths + getOpenPaths(), Statements.investigatePaths + getOpenPathsFallBack());
		case text63:
			this.attributes['optionId'] = text66;
			this.emit(':ask', Statements.TextOptions[text66], Statements.TextOptions[fallback66]);
		case text64:
			this.attributes['optionId'] = text66;
			this.emit(':ask', Statements.TextOptions[text66], Statements.TextOptions[fallback66]);
		case text65:
			this.attributes['optionId'] = text73;
			this.emit(':ask', Statements.TextOptions[text73], Statements.TextOptions[fallback73]);
		case text66: 
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text82] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text67:
			this.attributes['optionId'] = text66;
			this.emit(':ask', Statements.TextOptions[text66], Statements.TextOptions[fallback66]);
		case text68:
			this.attributes['optionId'] = text66;
			this.emit(':ask', Statements.TextOptions[text66], Statements.TextOptions[fallback66]);;
		case text69:
			this.attributes['optionId'] = text71;
			this.emit(':ask', Statements.TextOptions[text71], Statements.TextOptions[fallback70]);
		case text70:
			this.attributes['optionId'] = text66;
			this.emit(':ask', Statements.TextOptions[text66], Statements.TextOptions[fallback66]);
		case text71:
			this.attributes['optionId'] = text66;
			this.emit(':ask', Statements.TextOptions[text66], Statements.TextOptions[fallback66]);
		case text72:
			this.attributes['optionId'] = text75;
			this.emit(':ask', Statements.TextOptions[text75], Statements.TextOptions[fallback75]);
		case text73:
			this.attributes['optionId'] = text8;
			this.emit(':ask', Statements.investigatePaths + getOpenPaths(), Statements.investigatePaths + getOpenPathsFallBack());
		case text74:
			this.attributes['optionId'] = text8;
			this.emit(':ask', Statements.investigatePaths + getOpenPaths(), Statements.investigatePaths + getOpenPathsFallBack());
		case text75:
			this.attributes['optionId'] = text77;
			this.emit(':ask', Statements.TextOptions[text77], Statements.TextOptions[fallback77]);
		case text76:
			this.attributes['optionId'] = text79;
			this.emit(':ask', Statements.TextOptions[text79], Statements.TextOptions[fallback79]);
		case text77:
			this.attributes['optionId'] = text8;
			this.emit(':ask', Statements.investigatePaths + getOpenPaths(), Statements.investigatePaths + getOpenPathsFallBack());
		case text78:
			this.attributes['optionId'] = text8;
			this.emit(':ask', Statements.investigatePaths + getOpenPaths(), Statements.investigatePaths + getOpenPathsFallBack());
		case text79:
			this.attributes['optionId'] = text66;
			this.emit(':ask', Statements.TextOptions[text66], Statements.TextOptions[fallback66]);
		case text80:
			this.attributes['optionId'] = text66;
			this.emit(':ask', Statements.TextOptions[text66], Statements.TextOptions[fallback66]);
		case text81:
			this.attributes['optionId'] = text84;
			this.emit(':ask', Statements.TextOptions[text84], Statements.TextOptions[fallback84]);
		case text84:
			this.attributes['optionId'] = text86;
			this.emit(':ask', Statements.TextOptions[text86], Statements.TextOptions[fallback86]);
		case text86:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text88] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
		case text87:
			this.attributes['optionId'] = text90;
			this.emit(':ask', Statements.TextOptions[text90], Statements.TextOptions[fallback90]);
		case text90:
			this.attributes['optionId'] = text92;
			this.emit(':ask', Statements.TextOptions[text92], Statements.TextOptions[fallback92]);
		case text92:
			this.attributes['optionId'] = text94;
			this.emit(':ask', Statements.TextOptions[text94], Statements.TextOptions[fallback86]);
		case text94:
			this.attributes['optionId'] = text8;
			let statement = Statements.TextOptions[text96] + getOpenPaths();
			this.emit(':ask', statement, getOpenPathsFallBack());
	}
}

const getOptionThreeText = function(optionId){
	switch(optionId){
		case text57: 
			this.attributes['optionId'] = text60;
			this.emit(':ask', Statements.TextOptions[text60], Statements.TextOptions[fallback60]);
		default:
			let fallback = text"fallback" + this.attributes['optionId'];
			this.emit(":ask", Statements.TextOptions[fallback], Statements.TextOptions[fallback]);
	}
}

function getOpenPaths(){
	let openPaths = [];
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

function getOpenPathsFallBack(){
	return "Please say " + getOpenPaths();
}


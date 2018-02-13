'use strict';

// =================================================================================
// App Configuration
// =================================================================================

const app = require('jovo-framework').Jovo;
const bst = require('bespoken-tools');
//const APP_ID = "amzn1.ask.skill.a2357136-45d2-4764-b3b0-cbe0703479b6";
app.setDynamoDb('GoogleSelectAStory');

// Analytics 
app.addBespokenAnalytics("9079a823-5ec4-4765-8e88-d5691069b946");

// Global Intents Outside Unhandled
let myIntentsToSkipUnhandled = [
    'CancelIntent',
    'HelpIntent',
];

// Use the setter
app.setIntentsToSkipUnhandled(myIntentsToSkipUnhandled);

// Use setConfig
app.setConfig({
    intentsToSkipUnhandled: myIntentsToSkipUnhandled,
    // Other configurations
});

// Cards
const cardTitle = 'Select A Story';
const cardImage = 'https://s3.amazonaws.com/selectastory/cinderCharming/prod/largetitle.jpg';
const cardText = 'www.selectastory.com';

// Static variables
const goodbyeText1 = 'Please rate this skill in the Google store.';
const goodbyeText2 = 'Visit selectastory.com for new story news.';
const newGameText = 'Would you like to start a new game?';
const closingUrl = 'https://s3.amazonaws.com/selectastory/cinderCharming/prod/closing.mp3';
const openingUrl = 'https://s3.amazonaws.com/selectastory/cinderCharming/prod/opening.mp3';
const endScenes = [82, 81, 83, 84, 39, 37, 35, 34, 31,30,26, 41, 42, 75, 77, 14, 59, 60, 61, 62, 47, 48, 49, 50, 55, 56, 57, 58, 8, 108, 109, 112, 115, 158, 146, 148,154, 151, 153, 155, 138, 139, 136,137,134,135,125, 127,128,129, 137];


// Main Handler
exports.handler = function(event, context, callback) {
    app.handleRequest(event, callback, handlers);
    app.execute();
};

// =================================================================================
// App Logic
// =================================================================================

const handlers = {

    'LAUNCH' : function () {
        if(app.user().isNewUser()){
            app.user().data.stories = {
            	cinderCharming : {
            		chapter : 1,
            		active : true
            	}
            }
            app.user().data.attempts = 0;
            app.user().data.endScene = false;
            let introText = 'Welcome to Select a Story. Our first story, Cinder Charming by Katie Ernst, begins now'; 
            app.toIntent('TellStoryIntent', introText);
        } else {
            app.user().data.attempts = 0;
            app.user().data.endScene = false;
            app.user().data.continue = true;
            let introText = 'Welcome back to Select a story, would you like to finish your last story or begin a new game?';
            app.toIntent('TellStoryIntent', introText);
        }
    },

    'END' : function () {
        app.user().data.attempts = 0;
        let reason = app.getEndReason();
        console.log('Session ended with reason: ' + reason);
        let speech = app.speechBuilder()
    		.addText([goodbyeText1, goodbyeText2])
    	app.tell(speech);
    },

    'CancelIntent' : function (){
    	app.user().data.attempts = 0;
    	let speech = app.speechBuilder()
    		.addText([goodbyeText1, goodbyeText2])
    	app.showImageCard(cardTitle, cardText, cardImage).tell(speech);
    },

    'HelpIntent' : function (){
    	app.user().data.attempts = 0;
        let helpText = "You are playing an interactive adventure.  \
                        You will be given several choices during the game and just state your choice to make your selection.  \
                        If you want to start a new game say, New Game. \
                        To repeat a scene say, repeat. \
                        If you need these instructions again just say, help. \
                        To go back to the game say, go back.";
        app.showImageCard(cardTitle, cardText, cardImage).ask(helpText, 'Say repeat to hear these instructions again or go back to continue the game');
    },

    'ContinueIntent' : function () {
        if(app.user().data.continue){
            app.user().data.continue = false;
            app.toIntent('TellStoryIntent');
        } else {
            if(endScenes.indexOf(app.user().data.stories.cinderCharming.chapter) !== -1){
                app.toIntent('NewGameIntent');
            } else {
                let repromptUrl = 'https://s3.amazonaws.com/selectastory/cinderCharming/prod/reprompt' + app.user().data.stories.cinderCharming.chapter + '.mp3';
                let speech = app.speechBuilder()
                	.addText('Sorry, that is not an option right now.')
                	.addBreak('500ms')
                	.addText(repromptUrl)
                let repromptSpeech = app.speechBuilder()
                	.addAudio(repromptUrl, 'Chapter ' + app.user().data.stories.cinderCharming.chapter);
                app.followUpState('cinderCharmingState').showImageCard(cardTitle, cardText, cardImage).ask(speech, repromptSpeech);
            }
        }      
    },

    'EndSceneIntent' : function () {
        app.user().data.attempts = 0;
        app.user().data.endScene = true;
        let url = 'https://s3.amazonaws.com/selectastory/cinderCharming/prod/'+app.user().data.stories.cinderCharming.chapter+'.mp3';
        let speech = app.speechBuilder()
        	.addAudio(url, newGameText)
            .addBreak('1500ms')
            .addText(newGameText)
        app.followUpState('cinderCharmingState').showImageCard(cardTitle, cardText, cardImage).ask(speech, newGameText);
    },

    'GoBackIntent' : function () {
        app.toIntent('TellStoryIntent');
    },

    'NewGameIntent' : function(){
        app.user().data.attempts = 0;
        app.user().data.continue = false;
        app.user().data.endScene = false;
        app.user().data.stories.cinderCharming.chapter = 1;
        let url = 'https://s3.amazonaws.com/selectastory/cinderCharming/prod/1.mp3';
        let repromptUrl = 'https://s3.amazonaws.com/selectastory/cinderCharming/prod/reprompt1.mp3';
        let speech = app.speechBuilder()
        	.addAudio(url, 'Chapter ' + app.user().data.stories.cinderCharming.chapter);
        let repromptSpeech = app.speechBuilder()
        	.addAudio(repromptUrl, 'Chapter ' + app.user().data.stories.cinderCharming.chapter);
        app.followUpState('cinderCharmingState').showImageCard(cardTitle, cardText, cardImage).ask(speech, repromptSpeech);
    },

    'StartOverIntent' : function () { 
        app.user().data.attempts = 0;
        app.user().data.endScene = false;
        app.user().data.stories.cinderCharming.chapter = 1;
        let url = 'https://s3.amazonaws.com/selectastory/cinderCharming/prod/'+app.user().data.stories.cinderCharming.chapter+'.mp3';
        let repromptUrl = 'https://s3.amazonaws.com/selectastory/cinderCharming/prod/reprompt'+app.user().data.stories.cinderCharming.chapter+'.mp3';
        let speech = app.speechBuilder()
    		.addAudio(url, 'Chapter ' + app.user().data.stories.cinderCharming.chapter);
    	let reprompt = app.speechBuilder()
    		.addAudio(repromptUrl, 'Chapter ' + app.user().data.stories.cinderCharming.chapter);
        app.followUpState('cinderCharmingState').showImageCard(cardTitle, cardText, cardImage).ask(speech, reprompt);
    },

    'TellStoryIntent' : function (introText){
        app.user().data.attempts = 0;
        let url = 'https://s3.amazonaws.com/selectastory/cinderCharming/prod/'+app.user().data.stories.cinderCharming.chapter+'.mp3';
        let repromptUrl = 'https://s3.amazonaws.com/selectastory/cinderCharming/prod/reprompt'+app.user().data.stories.cinderCharming.chapter+'.mp3';
        let speech = '';
        let reprompt = '';
        if(app.user().isNewUser()){
        	speech = app.speechBuilder()
        		.addAudio(openingUrl, 'Hey')
	            .addText(introText)
	            .addBreak('2000ms')
	            .addAudio(url, 'Chapter ' + app.user().data.stories.cinderCharming.chapter);
	        reprompt = app.speechBuilder()
	        	.addAudio(repromptUrl, 'Chapter ' + app.user().data.stories.cinderCharming.chapter)
        } else if (introText) {
        	speech = app.speechBuilder()
        		.addAudio(openingUrl, 'Hey')
	            .addText(introText);
	        reprompt = app.speechBuilder()
	        	.addText('Would you like to finish your story or begin a new game?');
        } else {
        	speech = app.speechBuilder()
        		.addAudio(url, 'Chapter ' + app.user().data.stories.cinderCharming.chapter);
        	reprompt = app.speechBuilder()
        		.addAudio(repromptUrl, 'Chapter ' + app.user().data.stories.cinderCharming.chapter);
        }
        app.followUpState('cinderCharmingState').showImageCard(cardTitle, cardText, cardImage).ask(speech, reprompt);
    },

    'Unhandled' : function (){
    	if (endScenes.indexOf(app.user().data.stories.cinderCharming.chapter) !== -1){
            app.showImageCard(cardTitle, cardText, cardImage).ask('if you would like to start a new game, say "new game"', 'if you would like to start a new game, say "new game"');
        } else if (app.user().data.attempts < 2){
            app.user().data.attempts++;
            let repromptUrl = 'https://s3.amazonaws.com/selectastory/cinderCharming/prod/reprompt' + app.user().data.stories.cinderCharming.chapter + '.mp3';
            let speech = app.speechBuilder()
            	.addAudio(repromptUrl, 'Can you say that again?');
            app.followUpState('cinderCharmingState').showImageCard(cardTitle, cardText, cardImage).ask(speech, speech);
        } else {
            app.user().data.attempts = 0;
            let speech = app.speechBuilder()
            	.addText("Why don't you come back another time and play again.")
            	.addAudio(closingUrl, 'Thanks for playing, why dont you come back another time')
            app.showImageCard(cardTitle, cardText, cardImage).tell(speech)
        }
    },

    'cinderCharmingState' : {

    	// Basic Intents
	    'ContinueIntent' : function () {
	        if(app.user().data.continue){
	            app.user().data.continue = false;
	            app.toIntent('TellStoryIntent');
	        } else {
	            if(endScenes.indexOf(app.user().data.stories.cinderCharming.chapter) !== -1){
	                app.toIntent('NewGameIntent');
	            } else {
	                let repromptUrl = 'https://s3.amazonaws.com/selectastory/cinderCharming/prod/reprompt' + app.user().data.stories.cinderCharming.chapter + '.mp3';
	                let speech = app.speechBuilder()
	                	.addText('Sorry, that is not an option right now.')
	                	.addBreak('500ms')
	                	.addText(repromptUrl)
	                let repromptSpeech = app.speechBuilder()
	                	.addAudio(repromptUrl, 'Chapter ' + app.user().data.stories.cinderCharming.chapter);
	                app.followUpState('cinderCharmingState').showImageCard(cardTitle, cardText, cardImage).ask(speech, repromptSpeech);
	            }
	        }      
	    },

	    'GoBackIntent' : function () {
	        app.toIntent('TellStoryIntent');
	    },

	    'NewGameIntent' : function(){
	        app.user().data.attempts = 0;
	        app.user().data.continue = false;
	        app.user().data.endScene = false;
	        app.user().data.stories.cinderCharming.chapter = 1;
	        let url = 'https://s3.amazonaws.com/selectastory/cinderCharming/prod/1.mp3';
	        let repromptUrl = 'https://s3.amazonaws.com/selectastory/cinderCharming/prod/reprompt1.mp3';
	        let speech = app.speechBuilder()
	        	.addAudio(url, 'Chapter ' + app.user().data.stories.cinderCharming.chapter);
	        let repromptSpeech = app.speechBuilder()
	        	.addAudio(repromptUrl, 'Chapter ' + app.user().data.stories.cinderCharming.chapter);
	        app.followUpState('cinderCharmingState').showImageCard(cardTitle, cardText, cardImage).ask(speech, repromptSpeech);
	    },

	    'NoIntent' : function () {
	        if (endScenes.indexOf(app.user().data.stories.cinderCharming.chapter) !== -1) {
	            app.user().data.stories.cinderCharming.chapter = 1;
	            let speech = app.speechBuilder()
	            	.addText(goodbyeText)
	            	.addAudio(closingUrl, goodbyeText)
	            app.showImageCard(cardTitle, cardText, cardImage).tell(speech);
	        } else if(app.user().data.stories.cinderCharming.chapter === 80){
	            app.user().data.stories.cinderCharming.chapter = 82;
	            app.toIntent('EndSceneIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'NextIntent' : function () {
	        if(endScenes.indexOf(app.user().data.stories.cinderCharming.chapter) === -1){
	            let repromptUrl = 'https://s3.amazonaws.com/selectastory/cinderCharming/prod/reprompt'+app.user().data.stories.cinderCharming.chapter+'.mp3'; 
	            let speech = app.speechBuilder()
	            	.addAudio(repromptUrl, 'Chapter ' + app.user().data.stories.cinderCharming.chapter);
	            app.showImageCard(cardTitle, cardText, cardImage).ask(speech, speech);
	        } else {
	            app.showImageCard(cardTitle, cardText, cardImage).ask(newGameText, newGameText);
	        }  
	    },

	    'RepeatIntent' : function () {
	        if(endScenes.indexOf(app.user().data.stories.cinderCharming.chapter) !== -1){
	            app.toIntent('EndSceneIntent');
	        } else {
	            app.toIntent('TellStoryIntent'); 
	        } 
	    },

	    'StartOverIntent' : function () { 
	        app.user().data.attempts = 0;
	        app.user().data.endScene = false;
	        app.user().data.stories.cinderCharming.chapter = 1;
	        let url = 'https://s3.amazonaws.com/selectastory/cinderCharming/prod/'+app.user().data.stories.cinderCharming.chapter+'.mp3';
        let repromptUrl = 'https://s3.amazonaws.com/selectastory/cinderCharming/prod/reprompt'+app.user().data.stories.cinderCharming.chapter+'.mp3';
	        let speech = app.speechBuilder()
	    		.addAudio(url, 'Chapter ' + app.user().data.stories.cinderCharming.chapter);
	    	let reprompt = app.speechBuilder()
	    		.addAudio(repromptUrl, 'Chapter ' + app.user().data.stories.cinderCharming.chapter);
	        app.followUpState('cinderCharmingState').showImageCard(cardTitle, cardText, cardImage).ask(speech, reprompt);
	    },

	    'YesIntent' : function () {
	        if (endScenes.indexOf(app.user().data.stories.cinderCharming.chapter) !== -1) {
	            app.toIntent('NewGameIntent');
	        } else if(app.user().data.stories.cinderCharming.chapter === 80){
	            app.user().data.stories.cinderCharming.chapter = 81;
	            app.toIntent('EndSceneIntent');
	        } else if(app.user().data.continue) {
	            app.showImageCard(cardTitle, cardText, cardImage).ask('You can say finish your game or new game', 'you can say finish your game or new game');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },


	    // Story Intents
	    'AidIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch(chapters){
	            case 20:
	                app.user().data.stories.cinderCharming.chapter = 43;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 21:
	                app.user().data.stories.cinderCharming.chapter = 45;
	                app.toIntent('TellStoryIntent');
	                break;
	            default:
	                app.toIntent('Unhandled');
	        }
	    },

	    'AssistanceIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch(chapters){
	            case 121: 
	                app.user().data.stories.cinderCharming.chapter = 124;
	                app.toIntent('TellStoryIntent');
	                break;
	            default:
	                app.toIntent('Unhandled');
	        }
	    },

	    'AttorneyIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 101){
	            app.user().data.stories.cinderCharming.chapter = 117;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'BadNewsIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 6){
	            app.user().data.stories.cinderCharming.chapter = 9;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'BackStairsIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 132){
	            app.user().data.stories.cinderCharming.chapter = 137;
	            app.toIntent('EndSceneIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'BedPostsIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 131){
	            app.user().data.stories.cinderCharming.chapter = 139;
	            app.toIntent('EndSceneIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'BlondeIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch(chapters){
	            case 67:
	            case 68: 
	                app.user().data.stories.cinderCharming.chapter = 69;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 69 : 
	                app.user().data.stories.cinderCharming.chapter = 77;
	                app.toIntent('EndSceneIntent');
	                break;
	            case 70 : 
	                app.user().data.stories.cinderCharming.chapter = 71;
	                app.toIntent('TellStoryIntent');
	                break;
	            default:
	                app.toIntent('Unhandled');
	        }
	    },

	    'BouquetIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 36){
	            app.user().data.stories.cinderCharming.chapter = 37;
	            app.toIntent('EndSceneIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'BrunetteIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch(chapters){
	            case 67:
	            case 68 : 
	                app.user().data.stories.cinderCharming.chapter = 70;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 69 : 
	                app.user().data.stories.cinderCharming.chapter = 78;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 70 : 
	                app.user().data.stories.cinderCharming.chapter = 72;
	                app.toIntent('TellStoryIntent');
	                break;
	            default:
	                app.toIntent('Unhandled');
	        }
	    },

	    'BurstInIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 4){
	            app.user().data.stories.cinderCharming.chapter = 6;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'ClarenceIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch(chapters){
	            case 43 : 
	                app.user().data.stories.cinderCharming.chapter = 51;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 45 : 
	                app.user().data.stories.cinderCharming.chapter = 53;
	                app.toIntent('TellStoryIntent');
	                break;
	            default:
	                app.toIntent('Unhandled');
	        }
	    },

	    'CoalChuteIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 133){
	            app.user().data.stories.cinderCharming.chapter = 134;
	            app.toIntent('EndSceneIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'CottageIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch(chapters){
	            case 1: 
	                app.user().data.stories.cinderCharming.chapter = 100;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 79 : 
	                app.user().data.stories.cinderCharming.chapter = 84;
	                app.toIntent('EndSceneIntent');
	                break;
	            default:
	                app.toIntent('Unhandled');
	        }
	    },

	    'DownstairsIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        if(chapters === 119 || chapters === 122){
	            app.user().data.stories.cinderCharming.chapter = 132;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'DoSomethingIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        if(chapters === 103 || chapters === 113){
	            app.user().data.stories.cinderCharming.chapter = 114;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled'); 
	        }
	    },

	    'DragonIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch(chapters){
	            case 11:
	            case 13:
	                app.user().data.stories.cinderCharming.chapter = 15;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 43 : 
	                app.user().data.stories.cinderCharming.chapter = 52;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 45 : 
	                app.user().data.stories.cinderCharming.chapter = 54;
	                app.toIntent('TellStoryIntent');
	                break;
	            default:
	                app.toIntent('Unhandled');
	        }
	    },

	    'DresserIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 131){
	            app.user().data.stories.cinderCharming.chapter = 138;
	            app.toIntent('EndSceneIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'DropIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 27){
	            app.user().data.stories.cinderCharming.chapter = 32;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'FairyIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 76){
	            app.user().data.stories.cinderCharming.chapter = 80;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'FinchesIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch(chapters){
	            case 144:
	            case 145: 
	                app.user().data.stories.cinderCharming.chapter = 146;
	                app.toIntent('EndSceneIntent');
	                break;
	            default:
	                app.toIntent('Unhandled');
	        }
	    },

	    'FindHerIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        if(chapters === 73 || chapters === 74){
	            app.user().data.stories.cinderCharming.chapter = 76;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'FireplaceIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 132){
	            app.user().data.stories.cinderCharming.chapter = 136;
	            app.toIntent('EndSceneIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'FramedIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 40){
	            app.user().data.stories.cinderCharming.chapter = 41;
	            app.toIntent('EndSceneIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'FrontPorchIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 133){
	            app.user().data.stories.cinderCharming.chapter = 135;
	            app.toIntent('EndSceneIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'GiveUpIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        if(chapters === 11 || chapters === 13){
	            app.user().data.stories.cinderCharming.chapter = 14;
	            app.toIntent('EndSceneIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'GoForItIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 12){
	            app.user().data.stories.cinderCharming.chapter = 64;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'GoingIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch(chapters){
	            case 20:
	                app.user().data.stories.cinderCharming.chapter = 44;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 21:
	                app.user().data.stories.cinderCharming.chapter = 46;
	                app.toIntent('TellStoryIntent');
	                break;
	            default:
	                app.toIntent('Unhandled');
	        }
	    },

	    'GoodNewsIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 6){
	            app.user().data.stories.cinderCharming.chapter = 8;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'HaikuIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch(chapters){
	            case 64 : 
	                app.user().data.stories.cinderCharming.chapter = 68;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 140 : 
	                app.user().data.stories.cinderCharming.chapter = 156;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 141 : 
	                app.user().data.stories.cinderCharming.chapter = 142;
	                app.toIntent('TellStoryIntent');
	                break;           
	            default:
	                app.toIntent('Unhandled');
	        }
	    },

	    'HearMoreIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 10){
	            app.user().data.stories.cinderCharming.chapter = 12;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'KnifeIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch (chapters){
	            case 102:
	                app.user().data.stories.cinderCharming.chapter = 105;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 105:
	                app.user().data.stories.cinderCharming.chapter = 109;
	                app.toIntent('EndSceneIntent');   
	                break;
	            default:
	                app.toIntent('Unhandled');     
	        }
	    },

	    'LeaveAloneIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        if(chapters === 73 || chapters === 74){
	            app.user().data.stories.cinderCharming.chapter = 75;
	            app.toIntent('EndSceneIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'LeaveIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch(chapters){
	            case 16 : 
	                app.user().data.stories.cinderCharming.chapter = 22;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 118 : 
	                app.user().data.stories.cinderCharming.chapter = 140;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 142:
	            case 143:
	            case 156:
	            case 157:
	                app.user().data.stories.cinderCharming.chapter = 145;
	                app.toIntent('TellStoryIntent');
	                break;
	            default:
	                app.toIntent('Unhandled');
	        }
	    },

	    'LieIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch (chapters){
	            case 44:
	                app.user().data.stories.cinderCharming.chapter = 48;
	                app.toIntent('EndSceneIntent');
	                break;
	            case 46:
	                app.user().data.stories.cinderCharming.chapter = 50;
	                app.toIntent('EndSceneIntent');
	                break;
	            case 51:
	                app.user().data.stories.cinderCharming.chapter = 60;
	                app.toIntent('EndSceneIntent');
	                break;
	            case 52:
	                app.user().data.stories.cinderCharming.chapter = 62;
	                app.toIntent('EndSceneIntent');
	                break;
	            case 53:
	                app.user().data.stories.cinderCharming.chapter = 58;
	                app.toIntent('EndSceneIntent');
	                break;
	            case 54:
	                app.user().data.stories.cinderCharming.chapter = 56;
	                app.toIntent('EndSceneIntent');
	                break;
	            case 123:
	            case 126:
	                app.user().data.stories.cinderCharming.chapter = 128;
	                app.toIntent('EndSceneIntent');
	                break;
	            default:
	                app.toIntent('Unhandled');     
	        }
	    },

	    'LimerickIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch(chapters){
	            case 64 : 
	                app.user().data.stories.cinderCharming.chapter = 67;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 140 : 
	                app.user().data.stories.cinderCharming.chapter = 157;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 141 : 
	                app.user().data.stories.cinderCharming.chapter = 143;
	                app.toIntent('TellStoryIntent');
	                break;
	            default:
	                app.toIntent('Unhandled');
	        }
	    },

	    'ListenIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 4){
	            app.user().data.stories.cinderCharming.chapter = 7;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'LoveIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 152){
	            app.user().data.stories.cinderCharming.chapter = 155;
	            app.toIntent('EndSceneIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'MansionIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 79){
	            app.user().data.stories.cinderCharming.chapter = 83;
	            app.toIntent('EndSceneIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'MatureIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        if(chapters === 8 || chapters === 9 || chapters === 7){
	            app.user().data.stories.cinderCharming.chapter = 11;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'MouthShutIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch(chapters){
	            case 71:
	            case 72:
	            case 78:
	                app.user().data.stories.cinderCharming.chapter = 74;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 147: 
	                app.user().data.stories.cinderCharming.chapter = 149;
	                app.toIntent('TellStoryIntent');
	                break;
	            default:
	                app.toIntent('Unhandled');
	        }
	    },

	    'MurderIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        if(chapters === 100 || chapters === 114){
	            app.user().data.stories.cinderCharming.chapter = 102;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'OfferIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch(chapters){
	            case 116:
	                app.user().data.stories.cinderCharming.chapter = 118;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 117: 
	                app.user().data.stories.cinderCharming.chapter = 118;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 124:
	                app.user().data.stories.cinderCharming.chapter = 125;
	                app.toIntent('EndSceneIntent');
	                break;
	            default:
	                app.toIntent('Unhandled');
	        }
	    },

	    'OneSeventyFiveIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 32){
	            app.user().data.stories.cinderCharming.chapter = 34;
	            app.toIntent('EndSceneIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'OneFiftyIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 32){
	            app.user().data.stories.cinderCharming.chapter = 33;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'OpalDragonIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 15){
	            app.user().data.stories.cinderCharming.chapter = 17;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'OstrichIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 33){
	            app.user().data.stories.cinderCharming.chapter = 36;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'OutsideIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        if(chapters === 119 || chapters === 122){
	            app.user().data.stories.cinderCharming.chapter = 133;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'PalaceIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 1){
	            app.user().data.stories.cinderCharming.chapter = 4;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'ParakeetIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 33){
	            app.user().data.stories.cinderCharming.chapter = 35;
	            app.toIntent('EndSceneIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'PigeonIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch(chapters){
	            case 144:
	            case 145: 
	                app.user().data.stories.cinderCharming.chapter = 147;
	                app.toIntent('TellStoryIntent');
	                break;
	            default:
	                app.toIntent('Unhandled');
	        }
	    },

	    'PoisonIntent' : function () {
	       let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch (chapters){
	            case 102:
	                app.user().data.stories.cinderCharming.chapter = 104;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 104:
	                app.user().data.stories.cinderCharming.chapter = 108;
	                app.toIntent('EndSceneIntent');   
	                break;
	            default:
	                app.toIntent('Unhandled');     
	        } 
	    },

	    'RainbowIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 36){
	            app.user().data.stories.cinderCharming.chapter = 38;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'ReconsiderIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch(chapters){
	            case 104:
	                app.user().data.stories.cinderCharming.chapter = 107;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 105:
	                app.user().data.stories.cinderCharming.chapter = 110;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 106:
	                app.user().data.stories.cinderCharming.chapter = 111;
	                app.toIntent('TellStoryIntent');
	                break;
	            default:
	                app.toIntent('Unhandled');
	        }
	    },

	    'RefuseIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch(chapters){
	            case 10:
	            case 12:
	                app.user().data.stories.cinderCharming.chapter = 13;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 116:
	                app.user().data.stories.cinderCharming.chapter = 119;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 117:
	                app.user().data.stories.cinderCharming.chapter = 120;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 124:
	                app.user().data.stories.cinderCharming.chapter = 126;
	                app.toIntent('TellStoryIntent');
	                break;
	            default:
	                app.toIntent('Unhandled');
	        }
	    },

	    'RubItInIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 147){
	            app.user().data.stories.cinderCharming.chapter = 148;
	            app.toIntent('EndSceneIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'RubyDragonIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 15){
	            app.user().data.stories.cinderCharming.chapter = 16;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'RunIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch(chapters){
	            case 29 : 
	                app.user().data.stories.cinderCharming.chapter = 30;
	                app.toIntent('EndSceneIntent');
	                break;
	            case 121 : 
	                app.user().data.stories.cinderCharming.chapter = 123;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 150 : 
	                app.user().data.stories.cinderCharming.chapter = 152;
	                app.toIntent('TellStoryIntent');
	                break;
	            default:
	                app.toIntent('Unhandled');
	        }
	    },

	    'SatchelIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 17){
	            app.user().data.stories.cinderCharming.chapter = 21;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'SeaIntent' : function (){
	        if(app.user().data.stories.cinderCharming.chapter === 120){
	            app.user().data.stories.cinderCharming.chapter = 121;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'ShoeIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 76){
	            app.user().data.stories.cinderCharming.chapter = 79;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'SlashIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        if(chapters === 29 || chapters === 27){
	            app.user().data.stories.cinderCharming.chapter = 31;
	            app.toIntent('EndSceneIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'SmileAndNodIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 149){
	            app.user().data.stories.cinderCharming.chapter = 151;
	            app.toIntent('EndSceneIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'SmotherIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch (chapters){
	            case 102:
	                app.user().data.stories.cinderCharming.chapter = 106;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 106:
	                app.user().data.stories.cinderCharming.chapter = 112;
	                app.toIntent('EndSceneIntent');   
	                break;
	            default:
	                app.toIntent('Unhandled');     
	        }
	    },

	    'SnappedIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 40){
	            app.user().data.stories.cinderCharming.chapter = 42;
	            app.toIntent('EndSceneIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'SneakIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch(chapters){
	            case 22:
	                app.user().data.stories.cinderCharming.chapter = 27;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 23:
	                app.user().data.stories.cinderCharming.chapter = 29;
	                app.toIntent('TellStoryIntent');
	                break;
	            default:
	                app.toIntent('Unhandled');
	        }
	    },

	    'SnoopIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 101){
	            app.user().data.stories.cinderCharming.chapter = 116;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'StayIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch(chapters){
	            case 118 : 
	                app.user().data.stories.cinderCharming.chapter = 141;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 142:
	            case 143:
	                app.user().data.stories.cinderCharming.chapter = 144;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 156:
	            case 157:
	                app.user().data.stories.cinderCharming.chapter = 158;
	                app.toIntent('EndSceneIntent');
	                break;
	            default:
	                app.toIntent('Unhandled');
	        }
	    },

	    'TantrumIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        if(chapters === 7 || chapters === 8 || chapters === 9){
	            app.user().data.stories.cinderCharming.chapter = 10;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'TellHimIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch (chapters){
	            case 149:
	                app.user().data.stories.cinderCharming.chapter = 150;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 150:
	                app.user().data.stories.cinderCharming.chapter = 153;
	                app.toIntent('EndSceneIntent');   
	                break;
	            default:
	                app.toIntent('Unhandled');     
	        }
	    },

	    'TimIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 38){
	            app.user().data.stories.cinderCharming.chapter = 40;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'TravelLightIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 17){
	            app.user().data.stories.cinderCharming.chapter = 20;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'TresIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 38){
	            app.user().data.stories.cinderCharming.chapter = 39;
	            app.toIntent('EndSceneIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'TruthIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch (chapters){
	            case 44:
	                app.user().data.stories.cinderCharming.chapter = 47;
	                app.toIntent('EndSceneIntent');
	                break;
	            case 46:
	                app.user().data.stories.cinderCharming.chapter = 49;
	                app.toIntent('EndSceneIntent');
	                break;
	            case 51:
	                app.user().data.stories.cinderCharming.chapter = 59;
	                app.toIntent('EndSceneIntent');
	                break;
	            case 52:
	                app.user().data.stories.cinderCharming.chapter = 61;
	                app.toIntent('EndSceneIntent');
	                break;
	            case 53:
	                app.user().data.stories.cinderCharming.chapter = 57;
	                app.toIntent('EndSceneIntent');
	                break;
	            case 54:
	                app.user().data.stories.cinderCharming.chapter = 55;
	                app.toIntent('EndSceneIntent');
	                break;
	            case 71:
	            case 72:
	            case 78:
	                app.user().data.stories.cinderCharming.chapter = 73;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 123:
	                app.user().data.stories.cinderCharming.chapter = 129;
	                app.toIntent('EndSceneIntent');
	                break;
	            case 126:
	                app.user().data.stories.cinderCharming.chapter = 127;
	                app.toIntent('EndSceneIntent');
	                break;        
	            default:
	                app.toIntent('Unhandled');     
	        }
	    },

	    'UpstairsIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        if(chapters === 119 || chapters === 122){
	            app.user().data.stories.cinderCharming.chapter = 131;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'WaitIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch (chapters){
	            case 22:
	            case 23:
	                app.user().data.stories.cinderCharming.chapter = 26;
	                app.toIntent('EndSceneIntent');
	                break;
	            case 100:    
	                app.user().data.stories.cinderCharming.chapter = 103;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 103:
	                app.user().data.stories.cinderCharming.chapter = 113;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 107:
	            case 110:
	            case 111:
	                app.user().data.stories.cinderCharming.chapter = 103;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 113:
	                app.user().data.stories.cinderCharming.chapter = 115;
	                app.toIntent('EndSceneIntent');   
	                break;
	            default:
	                app.toIntent('Unhandled');     
	        }
	    },

	    'WearIntent' : function () {
	        if(app.user().data.stories.cinderCharming.chapter === 16){
	            app.user().data.stories.cinderCharming.chapter = 23;
	            app.toIntent('TellStoryIntent');
	        } else {
	            app.toIntent('Unhandled');
	        }
	    },

	    'WillIntent' : function () {
	        let chapters = app.user().data.stories.cinderCharming.chapter;
	        switch (chapters){
	            case 100:
	            case 107:
	            case 110:
	            case 111:
	            case 114:
	                app.user().data.stories.cinderCharming.chapter = 101;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 120:
	                app.user().data.stories.cinderCharming.chapter = 122;
	                app.toIntent('TellStoryIntent');
	                break;
	            case 152:
	                app.user().data.stories.cinderCharming.chapter = 154;
	                app.toIntent('EndSceneIntent');
	                break;
	            default:
	                app.toIntent('Unhandled');     
	        }
	    },

	    'Unhandled' : function (){
	    	if (endScenes.indexOf(app.user().data.stories.cinderCharming.chapter) !== -1){
	            app.showImageCard(cardTitle, cardText, cardImage).ask('if you would like to start a new game, say "new game"', 'if you would like to start a new game, say "new game"');
	        } else if (app.user().data.attempts < 2){
	            app.user().data.attempts++;
	            let repromptUrl = 'https://s3.amazonaws.com/selectastory/cinderCharming/prod/reprompt' + app.user().data.stories.cinderCharming.chapter + '.mp3';
	            let speech = app.speechBuilder()
	            	.addAudio(repromptUrl, 'Can you say that again?');
	            app.followUpState('cinderCharmingState').showImageCard(cardTitle, cardText, cardImage).ask(speech, speech);
	        } else {
	            app.user().data.attempts = 0;
	            let speech = app.speechBuilder()
	            	.addText("Why don't you come back another time and play again.")
	            	.addAudio(closingUrl, 'Thanks for playing, why dont you come back another time')
	            app.showImageCard(cardTitle, cardText, cardImage).tell(speech)
	        }
	    }
	}   
};


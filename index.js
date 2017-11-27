const Alexa = require('alexa-sdk');
const pathTree = require('./pathTree');

// App Config

const APP_ID = "amzn1.ask.skill.a2357136-45d2-4764-b3b0-cbe0703479b6";
const permissionArray = ['read::alexa:device:all:address'];
const states = {
    gameState : 'gameState',
    helpState : 'helpState',
    bookendState : 'bookendState'
};
const cardTitle = 'Select A Story';
const cardImage = {
    largeImageUrl : 'https://s3.amazonaws.com/selectastory/cinderella/prod/largeImage.jpg', 
    smallImageUrl : 'https://s3.amazonaws.com/selectastory/cinderella/prod/smallImage.jpg' 
};
const cardText = 'www.selectastory.com';
var storyIndex = 0;

// App Handler Functions

const newSessionHandlers = {

    'LaunchRequest': function(){
        this.emit('NewSession');
    },

     // This will either start a new game if you are not a returning user or you're at the beginning or take you to where you left off
    'NewSession': function() {
        // This conditional will need to be changed once more stories are added, but for now this should trigger for a new user and push them into Cinderella
        if(!this.attributes['stories'] || !this.attributes['stories'].length > 0 || this.attributes['stories'][0]['chapter'] === 0){
            this.attributes['stories'] = [];
            var activeStory = {
                name : 'cinderella',
                chapter : 1,
                active : true
            };
            this.attributes['stories'].push(activeStory);
            this.handler.state = states.gameState;
            storyIndex = 0;
            this.emitWithState('TellStoryIntent', 1);
        } else {
            storyIndex = getActiveStoryIndex.call(this);
            this.handler.state = states.gameState;
            var chapter = this.attributes['stories'][storyIndex]['chapter'];
            this.emitWithState('TellStoryIntent', chapter);
        }
    }
};

const gameHandlers = Alexa.CreateStateHandler(states.gameState,  {

    'LaunchRequest': function(){
        storyIndex = getActiveStoryIndex.call(this);
        this.handler.state = states.gameState;
        var chapter = this.attributes['stories'][storyIndex]['chapter'];
        this.emitWithState('TellStoryIntent', chapter);
    },

    'SessionEndedRequest' : function () {
        this.emit(':saveState', true);
    },

    // Amazon Intents
    
    'AMAZON.CancelIntent' : function () { 
        var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/goodbye.mp3';
        this.emit(':tellWithCard', '<audio src="'+url+'" />', cardTitle, cardText, cardImage); 
    },

    'AMAZON.HelpIntent' : function () {
        this.handler.state = states.helpState;
        this.emitWithState('HelpIntent');
    },

    'AMAZON.PauseIntent' : function () { 
        var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/goodbye.mp3';
        this.emit(':tellWithCard', '<audio src="'+url+'" />', cardTitle, cardText, cardImage);
    },

    'AMAZON.RepeatIntent' : function () {
        var chapter = this.attributes['stories'][storyIndex]['chapter'];
        this.emitWithState('TellStoryIntent', chapter); 
    },

    'AMAZON.StartOverIntent' : function () { 
        // Commented Out For Test
        //var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/1.mp3';
        //var repromptUrl = 'https://s3.amazonaws.com/selectastory/cinderella/prod/reprompt1.mp3';
        
        // For Test
        var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/reprompt1.mp3';

        this.attributes['stories'][storyIndex]['chapter'] = 1;

        // May Not Need If Emit Works
        //this.response.speak('<audio>'+url+'</audio>').cardRenderer(cardTitle, cardText, cardImage).listen('<audio>'+repromptUrl+'</audio>'); 
        //this.emit(':responseReady');
        
        this.emit(':askWithCard', '<audio src="'+url+'" />', '<audio src="'+url+'" />', cardTitle, cardText, cardImage); 
    },

    'AMAZON.StopIntent' : function () { 
        var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/goodbye.mp3';
        this.emit(':tellWithCard', '<audio src="'+url+'" />', cardTitle, cardText, cardImage); 
    },


    // Custom Intents
    'FirstIntent' : function() {     
        var chapter = this.attributes['stories'][storyIndex]['chapter'];
        var option = pathTree.pathways[chapter]['first'];
        this.attributes['stories'][storyIndex]['chapter'] = option;
        if(isEndScene.call(this)){
            this.handler.state = states.bookendState;
            this.emitWithState('EndSceneIntent', option);
        } else {
            this.emitWithState('TellStoryIntent', option);
        }
    },

    'NewGameIntent' : function(){
        // Commented Out For Test
        //var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/1.mp3';
        //var repromptUrl = 'https://s3.amazonaws.com/selectastory/cinderella/prod/reprompt1.mp3';
        
        // For Test
        var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/reprompt1.mp3';

        this.attributes['stories'][storyIndex]['chapter'] = 1;

        // May Not Need If Emit Works
        //this.response.speak('<audio>'+url+'</audio>').cardRenderer(cardTitle, cardText, cardImage).listen('<audio>'+repromptUrl+'</audio>'); 
        //this.emit(':responseReady');
        
        this.emit(':askWithCard', '<audio src="'+url+'" />', '<audio src="'+url+'" />', cardTitle, cardText, cardImage); 
    },

    'SecondIntent' : function() {
        var chapter = this.attributes['stories'][storyIndex]['chapter'];
        var option = pathTree.pathways[chapter]['second'];
        this.attributes['stories'][storyIndex]['chapter'] = option;
        if(isEndScene.call(this)){
            this.handler.state = states.bookendState;
            this.emitWithState('EndSceneIntent', option);
        } else {
            this.emitWithState('TellStoryIntent', option);
        }
    },

    'SkipIntent' : function (){
        var chapter = this.attributes['stories'][storyIndex]['chapter'];
        var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/reprompt'+chapter+'.mp3';

        // May Not Need If Emit Works
        //this.response.speak('<audio>'+url+'</audio>').cardRenderer(cardTitle, cardText, cardImage).listen('<audio>'+repromptUrl+'</audio>'); 
        //this.emit(':responseReady');
        
        this.emit(':askWithCard', '<audio src="'+url+'" />', '<audio src="'+url+'" />', cardTitle, cardText, cardImage);
    },

    'TellStoryIntent' : function (chapter){
        // Commented Out For Test
        // var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/'+chapter+'.mp3';
        // var repromptUrl = 'https://s3.amazonaws.com/selectastory/cinderella/prod/reprompt'+chapter+'.mp3';

        // Used for Test
        var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/reprompt'+chapter+'.mp3';
        // May Not Need If Emit Works
        //this.response.speak('<audio>'+url+'</audio>').cardRenderer(cardTitle, cardText, cardImage).listen('<audio>'+repromptUrl+'</audio>'); 
        //this.emit(':responseReady');
        
        this.emit(':askWithCard', '<audio src="'+url+'" />', '<audio src="'+url+'" />', cardTitle, cardText, cardImage);
    },

    'ThirdIntent' : function() {
        if(isValidThirdIntent.call(this)){
            if(isSecondIntent.call(this)){
                this.emit('SecondIntent');
            } else {
                var chapter = this.attributes['stories'][storyIndex]['chapter'];
                var option = pathTree.pathways[chapter]['third'];
                this.attributes['stories'][storyIndex]['chapter'] = option;
                if(isEndScene.call(this)){
                    this.handler.state = states.bookendState;
                    this.emitWithState('EndSceneIntent', option);
                } else {
                    this.emitWithState('TellStoryIntent', option);
                }
            }
        } else {
            this.emit('Unhandled');
        }
           
    },

    'Unhandled' : function () {
        var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/unhandled.mp3';
        this.emit(':askWithCard', '<audio src="'+url+'" />', '<audio src="'+url+'" />', cardTitle, cardText, cardImage); 
    }    
        
});

const bookendHandlers = Alexa.CreateStateHandler(states.bookendState, {

    'LaunchRequest': function(){
        this.emit('NewSession');
    },

    'SessionEndedRequest' : function () {
        this.emit(':saveState', true);
    },

    // Amazon Intents
    
    'AMAZON.CancelIntent' : function () { 
        var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/goodbye.mp3';
        this.emit(':tellWithCard', '<audio src="'+url+'" />', cardTitle, cardText, cardImage); 
    },

    'AMAZON.HelpIntent' : function () {
        this.handler.state = states.helpState;
        this.emitWithState('HelpIntent');
    }, 

    'AMAZON.NoIntent' : function () {
        var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/goodbye.mp3';
        this.emit(':tellWithCard', '<audio src="'+url+'" />', cardTitle, cardText, cardImage); 
    },

    'AMAZON.PauseIntent' : function () {
        var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/goodbye.mp3';
        this.emit(':tellWithCard', '<audio src="'+url+'" />', cardTitle, cardText, cardImage); 
    },

    'AMAZON.StartOverIntent' : function () { 
        this.handler.state = states.gameState;
        this.emitWithState('NewGameIntent'); 
    },

    'AMAZON.StopIntent' : function () { 
        var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/goodbye.mp3';
        this.emit(':tellWithCard', '<audio src="'+url+'" />', cardTitle, cardText, cardImage); 
    },

    'AMAZON.YesIntent' : function () {
        this.handler.state = states.gameState;
        this.emitWithState('NewGameIntent');
    }, 
    
    // Custom Intents
    
    'EndSceneIntent' : function (chapter) {
        // Commented out for Test
        // var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/'+chapter+'.mp3';
        
        // Test
        var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/startover.mp3';

        this.attributes['stories'][storyIndex]['chapter'] = 1;
        this.emit(':askWithCard', '<audio src="'+url+'" />', '<audio src="'+url+'" />', cardTitle, cardText, cardImage); 
    },

    'FirstIntent' : function (){
        this.handler.state = states.gameState;
        this.emitWithState('NewGameIntent');
    },

    'SecondIntent' : function () {
        var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/goodbye.mp3';
        this.emit(':tellWithCard', '<audio src="'+url+'" />', cardTitle, cardText, cardImage); 
    },

    'Unhandled' : function () {
        var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/unhandled.mp3';
        this.emit(':askWithCard', '<audio src="'+url+'" />', '<audio src="'+url+'" />', cardTitle, cardText, cardImage); 
    }
});

const helpHandlers = Alexa.CreateStateHandler(states.helpState, {
    
    'LaunchRequest': function(){
        this.emit('NewSession');
    },

    'SessionEndedRequest' : function () {
        this.emit(':saveState', true);
    },

    //Amazon Intents
    'AMAZON.CancelIntent' : function () { 
        var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/goodbye.mp3';
        this.emit(':tellWithCard', '<audio src="'+url+'" />', '<audio src="'+url+'" />', cardTitle, cardText, cardImage); 
    },

    'AMAZON.HelpIntent' : function () {
        var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/help.mp3';
        this.emit(':askWithCard', '<audio src="'+url+'" />', '<audio src="'+url+'" />', cardTitle, cardText, cardImage); 
    }, 

    'AMAZON.RepeatIntent' : function () {
        var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/help.mp3';
        this.emit(':askWithCard', '<audio src="'+url+'" />', '<audio src="'+url+'" />', cardTitle, cardText, cardImage); 
    },

    'GoBackIntent' : function () {
        this.handler.state = states.gameState;
        var chapter = this.attributes['stories'][storyIndex]['chapter'];
        this.emitWithState('TellStoryIntent', chapter);
    },

    'AMAZON.PauseIntent' : function () { 
        this.response.speak('Ok, to start your game at the same place, say Alexa open Select A Story');
        this.emit(':askWithCard', 'Ok, to start your game at the same place, say Alexa open Select A Story', cardTitle, cardText, cardImage); 
    },

    'AMAZON.StartOverIntent' : function () { 
        this.handler.state = states.gameState;
        this.attributes['stories'][storyIndex]['chapter'] = 1;
        this.emitWithState('NewGameIntent'); 
    },

    'AMAZON.StopIntent' : function () { 
        var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/goodbye.mp3';
        this.emit(':tellWithCard', '<audio src="'+url+'" />', cardTitle, cardText, cardImage); 
    },
    
    'AMAZON.YesIntent' : function () {
        var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/help.mp3';
        this.emit(':askWithCard', '<audio src="'+url+'" />', '<audio src="'+url+'" />', cardTitle, cardText, cardImage); 
    },

    // Custom Intents
    'HelpIntent' : function (){
        var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/help.mp3';
        this.emit(':askWithCard', '<audio src="'+url+'" />', '<audio src="'+url+'" />', cardTitle, cardText, cardImage);
    }, 
    
    'Unhandled' : function () {
        var url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/unhandled.mp3';
        this.emit(':askWithCard', '<audio src="'+url+'" />', '<audio src="'+url+'" />', cardTitle, cardText, cardImage); 
    }
});

// App Helper Functions

function getActiveStoryIndex() {
    var activeIndex;
    for(var i = 0; i < this.attributes['stories'].length; i++){
        if(this.attributes['stories'][i]['active'] === true){
            activeIndex = i;
        }
    }
    return activeIndex;
}

function isSecondIntent(){
    var doubles = [107, 110, 114];
    return doubles.indexOf(this.attributes['stories'][storyIndex]['chapter']) !== -1;
}

function isEndScene(){
    if(pathTree.endScenes.indexOf(this.attributes['stories'][storyIndex]['chapter']) === -1){
        return false;
    } else {
        return true;
    }
}

function isValidThirdIntent(){
    var thirds = [100, 103, 119, 122];
    return thirds.indexOf(this.attributes['stories'][storyIndex]['chapter']) !== -1;
}

exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.dynamoDBTableName = 'SelectAStoryTest'; 
    alexa.registerHandlers(newSessionHandlers, helpHandlers, bookendHandlers, gameHandlers);
    alexa.execute();
};
const Alexa = require('alexa-sdk');
const bst = require('bespoken-tools');

// App Config

const APP_ID = "amzn1.ask.skill.a2357136-45d2-4764-b3b0-cbe0703479b6";
const permissionArray = ['read::alexa:device:all:address'];
const states = {
    gameState : 'gameState'
};
const cardTitle = 'Select A Story';
const cardImage = {
    largeImageUrl : 'https://s3.amazonaws.com/selectastory/cinderella/prod/largetitle.jpg', 
    smallImageUrl : 'https://s3.amazonaws.com/selectastory/cinderella/prod/smalltitle.jpg' 
};
const cardText = 'www.selectastory.com';
const goodbyeText = 'Thanks for playing. Please visit us at selectastory.com';
const newGameText = 'Would you like to start a new game?';
const closingUrl = '<audio src="https://s3.amazonaws.com/selectastory/cinderella/prod/closing.mp3" />';
const openingUrl = '<audio src="https://s3.amazonaws.com/selectastory/cinderella/prod/opening.mp3" />';
const endScenes = [82, 81, 83, 84, 39, 37, 35, 34, 31,30,26, 41, 42, 75, 77, 14, 59, 60, 61, 62, 47, 48, 49, 50, 55, 56, 57, 58, 8, 108, 109, 112, 115, 158, 146, 148,154, 151, 153, 155, 138, 139, 136,137,134,135,125, 127,128,129, 137];
let storyIndex = 0;

// App Handler Functions

const newSessionHandlers = {

    'LaunchRequest': function(){
        this.emitWithState('NewSession');
    },

     // This will either start a new game if you are not a returning user or you're at the beginning or take you to where you left off
    'NewSession': function() {
        // This conditional will need to be changed once more stories are added, but for now this should trigger for a new user and push them into Cinderella
        if(!this.attributes['stories'] || !this.attributes['stories'].length > 0 || this.attributes['stories'][0]['chapter'] === 0){
            this.attributes['stories'] = [];
            var activeStory = {
                name : 'cinderCharming',
                chapter : 1,
                active : true
            };
            this.attributes['stories'].push(activeStory);
            this.attributes['attempts'] = 0;
            this.attributes['endScene'] = false;
            this.handler.state = states.gameState;
            let introText = 'Welcome to Select a Story, cinder charming by Katie Ernst starts now'; 
            this.emitWithState('TellStoryIntent', introText, true);  
        } else {
            storyIndex = getActiveStoryIndex.call(this);
            this.attributes['attempts'] = 0;
            this.attributes['endScene'] = false;
            this.handler.state = states.gameState;
            let introText = 'Welcome back to Select a story, would you like to finish your last story or begin a new game?';
            this.emitWithState('TellStoryIntent', introText);
        }
    }
};

const gameHandlers = Alexa.CreateStateHandler(states.gameState,  {

    'LaunchRequest': function(){
        storyIndex = getActiveStoryIndex.call(this);
        this.attributes['attempts'] = 0;
        this.attributes['endScene'] = false;
        if(endScenes.indexOf(this.attributes['stories'][storyIndex]['chapter']) !== -1){
            this.attributes['stories'][storyIndex]['chapter'] = 1;
        }
        let introText = 'Welcome back to Select a story, would you like to finish your last story or begin a new game?';
        this.attributes['continue'] = true;
        this.emitWithState('TellStoryIntent', introText);
    },

    'SessionEndedRequest' : function () {
        this.attributes['attempts'] = 0;
        console.log('Session ended with reason: ' + this.event.request.reason);
        this.emit(':saveState', true);
    },

    // Amazon Intents
    
    'AMAZON.CancelIntent' : function () { 
        this.attributes['attempts'] = 0;
        this.response.cardRenderer(cardTitle, cardText, cardImage).speak(goodbyeText + closingUrl);
        this.emit(":responseReady");
    },

     'AMAZON.HelpIntent' : function () {
        this.attributes['attempts'] = 0;
        let helpText = "You are playing an interactive adventure.  \
                        You will be given several choices during the game and just state your choice to make your selection.  \
                        If you want to skip a scene say, Alexa Next. \
                        If you want to start a new game say, New Game. \
                        To repeat a scene say, Alexa repeat. \
                        If you need these instructions again just say, help. \
                        To go back to the game say, go back.";
        this.response.cardRenderer(cardTitle, cardText, cardImage).speak(helpText).listen('Say repeat to hear these instructions again or go back to continue the game');
        this.emit(":responseReady");
    }, 

    'AMAZON.NoIntent' : function () {
        if (endScenes.indexOf(this.attributes['stories'][storyIndex]['chapter']) !== -1) {
            this.attributes['stories'][storyIndex]['chapter'] = 1;
            this.response.cardRenderer(cardTitle, cardText, cardImage).speak(goodbyeText + closingUrl);
            this.emit(":responseReady");
        } else if(this.attributes['stories'][storyIndex]['chapter'] === 80){
            this.attributes['stories'][storyIndex]['chapter'] = 82;
            this.emitWithState('EndSceneIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'AMAZON.NextIntent' : function () {
        if(endScenes.indexOf(this.attributes['stories'][storyIndex]['chapter']) === -1){
            let repromptText = '<audio src="https://s3.amazonaws.com/selectastory/cinderella/prod/reprompt'+this.attributes['stories'][storyIndex]['chapter']+'.mp3" />'; 
            this.response.cardRenderer(cardTitle, cardText, cardImage).speak(repromptText).listen(repromptText);
            this.emit(':responseReady');
        } else {
            this.response.cardRenderer(cardTitle, cardText, cardImage).speak(newGameText).listen(newGameText);
            this.emit(':responseReady');
        }  
    },

    'AMAZON.RepeatIntent' : function () {
        this.emitWithState('TellStoryIntent'); 
    },

    'AMAZON.StartOverIntent' : function () { 
        this.attributes['attempts'] = 0;
        this.attributes['endScene'] = false;
        let url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/1.mp3';
        let repromptText = '<audio src="https://s3.amazonaws.com/selectastory/cinderella/prod/reprompt1.mp3" />';

        this.attributes['stories'][storyIndex]['chapter'] = 1;
        this.response.cardRenderer(cardTitle, cardText, cardImage).speak('<audio src="'+url+'" />').listen(repromptText);
        this.emit(':responseReady');
    },

    'AMAZON.StopIntent' : function () {
        this.attributes['attempts'] = 0; 
        this.attributes['endScene'] = false;
        this.response.cardRenderer(cardTitle, cardText, cardImage).speak(goodbyeText + closingUrl);
        this.emit(":responseReady"); 
    },

    'AMAZON.YesIntent' : function () {
        if (endScenes.indexOf(this.attributes['stories'][storyIndex]['chapter']) !== -1) {
            this.emitWithState('NewGameIntent');
        } else if(this.attributes['stories'][storyIndex]['chapter'] === 80){
            this.attributes['stories'][storyIndex]['chapter'] = 81;
            this.emitWithState('EndSceneIntent');
        } else if(this.attributes['continue']) {
            this.response.speak('You can say finish your game or new game').listen('you can say finish your game or new game');
            this.emit(':responseReady');
        } else {
            this.emitWithState('Unhandled');
        }
    },


    // Custom Intents
    'AidIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 20:
                this.attributes['stories'][storyIndex]['chapter'] = 43;
                this.emitWithState('TellStoryIntent');
                break;
            case 21:
                this.attributes['stories'][storyIndex]['chapter'] = 45;
                this.emitWithState('TellStoryIntent');
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'AssistanceIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 121: 
                this.attributes['stories'][storyIndex]['chapter'] = 124;
                this.emitWithState('TellStoryIntent');
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'AttorneyIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 101){
            this.attributes['stories'][storyIndex]['chapter'] = 117;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'BadNewsIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 6){
            this.attributes['stories'][storyIndex]['chapter'] = 9;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'BackStairsIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 132){
            this.attributes['stories'][storyIndex]['chapter'] = 137;
            this.emitWithState('EndSceneIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'BedPostsIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 131){
            this.attributes['stories'][storyIndex]['chapter'] = 139;
            this.emitWithState('EndSceneIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'BlondeIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 67:
            case 68: 
                this.attributes['stories'][storyIndex]['chapter'] = 69;
                this.emitWithState('TellStoryIntent');
                break;
            case 69 : 
                this.attributes['stories'][storyIndex]['chapter'] = 77;
                this.emitWithState('EndSceneIntent');
                break;
            case 70 : 
                this.attributes['stories'][storyIndex]['chapter'] = 71;
                this.emitWithState('TellStoryIntent');
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'BouquetIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 36){
            this.attributes['stories'][storyIndex]['chapter'] = 37;
            this.emitWithState('EndSceneIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'BrunetteIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 67:
            case 68 : 
                this.attributes['stories'][storyIndex]['chapter'] = 70;
                this.emitWithState('TellStoryIntent');
                break;
            case 69 : 
                this.attributes['stories'][storyIndex]['chapter'] = 78;
                this.emitWithState('TellStoryIntent');
                break;
            case 70 : 
                this.attributes['stories'][storyIndex]['chapter'] = 72;
                this.emitWithState('TellStoryIntent');
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'BurstInIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 4){
            this.attributes['stories'][storyIndex]['chapter'] = 6;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'ClarenceIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 43 : 
                this.attributes['stories'][storyIndex]['chapter'] = 51;
                this.emitWithState('TellStoryIntent');
                break;
            case 45 : 
                this.attributes['stories'][storyIndex]['chapter'] = 53;
                this.emitWithState('TellStoryIntent');
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'CoalChuteIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 133){
            this.attributes['stories'][storyIndex]['chapter'] = 134;
            this.emitWithState('EndSceneIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'CottageIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 1: 
                this.attributes['stories'][storyIndex]['chapter'] = 100;
                this.emitWithState('TellStoryIntent');
                break;
            case 79 : 
                this.attributes['stories'][storyIndex]['chapter'] = 84;
                this.emitWithState('EndSceneIntent');
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'DownstairsIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        if(chapters === 119 || chapters === 122){
            this.attributes['stories'][storyIndex]['chapter'] = 132;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'DoSomethingIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        if(chapters === 103 || chapters === 113){
            this.attributes['stories'][storyIndex]['chapter'] = 114;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled'); 
        }
    },

    'DragonIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 11:
            case 13:
                this.attributes['stories'][storyIndex]['chapter'] = 15;
                this.emitWithState('TellStoryIntent');
                break;
            case 43 : 
                this.attributes['stories'][storyIndex]['chapter'] = 52;
                this.emitWithState('TellStoryIntent');
                break;
            case 45 : 
                this.attributes['stories'][storyIndex]['chapter'] = 54;
                this.emitWithState('TellStoryIntent');
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'DresserIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 131){
            this.attributes['stories'][storyIndex]['chapter'] = 138;
            this.emitWithState('EndSceneIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'DropIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 27){
            this.attributes['stories'][storyIndex]['chapter'] = 32;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'FairyIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 76){
            this.attributes['stories'][storyIndex]['chapter'] = 80;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'FinchesIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 144:
            case 145: 
                this.attributes['stories'][storyIndex]['chapter'] = 146;
                this.emitWithState('EndSceneIntent');
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'FindHerIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        if(chapters === 73 || chapters === 74){
            this.attributes['stories'][storyIndex]['chapter'] = 76;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'FireplaceIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 132){
            this.attributes['stories'][storyIndex]['chapter'] = 136;
            this.emitWithState('EndSceneIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'FramedIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 40){
            this.attributes['stories'][storyIndex]['chapter'] = 41;
            this.emitWithState('EndSceneIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'FrontPorchIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 133){
            this.attributes['stories'][storyIndex]['chapter'] = 135;
            this.emitWithState('EndSceneIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'GiveUpIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        if(chapters === 11 || chapters === 13){
            this.attributes['stories'][storyIndex]['chapter'] = 14;
            this.emitWithState('EndSceneIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'GoForItIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 12){
            this.attributes['stories'][storyIndex]['chapter'] = 64;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'GoingIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 20:
                this.attributes['stories'][storyIndex]['chapter'] = 44;
                this.emitWithState('TellStoryIntent');
                break;
            case 21:
                this.attributes['stories'][storyIndex]['chapter'] = 46;
                this.emitWithState('TellStoryIntent');
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'GoodNewsIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 6){
            this.attributes['stories'][storyIndex]['chapter'] = 8;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'HaikuIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 64 : 
                this.attributes['stories'][storyIndex]['chapter'] = 68;
                this.emitWithState('TellStoryIntent');
                break;
            case 140 : 
                this.attributes['stories'][storyIndex]['chapter'] = 156;
                this.emitWithState('TellStoryIntent');
                break;
            case 141 : 
                this.attributes['stories'][storyIndex]['chapter'] = 142;
                this.emitWithState('TellStoryIntent');
                break;           
            default:
                this.emitWithState('Unhandled');
        }
    },

    'HearMoreIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] = 10){
            this.attributes['stories'][storyIndex]['chapter'] = 12;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'KnifeIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch (chapters){
            case 102:
                this.attributes['stories'][storyIndex]['chapter'] = 105;
                this.emitWithState('TellStoryIntent');
                break;
            case 105:
                this.attributes['stories'][storyIndex]['chapter'] = 109;
                this.emitWithState('EndSceneIntent');   
                break;
            default:
                this.emitWithState('Unhandled');     
        }
    },

    'LeaveAloneIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        if(chapters === 73 || chapters === 74){
            this.attributes['stories'][storyIndex]['chapter'] = 75;
            this.emitWithState('EndSceneIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'LeaveIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 16 : 
                this.attributes['stories'][storyIndex]['chapter'] = 22;
                this.emitWithState('TellStoryIntent');
                break;
            case 118 : 
                this.attributes['stories'][storyIndex]['chapter'] = 140;
                this.emitWithState('TellStoryIntent');
                break;
            case 142:
            case 143:
            case 156:
            case 157:
                this.attributes['stories'][storyIndex]['chapter'] = 145;
                this.emitWithState('TellStoryIntent');
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'LieIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch (chapters){
            case 44:
                this.attributes['stories'][storyIndex]['chapter'] = 48;
                this.emitWithState('EndSceneIntent');
                break;
            case 46:
                this.attributes['stories'][storyIndex]['chapter'] = 50;
                this.emitWithState('EndSceneIntent');
                break;
            case 51:
                this.attributes['stories'][storyIndex]['chapter'] = 60;
                this.emitWithState('EndSceneIntent');
                break;
            case 52:
                this.attributes['stories'][storyIndex]['chapter'] = 62;
                this.emitWithState('EndSceneIntent');
                break;
            case 53:
                this.attributes['stories'][storyIndex]['chapter'] = 58;
                this.emitWithState('EndSceneIntent');
                break;
            case 54:
                this.attributes['stories'][storyIndex]['chapter'] = 56;
                this.emitWithState('EndSceneIntent');
                break;
            case 123:
            case 126:
                this.attributes['stories'][storyIndex]['chapter'] = 128;
                this.emitWithState('EndSceneIntent');
                break;
            default:
                this.emitWithState('Unhandled');     
        }
    },

    'LimerickIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 64 : 
                this.attributes['stories'][storyIndex]['chapter'] = 67;
                this.emitWithState('TellStoryIntent');
                break;
            case 140 : 
                this.attributes['stories'][storyIndex]['chapter'] = 157;
                this.emitWithState('TellStoryIntent');
                break;
            case 141 : 
                this.attributes['stories'][storyIndex]['chapter'] = 143;
                this.emitWithState('TellStoryIntent');
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'ListenIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 4){
            this.attributes['stories'][storyIndex]['chapter'] = 7;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'LoveIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 152){
            this.attributes['stories'][storyIndex]['chapter'] = 155;
            this.emitWithState('EndSceneIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'MansionIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 79){
            this.attributes['stories'][storyIndex]['chapter'] = 83;
            this.emitWithState('EndSceneIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'MatureIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        if(chapters === 8 || chapters === 9 || chapters === 7){
            this.attributes['stories'][storyIndex]['chapter'] = 11;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'MouthShutIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 71:
            case 72:
            case 78:
                this.attributes['stories'][storyIndex]['chapter'] = 74;
                this.emitWithState('TellStoryIntent');
                break;
            case 147: 
                this.attributes['stories'][storyIndex]['chapter'] = 149;
                this.emitWithState('TellStoryIntent');
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'MurderIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        if(chapters === 100 || chapters === 114){
            this.attributes['stories'][storyIndex]['chapter'] = 102;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'OfferIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 116:
                this.attributes['stories'][storyIndex]['chapter'] = 118;
                this.emitWithState('TellStoryIntent');
                break;
            case 117: 
                this.attributes['stories'][storyIndex]['chapter'] = 118;
                this.emitWithState('TellStoryIntent');
                break;
            case 124:
                this.attributes['stories'][storyIndex]['chapter'] = 125;
                this.emitWithState('EndSceneIntent');
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'OneSeventyFiveIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 32){
            this.attributes['stories'][storyIndex]['chapter'] = 34;
            this.emitWithState('EndSceneIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'OneFiftyIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 32){
            this.attributes['stories'][storyIndex]['chapter'] = 33;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'OpalDragonIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 15){
            this.attributes['stories'][storyIndex]['chapter'] = 17;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'OstrichIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 33){
            this.attributes['stories'][storyIndex]['chapter'] = 36;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'OutsideIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        if(chapters === 119 || chapters === 122){
            this.attributes['stories'][storyIndex]['chapter'] = 133;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'PalaceIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 1){
            this.attributes['stories'][storyIndex]['chapter'] = 4;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'ParakeetIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 33){
            this.attributes['stories'][storyIndex]['chapter'] = 35;
            this.emitWithState('EndSceneIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'PigeonIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 144:
            case 145: 
                this.attributes['stories'][storyIndex]['chapter'] = 147;
                this.emitWithState('TellStoryIntent');
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'PoisonIntent' : function () {
       let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch (chapters){
            case 102:
                this.attributes['stories'][storyIndex]['chapter'] = 104;
                this.emitWithState('TellStoryIntent');
                break;
            case 104:
                this.attributes['stories'][storyIndex]['chapter'] = 108;
                this.emitWithState('EndSceneIntent');   
                break;
            default:
                this.emitWithState('Unhandled');     
        } 
    },

    'RainbowIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 36){
            this.attributes['stories'][storyIndex]['chapter'] = 38;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'ReconsiderIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 104:
                this.attributes['stories'][storyIndex]['chapter'] = 107;
                this.emitWithState('TellStoryIntent');
                break;
            case 105:
                this.attributes['stories'][storyIndex]['chapter'] = 110;
                this.emitWithState('TellStoryIntent');
                break;
            case 106:
                this.attributes['stories'][storyIndex]['chapter'] = 111;
                this.emitWithState('TellStoryIntent');
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'RefuseIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 10:
            case 12:
                this.attributes['stories'][storyIndex]['chapter'] = 13;
                this.emitWithState('TellStoryIntent');
                break;
            case 116:
                this.attributes['stories'][storyIndex]['chapter'] = 119;
                this.emitWithState('TellStoryIntent');
                break;
            case 117:
                this.attributes['stories'][storyIndex]['chapter'] = 120;
                this.emitWithState('TellStoryIntent');
                break;
            case 124:
                this.attributes['stories'][storyIndex]['chapter'] = 126;
                this.emitWithState('TellStoryIntent');
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'RubItInIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 147){
            this.attributes['stories'][storyIndex]['chapter'] = 148;
            this.emitWithState('EndSceneIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'RubyDragonIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 15){
            this.attributes['stories'][storyIndex]['chapter'] = 16;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'RunIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 29 : 
                this.attributes['stories'][storyIndex]['chapter'] = 30;
                this.emitWithState('EndSceneIntent');
                break;
            case 121 : 
                this.attributes['stories'][storyIndex]['chapter'] = 123;
                this.emitWithState('TellStoryIntent');
                break;
            case 150 : 
                this.attributes['stories'][storyIndex]['chapter'] = 152;
                this.emitWithState('TellStoryIntent');
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'SatchelIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 17){
            this.attributes['stories'][storyIndex]['chapter'] = 21;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'SeaIntent' : function (){
        if(this.attributes['stories'][storyIndex]['chapter'] === 120){
            this.attributes['stories'][storyIndex]['chapter'] = 121;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'ShoeIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 76){
            this.attributes['stories'][storyIndex]['chapter'] = 79;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'SlashIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        if(chapters === 29 || chapters === 27){
            this.attributes['stories'][storyIndex]['chapter'] = 31;
            this.emitWithState('EndSceneIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'SmileAndNodIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 149){
            this.attributes['stories'][storyIndex]['chapter'] = 151;
            this.emitWithState('EndSceneIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'SmotherIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch (chapters){
            case 102:
                this.attributes['stories'][storyIndex]['chapter'] = 106;
                this.emitWithState('TellStoryIntent');
                break;
            case 106:
                this.attributes['stories'][storyIndex]['chapter'] = 112;
                this.emitWithState('EndSceneIntent');   
                break;
            default:
                this.emitWithState('Unhandled');     
        }
    },

    'SnappedIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 40){
            this.attributes['stories'][storyIndex]['chapter'] = 42;
            this.emitWithState('EndSceneIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'SneakIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 22:
                this.attributes['stories'][storyIndex]['chapter'] = 27;
                this.emitWithState('TellStoryIntent');
                break;
            case 23:
                this.attributes['stories'][storyIndex]['chapter'] = 29;
                this.emitWithState('TellStoryIntent');
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'SnoopIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 101){
            this.attributes['stories'][storyIndex]['chapter'] = 116;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'StayIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 118 : 
                this.attributes['stories'][storyIndex]['chapter'] = 141;
                this.emitWithState('TellStoryIntent');
                break;
            case 142:
            case 143:
                this.attributes['stories'][storyIndex]['chapter'] = 144;
                this.emitWithState('TellStoryIntent');
                break;
            case 156:
            case 157:
                this.attributes['stories'][storyIndex]['chapter'] = 158;
                this.emitWithState('EndSceneIntent');
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'TantrumIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        if(chapters === 7 || chapters === 8 || chapters === 9){
            this.attributes['stories'][storyIndex]['chapter'] = 10;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'TellHimIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch (chapters){
            case 149:
                this.attributes['stories'][storyIndex]['chapter'] = 150;
                this.emitWithState('TellStoryIntent');
                break;
            case 150:
                this.attributes['stories'][storyIndex]['chapter'] = 153;
                this.emitWithState('EndSceneIntent');   
                break;
            default:
                this.emitWithState('Unhandled');     
        }
    },

    'TimIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 38){
            this.attributes['stories'][storyIndex]['chapter'] = 40;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'TravelLightIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 17){
            this.attributes['stories'][storyIndex]['chapter'] = 20;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'TresIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 38){
            this.attributes['stories'][storyIndex]['chapter'] = 39;
            this.emitWithState('EndSceneIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'TruthIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch (chapters){
            case 44:
                this.attributes['stories'][storyIndex]['chapter'] = 47;
                this.emitWithState('EndSceneIntent');
                break;
            case 46:
                this.attributes['stories'][storyIndex]['chapter'] = 49;
                this.emitWithState('EndSceneIntent');
                break;
            case 51:
                this.attributes['stories'][storyIndex]['chapter'] = 59;
                this.emitWithState('EndSceneIntent');
                break;
            case 52:
                this.attributes['stories'][storyIndex]['chapter'] = 61;
                this.emitWithState('EndSceneIntent');
                break;
            case 53:
                this.attributes['stories'][storyIndex]['chapter'] = 57;
                this.emitWithState('EndSceneIntent');
                break;
            case 54:
                this.attributes['stories'][storyIndex]['chapter'] = 55;
                this.emitWithState('EndSceneIntent');
                break;
            case 71:
            case 72:
            case 78:
                this.attributes['stories'][storyIndex]['chapter'] = 73;
                this.emitWithState('TellStoryIntent');
                break;
            case 123:
                this.attributes['stories'][storyIndex]['chapter'] = 129;
                this.emitWithState('EndSceneIntent');
                break;
            case 126:
                this.attributes['stories'][storyIndex]['chapter'] = 127;
                this.emitWithState('EndSceneIntent');
                break;        
            default:
                this.emitWithState('Unhandled');     
        }
    },

    'UpstairsIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        if(chapters === 119 || chapters === 122){
            this.attributes['stories'][storyIndex]['chapter'] = 131;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'WaitIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch (chapters){
            case 22:
            case 23:
                this.attributes['stories'][storyIndex]['chapter'] = 26;
                this.emitWithState('EndSceneIntent');
                break;
            case 100:    
                this.attributes['stories'][storyIndex]['chapter'] = 103;
                this.emitWithState('TellStoryIntent');
                break;
            case 103:
                this.attributes['stories'][storyIndex]['chapter'] = 113;
                this.emitWithState('TellStoryIntent');
                break;
            case 107:
            case 110:
            case 111:
                this.attributes['stories'][storyIndex]['chapter'] = 103;
                this.emitWithState('TellStoryIntent');
                break;
            case 113:
                this.attributes['stories'][storyIndex]['chapter'] = 115;
                this.emitWithState('EndSceneIntent');   
                break;
            default:
                this.emitWithState('Unhandled');     
        }
    },

    'WearIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 16){
            this.attributes['stories'][storyIndex]['chapter'] = 23;
            this.emitWithState('TellStoryIntent');
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'WillIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch (chapters){
            case 100:
            case 107:
            case 110:
            case 111:
            case 114:
                this.attributes['stories'][storyIndex]['chapter'] = 101;
                this.emitWithState('TellStoryIntent');
                break;
            case 120:
                this.attributes['stories'][storyIndex]['chapter'] = 122;
                this.emitWithState('TellStoryIntent');
                break;
            case 152:
                this.attributes['stories'][storyIndex]['chapter'] = 154;
                this.emitWithState('EndSceneIntent');
                break;
            default:
                this.emitWithState('Unhandled');     
        }
    },

    'ContinueIntent' : function () {
        if(this.attributes['continue']){
            this.attributes['continue'] = false;
            this.emitWithState('TellStoryIntent');
        } else {
            if(endScenes.indexOf(this.attributes['stories'][storyIndex]['chapter']) !== -1){
                this.emitWithState('NewGameIntent');
            } else {
                let text = 'Sorry, that is not an option right now.';
                let repromptText = '<audio src="https://s3.amazonaws.com/selectastory/cinderella/prod/reprompt' + this.attributes['stories'][storyIndex]['chapter'] + '.mp3" />';
                this.response.speak(text + '<break time=".5s" />' + repromptText).listen(repromptText).cardRenderer(cardTitle, cardText, cardImage);
                this.emit(':responseReady');
            }
        }      
    },

    'EndSceneIntent' : function () {
        this.attributes['attempts'] = 0;
        this.attributes['endScene'] = true;
        let url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/'+this.attributes['stories'][storyIndex]['chapter']+'.mp3';
        this.response.speak('<audio src="' + url + '" />' + '<break time="1.5s" />' + newGameText).listen(newGameText).cardRenderer(cardTitle, cardText, cardImage);
        this.emit(':responseReady');
    },

    'GoBackIntent' : function () {
        this.emitWithState('TellStoryIntent');
    },

    'NewGameIntent' : function(){
        this.attributes['attempts'] = 0;
        this.attributes['continue'] = false;
        this.attributes['endScene'] = false;
        let url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/1.mp3';
        let repromptText = '<audio src="https://s3.amazonaws.com/selectastory/cinderella/prod/reprompt1.mp3" />';

        this.attributes['stories'][storyIndex]['chapter'] = 1;
        this.response.cardRenderer(cardText, cardTitle, cardImage).speak('<audio src="'+url+'" />').listen(repromptText);
        this.emit(':responseReady');
    },

    'TellStoryIntent' : function (introText, newUser){
        this.attributes['attempts'] = 0;
        let url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/'+this.attributes['stories'][storyIndex]['chapter']+'.mp3';
        let repromptText = '<audio src="https://s3.amazonaws.com/selectastory/cinderella/prod/reprompt'+this.attributes['stories'][storyIndex]['chapter']+'.mp3" />';
        if(introText && newUser){
            this.response.speak(openingUrl + introText + '<break time="2s" /><audio src="'+url+'" />').listen(repromptText).cardRenderer(cardTitle, cardText, cardImage);
            this.emit(':responseReady');
        } else if (introText) {
            this.response.speak(openingUrl + introText).listen('would you like to finish your story or begin a new game?').cardRenderer(cardTitle, cardText, cardImage);
            this.emit(':responseReady');
        } else {
            this.response.speak('<audio src="'+url+'" />').listen(repromptText).cardRenderer(cardTitle, cardText, cardImage);
            this.emit(':responseReady');
        }
        
    },

    'Unhandled' : function () {
        if (endScenes.indexOf(this.attributes['stories'][storyIndex]['chapter']) !== -1){
            this.response.speak('if you would like to start a new game, say "new game"').listen('if you would like to start a new game, say "new game"').cardRenderer(cardTitle, cardText, cardImage);
            this.emit(':responseReady');
        } else if (this.attributes['attempts'] < 2){
            this.attributes['attempts']++;
            let repromptText = '<audio src="https://s3.amazonaws.com/selectastory/cinderella/prod/reprompt' + this.attributes['stories'][storyIndex]['chapter'] + '.mp3" />';
            this.response.cardRenderer(cardTitle, cardText, cardImage).speak(repromptText).listen(repromptText);
            this.emit(":responseReady");
        } else {
            this.attributes['attempts'] = 0;
            this.response.cardRenderer(cardTitle, cardText, cardImage).speak("Why don't you come back another time and play again." + closingUrl);
            this.emit(':responseReady');
        }
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

exports.handler = bst.Logless.capture("9079a823-5ec4-4765-8e88-d5691069b946", function (event, context, callback) {
    var alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.dynamoDBTableName = 'SelectAStoryTest'; 
    alexa.registerHandlers(newSessionHandlers, gameHandlers);
    alexa.execute();
});

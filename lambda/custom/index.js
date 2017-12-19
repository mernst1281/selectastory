const Alexa = require('alexa-sdk');

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
let url = "";
let repromptText = "";
let attempts = 0;

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
            this.handler.state = states.gameState;
            let introText = 'Welcome to Select a Story, cinder charming by Katie Ernst starts now'; 
            this.emitWithState('TellStoryIntent', 1, introText, true);  
        } else {
            storyIndex = getActiveStoryIndex.call(this);
            this.handler.state = states.gameState;
            var chapter = this.attributes['stories'][storyIndex]['chapter'];
            let introText = 'Welcome back to Select a story, would you like to finish your last story or begin a new game?';
            this.emitWithState('TellStoryIntent', chapter, introText);
        }
    }
};

const gameHandlers = Alexa.CreateStateHandler(states.gameState,  {

    'LaunchRequest': function(){
        storyIndex = getActiveStoryIndex.call(this);
        this.handler.state = states.gameState;
        var chapter = this.attributes['stories'][storyIndex]['chapter'];
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/'+chapter+'.mp3';
        let introText = 'Welcome back to Select a story, would you like to finish your last story or begin a new game?';
        this.emitWithState('TellStoryIntent', chapter, introText);
    },

    'SessionEndedRequest' : function () {
        this.emit(':saveState', true);
        this.response.cardRenderer(cardTitle, cardText, cardImage).speak(goodbyeText + closingUrl);
        this.emit(":responseReady");
    },

    // Amazon Intents
    
    'AMAZON.CancelIntent' : function () { 
        this.response.cardRenderer(cardTitle, cardText, cardImage).speak(goodbyeText + closingUrl);
        this.emit(":responseReady");
    },

     'AMAZON.HelpIntent' : function () {
        attempts = 0;
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
            this.emitWithState('EndSceneIntent', 82);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'AMAZON.NextIntent' : function () {
        if(endScenes.indexOf(this.attributes['stories'][storyIndex]['chapter']) === -1){
            this.response.cardRenderer(cardTitle, cardText, cardImage).speak(repromptText).listen(repromptText);
            this.emit(':responseReady');
        } else {
            this.response.cardRenderer(cardTitle, cardText, cardImage).speak(newGameText).listen(newGameText);
            this.emit(':responseReady');
        }  
    },

    'AMAZON.RepeatIntent' : function () {
        var chapter = this.attributes['stories'][storyIndex]['chapter'];
        this.emitWithState('TellStoryIntent', chapter); 
    },

    'AMAZON.StartOverIntent' : function () { 
        attempts = 0;
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/1.mp3';
        repromptText = '<audio src="https://s3.amazonaws.com/selectastory/cinderella/prod/reprompt1.mp3" />';

        this.attributes['stories'][storyIndex]['chapter'] = 1;
        this.response.cardRenderer(cardTitle, cardText, cardImage).speak('<audio src="'+url+'" />').listen(repromptText);
        this.emit(':responseReady');
    },

    'AMAZON.StopIntent' : function () { 
        this.response.cardRenderer(cardTitle, cardText, cardImage).speak(goodbyeText + closingUrl);
        this.emit(":responseReady"); 
    },

    'AMAZON.YesIntent' : function () {
        if (endScenes.indexOf(this.attributes['stories'][storyIndex]['chapter']) !== -1) {
            this.emitWithState('NewGameIntent');
        } else if(this.attributes['stories'][storyIndex]['chapter'] === 80){
            this.attributes['stories'][storyIndex]['chapter'] = 81;
            this.emitWithState('EndSceneIntent', 81);
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
                this.emitWithState('TellStoryIntent', 43);
                break;
            case 21:
                this.attributes['stories'][storyIndex]['chapter'] = 45;
                this.emitWithState('TellStoryIntent', 45);
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
                this.emitWithState('TellStoryIntent', 124);
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'AttorneyIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 101){
            this.attributes['stories'][storyIndex]['chapter'] = 117;
            this.emitWithState('TellStoryIntent', 117);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'BadNewsIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 6){
            this.attributes['stories'][storyIndex]['chapter'] = 9;
            this.emitWithState('TellStoryIntent', 9);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'BackStairsIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 132){
            this.attributes['stories'][storyIndex]['chapter'] = 137;
            this.emitWithState('EndSceneIntent', 137);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'BedPostsIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 131){
            this.attributes['stories'][storyIndex]['chapter'] = 139;
            this.emitWithState('EndSceneIntent', 139);
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
                this.emitWithState('TellStoryIntent', 69);
                break;
            case 69 : 
                this.attributes['stories'][storyIndex]['chapter'] = 77;
                this.emitWithState('EndSceneIntent', 77);
                break;
            case 70 : 
                this.attributes['stories'][storyIndex]['chapter'] = 71;
                this.emitWithState('TellStoryIntent', 71);
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'BouquetIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 36){
            this.attributes['stories'][storyIndex]['chapter'] = 37;
            this.emitWithState('EndSceneIntent', 37);
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
                this.emitWithState('TellStoryIntent', 70);
                break;
            case 69 : 
                this.attributes['stories'][storyIndex]['chapter'] = 78;
                this.emitWithState('TellStoryIntent', 78);
                break;
            case 70 : 
                this.attributes['stories'][storyIndex]['chapter'] = 72;
                this.emitWithState('TellStoryIntent', 72);
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'BurstInIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 4){
            this.attributes['stories'][storyIndex]['chapter'] = 6;
            this.emitWithState('TellStoryIntent', 6);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'ClarenceIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 43 : 
                this.attributes['stories'][storyIndex]['chapter'] = 51;
                this.emitWithState('TellStoryIntent', 51);
                break;
            case 45 : 
                this.attributes['stories'][storyIndex]['chapter'] = 53;
                this.emitWithState('TellStoryIntent', 53);
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'CoalChuteIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 133){
            this.attributes['stories'][storyIndex]['chapter'] = 134;
            this.emitWithState('EndSceneIntent', 134);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'CottageIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 1: 
                this.attributes['stories'][storyIndex]['chapter'] = 100;
                this.emitWithState('TellStoryIntent', 100);
                break;
            case 79 : 
                this.attributes['stories'][storyIndex]['chapter'] = 84;
                this.emitWithState('EndSceneIntent', 84);
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'DownstairsIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        if(chapters === 119 || chapters === 122){
            this.attributes['stories'][storyIndex]['chapter'] = 132;
            this.emitWithState('TellStoryIntent', 132);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'DoSomethingIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        if(chapters === 103 || chapters === 113){
            this.attributes['stories'][storyIndex]['chapter'] = 114;
            this.emitWithState('TellStoryIntent', 114);
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
                this.emitWithState('TellStoryIntent', 15);
                break;
            case 43 : 
                this.attributes['stories'][storyIndex]['chapter'] = 52;
                this.emitWithState('TellStoryIntent', 52);
                break;
            case 45 : 
                this.attributes['stories'][storyIndex]['chapter'] = 54;
                this.emitWithState('TellStoryIntent', 54);
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'DresserIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 131){
            this.attributes['stories'][storyIndex]['chapter'] = 138;
            this.emitWithState('EndSceneIntent', 138);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'DropIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 27){
            this.attributes['stories'][storyIndex]['chapter'] = 32;
            this.emitWithState('TellStoryIntent', 32);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'FairyIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 76){
            this.attributes['stories'][storyIndex]['chapter'] = 80;
            this.emitWithState('TellStoryIntent', 80);
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
                this.emitWithState('EndSceneIntent', 146);
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'FindHerIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        if(chapters === 73 || chapters === 74){
            this.attributes['stories'][storyIndex]['chapter'] = 76;
            this.emitWithState('TellStoryIntent', 76);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'FireplaceIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 132){
            this.attributes['stories'][storyIndex]['chapter'] = 136;
            this.emitWithState('EndSceneIntent', 136);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'FramedIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 40){
            this.attributes['stories'][storyIndex]['chapter'] = 41;
            this.emitWithState('EndSceneIntent', 41);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'FrontPorchIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 133){
            this.attributes['stories'][storyIndex]['chapter'] = 135;
            this.emitWithState('EndSceneIntent', 135);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'GiveUpIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        if(chapters === 11 || chapters === 13){
            this.attributes['stories'][storyIndex]['chapter'] = 14;
            this.emitWithState('EndSceneIntent', 14);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'GoForItIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 12){
            this.attributes['stories'][storyIndex]['chapter'] = 64;
            this.emitWithState('TellStoryIntent', 64);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'GoingIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 20:
                this.attributes['stories'][storyIndex]['chapter'] = 44;
                this.emitWithState('TellStoryIntent', 44);
                break;
            case 21:
                this.attributes['stories'][storyIndex]['chapter'] = 46;
                this.emitWithState('TellStoryIntent', 46);
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'GoodNewsIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 6){
            this.attributes['stories'][storyIndex]['chapter'] = 8;
            this.emitWithState('TellStoryIntent', 8);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'HaikuIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 64 : 
                this.attributes['stories'][storyIndex]['chapter'] = 68;
                this.emitWithState('TellStoryIntent', 68);
                break;
            case 140 : 
                this.attributes['stories'][storyIndex]['chapter'] = 156;
                this.emitWithState('TellStoryIntent', 156);
                break;
            case 141 : 
                this.attributes['stories'][storyIndex]['chapter'] = 142;
                this.emitWithState('TellStoryIntent', 142);
                break;           
            default:
                this.emitWithState('Unhandled');
        }
    },

    'HearMoreIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] = 10){
            this.attributes['stories'][storyIndex]['chapter'] = 12;
            this.emitWithState('TellStoryIntent', 12);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'KnifeIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch (chapters){
            case 102:
                this.attributes['stories'][storyIndex]['chapter'] = 105;
                this.emitWithState('TellStoryIntent', 105);
                break;
            case 105:
                this.attributes['stories'][storyIndex]['chapter'] = 109;
                this.emitWithState('EndSceneIntent', 109);   
                break;
            default:
                this.emitWithState('Unhandled');     
        }
    },

    'LeaveAloneIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        if(chapters === 73 || chapters === 74){
            this.attributes['stories'][storyIndex]['chapter'] = 75;
            this.emitWithState('EndSceneIntent', 75);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'LeaveIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 16 : 
                this.attributes['stories'][storyIndex]['chapter'] = 22;
                this.emitWithState('TellStoryIntent', 22);
                break;
            case 118 : 
                this.attributes['stories'][storyIndex]['chapter'] = 140;
                this.emitWithState('TellStoryIntent', 140);
                break;
            case 142:
            case 143:
            case 156:
            case 157:
                this.attributes['stories'][storyIndex]['chapter'] = 145;
                this.emitWithState('TellStoryIntent', 145);
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
                this.emitWithState('EndSceneIntent', 48);
                break;
            case 46:
                this.attributes['stories'][storyIndex]['chapter'] = 50;
                this.emitWithState('EndSceneIntent', 50);
                break;
            case 51:
                this.attributes['stories'][storyIndex]['chapter'] = 60;
                this.emitWithState('EndSceneIntent', 60);
                break;
            case 52:
                this.attributes['stories'][storyIndex]['chapter'] = 62;
                this.emitWithState('EndSceneIntent', 62);
                break;
            case 53:
                this.attributes['stories'][storyIndex]['chapter'] = 58;
                this.emitWithState('EndSceneIntent', 58);
                break;
            case 54:
                this.attributes['stories'][storyIndex]['chapter'] = 56;
                this.emitWithState('EndSceneIntent', 56);
                break;
            case 123:
            case 126:
                this.attributes['stories'][storyIndex]['chapter'] = 128;
                this.emitWithState('EndSceneIntent', 128);
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
                this.emitWithState('TellStoryIntent', 67);
                break;
            case 140 : 
                this.attributes['stories'][storyIndex]['chapter'] = 157;
                this.emitWithState('TellStoryIntent', 157);
                break;
            case 141 : 
                this.attributes['stories'][storyIndex]['chapter'] = 143;
                this.emitWithState('TellStoryIntent', 143);
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'ListenIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 4){
            this.attributes['stories'][storyIndex]['chapter'] = 7;
            this.emitWithState('TellStoryIntent', 7);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'LoveIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 152){
            this.attributes['stories'][storyIndex]['chapter'] = 155;
            this.emitWithState('EndSceneIntent', 155);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'MansionIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 79){
            this.attributes['stories'][storyIndex]['chapter'] = 83;
            this.emitWithState('EndSceneIntent', 83);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'MatureIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        if(chapters === 8 || chapters === 9 || chapters === 7){
            this.attributes['stories'][storyIndex]['chapter'] = 11;
            this.emitWithState('TellStoryIntent', 11);
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
                this.emitWithState('TellStoryIntent', 74);
                break;
            case 147: 
                this.attributes['stories'][storyIndex]['chapter'] = 149;
                this.emitWithState('TellStoryIntent', 149);
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'MurderIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        if(chapters === 100 || chapters === 114){
            this.attributes['stories'][storyIndex]['chapter'] = 102;
            this.emitWithState('TellStoryIntent', 102);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'OfferIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 116:
                this.attributes['stories'][storyIndex]['chapter'] = 118;
                this.emitWithState('TellStoryIntent', 118);
                break;
            case 117: 
                this.attributes['stories'][storyIndex]['chapter'] = 118;
                this.emitWithState('TellStoryIntent', 118);
                break;
            case 124:
                this.attributes['stories'][storyIndex]['chapter'] = 125;
                this.emitWithState('EndSceneIntent', 125);
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'OneSeventyFiveIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 32){
            this.attributes['stories'][storyIndex]['chapter'] = 34;
            this.emitWithState('EndSceneIntent', 34);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'OneFiftyIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 32){
            this.attributes['stories'][storyIndex]['chapter'] = 33;
            this.emitWithState('TellStoryIntent', 33);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'OpalDragonIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 15){
            this.attributes['stories'][storyIndex]['chapter'] = 17;
            this.emitWithState('TellStoryIntent', 17);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'OstrichIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 33){
            this.attributes['stories'][storyIndex]['chapter'] = 36;
            this.emitWithState('TellStoryIntent', 36);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'OutsideIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        if(chapters === 119 || chapters === 122){
            this.attributes['stories'][storyIndex]['chapter'] = 133;
            this.emitWithState('TellStoryIntent', 133);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'PalaceIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 1){
            this.attributes['stories'][storyIndex]['chapter'] = 4;
            this.emitWithState('TellStoryIntent', 4);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'ParakeetIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 33){
            this.attributes['stories'][storyIndex]['chapter'] = 35;
            this.emitWithState('EndSceneIntent', 35);
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
                this.emitWithState('TellStoryIntent', 147);
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
                this.emitWithState('TellStoryIntent', 104);
                break;
            case 104:
                this.attributes['stories'][storyIndex]['chapter'] = 108;
                this.emitWithState('EndSceneIntent', 108);   
                break;
            default:
                this.emitWithState('Unhandled');     
        } 
    },

    'RainbowIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 36){
            this.attributes['stories'][storyIndex]['chapter'] = 38;
            this.emitWithState('TellStoryIntent', 38);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'ReconsiderIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 104:
                this.attributes['stories'][storyIndex]['chapter'] = 107;
                this.emitWithState('TellStoryIntent', 107);
                break;
            case 105:
                this.attributes['stories'][storyIndex]['chapter'] = 110;
                this.emitWithState('TellStoryIntent', 110);
                break;
            case 106:
                this.attributes['stories'][storyIndex]['chapter'] = 111;
                this.emitWithState('TellStoryIntent', 111);
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
                this.emitWithState('TellStoryIntent', 13);
                break;
            case 116:
                this.attributes['stories'][storyIndex]['chapter'] = 119;
                this.emitWithState('TellStoryIntent', 119);
                break;
            case 117:
                this.attributes['stories'][storyIndex]['chapter'] = 120;
                this.emitWithState('TellStoryIntent', 120);
                break;
            case 124:
                this.attributes['stories'][storyIndex]['chapter'] = 126;
                this.emitWithState('TellStoryIntent', 126);
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'RubItInIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 147){
            this.attributes['stories'][storyIndex]['chapter'] = 148;
            this.emitWithState('EndSceneIntent', 148);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'RubyDragonIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 15){
            this.attributes['stories'][storyIndex]['chapter'] = 16;
            this.emitWithState('TellStoryIntent', 16);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'RunIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 29 : 
                this.attributes['stories'][storyIndex]['chapter'] = 30;
                this.emitWithState('EndSceneIntent', 30);
                break;
            case 121 : 
                this.attributes['stories'][storyIndex]['chapter'] = 123;
                this.emitWithState('TellStoryIntent', 123);
                break;
            case 150 : 
                this.attributes['stories'][storyIndex]['chapter'] = 152;
                this.emitWithState('TellStoryIntent', 152);
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'SatchelIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 17){
            this.attributes['stories'][storyIndex]['chapter'] = 21;
            this.emitWithState('TellStoryIntent', 21);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'SeaIntent' : function (){
        if(this.attributes['stories'][storyIndex]['chapter'] === 120){
            this.attributes['stories'][storyIndex]['chapter'] = 121;
            this.emitWithState('TellStoryIntent', 121);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'ShoeIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 76){
            this.attributes['stories'][storyIndex]['chapter'] = 79;
            this.emitWithState('TellStoryIntent', 79);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'SlashIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        if(chapters === 29 || chapters === 27){
            this.attributes['stories'][storyIndex]['chapter'] = 31;
            this.emitWithState('EndSceneIntent', 31);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'SmileAndNodIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 149){
            this.attributes['stories'][storyIndex]['chapter'] = 151;
            this.emitWithState('EndSceneIntent', 151);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'SmotherIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch (chapters){
            case 102:
                this.attributes['stories'][storyIndex]['chapter'] = 106;
                this.emitWithState('TellStoryIntent', 106);
                break;
            case 106:
                this.attributes['stories'][storyIndex]['chapter'] = 112;
                this.emitWithState('EndSceneIntent', 112);   
                break;
            default:
                this.emitWithState('Unhandled');     
        }
    },

    'SnappedIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 40){
            this.attributes['stories'][storyIndex]['chapter'] = 42;
            this.emitWithState('EndSceneIntent', 42);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'SneakIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 22:
                this.attributes['stories'][storyIndex]['chapter'] = 27;
                this.emitWithState('TellStoryIntent', 27);
                break;
            case 23:
                this.attributes['stories'][storyIndex]['chapter'] = 29;
                this.emitWithState('TellStoryIntent', 29);
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'SnoopIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 101){
            this.attributes['stories'][storyIndex]['chapter'] = 116;
            this.emitWithState('TellStoryIntent', 116);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'StayIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 118 : 
                this.attributes['stories'][storyIndex]['chapter'] = 141;
                this.emitWithState('TellStoryIntent', 141);
                break;
            case 142:
            case 143:
                this.attributes['stories'][storyIndex]['chapter'] = 144;
                this.emitWithState('TellStoryIntent', 144);
                break;
            case 156:
            case 157:
                this.attributes['stories'][storyIndex]['chapter'] = 158;
                this.emitWithState('EndSceneIntent', 158);
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'TantrumIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        if(chapters === 7 || chapters === 8 || chapters === 9){
            this.attributes['stories'][storyIndex]['chapter'] = 10;
            this.emitWithState('TellStoryIntent', 10);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'TellHimIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch (chapters){
            case 149:
                this.attributes['stories'][storyIndex]['chapter'] = 150;
                this.emitWithState('TellStoryIntent', 150);
                break;
            case 150:
                this.attributes['stories'][storyIndex]['chapter'] = 153;
                this.emitWithState('EndSceneIntent', 153);   
                break;
            default:
                this.emitWithState('Unhandled');     
        }
    },

    'TimIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 38){
            this.attributes['stories'][storyIndex]['chapter'] = 40;
            this.emitWithState('TellStoryIntent', 40);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'TravelLightIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 17){
            this.attributes['stories'][storyIndex]['chapter'] = 20;
            this.emitWithState('TellStoryIntent', 20);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'TresIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 38){
            this.attributes['stories'][storyIndex]['chapter'] = 39;
            this.emitWithState('EndSceneIntent', 39);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'TruthIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch (chapters){
            case 44:
                this.attributes['stories'][storyIndex]['chapter'] = 47;
                this.emitWithState('EndSceneIntent', 47);
                break;
            case 46:
                this.attributes['stories'][storyIndex]['chapter'] = 49;
                this.emitWithState('EndSceneIntent', 49);
                break;
            case 51:
                this.attributes['stories'][storyIndex]['chapter'] = 59;
                this.emitWithState('EndSceneIntent', 59);
                break;
            case 52:
                this.attributes['stories'][storyIndex]['chapter'] = 61;
                this.emitWithState('EndSceneIntent', 61);
                break;
            case 53:
                this.attributes['stories'][storyIndex]['chapter'] = 57;
                this.emitWithState('EndSceneIntent', 57);
                break;
            case 54:
                this.attributes['stories'][storyIndex]['chapter'] = 55;
                this.emitWithState('EndSceneIntent', 55);
                break;
            case 71:
            case 72:
            case 78:
                this.attributes['stories'][storyIndex]['chapter'] = 73;
                this.emitWithState('TellStoryIntent', 73);
                break;
            case 123:
                this.attributes['stories'][storyIndex]['chapter'] = 129;
                this.emitWithState('EndSceneIntent', 129);
                break;
            case 126:
                this.attributes['stories'][storyIndex]['chapter'] = 127;
                this.emitWithState('EndSceneIntent', 127);
                break;        
            default:
                this.emitWithState('Unhandled');     
        }
    },

    'UpstairsIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        if(chapters === 119 || chapters === 122){
            this.attributes['stories'][storyIndex]['chapter'] = 131;
            this.emitWithState('TellStoryIntent', 131);
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
                this.emitWithState('EndSceneIntent', 26);
                break;
            case 100:
            case 107:     
                this.attributes['stories'][storyIndex]['chapter'] = 103;
                this.emitWithState('TellStoryIntent', 103);
                break;
            case 103:
                this.attributes['stories'][storyIndex]['chapter'] = 113;
                this.emitWithState('TellStoryIntent', 113);
                break;
            case 110:
            case 111:
                this.attributes['stories'][storyIndex]['chapter'] = 103;
                this.emitWithState('TellStoryIntent', 103);
                break;
            case 113:
                this.attributes['stories'][storyIndex]['chapter'] = 115;
                this.emitWithState('EndSceneIntent', 115);   
                break;
            default:
                this.emitWithState('Unhandled');     
        }
    },

    'WearIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 16){
            this.attributes['stories'][storyIndex]['chapter'] = 23;
            this.emitWithState('TellStoryIntent', 23);
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
                this.emitWithState('TellStoryIntent', 101);
                break;
            case 120:
                this.attributes['stories'][storyIndex]['chapter'] = 122;
                this.emitWithState('TellStoryIntent', 122);
                break;
            case 152:
                this.attributes['stories'][storyIndex]['chapter'] = 154;
                this.emitWithState('EndSceneIntent', 154);
                break;
            default:
                this.emitWithState('Unhandled');     
        }
    },

    'ContinueIntent' : function () {
        console.log('why')
        this.emitWithState('TellStoryIntent', this.attributes['stories'][storyIndex]['chapter']);
    },

    'EndSceneIntent' : function (chapter) {
        attempts = 0;
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/'+chapter+'.mp3';
        repromptText = newGameText;
        this.response.speak('<audio src="' + url + '" />' + '<break time="1.5s" />' + newGameText).listen(newGameText).cardRenderer(cardTitle, cardText, cardImage);
        this.emit(':responseReady');
    },

    'GoBackIntent' : function () {
        this.handler.state = states.gameState;
        var chapter = this.attributes['stories'][storyIndex]['chapter'];
        this.emitWithState('TellStoryIntent', chapter);
    },

    'NewGameIntent' : function(){
        attempts = 0;
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/1.mp3';
        repromptText = '<audio src="https://s3.amazonaws.com/selectastory/cinderella/prod/reprompt1.mp3" />';

        this.attributes['stories'][storyIndex]['chapter'] = 1;
        this.response.cardRenderer(cardText, cardTitle, cardImage).speak('<audio src="'+url+'" />').listen(repromptText);
        this.emit(':responseReady');
    },

    'TellStoryIntent' : function (chapter, introText, newUser){
        attempts = 0;
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/'+chapter+'.mp3';
        repromptText = '<audio src="https://s3.amazonaws.com/selectastory/cinderella/prod/reprompt'+chapter+'.mp3" />';
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
        if (attempts < 2){
            attempts++;
            this.response.cardRenderer(cardTitle, cardText, cardImage).speak(repromptText).listen(repromptText);
            this.emit(":responseReady");
        } else {
            attempts = 0;
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

exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.dynamoDBTableName = 'SelectAStoryTest'; 
    alexa.registerHandlers(newSessionHandlers, gameHandlers);
    alexa.execute();
};
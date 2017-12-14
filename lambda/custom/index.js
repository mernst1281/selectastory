const Alexa = require('alexa-sdk');

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
    largeImageUrl : 'https://s3.amazonaws.com/selectastory/cinderella/prod/largetitle.jpg', 
    smallImageUrl : 'https://s3.amazonaws.com/selectastory/cinderella/prod/smalltitle.jpg' 
};
const cardText = 'www.selectastory.com';
let storyIndex = 0;
let url = "";
let repromptUrl = "";
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
            url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/1.mp3';
            repromptUrl = 'https://s3.amazonaws.com/selectastory/cinderella/prod/reprompt1.mp3';
        
            this.emit(':askWithCard', '<audio src="https://s3.amazonaws/selectastory/cinderella/prod/opening.mp3" /><audio src="'+url+'" />', '<audio src="'+repromptUrl+'" />', cardTitle, cardText, cardImage);
        } else {
            storyIndex = getActiveStoryIndex.call(this);
            this.handler.state = states.gameState;
            var chapter = this.attributes['stories'][storyIndex]['chapter'];
            url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/'+chapter+'.mp3';
            repromptUrl = 'https://s3.amazonaws.com/selectastory/cinderella/prod/reprompt'+chapter+'.mp3';
            this.emit(':askWithCard', '<audio src="https://s3.amazonaws/selectastory/cinderella/prod/opening.mp3" /><audio src="'+url+'" />', '<audio src="'+repromptUrl+'" />', cardTitle, cardText, cardImage);
        }
    }
};

const gameHandlers = Alexa.CreateStateHandler(states.gameState,  {

    'LaunchRequest': function(){
        storyIndex = getActiveStoryIndex.call(this);
        this.handler.state = states.gameState;
        var chapter = this.attributes['stories'][storyIndex]['chapter'];
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/'+chapter+'.mp3';
        repromptUrl = 'https://s3.amazonaws.com/selectastory/cinderella/prod/reprompt'+chapter+'.mp3';
        this.emit(':askWithCard', '<audio src="https://s3.amazonaws/selectastory/cinderella/prod/opening.mp3" /><audio src="'+url+'" />', '<audio src="'+repromptUrl+'" />', cardTitle, cardText, cardImage);
    },

    'SessionEndedRequest' : function () {
        this.emit(':saveState', true);
    },

    // Amazon Intents
    
    'AMAZON.CancelIntent' : function () { 
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/goodbye.mp3';
        this.emit(':tellWithCard', '<audio src="'+url+'" /><audio src="https://s3.amazonaws.com/selectastory/cinderella/prod/closing.mp3" />', cardTitle, cardText, cardImage); 
    },

    'AMAZON.HelpIntent' : function () {
        this.handler.state = states.helpState;
        this.emitWithState('HelpIntent');
    },

    'AMAZON.NoIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 80){
            this.attributes['stories'][storyIndex]['chapter'] = 82;
            this.handler.state = states.bookendState;
            this.emitWithState('EndSceneIntent', 82);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'AMAZON.RepeatIntent' : function () {
        var chapter = this.attributes['stories'][storyIndex]['chapter'];
        this.emitWithState('TellStoryIntent', chapter); 
    },

    'AMAZON.StartOverIntent' : function () { 
        attempts = 0;
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/1.mp3';
        repromptUrl = 'https://s3.amazonaws.com/selectastory/cinderella/prod/reprompt1.mp3';

        this.attributes['stories'][storyIndex]['chapter'] = 1;
        this.emit(':askWithCard', '<audio src="'+url+'" />', '<audio src="'+repromptUrl+'" />', cardTitle, cardText, cardImage);
    },

    'AMAZON.StopIntent' : function () { 
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/goodbye.mp3';
        this.emit(':tellWithCard', '<audio src="'+url+'" /><audio src="https://s3.amazonaws.com/selectastory/cinderella/prod/closing.mp3" />', cardTitle, cardText, cardImage); 
    },

    'AMAZON.YesIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 80){
            this.attributes['stories'][storyIndex]['chapter'] = 81;
            this.handler.state = states.bookendState;
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
            this.handler.state = states.bookendState;
            this.emitWithState('EndSceneIntent', 137);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'BedPostsIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 131){
            this.attributes['stories'][storyIndex]['chapter'] = 139;
            this.handler.state = states.bookendState;
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
                this.handler.state = states.bookendState;
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
            this.handler.state = states.bookendState;
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
            this.handler.state = states.bookendState;
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
                this.handler.state = states.bookendState;
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
            this.handler.state = states.bookendState;
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
                this.handler.state = states.bookendState;
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
            this.handler.state = states.bookendState;
            this.emitWithState('EndSceneIntent', 136);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'FramedIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 40){
            this.attributes['stories'][storyIndex]['chapter'] = 41;
            this.handler.state = states.bookendState;
            this.emitWithState('EndSceneIntent', 41);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'FrontPorchIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 133){
            this.attributes['stories'][storyIndex]['chapter'] = 135;
            this.handler.state = states.bookendState;
            this.emitWithState('EndSceneIntent', 135);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'GetDragonIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        if(chapters === 11 || chapters === 13){
            this.attributes['stories'][storyIndex]['chapter'] = 15;
            this.emitWithState('TellStoryIntent', 15);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'GiveUpIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        if(chapters === 11 || chapters === 13){
            this.attributes['stories'][storyIndex]['chapter'] = 14;
            this.handler.state = states.bookendState;
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
            case 105:
                this.attributes['stories'][storyIndex]['chapter'] = 109;
                this.handler.state = states.bookendState;
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
            this.handler.state = states.bookendState;
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
                this.handler.state = states.bookendState;
                this.emitWithState('EndSceneIntent', 48);
                break;
            case 46:
                this.attributes['stories'][storyIndex]['chapter'] = 50;
                this.handler.state = states.bookendState;
                this.emitWithState('EndSceneIntent', 50);
                break;
            case 51:
                this.attributes['stories'][storyIndex]['chapter'] = 60;
                this.handler.state = states.bookendState;
                this.emitWithState('EndSceneIntent', 60);
                break;
            case 52:
                this.attributes['stories'][storyIndex]['chapter'] = 62;
                this.handler.state = states.bookendState;
                this.emitWithState('EndSceneIntent', 62);
                break;
            case 53:
                this.attributes['stories'][storyIndex]['chapter'] = 58;
                this.handler.state = states.bookendState;
                this.emitWithState('EndSceneIntent', 58);
                break;
            case 54:
                this.attributes['stories'][storyIndex]['chapter'] = 56;
                this.handler.state = states.bookendState;
                this.emitWithState('EndSceneIntent', 56);
                break;
            case 123:
            case 126:
                this.attributes['stories'][storyIndex]['chapter'] = 128;
                this.handler.state = states.bookendState;
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
            this.handler.state = states.bookendState;
            this.emitWithState('EndSceneIntent', 155);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'MansionIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 79){
            this.attributes['stories'][storyIndex]['chapter'] = 83;
            this.handler.state = states.bookendState;
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
                this.handler.state = states.bookendState;
                this.emitWithState('EndSceneIntent', 125);
                break;
            default:
                this.emitWithState('Unhandled');
        }
    },

    'OneSeventyFiveIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 32){
            this.attributes['stories'][storyIndex]['chapter'] = 34;
            this.handler.state = states.bookendState;
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
            this.handler.state = states.bookendState;
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
            case 104:
                this.attributes['stories'][storyIndex]['chapter'] = 108;
                this.handler.state = states.bookendState;
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

    'ResultsIntent' : function () {
        let chapters = this.attributes['stories'][storyIndex]['chapter'];
        switch(chapters){
            case 142:
            case 143:
                this.attributes['stories'][storyIndex]['chapter'] = 144;
                this.emitWithState('TellStoryIntent', 144);
                break;
            case 156:
            case 157:
                this.attributes['stories'][storyIndex]['chapter'] = 158;
                this.handler.state = states.bookendState;
                this.emitWithState('EndSceneIntent', 158);
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
            this.handler.state = states.bookendState;
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
                this.handler.state = states.bookendState;
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
            this.handler.state = states.bookendState;
            this.emitWithState('EndSceneIntent', 31);
        } else {
            this.emitWithState('Unhandled');
        }
    },

    'SmileAndNodIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 149){
            this.attributes['stories'][storyIndex]['chapter'] = 151;
            this.handler.state = states.bookendState;
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
                this.handler.state = states.bookendState;
                this.emitWithState('EndSceneIntent', 112);   
                break;
            default:
                this.emitWithState('Unhandled');     
        }
    },

    'SnappedIntent' : function () {
        if(this.attributes['stories'][storyIndex]['chapter'] === 40){
            this.attributes['stories'][storyIndex]['chapter'] = 42;
            this.handler.state = states.bookendState;
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
                this.handler.state = states.bookendState;
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
            this.handler.state = states.bookendState;
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
                this.handler.state = states.bookendState;
                this.emitWithState('EndSceneIntent', 47);
                break;
            case 46:
                this.attributes['stories'][storyIndex]['chapter'] = 49;
                this.handler.state = states.bookendState;
                this.emitWithState('EndSceneIntent', 49);
                break;
            case 51:
                this.attributes['stories'][storyIndex]['chapter'] = 59;
                this.handler.state = states.bookendState;
                this.emitWithState('EndSceneIntent', 59);
                break;
            case 52:
                this.attributes['stories'][storyIndex]['chapter'] = 61;
                this.handler.state = states.bookendState;
                this.emitWithState('EndSceneIntent', 61);
                break;
            case 53:
                this.attributes['stories'][storyIndex]['chapter'] = 57;
                this.handler.state = states.bookendState;
                this.emitWithState('EndSceneIntent', 57);
                break;
            case 54:
                this.attributes['stories'][storyIndex]['chapter'] = 55;
                this.handler.state = states.bookendState;
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
                this.handler.state = states.bookendState;
                this.emitWithState('EndSceneIntent', 129);
                break;
            case 126:
                this.attributes['stories'][storyIndex]['chapter'] = 127;
                this.handler.state = states.bookendState;
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
                this.handler.state = states.bookendState;
                this.emitWithState('EndSceneIntent', 26);
                break;
            case 100:
            case 107:
            case 110:
            case 111:
                this.attributes['stories'][storyIndex]['chapter'] = 103;
                this.emitWithState('TellStoryIntent', 103);
                break;
            case 103:
                this.attributes['stories'][storyIndex]['chapter'] = 113;
                this.emitWithState('TellStoryIntent', 113);
                break;
            case 113:
                this.attributes['stories'][storyIndex]['chapter'] = 115;
                this.handler.state = states.bookendState;
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
                this.handler.state = states.bookendState;
                this.emitWithState('EndSceneIntent', 154);
            default:
                this.emitWithState('Unhandled');     
        }
    },

    'NewGameIntent' : function(){
        attempts = 0;
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/1.mp3';
        repromptUrl = 'https://s3.amazonaws.com/selectastory/cinderella/prod/reprompt1.mp3';

        this.attributes['stories'][storyIndex]['chapter'] = 1;
        
        this.emit(':askWithCard', '<audio src="'+url+'" />', '<audio src="'+url+'" />', cardTitle, cardText, cardImage); 
    },

    'SkipIntent' : function (){
        var chapter = this.attributes['stories'][storyIndex]['chapter'];
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/reprompt'+chapter+'.mp3';
        
        this.emit(':askWithCard', '<audio src="'+url+'" />', '<audio src="'+url+'" />', cardTitle, cardText, cardImage);
    },

    'TellStoryIntent' : function (chapter){
        attempts = 0;
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/'+chapter+'.mp3';
        repromptUrl = 'https://s3.amazonaws.com/selectastory/cinderella/prod/reprompt'+chapter+'.mp3';
 
        this.emit(':askWithCard', '<audio src="'+url+'" />', '<audio src="'+repromptUrl+'" />', cardTitle, cardText, cardImage);
    },

    'Unhandled' : function () {
        if (attempts < 2){
            attempts++;
            this.emit(":askWithCard", '<audio src="'+repromptUrl+'" />','<audio src="'+repromptUrl+'" />', cardTitle, cardText, cardImage);
        } else {
            url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/unhandled.mp3';
            this.emit(':askWithCard', '<audio src="'+url+'" />', '<audio src="'+url+'" />', cardTitle, cardText, cardImage); 
        }    
    }    
        
});

const bookendHandlers = Alexa.CreateStateHandler(states.bookendState, {

    'LaunchRequest': function(){
        storyIndex = getActiveStoryIndex.call(this);
        this.handler.state = states.gameState;
        var chapter = this.attributes['stories'][storyIndex]['chapter'];
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/'+chapter+'.mp3';
        repromptUrl = 'https://s3.amazonaws.com/selectastory/cinderella/prod/reprompt'+chapter+'.mp3';
        this.emitWithState(':askWithCard', '<audio src="https://s3.amazonaws/selectastory/cinderella/prod/opening.mp3" /><audio src="'+url+'" />', '<audio src="'+repromptUrl+'" />', cardTitle, cardText, cardImage);
    },

    'SessionEndedRequest' : function () {
        this.emit(':saveState', true);
    },

    // Amazon Intents
    
    'AMAZON.CancelIntent' : function () { 
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/goodbye.mp3';
        this.emit(':tellWithCard', '<audio src="'+url+'" /><audio src="https://s3.amazonaws.com/selectastory/cinderella/prod/closing.mp3" />', cardTitle, cardText, cardImage); 
    },

    'AMAZON.HelpIntent' : function () {
        attempts = 0;
        this.handler.state = states.helpState;
        this.emitWithState('HelpIntent');
    }, 

    'AMAZON.NoIntent' : function () {
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/goodbye.mp3';
        this.handler.state = states.gameState;
        this.emitWithState(':tellWithCard', '<audio src="'+url+'" /><audio src="https://s3.amazonaws.com/selectastory/cinderella/prod/closing.mp3" />', cardTitle, cardText, cardImage); 
    },

    'AMAZON.StartOverIntent' : function () { 
        this.handler.state = states.gameState;
        this.emitWithState('NewGameIntent'); 
    },

    'AMAZON.StopIntent' : function () { 
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/goodbye.mp3';
        this.emit(':tellWithCard', '<audio src="'+url+'" /><audio src="https://s3.amazonaws.com/selectastory/cinderella/prod/closing.mp3" />', cardTitle, cardText, cardImage); 
    },

    'AMAZON.YesIntent' : function () {
        this.handler.state = states.gameState;
        this.emitWithState('NewGameIntent');
    }, 
    
    // Custom Intents
    
    'EndSceneIntent' : function (chapter) {
        attempts = 0;
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/'+chapter+'.mp3';
        this.attributes['stories'][storyIndex]['chapter'] = 1;
       
        this.emit(':askWithCard', '<audio src="'+url+'" /><audio src="https://s3.amazonaws.com/selectastory/cinderella/prod/startover.mp3 />', '<audio src="https://s3.amazonaws.com/selectastory/cinderella/prod/startover.mp3 />', cardTitle, cardText, cardImage);
    },

    'NewGameIntent' : function(){
        this.handler.state = states.gameState;
        this.emitWithState('NewGameIntent'); 
    },

    'Unhandled' : function () {
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/unhandled.mp3';
        this.emit(':askWithCard', '<audio src="'+url+'" />', '<audio src="'+url+'" />', cardTitle, cardText, cardImage); 
    }
});

const helpHandlers = Alexa.CreateStateHandler(states.helpState, {
    
    'LaunchRequest': function(){
        storyIndex = getActiveStoryIndex.call(this);
        this.handler.state = states.gameState;
        var chapter = this.attributes['stories'][storyIndex]['chapter'];
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/'+chapter+'.mp3';
        repromptUrl = 'https://s3.amazonaws.com/selectastory/cinderella/prod/reprompt'+chapter+'.mp3';
        this.emitWithState(':askWithCard', '<audio src="https://s3.amazonaws/selectastory/cinderella/prod/opening.mp3" /><audio src="'+url+'" />', '<audio src="'+repromptUrl+'" />', cardTitle, cardText, cardImage);
    },

    'SessionEndedRequest' : function () {
        this.emit(':saveState', true);
    },

    //Amazon Intents
    'AMAZON.CancelIntent' : function () { 
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/goodbye.mp3';
        this.emit(':tellWithCard', '<audio src="'+url+'" /><audio src="https://s3.amazonaws.com/selectastory/cinderella/prod/closing.mp3" />', cardTitle, cardText, cardImage); 
    },

    'AMAZON.HelpIntent' : function () {
        attempts = 0;
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/help.mp3';
        this.emit(':askWithCard', '<audio src="'+url+'" />', '<audio src="'+url+'" />', cardTitle, cardText, cardImage); 
    }, 

    'AMAZON.RepeatIntent' : function () {
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/help.mp3';
        this.emit(':askWithCard', '<audio src="'+url+'" />', '<audio src="'+url+'" />', cardTitle, cardText, cardImage); 
    }, 

    'AMAZON.StartOverIntent' : function () { 
        this.handler.state = states.gameState;
        this.attributes['stories'][storyIndex]['chapter'] = 1;
        this.emitWithState('NewGameIntent'); 
    },

    'AMAZON.StopIntent' : function () { 
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/goodbye.mp3';
        this.emit(':tellWithCard', '<audio src="'+url+'" /><audio src="https://s3.amazonaws.com/selectastory/cinderella/prod/closing.mp3" />', cardTitle, cardText, cardImage); 
    },
    
    'AMAZON.YesIntent' : function () {
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/help.mp3';
        this.emit(':askWithCard', '<audio src="'+url+'" />', '<audio src="'+url+'" />', cardTitle, cardText, cardImage); 
    },

    // Custom Intents
    'GoBackIntent' : function () {
        this.handler.state = states.gameState;
        var chapter = this.attributes['stories'][storyIndex]['chapter'];
        this.emitWithState('TellStoryIntent', chapter);
    },

    'HelpIntent' : function (){
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/help.mp3';
        this.emit(':askWithCard', '<audio src="'+url+'" />', '<audio src="'+url+'" />', cardTitle, cardText, cardImage);
    }, 

    'NewGameIntent' : function(){
        this.handler.state = states.gameState;
        this.emitWithState('NewGameIntent'); 
    },
    
    'Unhandled' : function () {
        url = 'https://s3.amazonaws.com/selectastory/cinderella/prod/unhandled.mp3';
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

exports.handler = function (event, context, callback) {
    var alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.dynamoDBTableName = 'SelectAStoryTest'; 
    alexa.registerHandlers(newSessionHandlers, helpHandlers, bookendHandlers, gameHandlers);
    alexa.execute();
};
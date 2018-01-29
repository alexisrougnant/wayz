/* log the session with the results
handle the reward feature according to the general result (from 0 to 2, if the result is superior or equal to 1, the reward happens)
*/

var gameOverState = {

    preload : function() {
        //LOGSession
        var app_id = game.global.app_id;
        var activity_id = game.global.activity_id;
        var server_id = game.global.server_id;
        var client_id = game.global.client_id;
        var start_configuration = game.global.start_configuration;
        var live_configuration = game.global.live_configuration;
        var notes = game.global.notes;
        var data = game.global.data;
        var dateStart = game.global.dateStart;
        var dateEnd = game.global.dateEnd;
        //abilia request
        //logSession(app_id,activity_id,server_id,client_id,start_configuration,live_configuration,notes,data,dateStart,dateEnd);
    },


    create: function () {
        //REWARD boolean
        this.videoReward = game.global.videoReward;
        this.imageReward = game.global.imageReward;
        this.audioReward = game.global.audioReward;
        this.rewardEnable = this.videoReward || this.imageReward || this.audioReward;
        
        //set the size and position of the UI
        var coefBtn = 8;
        this.playAgainX = 18/20*game.width;
        this.playAgainY = 6/20*game.height;
        this.nextLevelX = 18/20*game.width;
        this.nextLevelY = 14/20*game.height;

        if(!this.rewardEnable){ //update the variables if there is no reward
            coefBtn = 5;
            this.playAgainX = 6/20*game.width;
            this.playAgainY = 10/20*game.height;
            this.nextLevelX = 14/20*game.width;
            this.nextLevelY = 10/20*game.height;
        }

        this.btnSize = Math.min(game.width/coefBtn, game.height/coefBtn);

        
        //Creation of the reward gift/ sad face
        if(this.rewardEnable){
            if(game.global.result>0){
                this.imageGift = this.add.sprite(game.width/2, 0, "gift");
                this.imageGift.anchor.setTo(0.5,0.5);
                var width = this.imageGift.width;
                var height =this.imageGift.height;
                var scale = Math.min(game.width/width/2,game.height/height/2);
                this.imageGift.scale.setTo(scale);
                this.imageGift.angle=-3;
                this.imageGift.inputEnabled = true;
                this.imageGift.events.onInputDown.add(this.positiveReward, this);

                this.imageGift.tint = parseInt('0x'+'000000');
                this.imageGift.alpha = 0.4;


                var tween = this.add.tween(this.imageGift).to( { y: game.height/4 }, 1000, null, true);
                var tween1 = this.add.tween(this.imageGift).to( { y: game.height/2 }, 1000, Phaser.Easing.Bounce.Out, true);
                var tween2 = this.add.tween(this.imageGift.scale).to({ x: scale*1.03, y: scale*1.03}, 500, null,true,2000,-1,true);
                var tween3 = this.add.tween(this.imageGift).to({angle : 3}, 1000, Phaser.Easing.Quadratic.InOut,true,500,-1,true);
                //prevent some problems on android, the div of the video is displayed but not the video itself.
                //without those lines, we face an empty screen after the imageGift input until an input event that plays the video
                //with those lines, the imageGift input never occurs with the video but the input is catch by the video
                //on computer (or maybe some mobile devices or specific browsers) the video would be diplayed on top on the gift image since the beginning
                if(this.videoReward){
                    this.imageReward = false;
                    this.audioReward = false;
                    $('#videoDiv').css('pointer-events','auto');
                }
            }
            else{
                this.imageGift = this.add.sprite(game.width/2, game.height/2, "negativeRewardImage");
                this.imageGift.anchor.setTo(0.5,0.5);
                var width = this.imageGift.width;
                var height =this.imageGift.height;
                var scale = Math.min(game.width/width/2,game.height/height/2);
                this.imageGift.scale.setTo(scale);
                this.imageGift.tint = parseInt('0x'+'000000');
                this.imageGift.alpha = 0.4;
            }
        }
        //display UI for playagain and nextlevel
        this.nextLevelBtn();
        this.playAgainBtn();
    },
    
    playAgainBtn: function() {
        //create a group for all the PlayAgain buttons (actually just one)
        this.btnPlayAgainGrp = game.add.group();
        //position of the sprite
        var x = this.playAgainX;
        var y = this.playAgainY;
        var spriteName = 'playAgainBtn';
        //set the sprite
        this.btnPlayAgain = game.add.sprite(x,y,spriteName,this.btnPlayAgainGrp);
        this.btnPlayAgain.anchor.setTo(0.5,0.5);
        //set the scale
        var width = this.btnPlayAgain.width;
        var height = this.btnPlayAgain.height;
        var scale = Math.min(this.btnSize/width,this.btnSize/height);
        this.btnPlayAgain.scale.setTo(scale);
        this.btnPlayAgain.tint = parseInt('0x'+'000000');
        this.btnPlayAgain.alpha = 0.4;
        //enable the input
        this.btnPlayAgain.inputEnabled = true;
        this.btnPlayAgain.events.onInputDown.add(this.playAgainFct, this);
    },

    playAgainFct: function() {
        this.destroyFct();
        game.state.start('Play');
    },

    // NEXT LEVEL BUTTON
    //Set the nextLevel button
    nextLevelBtn: function(){
        //create a group for all the nextLevel buttons (actually just one)
        this.btnNextLevelGrp = game.add.group();
        //position of the sprite
        var x = this.nextLevelX;
        var y = this.nextLevelY;
        var spriteName = 'nextLevelBtn';
        //set the sprite
        this.btnNextLevel = game.add.sprite(x,y,spriteName,this.btnNextLevelGrp);
        this.btnNextLevel.anchor.setTo(0.5,0.5);
        //set the scale
        var width = this.btnNextLevel.width;
        var height = this.btnNextLevel.height;
        var scale = Math.min(this.btnSize/width,this.btnSize/height);
        this.btnNextLevel.scale.setTo(scale);
        this.btnNextLevel.tint = parseInt('0x'+'000000');
        this.btnNextLevel.alpha = 0.4;
        //enable the input
        this.btnNextLevel.inputEnabled = true;
        this.btnNextLevel.events.onInputDown.add(this.nextLevelFct, this);

    },

    nextLevelFct: function() {
        this.destroyFct();
        //destroy the video element
        if(this.videoReward){
            $("#video").remove();
        }
        game.state.start("ChooseActivity");
    },

    destroyFct: function() {
        if(this.rewardEnable){
            this.imageGift.destroy(true);
            if(game.global.result>0){
                if(this.videoReward){
                    $('#videoDiv').css('pointer-events','none');
                    $('#videoDiv').fadeTo(0.5,0);
                }
                if(this.imageReward && (typeof this.image != 'undefined')){
                    this.image.destroy(true);
                }
                if(this.audioReward && (typeof this.audio != 'undefined')){
                    this.audio.destroy(true);
                    if(typeof this.musicIcon != 'undefined'){
                        this.musicIcon.destroy(true);
                    }
                }
                 
            } 
        }  
        this.btnNextLevel.destroy();
        this.btnPlayAgain.destroy();
    },

    positiveReward : function() {
        //video reward
        if(this.videoReward){
            this.imageReward = false;
            this.audioReward = false;
            $('#videoDiv').css('pointer-events','auto');
        }
        //image reward
        if(this.imageReward){
            this.image = this.add.sprite(game.width/2, game.height/2, "rewardImage");
            this.image.anchor.setTo(0.5,0.5);
            //scale the image to fit the screen
            var width = this.image.width;
            var height =this.image.height;
            var scale = Math.min(game.width/width,game.height/height);
            this.image.scale.setTo(scale);
            this.imageGift.alpha = 0;
        }
        //audio reward
        if(this.audioReward){
            this.audio = game.add.audio('rewardAudio');
            this.audio.play();
            this.imageGift.alpha = 0;
            //display a music note icon
            if(!this.imageReward){
                this.musicIcon = this.add.sprite(game.width/2, game.height/2, "music");
                this.musicIcon.anchor.setTo(0.5,0.5);
                var width = this.musicIcon.width;
                var height =this.musicIcon.height;
                var scale = Math.min(game.width/width/4,game.height/height/4);
                this.musicIcon.scale.setTo(scale);
                this.musicIcon.alpha = 0.7;
            }
        }
    }
};
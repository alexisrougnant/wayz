/* loadState : load all the asset of the current activity
Let know the user some times is needed in displaying and hourglass*/

var loadState = {

    preload: function() {
        //preload wait icon
        game.load.image('wait','img/ui/hourglass.png');

        //background color
        game.stage.backgroundColor = game.global.backgroundColor;
        game.canvas.parentElement.style.backgroundColor = game.global.backgroundColor;
        $('#videoDiv').css('background-color',game.global.backgroundColor);
        //convert the different size and height in pixel 
        game.global.drawingSize = game.global.drawingSize*game.global.pxpcm;
        game.global.outlinePathSize = game.global.outlinePathSize*game.global.pxpcm;
        game.global.pathSize = game.global.pathSize*game.global.pxpcm;
        game.global.patternHeight = game.global.patternHeight*game.global.pxpcm;
        //sprite and length size
        game.global.pathLength = game.global.pathLength*game.global.pxpcm;
        game.global.sourceImageSize = game.global.sourceImageSize*game.global.pxpcm;
        game.global.endImageSize = game.global.endImageSize*game.global.pxpcm;
        game.global.sourceImageWidth = game.global.sourceImageWidth*game.global.pxpcm;
        game.global.endImageWidth = game.global.endImageWidth*game.global.pxpcm;
        
    },

    create: function() {
        //loading layout
        var spriteName = "wait";
        this.wait = this.add.sprite(game.width/8,game.height/8,spriteName);
        this.wait.anchor.setTo(0.5,0.5);
        //set the scale
        var coef = 6;
        this.spriteSize = Math.min(this.game.width/coef, this.game.height/coef);
        var width = this.wait.width;
        var height = this.wait.height;
        var scale = Math.min(this.spriteSize/width,this.spriteSize/height);
        this.wait.scale.setTo(scale);
        this.wait.tint = parseInt('0x'+'000000');
        this.wait.alpha = 0.4;
        
        //load complete event
        this.load.onLoadComplete.add(this.loadComplete, this);
        //start loading
        this.loadStart();       
    },

    loadStart: function() {
        //this.text.setText("Loading ...");
        //workaround to reload the assets anytime we load the state
        //for new activities 
        //var stamp = '?' + game.global.activity_id;
        //anytime
        var stamp = '?' + new Date().getTime();
        //REWARDS
        game.load.image('negativeRewardImage', "./img/ui/negativeReward.png"+stamp);
        game.load.image('gift','img/ui/gift.png');
        if(game.global.imageReward){
            game.load.image('rewardImage', game.global.rewardImageLocation+stamp);
        }
        if(game.global.videoReward){
            //game.load.video('rewardVideo', game.global.rewardVideoLocation+stamp);
            //some issues with Phaser.js led us to use classic DOM element to embed the video
            $("#videoDiv").append("<video id='video' onended='videoEnd()'><source src='"+game.global.rewardVideoLocation+"'>Your browser does not support HTML5 video.</video>");
        }
        if(game.global.audioReward){
            game.load.audio('rewardAudio', game.global.rewardAudioLocation+stamp);
            game.load.image('music','img/ui/music.png');
        }

        //SOURCE AND END IMAGES
        var sourceImage = game.global.sourceImage;
        if(sourceImage.length >0){
	        game.load.image('source', game.global.sourceImage+stamp);
	    }
        var endImage = game.global.endImage;
        if(endImage.length >0){
        	game.load.image('destination', game.global.endImage+stamp);
        }

        //UI
        //buttons
        game.load.image('endBtn','img/ui/endBtn.png');
        game.load.image('clearBtn','img/ui/clearBtn.png');
        game.load.image('child','img/ui/child.png');
        game.load.image('supervisor','img/ui/supervisor.png');

        
        //Menu
        game.load.image('fullscreenBtn','img/ui/fullscreenBtn.png');
        game.load.image('startBtn','img/ui/startBtn.png');
        game.load.image('playAgainBtn','img/ui/playAgainBtn.png');
        game.load.image('nextLevelBtn','img/ui/nextLevelBtn.png');
        

        //FEEDBACKS
        game.load.audio('wrong', 'sounds/wrong.wav');


        //start the loading process
        game.load.start();
    },

    loadComplete: function() {
        game.time.events.add(Phaser.Timer.SECOND*0.3, this.startMenu, this);
    },

    startMenu: function() {
        this.destroy();
        game.state.start('Menu');
    },


    destroy: function(){
        this.wait.destroy(true);
    }
};
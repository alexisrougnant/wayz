//Bootstate : set the background color and the scale option of the game
var bootState = {
    create: function() {
        //set the maximum number of input to 1
        game.input.maxPointers = 1;
        //define the background color
        game.stage.backgroundColor = "#fbfcfc";
        game.canvas.parentElement.style.backgroundColor = "#fbfcfc";
        $('#videoDiv').css('background-color',game.global.backgroundColor);
        //scale management
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
        game.scale.pageAlignHorizontally = true;
        game.scale.pageAlignVertically = true;

        //size constraint conversion in pixel
        game.global.widthImageMax = game.global.widthImageMax*game.global.pxpcm;
        game.global.padding = game.global.padding*game.global.pxpcm;

        //Start the Activity choice screen
        game.state.start('ChooseActivity');
    }
};
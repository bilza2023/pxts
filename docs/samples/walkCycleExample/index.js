import { PixiEngine,Pixi } from "../pxts.js";

const en = new PixiEngine("bilza", 800, 400, 0xb5af6c);
en.backgroundColor(0xffcccc);

const app = en.getApp();

let background;
let animatedCapguy;

const capguyFrames = [
    "../../assets/capguy/walk_01.png",
    "../../assets/capguy/walk_02.png",
    "../../assets/capguy/walk_03.png",
    "../../assets/capguy/walk_04.png",
    "../../assets/capguy/walk_05.png",
    "../../assets/capguy/walk_06.png",
    "../../assets/capguy/walk_07.png",
    "../../assets/capguy/walk_08.png"
];


app.loader
.add("background", "../../assets/background.png")
    //--we can give it array of
.add(capguyFrames)
.load(setup);

////////////////////////////////////
function setup() {

// background = new Pixi.Sprite(app.loader.resources["background"].texture);
background = new Pixi.Sprite(en.getTexture("background"));
en.add(background);
    // scale stage container that it fits into the view
//--importantay 
    app.stage.scale.x = app.view.width / background.width;
    app.stage.scale.y = app.view.height / background.height;
    // create an animated sprite
    animatedCapguy = Pixi.AnimatedSprite.fromFrames(capguyFrames);
    // configure + start animation:
    animatedCapguy.animationSpeed = 1/6;                  // 6 fps
    animatedCapguy.position.set(0, background.height - 350); // almost bottom-left corner of the canvas
    animatedCapguy.play();

    en.add(animatedCapguy);
        app.ticker.add(delta => gameLoop(delta));
// highlight-end
}

function gameLoop(delta) {
    animatedCapguy.x = (animatedCapguy.x + 5*delta) % (background.width + 200);
}
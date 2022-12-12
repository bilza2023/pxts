import { PixiEngine, dat } from "./index.js";
import {Sprite,AnimatedSprite} from "pixi.js";

const engine = new PixiEngine("bilza", 800, 400, 0xb5af6c);
engine.backgroundColor(0xffcccc);
const app = engine.getApp();
let background :Sprite;
let animatedCapguy :AnimatedSprite;

const capguyFrames = [
    "assets/capguy/walk_01.png",
    "assets/capguy/walk_02.png",
    "assets/capguy/walk_03.png",
    "assets/capguy/walk_04.png",
    "assets/capguy/walk_05.png",
    "assets/capguy/walk_06.png",
    "assets/capguy/walk_07.png",
    "assets/capguy/walk_08.png"
];

engine.getApp().loader
    .add("assets/background.png")
    .add(capguyFrames)
    .load(setup);

function setup() {
    let resources = app.loader.resources;

    // initialize background sprite
    background = new Sprite(resources["assets/background.png"].texture);
    app.stage.addChild(background);

    // scale stage container that it fits into the view
    app.stage.scale.x = app.view.width / background.width;
    app.stage.scale.y = app.view.height / background.height;

// highlight-start
    // create an animated sprite
    animatedCapguy = AnimatedSprite.fromFrames(capguyFrames);

    // configure + start animation:
    animatedCapguy.animationSpeed = 1/6;                  // 6 fps
    animatedCapguy.position.set(0, background.height - 350); // almost bottom-left corner of the canvas
    animatedCapguy.play();

    app.stage.addChild(animatedCapguy);
        app.ticker.add(delta => gameLoop(delta));
// highlight-end
}

function gameLoop(delta:number) {
    animatedCapguy.x = (animatedCapguy.x + 5*delta) % (background.width + 200);
}
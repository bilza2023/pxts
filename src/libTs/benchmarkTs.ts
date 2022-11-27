import { Graphics, Application, Loader, Texture, AnimatedSprite, Sprite } from "pixi.js";
import "./style.css";
///////////////////////////////////////////////////

const gameWidth = 600;
const gameHeight = 350;

///////////////--Creating the App
const app = new Application({
    backgroundColor: 0xd3d3d3,
    width: gameWidth,
    height: gameHeight,
});
///////////////--On load event
window.onload = async (): Promise<void> => {
    await loadGameAssets();

    document.body.appendChild(app.view);

    resizeCanvas();
    //--convert this to loader
    const background = Sprite.from("assets/background.png");
    background.width = app.renderer.screen.width;
    background.height = app.renderer.screen.height;
    app.stage.addChild(background);
    ///////////////
    const capGuy = getCapGuy();
    // capGuy.anchor.set(0.5, 0.5);
    capGuy.position.set(100, 210);
    capGuy.scale.set(0.5, 0.4);
    app.stage.addChild(capGuy);
    ///////////////////////////
    app.ticker.add(() => {
        capGuy.x += 1;
        if (capGuy.x > app.renderer.screen.width - 10) {
            capGuy.x = 0;
        }
    });
    /////////////////////////////
    app.stage.interactive = true;
};

////////////////--loadGameAssets
async function loadGameAssets(): Promise<void> {
    return new Promise((res, rej) => {
        const loader = Loader.shared;
        // loader.add("rabbit", "./assets/simpleSpriteSheet.json");
        // loader.add("pixie", "./assets/spine-assets/pixie.json");
        ///////////////////
        loader.add("capGuy", "./assets/capGuy/capGuy.json");

        ///////////////////
        loader.onComplete.once(() => {
            res();
        });

        loader.onError.once(() => {
            rej();
        });

        loader.load();
    });
}

/////-resizeCanvas
function resizeCanvas(): void {
    const resize = () => {
        app.renderer.resize(window.innerWidth, window.innerHeight);
        app.stage.scale.x = window.innerWidth / gameWidth;
        app.stage.scale.y = window.innerHeight / gameHeight;
    };

    resize();

    window.addEventListener("resize", resize);
}
///////////////////////////////////////////
function getCapGuy(): AnimatedSprite {
    const capGuy = new AnimatedSprite([
        Texture.from("walk_01.png"),
        Texture.from("walk_02.png"),
        Texture.from("walk_03.png"),
        Texture.from("walk_04.png"),
        Texture.from("walk_05.png"),
        Texture.from("walk_06.png"),
        Texture.from("walk_07.png"),
        Texture.from("walk_08.png"),
    ]);
    capGuy.loop = true;
    capGuy.animationSpeed = 0.11;
    capGuy.play();
    return capGuy;
}

///////////////////////////////////////////

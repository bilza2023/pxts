const app = new PIXI.Application({ background: "#1099bb" });
document.body.appendChild(app.view);

// Add the assets to load
PIXI.Assets.add("background", "../images/background.png");
PIXI.Assets.add("runner", "../images/runner.png");

// Load the assets and get a resolved promise once both are loaded
const texturesPromise = PIXI.Assets.load(["background", "runner"]);
// => Promise<{flowerTop: Texture, eggHead: Texture}>

// When the promise resolves, we have the texture!
texturesPromise.then((textures) => {
    const background = PIXI.Sprite.from(textures.background);
    app.stage.addChild(background);

    const runner = PIXI.Sprite.from(textures.runner);
    app.stage.addChild(runner);
});

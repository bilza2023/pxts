const app = new PIXI.Application({ width: 800, height: 350, background: "#1099bb" });
document.body.appendChild(app.view);

// Add the assets to load
// PIXI.Assets.add('background', '../images/background.png');

// const texturesPromise = PIXI.Assets.load(['background']);

//     texturesPromise.then((textures) => {

//     const background = PIXI.Sprite.from(textures.background);
//     background.width = app.renderer.screen.width;
//     background.height = app.renderer.screen.height;

//     app.stage.addChild(background);

// });

//////////////////////////

PIXI.Assets.load("../images/capGuyAnimated/capGuy.json").then(() => {
    // create an array of textures from an image path
    const frames = [];

    for (let i = 0; i < 8; i++) {
        const val = `walk_0${i + 1}.png`;
        //i < 10 ? `0${i}` : i;

        // magically works since the spritesheet was loaded with the pixi loader
        frames.push(PIXI.Texture.from(val));
    }

    // create an AnimatedSprite (brings back memories from the days of Flash, right ?)
    const anim = new PIXI.AnimatedSprite(frames);

    /*
     * An AnimatedSprite inherits all the properties of a PIXI sprite
     * so you can change its position, its anchor, mask it, etc
     */
    anim.x = 100;
    anim.y = 10;
    // anim.anchor.set(0.5);
    anim.animationSpeed = 0.15;
    anim.play();

    app.stage.addChild(anim);
});

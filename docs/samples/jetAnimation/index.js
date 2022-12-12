import { PixiEngine, Rect,Ellipse, dat } from "../pxts.js";

const engine = new PixiEngine("bilza", 800, 300, 0xb5af6c);


PIXI.Assets.load("../images/fighter.json").then(() => {
    // create an array of textures from an image path
    const frames = [];

    for (let i = 0; i < 30; i++) {
        const val = i < 10 ? `0${i}` : i;

        // magically works since the spritesheet was loaded with the pixi loader
        frames.push(PIXI.Texture.from(`rollSequence00${val}.png`));
    }

    // create an AnimatedSprite (brings back memories from the days of Flash, right ?)
    const anim = new PIXI.AnimatedSprite(frames);

    /*
     * An AnimatedSprite inherits all the properties of a PIXI sprite
     * so you can change its position, its anchor, mask it, etc
     */
    anim.x = app.screen.width / 2;
    anim.y = app.screen.height / 2;
    anim.anchor.set(0.5);
    anim.animationSpeed = 0.5;
    //--animated sprite play
    anim.play();

    app.stage.addChild(anim);

    // Animate the rotation --we can not use this if we want
    // app.ticker.add(() => {
    //     anim.rotation += 0.01;
    // });
});
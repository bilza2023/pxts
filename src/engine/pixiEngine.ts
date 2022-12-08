import { Application, DisplayObject, utils, Graphics } from "pixi.js";

///////////////////////////////////////////
export default class PixiEngine {
    private app: Application;
    ///////////////////////////

    constructor(width: number = 600, height: number = 300, backgroundColor: number = 0xd3d3d3) {
        //----------------------------
        utils.skipHello();

        this.app = new Application({
            width: width,
            height: height,
            antialias: true,
        });
        this.app.stage.interactive = true;
        this.app.renderer.backgroundColor = backgroundColor;
        //.........................................
        document.body.appendChild(this.app.view);
        /////////////////////
        window.onload = async (): Promise<void> => {
            // await loadGameAssets();
            resizeCanvas(this.app);
        };
        //----------------------------
    }

    add(comp: DisplayObject) {
        this.app.stage.addChild(comp);
    }

    drawRect(x: number, y: number, width: number, height: number, color: number): DisplayObject {
        const graphics = new Graphics();
        graphics.beginFill(color);
        graphics.drawRect(x, y, width, height);
        graphics.endFill();
        return graphics;
    }
}

///XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
function resizeCanvas(app: Application): void {
    const resize = () => {
        app.renderer.resize(app.renderer.width, app.renderer.height);
        //     app.stage.scale.x = window.innerWidth / app.screen.width;
        //     app.stage.scale.y = window.innerHeight / app.screen.height;
    };
    //     const resize = () => {
    //     app.renderer.resize(window.innerWidth, window.innerHeight);
    //     app.stage.scale.x = window.innerWidth / app.screen.width;
    //     app.stage.scale.y = window.innerHeight / app.screen.height;
    //     };
    ///////////////
    window.addEventListener("resize", resize);
    /////////////////
    resize();
}

////////////////--loadGameAssets
// async function loadGameAssets(): Promise<void> {
//     return new Promise((res, rej) => {
// const loader = Loader.shared;
// loader.add("rabbit", "./assets/simpleSpriteSheet.json");
// loader.add("pixie", "./assets/spine-assets/pixie.json");
///////////////////
// loader.add("capGuy", "./assets/capGuy/capGuy.json");

///////////////////
//         loader.onComplete.once(() => {
//             res();
//         });

//         loader.onError.once(() => {
//             rej();
//         });

//         loader.load();
//     });
// }

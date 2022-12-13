import { Application, DisplayObject, Texture, utils } from "pixi.js";

///////////////////////////////////////////
export default class PixiEngine {
    private app: Application;
    ///////////////////////////

    constructor(id :string="bilza",width: number = 600, height: number = 300, backgroundColor: number = 0xd3d3d3) {
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
        const cont = document.getElementById(id);
        if (cont == null){
        throw new Error("container not found");
         }
        cont.appendChild(this.app.view);
        /////////////////////
        window.onload = async (): Promise<void> => {
            // await loadGameAssets();
            resizeCanvas(this.app);
        };
        //----------------------------
    }
    backgroundColor(backgroundColor :number){
     this.app.renderer.backgroundColor = backgroundColor;
    }
    getApp():Application{
    return this.app;
    }
    add(comp: DisplayObject) {
        this.app.stage.addChild(comp);
    }
    getTexture(textureName:string):Texture{
    const r = this.app.loader.resources[textureName].texture; 
    if (r==null){throw new Error("texture not found");
    }
    return r;
    }
    destroy(){
        while(this.app.stage.children[0]) { 
            this.app.stage.removeChild(
                this.app.stage.children[0]
                ); 
            }
    }
    totalComps():number{
    return this.app.stage.children.length;
    }

    canvasWidth():number{
    return this.app.renderer.width;
    }
    canvasHeight():number{
    return this.app.renderer.height;
    }
    stageWidth():number{
    return this.app.stage.width;
    }
    stageHeight():number{
    return this.app.stage.height;
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

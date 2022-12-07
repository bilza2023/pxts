import { Graphics, GraphicsGeometry } from "pixi.js";
/////////////////////////////////////////////

export default class Rect extends Graphics {
    /////////////////////////////////////////
    constructor() {
        super();
        this.beginFill(0xffffff);
        this.drawRect(0, 0, 5, 5);
        this.endFill();
        //======================================
    }

    //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
}

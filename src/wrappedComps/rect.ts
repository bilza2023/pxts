import { Graphics, Container, DisplayObject, Application } from "pixi.js";
import BaseWrapper from "./base/baseWrapper";
/////////////////////////////////////////////

export default class Rect extends BaseWrapper {
    /////////////////////////////////////////
    constructor(width: number, height: number) {
        super();
        this.init(width, height);
        /////////////////////////////
    }

    init(width: number, height: number) {
        this.graphics.beginFill(0xffffff);

        this.graphics.drawRect(
            0, // dont use this.x in init since it accumulates
            0,
            width,
            height,
        );

        //======================================
        this.graphics.endFill();
        //======================================
    }

    //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
}
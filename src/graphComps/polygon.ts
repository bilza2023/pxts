import { DisplayObject } from "pixi.js";
import BaseGraphComp from "../baseGraphComp/baseGraphComp";
/////////////////////////////////////////////

export default class Polygon extends BaseGraphComp {
    /////////////////////////////////////////
    public points: number[];
    constructor() {
        super();
        this.points = [];
        /////////////////////////////
    }

    init() {
        if (this.points.length < 6) {
            throw new Error("a polygon needs atleast 6 points to draw");
        }

        this.graphics.beginFill(this.getColor());

        this.graphics.drawPolygon(this.points);
        //======================================
        this.graphics.endFill();
        //======================================
    }
    /**
* POLYGON CAN HIDE ITS INIT IN getDrawable()
init only when asked to deliver graphics object. Before that the user can add points.
*/
    public getDrawable(): DisplayObject {
        this.init();
        return this.graphics;
    }

    addPoint(x: number, y: number) {
        this.points.push(x);
        this.points.push(y);
    }
}

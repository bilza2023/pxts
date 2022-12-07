import BaseGraph from "../baseGraph/baseGraph";

/////////////////////////////////////////////

export default class Polygon extends BaseGraph {
    /////////////////////////////////////////
    public points: number[];
    constructor(x: number, y: number, width: number, height: number, color: number) {
        super(x, y, width, height, color);
        this.points = [];
        /////////////////////////////
    }

    addPoint(x: number, y: number) {
        this.points.push(x);
        this.points.push(y);
    }

    init() {
        if (this.points.length < 6) {
            throw new Error("a polygon needs atleast 6 points to draw");
        }

        this.graphics.beginFill(this.color);

        this.graphics.drawPolygon(this.points);
        //======================================
        this.graphics.endFill();
        //======================================
    }

    public update(): void {
        this.init();
    }
    //xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
}

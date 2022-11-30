import { DisplayObject, Graphics } from "pixi.js";
// import IDrawable from "./IDrawable";
import { AniNumberDb } from "../animations/animations";

/////////////////////////////////////////////
export default class BaseGraphDb  {
    private graphics: Graphics;

    public readonly id: string;

    public readonly startTime: number;
    public readonly endTime: number;
    public canvasWidth: number;
    public canvasHeight: number;

    public x: AniNumberDb;
    public width: number;
    public height: number;
    public color: number;

    /////////////////////////////////////////
    constructor(startTime: number, endTime: number, x: number = 0, y: number = 0, width: number = 50, height: number = 50, color: number = 0xde3249) {

        this.startTime = startTime;
        this.endTime = endTime;
        this.canvasWidth = 800;
        this.canvasHeight = 350;
        this.id = Math.random().toString(36).slice(2);
        this.x = new AniNumberDb(0);
        this.width = width;
        this.height = height;
        this.color = color;
       
///////////////////
}



// setX(x: number): number {
//     this.graphics.x = (this.canvasWidth / 100) * x;
//     return this.graphics.x;
// }
// setY(y: number): number {
//     this.graphics.y = (this.canvasHeight / 100) * y;
//     return this.graphics.y;
// }
// setxy(x: number, y: number): void {
//     this.setX(x);
//     this.setY(y);
// }


}
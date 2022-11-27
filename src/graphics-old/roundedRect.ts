import { Application, Graphics } from "pixi.js";
import BaseComp from "./BaseGraph";

/////////////////////////////////////
export default class RoundedRect extends BaseComp {

        radius: number;
        /////////////////////////////////////
        constructor(x: number, y: number, width: number, height: number, radius: number, color: number) {
                super(x, y, width, height, color);
                this.radius = radius;
        }

        draw(stage: Application['stage']) {
                const graphics = new Graphics();
                this.drawBorder(graphics);

                // Rectangle
                graphics.beginFill(this.color, this.alpha);
                graphics.drawRoundedRect(this.x, this.y, this.width, this.height, this.radius);
                graphics.endFill();

                stage.addChild(graphics);
        }



}
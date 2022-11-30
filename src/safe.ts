import { Application, Graphics, Loader, Texture, AnimatedSprite } from "pixi.js";
import rect from "./fnComps/rect";
import BaseGraph from "./core/baseGraph";

const app = new Application({ antialias: true, width: 800, height: 600 });

document.body.appendChild(app.view);

const bg = new BaseGraph();
const comp = bg.getDrawable();
// comp.y = 20;
app.stage.addChild(comp);


bg.setX((app.renderer.width / 100) * 10);

// let xval = 0;
// setInterval( ( ) => {
//     xval +=1;
//     bg.setX( (app.renderer.width/100) * xval);
// // comp.y += 1;
// },200 );

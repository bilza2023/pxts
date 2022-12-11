import { PixiEngine, Line,dat } from "../pxts.js";

////////////////////////////////////////////////
const engine = new PixiEngine("bilza", 800, 400, 0xb5af6c);
///////////////////////////////////
const state = {
numberOfLines : 1000,
// exponential : 10,
minX1 : 0 ,
maxX1 : 800,
minY1 : 0 ,
maxY1 : 400,
minX2 : 0 ,
maxX2 : 800,
minY2 : 0 ,
maxY2 : 400,

}


function drawLines(){
engine.destroy();
for (let i = 0; i < (state.numberOfLines); i++) {

const x1 = Math.floor(Math.random() * (state.maxX1 - state.minX1 + 1) + state.minX1)
const y1 = Math.floor(Math.random() * (state.maxY1 - state.minY1 + 1) + state.minY1)
const x2 = Math.floor(Math.random() * (state.maxX2 - state.minX2 + 1) + state.minX2)
const y2 = Math.floor(Math.random() * (state.maxY2 - state.minY2 + 1) + state.minY2)

 const l = new Line(x1,y1,x2,y2, randomHex (), 1);
 engine.add(l.pixiObj);   
    
}

////log number of children
console.log("Total number of drawable components", engine.totalComps());

}//draw lines fn

drawLines();

function randomHex (){
 const hx = [...Array(6)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
return `0x${hx}`;
}

////////////////////////gui code////////////////////

const gui = new dat.GUI();


gui.add(state,"numberOfLines", 1 , 1000).name("numberOfLines")
.onChange(() => {
    drawLines()
});

gui.add(state,"minX1", 0 , 800).name("minX1")
.onChange(() => {
    drawLines()
});

gui.add(state,"maxX1", 0 , 800).name("maxX1")
.onChange(() => {
    drawLines()
});

gui.add(state,"minY1", 0 , 400).name("minY1")
.onChange(() => {
    drawLines()
});

gui.add(state,"maxY1", 0 , 400).name("maxY1")
.onChange(() => {
    drawLines()
});

gui.add(state,"minX2", 0 , 800).name("minX2")
.onChange(() => {
    drawLines()
});

gui.add(state,"maxX2", 0 , 800).name("maxX2")
.onChange(() => {
    drawLines()
});

gui.add(state,"minY2", 0 , 400).name("minY2")
.onChange(() => {
    drawLines()
});

gui.add(state,"maxY2", 0 , 400).name("maxY2")
.onChange(() => {
    drawLines()
});



gui.open();

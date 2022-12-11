import { PixiEngine, Rect, dat } from "../pxts.js";

const engine = new PixiEngine("bilza", 800, 400, 0xb5af6c);
engine.backgroundColor(0xffcccc);
//--

const state = {
    x :50,
    y:50,
    backgroundColor : 0xcc0000,
    color1 : 0xff0000,
    color2 : 0x00ff00,
    size : 30
}


function getChessBoard (){
const board = [];

let paintColorOne = true;
for (let row = 1; row < 9; row++) {
    //--We need the top cell of every column to be of different color than the top cell on its left - so we need to swtich before every row start
    paintColorOne = !paintColorOne;

    const xVal = state.x +  (row * state.size);

        const boardCol =  [];
        for (let col = 1; col < 9; col++) {
            const yVal =   state.y +  (col * state.size)

            const rect = new Rect(state.size, state.size);

            rect.x = xVal;
            rect.y = yVal;

                if (paintColorOne  == true){
                rect.color = state.color1;
                paintColorOne = false;
                }else {
                rect.color = state.color2;
                paintColorOne = true;
                }
            // console.log("rowNo", row,"colNo", col,"xValu",xVal,"yValue",yVal);

        boardCol.push(rect);
        engine.add(rect.pixiObj);
        }
    board.push(boardCol);        
    }
return board;
}

const chessBoard = getChessBoard();
// console.log(getChessBoard());

function updateChessBoard (){

let paintColorOne = true;
for (let row = 1; row < 9; row++) {
    //--We need the top cell of every column to be of different color than the top cell on its left - so we need to swtich before every row start
    paintColorOne = !paintColorOne;

    const xVal = state.x +  (row * state.size);

        for (let col = 1; col < 9; col++) {
            const yVal =   state.y +  (col * state.size)
            //--for calc the col=1 and row=1
            const rect = chessBoard[row-1][col-1];

            rect.x = xVal;
            rect.y = yVal;
            rect.width = state.size;
            rect.height = state.size;

                if (paintColorOne  == true){
                rect.color = state.color1;
                paintColorOne = false;
                }else {
                rect.color = state.color2;
                paintColorOne = true;
                }
            // console.log("rowNo", row,"colNo", col,"xValu",xVal,"yValue",yVal);

        }
    }
}


updateChessBoard();


/////////////////////////////////////////////////
/////////////////////////////////////////////////
const gui = new dat.GUI();

gui.add(state, "x",0,800).name("x").onChange(() => {updateChessBoard();});
gui.add(state, "y",0,400).name("y").onChange(() => {updateChessBoard();});
gui.add(state, "size",1,300).name("size").onChange(() => {updateChessBoard();});


gui.addColor(state, "color1").name("color1")
.onChange(() => {
   updateChessBoard();
});
gui.addColor(state, "color2").name("color2")
.onChange(() => {
   updateChessBoard();
});
gui.addColor(state, "backgroundColor").name("backgroundColor")
.onChange(() => {
   engine.backgroundColor(state.backgroundColor);
});

gui.open();
const app = new PIXI.Application({ width: 800, height: 350, background: "#1099bb" });
document.body.appendChild(app.view);

//////////////////////////////////

// const capguyFrames = [
//   "../images/capguy/walk_01.png",
//   "../images/capguy/walk_02.png",
//   "../images/capguy/walk_03.png",
//   "../images/capguy/walk_04.png",
//   "../images/capguy/walk_05.png",
//   "../images/capguy/walk_06.png",
//   "../images/capguy/walk_07.png",
//   "../images/capguy/walk_08.png"
// ];

PIXI.Assets.add("background", "../images/background.png");
const background = await PIXI.Assets.load("background");

const bunny = new PIXI.Sprite(background);

app.stage.addChild(bunny);

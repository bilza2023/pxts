//--APP
const app = new PIXI.Application({ width: 800, height: 350 });
document.body.appendChild(app.view);

const container = new PIXI.Container();

app.stage.addChild(container);

// Create a new texture
const texture = PIXI.Texture.from("../images/cat.jpg");

const bunny = new PIXI.Sprite(texture);
bunny.anchor.set(0.5);
bunny.width = 600;
bunny.height = 400;
bunny.x = 0;
bunny.y = 0;
container.addChild(bunny);

// Move container to the center
container.x = app.screen.width / 2;
container.y = app.screen.height / 2;

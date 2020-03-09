import { join, resolve } from 'path';
import * as fs from 'fs';
import { createCanvas, loadImage, registerFont } from 'canvas';
import * as sharp from 'sharp';

let font = resolve(join(__dirname, '..', '..', 'fonts', 'RedRock.ttf'));
registerFont(font, { family: 'RedRock' });
font = resolve(join(__dirname, '..', '..', 'fonts', 'Roboto-Regular.ttf'));
registerFont(font, { family: 'Roboto' });

const IMG_WIDTH = 250;
const IMG_HEIGHT = 250;
async function drawTheCap(context, imgName, label, x, y) {
  let shishiBuffer = fs.readFileSync(
    resolve(join(__dirname, '..', '..', 'images', imgName))
  );
  shishiBuffer = await sharp(shishiBuffer)
    .resize(250, 250)
    .toBuffer();
  const base64shishi = Buffer.from(shishiBuffer).toString('base64');
  const imgShishi = await loadImage(`data:image/jpeg;base64,${base64shishi}`);
  context.font = '20px Roboto';
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.fillText(label, x + IMG_WIDTH / 2, 365);
  context.drawImage(imgShishi, x, y, IMG_WIDTH, IMG_HEIGHT);
}

const hello = async (req, resp) => {
  const canvas = createCanvas(3 * 250 + 40, 370);
  const ctx = canvas.getContext('2d');

  await drawTheCap(ctx, 'Warbl-Unit-02.jpg', 'Warbl Unit 02', 10, 90);
  await drawTheCap(
    ctx,
    'KeyForge-Shishi-Infected.jpg',
    'Infected Shishi',
    270,
    90
  );
  await drawTheCap(ctx, 'bullv2.jpeg', 'Bull v2 - Kratos', 530, 90);
  // Title
  ctx.font = '60px RedRock';
  ctx.fillStyle = 'red';
  ctx.textAlign = 'center';
  ctx.fillText('Zekth wishlist', (3 * IMG_WIDTH + 40) / 2, 60);
  return resp
    .header('content-disposition', `attachment; filename="wishlist.jpg"`)
    .type('image/jpeg')
    .status(200)
    .send(canvas.toBuffer('image/jpeg'));
};

export const controllers = { hello };

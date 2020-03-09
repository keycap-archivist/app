import { join, resolve } from 'path';
import axios from 'axios';
import { createCanvas, loadImage, registerFont, Image } from 'canvas';

let font = resolve(join(__dirname, '..', '..', 'fonts', 'RedRock.ttf'));
registerFont(font, { family: 'RedRock' });
font = resolve(join(__dirname, '..', '..', 'fonts', 'Roboto-Regular.ttf'));
registerFont(font, { family: 'Roboto' });

const BASE_URL = 'https://a.mrkeebs.com/api/';
const MARGIN_SIDE = 10;
const MARGIN_BOTTOM = 60;
const nbCapsPerLine = 3;
const IMG_WIDTH = 250;
const IMG_HEIGTH = 250;
const HEADER_HEIGHT = 90;
const LINE_HEIGHT = 22;
const canvasWidth =
  nbCapsPerLine * IMG_WIDTH + nbCapsPerLine * MARGIN_SIDE + MARGIN_SIDE;
const rowHeight = IMG_HEIGTH + MARGIN_BOTTOM;

async function getCap(id): Promise<keycap> {
  return await axios.get(`${BASE_URL}artisans/${id}`).then(resp => {
    return resp.data;
  });
}

async function drawTheCap(canvas, context, capId, x, y) {
  const cap = await getCap(capId);
  const img = await loadImage(cap.image);
  let h, w, sx, sy;
  if (img.width > img.height) {
    h = img.height;
    w = h;
    sy = 0;
    sx = Math.ceil((img.width - img.height) / 2);
  } else {
    sx = 0;
    sy = Math.ceil((img.height - img.width) / 2);
    w = img.width;
    h = w;
  }
  await context.drawImage(img, sx, sy, w, h, x, y, IMG_WIDTH, IMG_HEIGTH);

  context.font = '20px Roboto';
  context.fillStyle = 'white';
  context.textAlign = 'center';
  const legend = `${cap.sculpt} ${cap.colorway}`;
  const measurement = context.measureText(legend);
  if (measurement.width > IMG_WIDTH + 10) {
    context.fillText(
      `${cap.sculpt}`,
      x + IMG_WIDTH / 2,
      y + IMG_HEIGTH + LINE_HEIGHT
    );
    context.fillText(
      `${cap.colorway}`,
      x + IMG_WIDTH / 2,
      y + IMG_HEIGTH + LINE_HEIGHT + LINE_HEIGHT
    );
  } else {
    context.fillText(
      `${cap.sculpt} ${cap.colorway}`,
      x + IMG_WIDTH / 2,
      y + IMG_HEIGTH + LINE_HEIGHT
    );
  }
}
// async function getSculpt(name) {}
// async function getMaker(id) {
//   return await axios.get(`${BASE_URL}maker/${id}`);
// }
type keycap = {
  artisan_id: number;
  maker_id: number;
  maker: string;
  sculpt: string;
  colorway: string;
  image: string;
};
// http://localhost:3000/api/v1?ids=3210,3114,3202,3204,1959,2640S
const hello = async (req, resp) => {
  let canvas, ctx;
  const p = [];
  if (req.query.ids) {
    const ids: string[] = req.query.ids.split(',');
    const nbCaps = ids.length;
    const nbRows = Math.ceil(nbCaps / nbCapsPerLine);
    canvas = createCanvas(canvasWidth, HEADER_HEIGHT + rowHeight * nbRows);
    ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth, HEADER_HEIGHT + rowHeight * nbRows);
    let y = HEADER_HEIGHT;
    let idx = 0;
    for (const capId of ids) {
      if (idx === nbCapsPerLine) {
        idx = 0;
        y += rowHeight;
      }
      p.push(
        drawTheCap(
          canvas,
          ctx,
          capId,
          idx * (IMG_WIDTH + MARGIN_SIDE) + MARGIN_SIDE,
          y
        )
      );
      idx++;
    }
  } else {
    canvas = createCanvas(canvasWidth, HEADER_HEIGHT + rowHeight);
    ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth, 370);
    p.push(drawTheCap(canvas, ctx, 3210, 5, 90));
    p.push(drawTheCap(canvas, ctx, 3114, 260, 90));
    p.push(drawTheCap(canvas, ctx, 3202, 520, 90));
  }
  await Promise.all(p);

  // Title
  ctx.font = '60px RedRock';
  ctx.fillStyle = 'red';
  ctx.textAlign = 'center';
  ctx.fillText('Zekth wishlist', canvasWidth / 2, 60);
  return (
    resp
      // .header('content-disposition', `attachment; filename="wishlist.jpg"`)
      .type('image/jpeg')
      .status(200)
      .send(canvas.toBuffer('image/jpeg', { quality: 1, progressive: true }))
  );
};

export const controllers = { hello };

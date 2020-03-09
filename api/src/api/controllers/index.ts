import { join, resolve } from 'path';
import axios from 'axios';
import { createCanvas, loadImage, registerFont } from 'canvas';
import * as sharp from 'sharp';

let font = resolve(join(__dirname, '..', '..', 'fonts', 'RedRock.ttf'));
registerFont(font, { family: 'RedRock' });
font = resolve(join(__dirname, '..', '..', 'fonts', 'Roboto-Regular.ttf'));
registerFont(font, { family: 'Roboto' });

const BASE_URL = 'https://a.mrkeebs.com/api/';
const MARGIN_SIDE = 10;
const MARGIN_BOTTOM = 40;
const nbCapsPerLine = 3;
const IMG_WIDTH = 250;
const IMG_HEIGTH = 250;
const HEADER_HEIGTH = 90;
const canvasWidth =
  nbCapsPerLine * IMG_WIDTH + nbCapsPerLine * MARGIN_SIDE + MARGIN_SIDE;
const rowHeight = IMG_HEIGTH + MARGIN_BOTTOM;

async function getCap(id): Promise<keycap> {
  return await axios.get(`${BASE_URL}artisans/${id}`).then(resp => {
    return resp.data;
  });
}
async function getImage(url): Promise<Buffer> {
  return await axios
    .request({
      url: url,
      responseType: 'arraybuffer'
    })
    .then(response => {
      return Buffer.from(response.data);
    });
}
async function drawTheCap(context, capId, x, y) {
  const cap = await getCap(capId);
  let imgBuffer = await getImage(cap.image);
  imgBuffer = await sharp(imgBuffer)
    .resize(250, 250)
    .toBuffer();
  const base64shishi = Buffer.from(imgBuffer).toString('base64');
  const imgShishi = await loadImage(`data:image/jpeg;base64,${base64shishi}`);
  context.font = '20px Roboto';
  context.fillStyle = 'white';
  context.textAlign = 'center';
  context.fillText(
    `${cap.sculpt} ${cap.colorway}`,
    x + IMG_WIDTH / 2,
    y + IMG_HEIGTH + 25
  );
  context.drawImage(imgShishi, x, y, IMG_WIDTH, IMG_HEIGTH);
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
// http://localhost:3000/api/v1?ids=3210,3114,3202,3204,2921,2640S
const hello = async (req, resp) => {
  let canvas, ctx;
  const p = [];
  if (req.query.ids) {
    const ids: string[] = req.query.ids.split(',');
    const nbCaps = ids.length;
    const nbRows = Math.ceil(nbCaps / nbCapsPerLine);
    canvas = createCanvas(canvasWidth, HEADER_HEIGTH + rowHeight * nbRows);
    ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth, HEADER_HEIGTH + rowHeight * nbRows);
    let y = HEADER_HEIGTH;
    let idx = 0;
    for (const capId of ids) {
      if (idx === nbCapsPerLine) {
        idx = 0;
        y += rowHeight;
      }
      p.push(
        drawTheCap(ctx, capId, idx * (IMG_WIDTH + MARGIN_SIDE) + MARGIN_SIDE, y)
      );
      idx++;
    }
  } else {
    canvas = createCanvas(canvasWidth, HEADER_HEIGTH + rowHeight);
    ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth, 370);
    p.push(drawTheCap(ctx, 3210, 5, 90));
    p.push(drawTheCap(ctx, 3114, 260, 90));
    p.push(drawTheCap(ctx, 3202, 520, 90));
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

import { join, resolve } from 'path';
import { createCanvas, loadImage, registerFont, Image } from 'canvas';
import { appLogger } from 'logger';
import { LRUMap } from 'lru_map';
import { instance } from 'db/instance';

const imageMap = new LRUMap(400);

const fontPath = resolve(join(__dirname, '..', '..', 'public', 'fonts'));
registerFont(join(fontPath, 'RedRock.ttf'), { family: 'RedRock' });
registerFont(join(fontPath, 'Roboto-Regular.ttf'), { family: 'Roboto' });

const MARGIN_SIDE = 10;
const MARGIN_BOTTOM = 60;
const nbCapsPerLine = 3;
const IMG_WIDTH = 250;
const IMG_HEIGTH = 250;
const HEADER_HEIGHT = 90;
const LINE_HEIGHT = 22;
const canvasWidth = nbCapsPerLine * IMG_WIDTH + nbCapsPerLine * MARGIN_SIDE + MARGIN_SIDE;
const rowHeight = IMG_HEIGTH + MARGIN_BOTTOM;

async function drawTheCap(context, color, capId, x, y) {
  const cap = await instance.getColorway(capId);
  const img = new Image();
  if (imageMap.has(cap.img)) {
    appLogger.info('has img cache');
    img.src = imageMap.get(cap.img) as string;
  } else {
    appLogger.info('!has img cache');

    const _img = await loadImage(cap.img);
    let h, w, sx, sy;
    if (_img.width > _img.height) {
      h = _img.height;
      w = h;
      sy = 0;
      sx = Math.ceil((_img.width - _img.height) / 2);
    } else {
      sx = 0;
      sy = Math.ceil((_img.height - _img.width) / 2);
      w = _img.width;
      h = w;
    }
    const Tcanvas = createCanvas(IMG_WIDTH, IMG_HEIGTH);
    const Tctx = Tcanvas.getContext('2d');
    await Tctx.drawImage(_img, sx, sy, w, h, 0, 0, IMG_WIDTH, IMG_HEIGTH);

    img.src = Tcanvas.toDataURL();
    imageMap.set(cap.img, img.src);
    // appLogger.info(Tcanvas.toDataURL())
    // await context.drawImage(img, sx, sy, w, h, x, y, IMG_WIDTH, IMG_HEIGTH);
  }
  await context.drawImage(img, x, y);

  context.font = '20px Roboto';
  context.fillStyle = color;
  context.textAlign = 'center';
  const legend = `${cap.sculpt.name} ${cap.name}`;
  const measurement = context.measureText(legend);
  if (measurement.width > IMG_WIDTH + 10) {
    context.fillText(`${cap.sculpt.name}`, x + IMG_WIDTH / 2, y + IMG_HEIGTH + LINE_HEIGHT);
    context.fillText(`${cap.name}`, x + IMG_WIDTH / 2, y + IMG_HEIGTH + LINE_HEIGHT + LINE_HEIGHT);
  } else {
    context.fillText(`${cap.sculpt.name} ${cap.name}`, x + IMG_WIDTH / 2, y + IMG_HEIGTH + LINE_HEIGHT);
  }
}

// http://localhost:3000/api/v1?ids=15559f6e,eabbe6a8

const defaultValues = {
  ids: '',
  bg: '',
  textcolor: '',
  title: 'Wishlist',
  titleColor: ''
};

function parseParams(queryValues): any {
  const params = Object.assign({}, defaultValues, queryValues);
  params.ids = params.ids.split(',');
  params.bg = params.bg ? `#${params.bg}` : 'black';
  params.titleColor = params.titleColor ? `#${params.titleColor}` : 'red';
  params.textcolor = params.textcolor ? `#${params.textcolor}` : 'white';
  return params;
}

const genWishlist = async (req, resp) => {
  let canvas, ctx;
  const params = parseParams(req.query);
  const p = [];
  if (req.query.ids) {
    const ids: string[] = params.ids;
    const nbCaps = ids.length;
    const nbRows = Math.ceil(nbCaps / nbCapsPerLine);
    canvas = createCanvas(canvasWidth, HEADER_HEIGHT + rowHeight * nbRows);
    ctx = canvas.getContext('2d');
    ctx.fillStyle = params.bg;
    ctx.fillRect(0, 0, canvasWidth, HEADER_HEIGHT + rowHeight * nbRows);
    let y = HEADER_HEIGHT;
    let idx = 0;
    for (const capId of ids) {
      if (idx === nbCapsPerLine) {
        idx = 0;
        y += rowHeight;
      }
      p.push(drawTheCap(ctx, params.textcolor, capId, idx * (IMG_WIDTH + MARGIN_SIDE) + MARGIN_SIDE, y));
      idx++;
    }
  } else {
    canvas = createCanvas(canvasWidth, HEADER_HEIGHT + rowHeight);
    ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth, 370);
    p.push(drawTheCap(ctx, params.textcolor, 3210, 5, 90));
    p.push(drawTheCap(ctx, params.textcolor, 3114, 260, 90));
    p.push(drawTheCap(ctx, params.textcolor, 3202, 520, 90));
  }
  await Promise.all(p);

  // Title
  ctx.font = '60px RedRock';
  ctx.fillStyle = params.titleColor;
  ctx.textAlign = 'center';
  ctx.fillText(params.title ? params.title : 'Wishlist', canvasWidth / 2, 60);
  return (
    resp
      // .header('content-disposition', `attachment; filename="wishlist.jpg"`)
      .type('image/jpeg')
      .status(200)
      .send(canvas.toBuffer('image/jpeg', { quality: 1, progressive: true }))
  );
};

export const controllers = { genWishlist };

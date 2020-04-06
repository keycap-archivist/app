import { join, resolve } from 'path';
import { createCanvas, loadImage, registerFont, Image } from 'canvas';
import { appLogger } from 'logger';
import { LRUMap } from 'lru_map';
import { instance } from 'db/instance';

const imageMap = new LRUMap(400);

const fontPath = resolve(join(__dirname, 'fonts'));
registerFont(join(fontPath, 'RedRock.ttf'), { family: 'RedRock' });
registerFont(join(fontPath, 'Roboto-Regular.ttf'), { family: 'Roboto' });

const MARGIN_SIDE = 10;
const MARGIN_BOTTOM = 60;
const LINE_HEIGHT = 22;
const HEADER_HEIGHT = 90;

const IMG_WIDTH = 250;
const IMG_HEIGTH = IMG_WIDTH;
const rowHeight = IMG_HEIGTH + MARGIN_BOTTOM;

function isTextFittingSpace(ctx, legend, maxWidth): boolean {
  const measurement = ctx.measureText(legend);
  if (measurement.width > maxWidth - 10) {
    return false;
  }
  return true;
}

function fitText(ctx, legend, maxWidth): string {
  let outLegend = legend.trim();
  if (isTextFittingSpace(ctx, outLegend, maxWidth)) {
    return outLegend;
  }
  while (!isTextFittingSpace(ctx, `${outLegend}...`, maxWidth)) {
    outLegend = outLegend.trim().slice(0, -1);
  }
  return `${outLegend.trim()}...`;
}

async function drawTheCap(context, color, capId, x, y): Promise<void> {
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
  }
  await context.drawImage(img, x, y);

  context.font = '20px Roboto';
  context.fillStyle = color;
  context.textAlign = 'center';
  const legend = `${cap.sculpt.name} ${cap.name}`;
  if (!isTextFittingSpace(context, legend, IMG_WIDTH)) {
    context.fillText(fitText(context, cap.sculpt.name, IMG_WIDTH), x + IMG_WIDTH / 2, y + IMG_HEIGTH + LINE_HEIGHT);
    context.fillText(fitText(context, cap.name, IMG_WIDTH), x + IMG_WIDTH / 2, y + IMG_HEIGTH + LINE_HEIGHT * 2);
  } else {
    context.fillText(legend, x + IMG_WIDTH / 2, y + IMG_HEIGTH + LINE_HEIGHT);
  }
}

const defaultOptions = {
  ids: '',
  bg: '',
  textcolor: '',
  title: 'Wishlist',
  titleColor: '',
  capsPerLine: 3
};

function parseOptions(options): any {
  const opt = Object.assign({}, defaultOptions, options);
  opt.ids = opt.ids.split(',').filter((x) => x !== '');
  opt.bg = opt.bg ? `#${opt.bg}` : 'black';
  opt.titleColor = opt.titleColor ? `#${opt.titleColor}` : 'red';
  opt.textcolor = opt.textcolor ? `#${opt.textcolor}` : 'white';
  opt.capsPerLine = parseInt(opt.capsPerLine);
  return opt;
}

export async function generateWishlist(options): Promise<Buffer> {
  let canvas, ctx, canvasWidth;
  const opt = parseOptions(options);
  const p = [];
  if (opt.ids.length) {
    const nbCaps = opt.ids.length;
    if (opt.capsPerLine > nbCaps) {
      opt.capsPerLine = nbCaps;
    } else if (opt.capsPerLine < 1) {
      opt.capsPerLine = 1;
    }
    const nbRows = Math.ceil(nbCaps / opt.capsPerLine);
    canvasWidth = opt.capsPerLine * IMG_WIDTH + opt.capsPerLine * MARGIN_SIDE + MARGIN_SIDE;
    canvas = createCanvas(canvasWidth, HEADER_HEIGHT + rowHeight * nbRows);
    ctx = canvas.getContext('2d');
    ctx.fillStyle = opt.bg;
    ctx.fillRect(0, 0, canvasWidth, HEADER_HEIGHT + rowHeight * nbRows);
    let y = HEADER_HEIGHT;
    let idx = 0;
    for (const capId of opt.ids) {
      if (idx === opt.capsPerLine) {
        idx = 0;
        y += rowHeight;
      }
      p.push(drawTheCap(ctx, opt.textcolor, capId, idx * (IMG_WIDTH + MARGIN_SIDE) + MARGIN_SIDE, y));
      idx++;
    }
  } else {
    // Example
    canvasWidth = opt.capsPerLine * IMG_WIDTH + opt.capsPerLine * MARGIN_SIDE + MARGIN_SIDE;
    canvas = createCanvas(canvasWidth, HEADER_HEIGHT + rowHeight);
    ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvasWidth, 370);
    p.push(drawTheCap(ctx, opt.textcolor, '15559f6e', 5, 90));
    p.push(drawTheCap(ctx, opt.textcolor, 'e951b800', 260, 90));
    p.push(drawTheCap(ctx, opt.textcolor, '486a0062', 520, 90));
  }
  await Promise.all(p);

  // Title
  ctx.font = '60px RedRock';
  ctx.fillStyle = opt.titleColor;
  ctx.textAlign = 'center';
  ctx.fillText(opt.title ? opt.title : 'Wishlist', canvasWidth / 2, 60);
  return canvas.toBuffer('image/jpeg', { quality: 1, progressive: true });
}

import { createCanvas, loadImage } from 'canvas';
import { instance } from 'db/instance';
import type { Colorway, ColorwayDetailed } from 'db/instance';
import { getImgBuffer, fitText, isTextFittingSpace, drawBorder } from 'internal/utils';
import { appLogger } from 'logger';

const MARGIN_SIDE = 10;
const MARGIN_BOTTOM = 60;
const LINE_HEIGHT = 22;
const EXTRA_TEXT_MARGIN = 50;
const HEADER_HEIGHT = 90;
const THUMB_RADIUS = 10;

const IMG_WIDTH = 250;
const IMG_HEIGTH = IMG_WIDTH;
const rowHeight = IMG_HEIGTH + MARGIN_BOTTOM;
const NS_PER_SEC = 1e9;

async function drawTheCap(
  context: CanvasRenderingContext2D,
  opt: WishlistOptions,
  cap,
  x: number,
  y: number
): Promise<void> {
  const imgBuffer = await getImgBuffer(cap);
  let color = opt.textColor;
  const _img = await loadImage(imgBuffer);
  let h: number, w: number, sx: number, sy: number;
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

  Tctx.fillStyle = opt.bg;
  Tctx.fillRect(0, 0, IMG_WIDTH, IMG_HEIGTH);

  Tctx.beginPath();
  Tctx.moveTo(THUMB_RADIUS, 0);
  Tctx.lineTo(IMG_WIDTH - THUMB_RADIUS, 0);
  Tctx.quadraticCurveTo(IMG_WIDTH, 0, IMG_WIDTH, THUMB_RADIUS);
  Tctx.lineTo(IMG_WIDTH, IMG_HEIGTH - THUMB_RADIUS);
  Tctx.quadraticCurveTo(IMG_WIDTH, IMG_HEIGTH, IMG_WIDTH - THUMB_RADIUS, IMG_HEIGTH);
  Tctx.lineTo(THUMB_RADIUS, IMG_HEIGTH);
  Tctx.quadraticCurveTo(0, IMG_HEIGTH, 0, IMG_HEIGTH - THUMB_RADIUS);
  Tctx.lineTo(0, THUMB_RADIUS);
  Tctx.quadraticCurveTo(0, 0, THUMB_RADIUS, 0);
  Tctx.closePath();
  Tctx.clip();

  if (cap.isPrioritized) {
    const thickness = 4;
    drawBorder(Tctx, IMG_WIDTH, IMG_HEIGTH, thickness);
    color = '#F00';
    Tctx.drawImage(
      _img,
      sx,
      sy,
      w - thickness * 2,
      h - thickness * 2,
      thickness,
      thickness,
      IMG_WIDTH - thickness * 2,
      IMG_HEIGTH - thickness * 2
    );
  } else {
    Tctx.drawImage(_img, sx, sy, w, h, 0, 0, IMG_WIDTH, IMG_HEIGTH);
  }

  const b: Buffer = Tcanvas.toBuffer('image/jpeg', { quality: 1, progressive: true });
  //@ts-ignore
  // typing is fucked up but it works like this
  context.drawImage(await loadImage(b), x, y);

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

function getCaps(ids: string[], priorities: string[] = []): Colorway[] {
  return ids
    .map((x) => {
      const cap = instance.getColorway(x);
      if (cap && priorities.includes(cap.id)) {
        cap.isPrioritized = true;
      }
      return cap;
    })
    .filter(Boolean);
}

const defaultOptions = {
  ids: '15559f6e,e951b800,486a0062',
  prio: '',
  bg: 'black',
  textColor: 'white',
  titleText: 'Wishlist',
  titleColor: 'red',
  extraText: '',
  extraTextColor: 'white',
  titlePolice: 'RedRock',
  capsPerLine: 3
};

interface WishlistOptions {
  ids: string[];
  priorities: string[];
  bg: string;
  titleText: string;
  titlePolice: string;
  titleColor: string;
  textColor: string;
  extraTextColor: string;
  capsPerLine: number;
  extraText: string;
  caps: ColorwayDetailed[];
  hasPrior: boolean;
}

function parseQsOptions(options): WishlistOptions {
  const opt = Object.assign({}, defaultOptions, options);
  opt.ids = [...new Set(opt.ids.split(','))];
  opt.priorities = [...new Set(opt.prio.split(','))];
  opt.titlePolice = opt.titlePolice ? opt.titlePolice : 'RedRock';
  opt.bg = opt.bg ? opt.bg : 'black';
  opt.titleColor = opt.titleColor ? opt.titleColor : 'red';
  opt.textColor = opt.textColor ? opt.textColor : 'white';
  opt.extraTextColor = opt.extraTextColor ? opt.extraTextColor : 'white';
  opt.capsPerLine = parseInt(opt.capsPerLine);
  opt.extraText = opt.extraText.trim();
  opt.caps = getCaps(opt.ids, opt.priorities);
  opt.hasPrior = !!opt.caps.find((x) => x.isPrioritized);
  return opt;
}

function calcWidth(opt: WishlistOptions): number {
  return opt.capsPerLine * IMG_WIDTH + opt.capsPerLine * MARGIN_SIDE + MARGIN_SIDE;
}

function calcHeight(opt: WishlistOptions): number {
  const nbCaps = opt.caps.length;
  if (opt.capsPerLine > nbCaps) {
    opt.capsPerLine = nbCaps;
  } else if (opt.capsPerLine < 1) {
    opt.capsPerLine = 1;
  }
  const nbRows = Math.ceil(nbCaps / opt.capsPerLine);
  let out = HEADER_HEIGHT + rowHeight * nbRows;

  // Add extra size for additionnal text
  if (opt.extraText && opt.extraText.trim().length) {
    out += EXTRA_TEXT_MARGIN;
  }

  return out;
}

export async function generateWishlist(opt: WishlistOptions): Promise<Buffer> {
  const time = process.hrtime();
  const p = [];
  const canvasWidth = calcWidth(opt);
  const canvasHeight = calcHeight(opt);
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = opt.bg;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  let y = HEADER_HEIGHT;
  let idx = 0;
  for (const cap of opt.caps) {
    if (idx === opt.capsPerLine) {
      idx = 0;
      y += rowHeight;
    }
    p.push(drawTheCap(ctx, opt, cap, idx * (IMG_WIDTH + MARGIN_SIDE) + MARGIN_SIDE, y));
    idx++;
  }

  await Promise.all(p);

  // Title
  ctx.font = `60px ${opt.titlePolice}`;
  ctx.fillStyle = opt.titleColor;
  ctx.textAlign = 'center';
  ctx.fillText(opt.titleText ? opt.titleText : 'Wishlist', canvasWidth / 2, 60);

  // Extra text
  if (opt.extraText && opt.extraText.length) {
    ctx.font = '20px Roboto';
    ctx.fillStyle = opt.extraTextColor;
    ctx.textAlign = 'left';
    ctx.fillText(opt.extraText, MARGIN_SIDE, canvasHeight - 20);
    ctx.fillStyle = 'white';
    ctx.fillRect(MARGIN_SIDE, canvasHeight - EXTRA_TEXT_MARGIN, canvasWidth - MARGIN_SIDE * 2, 2);
  }

  if (opt.hasPrior) {
    ctx.font = '20px Roboto';
    ctx.fillStyle = 'red';
    ctx.textAlign = 'left';
    ctx.fillText('Priorities', MARGIN_SIDE, 30);
  }

  const outBuffer = canvas.toBuffer('image/png');
  const diff = process.hrtime(time);
  appLogger.info(`generateWishlist ${opt.caps.length} caps ${(diff[0] * NS_PER_SEC + diff[1]) / 1000000} ms`);
  return outBuffer;
}

export async function generateWishListFromPost(options): Promise<Buffer | null> {
  if (!options.ids.length) {
    return null;
  }
  const opt = Object.assign({}, defaultOptions, options);
  opt.ids = options.ids;
  opt.priorities = options.priorities;
  opt.caps = getCaps(opt.ids, opt.priorities);
  opt.hasPrior = !!opt.caps.find((x) => x.isPrioritized);
  return generateWishlist(opt);
}

export async function generateWishlistFromQS(options): Promise<Buffer | null> {
  const opt = parseQsOptions(options);
  if (!opt.ids.length) {
    return null;
  }
  return generateWishlist(opt);
}

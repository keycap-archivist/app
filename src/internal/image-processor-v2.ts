import { createCanvas, loadImage } from 'canvas';
import { instance, ColorwayDetailed } from 'db/instance';
import { getImgBuffer, fitText, isTextFittingSpace, drawBorder, assetsBuffer } from 'internal/utils';
import { appLogger } from 'logger';
import { merge } from 'lodash';

export interface wishlistCap {
  id: string;
  legend?: string;
  legendColor?: string;
  isPriority?: boolean;
}

interface textCustomization {
  color: string;
  font: string;
}

interface textOption extends textCustomization {
  text: string;
}

interface social extends textCustomization {
  discord: string;
  reddit: string;
}

export interface wishlistSetting {
  capsPerLine: number;
  priority: textCustomization;
  title: textOption;
  legends: textCustomization;
  extraText: textOption;
  background: {
    color: string;
  };
  social?: social;
}

export interface wishlistV2 {
  caps: wishlistCap[];
  settings: wishlistSetting;
}

interface hydratedWishlistCap extends ColorwayDetailed, wishlistCap {}

const defaultWishlistSettings: wishlistSetting = {
  capsPerLine: 3,
  priority: { color: 'red', font: 'Roboto' },
  title: { color: 'red', text: '', font: 'Roboto' },
  legends: { color: 'red', font: 'Roboto' },
  extraText: { color: 'red', text: '', font: 'Roboto' },
  background: { color: 'black' }
};

const MARGIN_SIDE = 10;
const MARGIN_BOTTOM = 60;
const LINE_HEIGHT = 22;
const EXTRA_TEXT_MARGIN = 50;
const SOCIAL_ICONS_MARGIN = 70;
const HEADER_HEIGHT = 90;
const THUMB_RADIUS = 10;

const IMG_WIDTH = 250;
const IMG_HEIGTH = IMG_WIDTH;
const rowHeight = IMG_HEIGTH + MARGIN_BOTTOM;
const NS_PER_SEC = 1e9;

async function drawTheCap(
  context: CanvasRenderingContext2D,
  settings: wishlistSetting,
  cap: hydratedWishlistCap,
  x: number,
  y: number
): Promise<void> {
  const imgBuffer = await getImgBuffer(cap);
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
  Tctx.quality = 'fast';

  Tctx.fillStyle = settings.background.color;
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

  let legendColor = cap.legendColor ? cap.legendColor : settings.legends.color;
  if (cap.isPriority) {
    legendColor = settings.priority.color;
    const thickness = 4;
    drawBorder(Tctx, IMG_WIDTH, IMG_HEIGTH, thickness, settings.priority.color);
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
  const i: any = await loadImage(b);
  context.drawImage(i, x, y);

  context.font = `20px ${settings.legends.font}`;
  context.fillStyle = legendColor;
  context.textAlign = 'center';

  if (cap.legend) {
    context.fillText(fitText(context, cap.legend, IMG_WIDTH), x + IMG_WIDTH / 2, y + IMG_HEIGTH + LINE_HEIGHT);
  } else {
    const legend = `${cap.sculpt.name} ${cap.name}`;
    if (!isTextFittingSpace(context, legend, IMG_WIDTH)) {
      context.fillText(fitText(context, cap.sculpt.name, IMG_WIDTH), x + IMG_WIDTH / 2, y + IMG_HEIGTH + LINE_HEIGHT);
      context.fillText(fitText(context, cap.name, IMG_WIDTH), x + IMG_WIDTH / 2, y + IMG_HEIGTH + LINE_HEIGHT * 2);
    } else {
      context.fillText(legend, x + IMG_WIDTH / 2, y + IMG_HEIGTH + LINE_HEIGHT);
    }
  }
}

function calcWidth(capsPerline: number): number {
  return capsPerline * IMG_WIDTH + capsPerline * MARGIN_SIDE + MARGIN_SIDE;
}

function calcHeight(w: wishlistV2): number {
  const nbCaps = w.caps.length;
  if (w.settings.capsPerLine > nbCaps) {
    w.settings.capsPerLine = nbCaps;
  } else if (w.settings.capsPerLine < 1) {
    w.settings.capsPerLine = 1;
  }
  const nbRows = Math.ceil(nbCaps / w.settings.capsPerLine);
  let out = HEADER_HEIGHT + rowHeight * nbRows;

  // Add extra size for additionnal text
  if (w.settings.extraText && w.settings.extraText.text && w.settings.extraText.text.trim().length) {
    out += EXTRA_TEXT_MARGIN;
  }
  if (w.settings.social) {
    out += SOCIAL_ICONS_MARGIN;
  }
  return out;
}

export async function generateWishlist(w: wishlistV2): Promise<Buffer> {
  const time = process.hrtime();
  w.settings = merge(defaultWishlistSettings, w.settings);
  const p = [];
  const canvasWidth = calcWidth(w.settings.capsPerLine);
  const canvasHeight = calcHeight(w);
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');
  ctx.quality = 'fast';

  ctx.fillStyle = w.settings.background.color;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  let y = HEADER_HEIGHT;
  let idx = 0;
  for (const cap of w.caps) {
    const hCap = Object.assign(cap, instance.getColorway(cap.id));
    if (idx === w.settings.capsPerLine) {
      idx = 0;
      y += rowHeight;
    }
    p.push(drawTheCap(ctx, w.settings, hCap, idx * (IMG_WIDTH + MARGIN_SIDE) + MARGIN_SIDE, y));
    idx++;
  }

  await Promise.all(p);

  // Title
  ctx.font = `60px ${w.settings.title.font}`;
  ctx.fillStyle = w.settings.title.color;
  ctx.textAlign = 'center';
  ctx.fillText(w.settings.title.text ? w.settings.title.text : 'Wishlist', canvasWidth / 2, 60);

  // Extra text
  if (w.settings.extraText && w.settings.extraText.text.length) {
    ctx.font = `20px ${w.settings.extraText.font}`;
    ctx.fillStyle = w.settings.extraText.color;
    ctx.textAlign = 'left';
    ctx.fillText(
      w.settings.extraText.text,
      MARGIN_SIDE,
      canvasHeight - 20 - (w.settings.social ? SOCIAL_ICONS_MARGIN : 0)
    );
    ctx.fillStyle = w.settings.extraText.color;
    ctx.fillRect(
      MARGIN_SIDE,
      canvasHeight - EXTRA_TEXT_MARGIN - (w.settings.social ? SOCIAL_ICONS_MARGIN : 0),
      canvasWidth - MARGIN_SIDE * 2,
      2
    );
  }

  // draw social
  if (w.settings.social) {
    ctx.textAlign = 'left';
    ctx.font = `20px ${w.settings.social.font}`;
    ctx.fillStyle = w.settings.social.color;
    const textMargin = MARGIN_SIDE + 35;
    if (w.settings.social.reddit) {
      const redditLogo = await loadImage(assetsBuffer.redditLogo);
      ctx.drawImage(redditLogo, 0, 0, 100, 100, MARGIN_SIDE, canvasHeight - SOCIAL_ICONS_MARGIN - 5, 25, 25);
      ctx.fillText(w.settings.social.reddit, textMargin, canvasHeight - 55);
    }
    if (w.settings.social.discord) {
      const discordLogo = await loadImage(assetsBuffer.discordLogo);
      ctx.drawImage(discordLogo, 0, 0, 100, 100, MARGIN_SIDE - 1, canvasHeight - SOCIAL_ICONS_MARGIN / 2 - 5, 27, 27);
      ctx.fillText(w.settings.social.discord, textMargin, canvasHeight - 20);
    }
  }

  if (w.caps.findIndex((x) => x.isPriority === true) > -1) {
    ctx.font = `20px ${w.settings.priority.font}`;
    ctx.fillStyle = w.settings.priority.color;
    ctx.textAlign = 'left';
    ctx.fillText('Priorities', MARGIN_SIDE, 30);
  }

  const outBuffer = canvas.toBuffer('image/png');
  const diff = process.hrtime(time);
  appLogger.info(`generateWishlist-v2 ${w.caps.length} caps ${(diff[0] * NS_PER_SEC + diff[1]) / 1000000} ms`);
  return outBuffer;
}

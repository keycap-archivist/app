import { existsSync, mkdirSync, readdirSync, promises as FSpromises, constants } from 'fs';
import { createCanvas, loadImage, registerFont } from 'canvas';
import { join, resolve } from 'path';
import axios from 'axios';

const cachePath = resolve(join(__dirname, '..', '..', 'img-cache'));

export const supportedPolice = [];

export function initImgProcessor() {
  if (!existsSync(cachePath)) {
    mkdirSync(cachePath);
  }
  const fontPath = resolve(join(__dirname, 'fonts'));
  for (const f of readdirSync(fontPath)) {
    const family = f.split('.')[0].split('-')[0];
    registerFont(join(fontPath, f), { family });
  }
}

export async function getImgBuffer(colorway): Promise<Buffer> {
  const filePath = join(cachePath, `${colorway.id}.jpg`);
  let output: Buffer;
  if (
    !(await FSpromises.access(filePath, constants.R_OK)
      .then(() => true)
      .catch(() => false))
  ) {
    const { data } = await axios.request({
      method: 'GET',
      responseType: 'arraybuffer',
      url: colorway.img
    });
    output = await resizeImg(data);
    FSpromises.writeFile(filePath, output);
  } else {
    output = await FSpromises.readFile(filePath);
  }
  return output;
}

export async function resizeImg(imgBuffer: Buffer): Promise<Buffer> {
  const IMG_HEIGTH = 500;
  const IMG_WIDTH = 500;
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

  Tctx.drawImage(_img, sx, sy, w, h, 0, 0, IMG_WIDTH, IMG_HEIGTH);

  return Tcanvas.toBuffer('image/jpeg', { quality: 1, progressive: true, chromaSubsampling: false });
}

export function isTextFittingSpace(
  ctx: CanvasRenderingContext2D,
  legend: string,
  maxWidth: number,
  margin = 10
): boolean {
  const measurement = ctx.measureText(legend);
  if (measurement.width > maxWidth - margin) {
    return false;
  }
  return true;
}

export function fitText(ctx: CanvasRenderingContext2D, legend: string, maxWidth: number): string {
  let outLegend = legend.trim();
  if (isTextFittingSpace(ctx, outLegend, maxWidth)) {
    return outLegend;
  }
  while (!isTextFittingSpace(ctx, `${outLegend}...`, maxWidth)) {
    outLegend = outLegend.trim().slice(0, -1);
  }
  return `${outLegend.trim()}...`;
}

export function drawBorder(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  thickness = 1,
  color = '#F00'
): void {
  ctx.fillStyle = color;
  ctx.fillRect(0 - thickness, 0 - thickness, width + thickness * 2, height + thickness * 2);
}

import axios from "axios";

const BASE_URL = "https://a.mrkeebs.com/api/";
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

async function getCap(id) {
  return await axios.get(`${BASE_URL}artisans/${id}`).then(resp => {
    return resp.data;
  });
}

async function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = function() {
      resolve(img);
    };
    img.src = src;
  });
}

async function drawTheCap(context, capId, x, y) {
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

  context.font = "20px Noto Sans";
  context.fillStyle = "white";
  context.textAlign = "center";
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

export async function generateWishlist(targetId, name, ids) {
  const container = document.getElementById(targetId);
  let canvas, ctx;
  const p = [];
  const nbCaps = ids.length;
  const nbRows = Math.ceil(nbCaps / nbCapsPerLine);
  canvas = document.createElement("canvas");
  canvas.height = HEADER_HEIGHT + rowHeight * nbRows;
  canvas.width = canvasWidth;
  //   canvas = createCanvas(canvasWidth, HEADER_HEIGHT + rowHeight * nbRows);
  ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvasWidth, HEADER_HEIGHT + rowHeight * nbRows);
  let y = HEADER_HEIGHT;
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

  await Promise.all(p);

  // Title
  ctx.font = "60px Sedgwick Ave";
  ctx.fillStyle = "red";
  ctx.textAlign = "center";
  ctx.fillText(`${name} wishlist`, canvasWidth / 2, 60);
  container.appendChild(canvas);
}

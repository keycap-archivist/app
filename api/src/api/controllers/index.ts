import { generateWishlistFromQS, getImgBuffer, generateWishlist } from 'internal/image-processor';
import { instance, ColorwayDetailed } from 'db/instance';
import * as tablemark from 'tablemark';
import { appLogger } from 'logger';

const genWishlistGet = async (req, resp) => {
  try {
    const imgBuffer = await generateWishlistFromQS(req.query);
    resp.type('image/jpeg').status(200).send(imgBuffer);
  } catch (e) {
    appLogger.error(e);
    resp.status(500).send('Oops! An error has occured');
  }
};

const genWishlistPost = async (req, resp) => {
  try {
    const imgBuffer = await generateWishlist(req.body);
    resp
      // .header('content-disposition', `attachment; filename="wishlist.jpg"`)
      .type('image/jpeg')
      .status(200)
      .send(imgBuffer);
  } catch (e) {
    appLogger.error(e);
    resp.status(500).send('Oops! An error has occured');
  }
};

const genTable = async (req, resp) => {
  let out = '';
  const caps: ColorwayDetailed[] = [];
  for (const i of req.query.ids.split(',').filter((x) => x)) {
    caps.push(instance.getColorway(i));
  }
  out = tablemark(
    caps.map((c) => {
      return {
        Artist: c.sculpt.artist.name,
        Sculpt: c.sculpt.name,
        Colorway: c.name,
        Image: `[link](${c.img})`
      };
    }),
    { columns: ['Artist', 'Sculpt', 'Colorway', 'Image'] }
  );
  resp.status(200).send(out);
};

const getKeycapImage = async (req, resp) => {
  const colorway = instance.getColorway(req.params.id);

  if (!colorway) {
    resp.status(404).send('Not found');
    return;
  }

  const output = await getImgBuffer(colorway);
  resp.header('content-disposition', `filename="${colorway.id}.jpg"`).type('image/jpeg').status(200).send(output);
};

export const controllers = { getKeycapImage, genWishlistGet, genWishlistPost, genTable };

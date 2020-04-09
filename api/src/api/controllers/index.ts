import { generateWishlist, getImgBuffer } from 'internal/image-processor';
import { instance, ColorwayDetailed } from 'db/instance';
import * as tablemark from 'tablemark';

const genWishlist = async (req, resp) => {
  const imgBuffer = await generateWishlist(req.query);
  return (
    resp
      // .header('content-disposition', `attachment; filename="wishlist.jpg"`)
      .type('image/jpeg')
      .status(200)
      .send(imgBuffer)
  );
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
  return resp.status(200).send(out);
};

const getKeycapImage = async (req, resp) => {
  const colorway = instance.getColorway(req.params.id);

  if (!colorway) {
    return resp.status(404).send('Not found');
  }

  const output = await getImgBuffer(colorway);

  return resp
    .header('content-disposition', `filename="${colorway.id}.jpg"`)
    .type('image/jpeg')
    .status(200)
    .send(output);
};

export const controllers = { getKeycapImage, genWishlist, genTable };

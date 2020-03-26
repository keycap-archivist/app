import { generateWishlist } from 'internal/image-processor';
import { instance, ColorwayDetailed } from 'db/instance';
import * as tablemark from 'tablemark';
import { appLogger } from 'logger';

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
  appLogger.info(caps);
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

export const controllers = { genWishlist, genTable };

import { appLogger } from 'logger';
import { generateWishlist } from 'internal/image-processor-v2';
import { instance, ColorwayDetailed } from 'db/instance';
import * as tablemark from 'tablemark';

export type wishlistCap = {
  id: string;
  legend?: string;
  isPriority?: boolean;
};

export type wishlistSetting = {
  capsPerLine: number;
  title: {
    color: string;
    text: string;
    font: string;
  };
  legends: {
    color: string;
    font: string;
  };
  background: {
    color: string;
  };
  extraText: {
    text: string;
    color: string;
    font: string;
  };
};

export type wishlistApi = {
  caps: wishlistCap[];
  settings: wishlistSetting;
};

export const getWishlist = async (req, resp): Promise<void> => {
  // todo : PARSE DA SHIET
  const foo = {};
  try {
    const imgBuffer = await generateWishlist(foo);
    if (imgBuffer) {
      return resp
        .header('content-disposition', `attachment; filename="wishlist.jpg"`)
        .type('image/jpeg')
        .status(200)
        .send(imgBuffer);
    }
    return resp.status(500).send('Oops! An error has occured');
  } catch (e) {
    appLogger.error(e);
    resp.status(500).send('Oops! An error has occured');
  }
};

export const postWishlist = async (req, resp): Promise<void> => {
  try {
    const imgBuffer = await generateWishlist(req.body);
    if (imgBuffer) {
      return resp
        .header('content-disposition', `attachment; filename="wishlist.jpg"`)
        .type('image/jpeg')
        .status(200)
        .send(imgBuffer);
    }
    return resp.status(500).send('Oops! An error has occured');
  } catch (e) {
    appLogger.error(e);
    resp.status(500).send('Oops! An error has occured');
  }
};

export const postTable = async (req, resp): Promise<void> => {
  const requestCaps: wishlistCap[] = req.body;
  const caps: ColorwayDetailed[] = requestCaps.map((x) => instance.getColorway(x.id));
  const out = tablemark(
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

export const fkunav = async (_, resp): Promise<void> => {
  resp.header('colorway', 'EVA IZ SHIET').status(508).send('FKU NAV');
};

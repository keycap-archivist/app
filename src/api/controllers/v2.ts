import { appLogger } from 'logger';
import { getImgBuffer, supportedFonts, addSubmission } from 'internal/utils';
import { generateWishlist } from 'internal/image-processor-v2';
import { instance, ColorwayDetailed } from 'db/instance';
import { v4 as uuidv4 } from 'uuid';
import tablemark from 'tablemark';
import { getSubmissionBuffer, discordSubmissionUpdate, discordSubmitCapName } from 'internal/utils';
import type { wishlistCap } from 'internal/image-processor-v2';

export const postWishlist = async (req, resp): Promise<void> => {
  try {
    const imgBuffer = await generateWishlist(req.body);
    if (imgBuffer) {
      return resp
        .header('content-disposition', `attachment; filename="wishlist.png"`)
        .type('image/png')
        .status(200)
        .send(imgBuffer);
    }
    return resp.status(500).send('Oops! An error has occured');
  } catch (e) {
    appLogger.error(e);
    resp.status(500).send('Oops! An error has occured');
  }
};

export const postWishListTable = async (req, resp): Promise<void> => {
  const requestCaps: wishlistCap[] = req.body;
  const caps: ColorwayDetailed[] = requestCaps.map((x) => instance.getColorway(x.id)).filter(Boolean);
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

export const getImg = async (req, resp): Promise<void> => {
  const colorway = instance.getColorway(req.params.id);

  if (!colorway) {
    resp.status(404).send('Not found');
    return;
  }

  const output = await getImgBuffer(colorway);
  resp.header('content-disposition', `filename="${colorway.id}.jpg"`).type('image/jpeg').status(200).send(output);
};

export const getWishlistSettings = async (_, resp): Promise<void> => {
  resp.type('application/json').status(200).send({ fonts: supportedFonts });
};

export const getSubmissionCap = async (req, resp): Promise<void> => {
  const b = await getSubmissionBuffer(req.params.id);
  if (!b) {
    resp.status(404).send('Not found');
    return;
  }
  resp.header('content-disposition', `filename="${req.params.id}.jpg"`).type('image/jpeg').status(200).send(b);
};

export const submitCap = async (req, resp): Promise<void> => {
  const fileBuffer = req.body.file;
  const { maker, sculpt, colorway } = req.body;
  const submission = { maker, sculpt, colorway, id: uuidv4() };
  await addSubmission(submission, fileBuffer[0].data);
  await discordSubmissionUpdate(submission);
  resp.status(200).send('OK');
};

export const submitName = async (req, resp): Promise<void> => {
  const { id, name } = req.body;

  const colorway = instance.getColorway(id);

  if (!colorway) {
    resp.status(404).send('Not found');
    return;
  }

  await discordSubmitCapName(colorway, name);
  resp.status(200).send('OK');
};

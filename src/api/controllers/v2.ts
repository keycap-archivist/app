import { v4 as uuidv4 } from 'uuid';
import tablemark from 'tablemark';

import { appLogger } from '#app/logger';
import { getImgBuffer, supportedFonts, addSubmission } from '#app/internal/utils';
import { generateWishlist } from '#app/internal/image-processor-v2';
import { instance } from '#app/db/instance';
import { getSubmissionBuffer, discordSubmissionUpdate, discordSubmitCapName } from '#app/internal/utils';

import type { ColorwayDetailed } from '#app/db/instance';
import type { FastifyRequest, FastifyReply } from 'fastify';
import type { wishlistCap, wishlistV2 } from '#app/internal/image-processor-v2';

export const postWishlist = async (req: FastifyRequest<{ Body: wishlistV2 }>, resp: FastifyReply): Promise<void> => {
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

export const postWishListTable = async (
  req: FastifyRequest<{ Body: wishlistCap[] }>,
  resp: FastifyReply
): Promise<void> => {
  const requestCaps = req.body;
  const caps: ColorwayDetailed[] = requestCaps
    .map((x) => instance.getColorway(x.id))
    .filter(Boolean) as ColorwayDetailed[];
  const out = tablemark(
    caps.map((c) => {
      return {
        Artist: c.sculpt.artist.name,
        Sculpt: c.sculpt.name,
        Colorway: c.name,
        Image: `[link](https://cdn.keycap-archivist.com/keycaps/${c.id}.jpg)`
      };
    }),
    { columns: ['Artist', 'Sculpt', 'Colorway', 'Image'] }
  );

  resp.status(200).send(out);
};

export const fkunav = async (_: FastifyRequest, resp: FastifyReply): Promise<void> => {
  resp.header('colorway', 'EVA IZ SHIET').status(508).send('FKU NAV');
};

export const getImg = async (req: FastifyRequest, resp: FastifyReply): Promise<void> => {
  const params = req.params as Record<string, string>;
  const colorway = instance.getColorway(params.id);

  if (!colorway) {
    resp.status(404).send('Not found');
    return;
  }

  const output = await getImgBuffer(colorway);
  resp.header('content-disposition', `filename="${colorway.id}.jpg"`).type('image/jpeg').status(200).send(output);
};

export const getWishlistSettings = async (_: FastifyRequest, resp: FastifyReply): Promise<void> => {
  resp.type('application/json').status(200).send({ fonts: supportedFonts });
};

export const getSubmissionCap = async (req: FastifyRequest, resp: FastifyReply): Promise<void> => {
  const params = req.params as Record<string, string>;
  const b = await getSubmissionBuffer(params.id);
  if (!b) {
    resp.status(404).send('Not found');
    return;
  }
  resp.header('content-disposition', `filename="${params.id}.jpg"`).type('image/jpeg').status(200).send(b);
};

export const submitCap = async (
  req: FastifyRequest<{ Body: { maker: string; sculpt: string; colorway: string; file: { data: Buffer }[] } }>,
  resp: FastifyReply
): Promise<void> => {
  const { maker, sculpt, colorway, file } = req.body;
  const submission = { maker, sculpt, colorway, id: uuidv4() };
  await addSubmission(submission, file[0].data);
  await discordSubmissionUpdate(submission);
  resp.status(200).send('OK');
};

export const submitName = async (
  req: FastifyRequest<{ Body: { id: string; name: string } }>,
  resp: FastifyReply
): Promise<void> => {
  const { id, name } = req.body;

  const colorway = instance.getColorway(id);

  if (!colorway) {
    resp.status(404).send('Not found');
    return;
  }

  await discordSubmitCapName(colorway, name);
  resp.status(200).send('OK');
};

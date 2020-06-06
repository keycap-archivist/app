import { appLogger } from 'logger';
import { generateWishlist } from 'internal/image-processor-v2';

const genWishlistPost = async (req, resp): Promise<void> => {
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
export const controllers = { genWishlistPost };

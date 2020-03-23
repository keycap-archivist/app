import { generateWishlist } from 'internal/image-processor';

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

export const controllers = { genWishlist };

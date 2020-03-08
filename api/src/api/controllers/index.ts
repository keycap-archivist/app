const hello = async (req, resp) => {
  return resp.status(200).send({ hello: 'world' });
};

export const controllers = { hello };

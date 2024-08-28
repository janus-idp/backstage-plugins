import { NextFunction, Request, Response } from 'express';

export const validateCompletionsRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { conversation_id, model, query, serverURL } = req.body;

  if (typeof conversation_id !== 'string' || conversation_id.trim() === '') {
    return res
      .status(400)
      .json({ error: 'conversation_id is required and must be a non-empty string' });
  }

  // TODO: Need to extract out the user_id from conversation_id, and verify with the login user entity

  if (typeof serverURL !== 'string' || serverURL.trim() === '') {
    return res
      .status(400)
      .json({ error: 'serverURL is required and must be a non-empty string' });
  }
  
  if (typeof model !== 'string' || model.trim() === '') {
    return res
      .status(400)
      .json({ error: 'model is required and must be a non-empty string' });
  }

  if (typeof query !== 'string' || query.trim() === '') {
    return res
      .status(400)
      .json({ error: 'query is required and must be a non-empty string' });
  }


  return next();
};

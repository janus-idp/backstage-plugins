import { NextFunction, Request, Response } from 'express';

import { QueryRequestBody } from './types';

export const validateCompletionsRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const reqData: QueryRequestBody = req.body;

  if (
    typeof reqData.conversation_id !== 'string' ||
    reqData.conversation_id.trim() === ''
  ) {
    return res.status(400).json({
      error: 'conversation_id is required and must be a non-empty string',
    });
  }

  // TODO: Need to extract out the user_id from conversation_id, and verify with the login user entity

  if (
    typeof reqData.serverURL !== 'string' ||
    reqData.serverURL.trim() === ''
  ) {
    return res
      .status(400)
      .json({ error: 'serverURL is required and must be a non-empty string' });
  }

  if (typeof reqData.model !== 'string' || reqData.model.trim() === '') {
    return res
      .status(400)
      .json({ error: 'model is required and must be a non-empty string' });
  }

  if (typeof reqData.query !== 'string' || reqData.query.trim() === '') {
    return res
      .status(400)
      .json({ error: 'query is required and must be a non-empty string' });
  }

  return next();
};

export const validateLoadHistoryRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const historyLength = Number(req.query.historyLength);

  if (historyLength && !Number.isInteger(historyLength)) {
    return res.status(400).send('historyLength has to be a valid integer');
  }

  // TODO: Need to extract out the user_id from conversation_id, and verify with the login user entity

  return next();
};

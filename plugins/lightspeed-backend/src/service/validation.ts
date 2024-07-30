import { NextFunction, Request, Response } from 'express';

export const validateCompletionsRequest = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { model, messages } = req.body;

  if (typeof model !== 'string' || model.trim() === '') {
    return res
      .status(400)
      .json({ error: 'Model is required and must be a non-empty string' });
  }

  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages must be an array' });
  }

  for (const message of messages) {
    if (typeof message.role !== 'string' || message.role.trim() === '') {
      return res.status(400).json({
        error: 'Each message must have a role which is a non-empty string',
      });
    }
    if (typeof message.content !== 'string' || message.content.trim() === '') {
      return res.status(400).json({
        error: 'Each message must have content which is a non-empty string',
      });
    }
  }

  return next();
};

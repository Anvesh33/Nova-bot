import { Request, Response, NextFunction } from 'express';

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  console.error('[Unhandled Error]', err.message);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
}

export default errorHandler;

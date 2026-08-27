import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error]:', err.message);

  if (err instanceof ZodError) {
    const zodErr = err as any;
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: zodErr.errors.map((e: any) => ({ path: e.path.join('.'), message: e.message }))
    });
  }

  if (err.message === 'Ticket not found') {
    return res.status(404).json({ error: err.message });
  }

  return res.status(500).json({ error: 'Internal server error' });
};

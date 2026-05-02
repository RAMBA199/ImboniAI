import { Response } from 'express';

export interface DetailedErrorResponse {
  error: string;
  timestamp: string;
  status: number;
  path?: string;
  method?: string;
  details?: string;
  trace?: any;
}

/**
 * Send a detailed error response with timestamp, status, and optional debug info
 */
export function sendDetailedError(
  res: Response,
  status: number,
  message: string,
  req?: any,
  details?: string | any
): Response {
  const errorResponse: DetailedErrorResponse = {
    error: message,
    timestamp: new Date().toISOString(),
    status,
    path: req?.path || req?.originalUrl,
    method: req?.method,
  };

  if (details) {
    errorResponse.details = typeof details === 'string' ? details : JSON.stringify(details);
  }

  // Log the error for server debugging
  console.error(`[${status}] ${message}`, {
    timestamp: errorResponse.timestamp,
    path: errorResponse.path,
    method: errorResponse.method,
    details: errorResponse.details,
  });

  return res.status(status).json(errorResponse);
}

/**
 * Handle catch-all errors with detailed information
 */
export function handleError(error: any, res: Response, req?: any): Response {
  const status = error.status || error.statusCode || 500;
  const message = error.message || 'Internal server error';
  const details = error.details || (error.response?.data ? JSON.stringify(error.response.data) : undefined);

  return sendDetailedError(res, status, message, req, details || error.toString());
}

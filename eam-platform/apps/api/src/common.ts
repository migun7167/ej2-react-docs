import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  createParamDecorator,
  ExecutionContext,
} from '@nestjs/common';
import { randomUUID } from 'crypto';

/** error format เดียวกันทุก endpoint: { error: { code, message, field?, trace_id } } */
export class ApiError extends HttpException {
  constructor(
    status: number,
    public readonly code: string,
    message: string,
    public readonly field?: string,
    public readonly details?: unknown,
  ) {
    super(message, status);
  }
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly log = new Logger('Http');
  catch(exception: any, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    const traceId = randomUUID();
    if (exception instanceof ApiError) {
      res.status(exception.getStatus()).json({
        error: {
          code: exception.code,
          message: exception.message,
          field: exception.field,
          details: exception.details,
          trace_id: traceId,
        },
      });
      return;
    }
    if (exception instanceof HttpException) {
      res.status(exception.getStatus()).json({
        error: { code: 'HTTP_ERROR', message: exception.message, trace_id: traceId },
      });
      return;
    }
    this.log.error(`[${traceId}] ${exception?.stack ?? exception}`);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: { code: 'INTERNAL', message: 'Internal server error', trace_id: traceId },
    });
  }
}

export interface CurrentUser {
  id: string;
  username: string;
  display_name: string;
  role_code: string;
}

export const User = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): CurrentUser =>
    ctx.switchToHttp().getRequest().user,
);

/** keyset pagination: ?limit=50&after=<base64 "created_at|id"> — เสถียรที่ 1M แถว */
export function parsePage(q: any): { limit: number; afterTs?: string; afterId?: string } {
  const limit = Math.min(Math.max(parseInt(q.limit ?? '50', 10) || 50, 1), 200);
  if (!q.after) return { limit };
  try {
    const [ts, id] = Buffer.from(String(q.after), 'base64').toString('utf8').split('|');
    return { limit, afterTs: ts, afterId: id };
  } catch {
    throw new ApiError(400, 'BAD_CURSOR', 'invalid after cursor', 'after');
  }
}

export function nextCursor(rows: { created_at: string | Date; id: string }[], limit: number) {
  if (rows.length < limit) return null;
  const last = rows[rows.length - 1];
  const ts = last.created_at instanceof Date ? last.created_at.toISOString() : last.created_at;
  return Buffer.from(`${ts}|${last.id}`).toString('base64');
}

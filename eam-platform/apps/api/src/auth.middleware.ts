import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import { ApiError } from './common';
import { DbService, TENANT_ID } from './db.service';

/**
 * AUTH_MODE=dev      — ผู้ใช้จาก seed (header X-Dev-User เลือก username, default: admin)
 *                      สำหรับรัน local/dev เท่านั้น
 * AUTH_MODE=keycloak — ตรวจ JWT (RS256) กับ JWKS ของ OIDC_ISSUER แล้ว map sub → app_user
 */
@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly log = new Logger('Auth');
  private jwks?: ReturnType<typeof createRemoteJWKSet>;

  constructor(private readonly db: DbService) {}

  async use(req: any, res: any, next: () => void) {
    const mode = process.env.AUTH_MODE ?? 'dev';
    if (mode === 'dev') {
      const username = req.headers['x-dev-user'] ?? 'admin';
      const user = await this.db.one(
        `SELECT id, username, display_name, role_code FROM core.app_user
         WHERE tenant_id = $1 AND username = $2 AND deleted_at IS NULL`,
        [TENANT_ID, username],
      );
      if (!user) throw new ApiError(401, 'UNKNOWN_USER', `unknown dev user: ${username}`);
      req.user = user;
      return next();
    }

    const token = (req.headers.authorization ?? '').replace(/^Bearer /, '');
    if (!token) throw new ApiError(401, 'NO_TOKEN', 'missing bearer token');
    const issuer = process.env.OIDC_ISSUER!;
    this.jwks ??= createRemoteJWKSet(new URL(`${issuer}/protocol/openid-connect/certs`));
    let payload;
    try {
      ({ payload } = await jwtVerify(token, this.jwks, { issuer }));
    } catch (e: any) {
      throw new ApiError(401, 'BAD_TOKEN', `token verification failed: ${e.message}`);
    }
    const user = await this.db.one(
      `SELECT id, username, display_name, role_code FROM core.app_user
       WHERE tenant_id = $1 AND (external_id = $2 OR username = $3) AND deleted_at IS NULL`,
      [TENANT_ID, payload.sub, payload.preferred_username],
    );
    if (!user) throw new ApiError(403, 'NOT_PROVISIONED', 'user not provisioned in EAM');
    req.user = user;
    next();
  }
}

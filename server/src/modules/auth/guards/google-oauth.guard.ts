import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOauthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    // Dynamically construct callback URL based on the request host
    // This allows the app to work on localhost, LAN IP, or public domain without changing code
    const host = request.get('host');
    const callbackURL = `http://${host}/api/auth/google/callback`;

    return {
      accessType: 'offline',
      callbackURL,
    };
  }
}

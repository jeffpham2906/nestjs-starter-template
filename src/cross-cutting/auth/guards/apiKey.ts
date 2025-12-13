import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private authService: AuthService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    return this.validateApiKey(request);
  }

  private async validateApiKey(request: Request): Promise<boolean> {
    const apiKey = request.headers['x-api-key'];
    console.log('API_KEY RUNNING');
    console.log(this.authService.getHello());

    // Replace 'your-secure-api-key' with your actual API key
    if (apiKey === 'your-secure-api-key') {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
    return false;
  }
}

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { FastifyRequest } from 'fastify';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    return this.validateApiKey(request);
  }

  private async validateApiKey(request: FastifyRequest): Promise<boolean> {
    const apiKey = request.headers['x-api-key'];
    console.log('API_KEY RUNNING');
    return true;
    // Replace 'your-secure-api-key' with your actual API key
    if (apiKey === 'your-secure-api-key') {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
    return false;
  }
}

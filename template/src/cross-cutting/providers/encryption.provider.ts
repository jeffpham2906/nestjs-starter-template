import { Inject, Injectable } from '@nestjs/common';
import { ILogger } from '../logging/port/logger.port';
import { ILoggerFactory } from '../logging/logger.factory';
import { ConfigService } from '@nestjs/config';
import crypto from 'crypto';

export interface IEncryptionProvider {
  encrypt(data: string): string;
  decrypt(data: string): string;
}

export const IEncryptionProvider = Symbol('IEncryptionProvider');

@Injectable()
export class EncryptionProvider implements IEncryptionProvider {
  private readonly logger: ILogger;
  private readonly encryptionKey: string;
  private readonly ALGORITHM = 'aes-256-gcm';
  private readonly IV_LENGTH = 12; // For GCM, the IV length is typically 12 bytes
  private readonly TAG_LENGTH = 16; // Authentication tag length for GCM

  constructor(
    @Inject(ILoggerFactory) private readonly loggerFactory: ILoggerFactory,
    private readonly configService: ConfigService,
  ) {
    this.logger = this.loggerFactory.createLoggerFromClass(EncryptionProvider);

    const rawKey = this.configService.getOrThrow<string>('ENCRYPTION_KEY');
    this.encryptionKey = crypto
      .createHash('sha256')
      .update(rawKey)
      .digest('base64')
      .slice(0, 32);
  }

  encrypt(data: string): string {
    this.logger.log(`Encrypting data ...`);

    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(
      this.ALGORITHM,
      this.encryptionKey,
      iv,
    );
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag();

    const result = Buffer.concat([
      iv,
      Buffer.from(encrypted, 'base64'),
      authTag,
    ]).toString('base64');

    return result;
  }

  decrypt(data: string): string {
    this.logger.log(`Decrypting data ...`);

    const rawData = Buffer.from(data, 'base64');
    const iv = rawData.subarray(0, this.IV_LENGTH);
    const authTag = rawData.subarray(rawData.length - this.TAG_LENGTH);
    const encryptedData = rawData.subarray(
      this.IV_LENGTH,
      rawData.length - this.TAG_LENGTH,
    );

    const decipher = crypto.createDecipheriv(
      this.ALGORITHM,
      this.encryptionKey,
      iv,
    );
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, undefined, 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

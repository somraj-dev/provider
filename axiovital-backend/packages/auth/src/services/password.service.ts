import { Injectable } from '@nestjs/common';
import * as argon2 from 'argon2';

/**
 * PasswordService handles secure password hashing and verification
 * using Argon2id — the winner of the Password Hashing Competition
 * and recommended by OWASP for healthcare applications.
 */
@Injectable()
export class PasswordService {
  private readonly hashOptions: argon2.Options = {
    type: argon2.argon2id,
    memoryCost: 65536,    // 64 MB
    timeCost: 3,          // 3 iterations
    parallelism: 4,       // 4 threads
  };

  async hash(password: string): Promise<string> {
    return argon2.hash(password, this.hashOptions);
  }

  async verify(hash: string, password: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch {
      return false;
    }
  }

  /**
   * Check if a hash needs to be rehashed (e.g., after config upgrade).
   */
  needsRehash(hash: string): boolean {
    return argon2.needsRehash(hash, this.hashOptions);
  }
}

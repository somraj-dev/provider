import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common';

export const globalValidationPipeOptions: ValidationPipeOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: { enableImplicitConversion: true },
  errorHttpStatusCode: 422,
  stopAtFirstError: false,
};

export function createGlobalValidationPipe(): ValidationPipe {
  return new ValidationPipe(globalValidationPipeOptions);
}

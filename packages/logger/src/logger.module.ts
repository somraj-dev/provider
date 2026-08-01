import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IncomingMessage } from 'http';

@Module({
  imports: [
    PinoLoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isDev = configService.get('app.env') === 'development';
        return {
          pinoHttp: {
            level: configService.get<string>('log.level') ?? 'debug',
            transport: isDev
              ? { target: 'pino-pretty', options: { colorize: true, singleLine: false, translateTime: 'SYS:standard', ignore: 'pid,hostname' } }
              : undefined,
            serializers: {
              req: (req: IncomingMessage) => ({ method: req.method, url: req.url, headers: { host: req.headers?.host, 'user-agent': req.headers?.['user-agent'] } }),
              res: (res: { statusCode?: number }) => ({ statusCode: res.statusCode }),
            },
            customProps: () => ({
              service: configService.get('app.name') ?? 'axiovital-backend',
              version: configService.get('app.version') ?? '0.1.0',
            }),
            autoLogging: { ignore: (req: IncomingMessage) => req.url === '/health' },
          },
        };
      },
    }),
  ],
})
export class LoggerConfigModule {}

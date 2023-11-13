import { Module } from '@nestjs/common';
import { IdentityController } from './identity.controller';
import { IdentityService } from './services/identity.service';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { TokenSchema } from './schema/token.schema';
import { MongoConfigService } from './services/config/mongo.service';
import { JwtConfigService } from './services/config/jwt.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useClass: JwtConfigService,
    }),
    MongooseModule.forRootAsync({
      useClass: MongoConfigService,
    }),
    MongooseModule.forFeature([
      {
        name: 'Token',
        schema: TokenSchema,
      },
    ]),
  ],
  controllers: [IdentityController],
  providers: [IdentityService],
})
export class AppModule {}

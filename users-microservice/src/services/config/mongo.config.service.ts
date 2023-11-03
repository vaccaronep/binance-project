import {
  MongooseOptionsFactory,
  MongooseModuleOptions,
} from '@nestjs/mongoose';

export class MongoConfigService implements MongooseOptionsFactory {
  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: process.env.MONGO_DSN,
      // auth: {
      //   password: process.env.MONGO_PASSWORD,
      //   username: process.env.MONGO_USER,
      // },
    };
  }
}

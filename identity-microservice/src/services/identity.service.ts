import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { IToken } from 'src/interfaces/token.interface';
import { Model, Query } from 'mongoose';

@Injectable()
export class IdentityService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel('Token') private readonly tokenModel: Model<IToken>,
  ) {}

  public createtoken(userId: string): Promise<IToken> {
    const token = this.jwtService.sign(
      {
        userId,
      },
      {
        expiresIn: 30 * 24 * 60 * 60,
      },
    );

    return new this.tokenModel({
      user_id: userId,
      token,
    }).save();
  }
  public deleteTokenForUserId(userId: string): Query<any, any> {
    return this.tokenModel.deleteOne({
      user_id: userId,
    });
  }

  public async decodeToken(token: string) {
    const tokenModel = await this.tokenModel.find({
      token,
    });
    let result = null;

    if (tokenModel && tokenModel[0]) {
      try {
        const tokenData = this.jwtService.decode(tokenModel[0].token) as {
          exp: number;
          userId: any;
        };
        if (!tokenData || tokenData.exp <= Math.floor(+new Date() / 1000)) {
          result = null;
        } else {
          result = {
            userId: tokenData.userId,
          };
        }
      } catch (e) {
        result = null;
      }
    }
    return result;
  }
}

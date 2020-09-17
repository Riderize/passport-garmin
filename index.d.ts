import passport = require('passport');
import express = require('express');

export interface Profile extends passport.Profile {
  id: string;
}

export interface StrategyOption {
  consumerKey: string;
  consumerSecret: string;
  callbackURL: string;

  authorizationURL?: string;
  tokenURL?: string;
}

export interface StrategyOptionWithRequest extends StrategyOption {
  passReqToCallback: true;
}

export type VerifyFunction = (token: string, tokenSecret: string, profile: Profile, done: (error: any, user?: any, info?: any) => void) => void;
export type VerifyFunctionWithRequest =
  (req: express.Request, accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any, info?: any) => void) => void;

export class Strategy implements passport.Strategy {
  constructor(options: StrategyOption, verify: VerifyFunction);
  constructor(options: StrategyOptionWithRequest, verify: VerifyFunctionWithRequest);

  name: string;
  authenticate(req: express.Request, options?: object): void;
}

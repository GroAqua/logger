import { LogFormat } from "./logFormat";

export type LogData = {
  created: string;
  key?: string;
  logLevel?: string;
  logFormat: LogFormat;
  originalMessage: string;
  userId?: string;
  username?: string;
  value?: string;
  callback?: (logData: LogData) => Promise<void>;
};

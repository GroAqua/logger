import { LogData } from "./logData";

export type LogOptions = {
  key?: string;
  value?: string;
  username?: string;
  userId?: string;
  shouldColorizeJson?: boolean;
  callback?: (logData: LogData) => Promise<void>;
};

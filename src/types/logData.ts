export type LogData = {
  created: string;
  key?: string;
  logLevel?: string;
  message: string;
  userId?: string;
  username?: string;
  value?: string;
  callback?: (logData: LogData) => Promise<void>;
};

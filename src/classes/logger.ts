import "../string/string.extensions";
import { ForegroundColor } from "../enums/foregroundColor";
import { Importance } from "../enums/importance";
import { Style } from "../enums/style";
import { BackgroundColor } from "../enums/backgroundColor";
import { Level } from "../enums/level";
import { LogData } from "../types/logData";

export class Logger {
  private static _level: Level = Level.INF;

  // eslint-disable-next-line
  private formatMessage(message: any) {
    if (typeof message === "object") {
      const msg = JSON.stringify(message);
      if (msg === "{}") {
        return message.toString();
      }
      return msg;
    } else if (typeof message !== "string") {
      return message.toString();
    }

    return message;
  }

  private print(
    message: string,
    importance: string,
    keyValueColor?: ForegroundColor | BackgroundColor,
    logData?: LogData | undefined,
  ) {
    if (logData === undefined) {
      console.log(
        `${new Date().toJSON()} ${"|".magenta().reset()} ${importance} ${"|".magenta().reset()} ${this.formatMessage(message)}`,
      );

      return;
    }

    console.log(
      `${new Date().toJSON()} ${"|".magenta().reset()} ${importance} ${"|".magenta().reset()}${logData.username ? `${` ( ${logData.username.cyan().reset()}`}${" )"}` : ""} ${logData.key && logData.value ? `[ ${keyValueColor ? keyValueColor : ""}${logData.key.toUpperCase()}: ${logData.value.toUpperCase()}${Style.Reset} ]` : ""} ${this.formatMessage(message)}`,
    );
  }

  // eslint-disable-next-line
  public debug(message: any, logData?: LogData) {
    if (Logger._level > Level.DEB) return;

    this.print(
      message,
      Importance.DEB.blueBg().reset(),
      ForegroundColor.Blue,
      logData,
    );

    if (logData?.callback) {
      logData
        .callback(logData)
        .then()
        .catch((error) =>
          this.print(this.formatMessage(error), Importance.ERR.redBg().reset()),
        );
    }
  }

  // eslint-disable-next-line
  public info(message: any, logData?: LogData) {
    if (Logger._level > Level.INF) return;

    this.print(
      message,
      Importance.INF.greenBg().reset(),
      ForegroundColor.Green,
      logData,
    );

    if (logData?.callback) {
      logData
        .callback(logData)
        .then()
        .catch((error) =>
          this.print(this.formatMessage(error), Importance.ERR.redBg().reset()),
        );
    }
  }

  // eslint-disable-next-line
  public error(message: any, logData?: LogData) {
    if (Logger._level > Level.ERR) return;

    this.print(
      message,
      Importance.ERR.redBg().reset(),
      ForegroundColor.Red,
      logData,
    );

    if (logData?.callback) {
      logData
        .callback(logData)
        .then()
        .catch((error) =>
          this.print(this.formatMessage(error), Importance.ERR.redBg().reset()),
        );
    }
  }

  // eslint-disable-next-line
  public warn(message: any, logData?: LogData) {
    if (Logger._level > Level.WAR) return;

    this.print(
      message,
      Importance.WAR.yellowBg().reset(),
      ForegroundColor.Yellow,
      logData,
    );

    if (logData?.callback) {
      logData
        .callback(logData)
        .then()
        .catch((error) =>
          this.print(this.formatMessage(error), Importance.ERR.redBg().reset()),
        );
    }
  }

  // eslint-disable-next-line
  public fatal(message: any, logData?: LogData) {
    if (Logger._level > Level.FAT) return;

    this.print(
      message,
      Importance.FAT.magentaBg().reset(),
      ForegroundColor.Magenta,
      logData,
    );

    if (logData?.callback) {
      logData
        .callback(logData)
        .then()
        .catch((error) =>
          this.print(this.formatMessage(error), Importance.ERR.redBg().reset()),
        );
    }
  }

  public static setLevel(level: Level) {
    this._level = level;
  }
}

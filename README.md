# logger

Install
```
npm i @groaqua/logger
```

How to use
```
import { Logger } from '@groaqua/logger';

const logger = new Logger();
```

Examples
```
import { Logger, Level, LogData, LogOptions } from '@groaqua/logger';

const logger = new Logger();

Logger.setLevel(Level.DEB);

logger.debug('Hello, world!')
logger.info("Hello, world!".yellow().reset());
logger.warn("Hello, world!".blueBg().reset());
logger.error("Hello, world!".underscore().reset(), {verbose: true});
logger.fatal("Hello, world!");
logger.info({name: "Peter Parker", age: 25, isSpiderman: true})

const logOptions: LogOptions = {
  shouldColorizeJson: true,
  verbose: true,
  callback: async (logData: LogData) => {
    console.log('callback =>', logData);
  }
}
logger.info({name: "Peter Parker", age: 25, isSpiderman: true}, logOptions)
```
Ouput

![](https://github.com/GroAqua/logger/blob/main/screenshot.png?raw=true)

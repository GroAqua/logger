# logger

Install
```
npm i @groaqua/logger
```

How to use
```
import { Logger } from "./classes/logger";

const logger = new Logger();
```

Examples
```
import { Logger } from "./classes/logger";
import { Level } from "./enums/level";

const logger = new Logger();

Logger.setLevel(Level.DEB);

logger.debug('Hello, world!')
logger.info("Hello, world!");
logger.warn("Hello, world!");
logger.error("Hello, world!");
logger.fatal("Hello, world!");

logger.info({name: "Peter Parker", age: 25, isSpiderman: true})
logger.info({name: "Peter Parker", age: 25, isSpiderman: true},{
  shouldColorizeJson: true,
  verbose: true,
  callback: async (logData) => {
    console.log(logData);
  }
})
```
Ouput

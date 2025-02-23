import { Logger } from "./classes/logger";
export { Logger };
export default Logger;

const log = new Logger();

log.info("Hello, world!");
log.info({ message: "Hello, world!" });
log.info(
  { message: "Hello, world!" },
  {
    key: "key",
    value: "value",
    shouldColorizeJson: true,
  },
);
log.info(
  { message: "Hello, world!" },
  {
    shouldColorizeJson: true,
    verbose: true,
  },
);

const set = new Set();
set.add("value");
set.add("key");

log.info(set, {
  shouldColorizeJson: true,
  verbose: true,
});

const map = new Map();
map.set("value", "value");
map.set("key", "value");

log.error(map, {
  shouldColorizeJson: true,
  verbose: true,
});

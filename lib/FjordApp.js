const cdk = require('@aws-cdk/core');

const SharedResources = require("./sharedResources");
const ConsumerGroup = require("./consumer");
const Server = require("./server");

const getSettings = require("./settings");
const SETTINGS = getSettings();

class FjordApp extends cdk.App {
  constructor() {
    super();

    const shared = new SharedResources(this, "fjord-shared-" + SETTINGS.name);
    const server = new Server(this, "fjord-server-" + SETTINGS.server.NAME, {
      SERVER: SETTINGS.server,
      CLUSTER: shared.cluster,
      REDIS: shared.redis
    });
    server.node.addDependency(shared);

    SETTINGS.consumerGroups.forEach(cg => {
      const group = new ConsumerGroup(this, "fjord-consumer-" + cg.NAME, {
        CONSUMER: cg,
        CLUSTER: shared.cluster,
        REDIS: shared.redis,
      });
      group.node.addDependency(shared);
    });
  }
}

new FjordApp().synth();
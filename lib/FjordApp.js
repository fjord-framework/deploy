const cdk = require('@aws-cdk/core');

const SharedResources = require("./sharedResources");
const ConsumerGroup = require("./consumer");
const Server = require("./server");

const getSettings = require("./settings");
const SETTINGS = getSettings();

class FjordApp extends cdk.App {
  constructor() {
    super();

    const shared = new SharedResources(this, "fjord-shared");
    const server = new Server(this, "fjord-server", {
      SERVER: SETTINGS.server,
      CLUSTER: shared.cluster,
      REDIS: shared.redis
    });

    SETTINGS.consumerGroups.forEach(cg => {
      const group = new ConsumerGroup(this, "fjord-consumer-" + cg.NAME, {
        CONSUMER: cg,
        CLUSTER: shared.cluster,
        REDIS: shared.redis,
      });
      group.node.addDependency(server);
    });
  }
}

new FjordApp().synth();
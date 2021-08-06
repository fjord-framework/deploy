/* eslint-disable max-lines-per-function */
const cdk = require('@aws-cdk/core');
const ecs = require("@aws-cdk/aws-ecs");

class ConsumerGroup extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id);

    const {CONSUMER, CLUSTER, REDIS} = props

    const { 
      NAME,
      CONSUMER_GROUP,
      BROKERS,
      SECURITY,
      KAFKA_USERNAME,
      KAFKA_PASSWORD,
      FROM_BEGINNINGS,
      KAFKA_TOPICS,
      API_TOPICS,
      MEMBERS_COUNT,
      STARTING_DELAY_SEC,
      CONCURRENT_PARTITIONS
    } = CONSUMER

    const consumerTaskDefinition = new ecs.FargateTaskDefinition(this, 'fjord-task-'+ NAME, {
      memoryLimitMiB: 512,
      cpu: 256,
    });

    consumerTaskDefinition.addContainer('fjord-consumer', {
      image: ecs.ContainerImage.fromRegistry("fjordframework/consumer"),
      portMappings: [{ containerPort: 8080 }],
      environment: {
        CLIENT: "Fjord-" + NAME,
        CONSUMER_GROUP,
        BROKERS,
        SECURITY,
        KAFKA_USERNAME,
        KAFKA_PASSWORD,
        KAFKA_TOPICS,
        API_TOPICS,
        FROM_BEGINNINGS,
        CONCURRENT_PARTITIONS,
        STARTING_DELAY_SEC,
        REDIS_HOST: REDIS.cluster.attrRedisEndpointAddress,
        REDIS_PORT: REDIS.cluster.attrRedisEndpointPort,
      },
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'fjord-consumer-'+ NAME })
    });

    this.consumerService = new ecs.FargateService(this, 'fjord-service-' + NAME, {
      cluster: CLUSTER,
      taskDefinition: consumerTaskDefinition,
      desiredCount: (Number(MEMBERS_COUNT) || 1)
    });

    this.consumerService.connections.allowToDefaultPort(REDIS);
  }
}

module.exports = ConsumerGroup;

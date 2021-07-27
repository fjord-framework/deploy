/* eslint-disable max-lines-per-function */
/* eslint-disable no-new */
const cdk = require('@aws-cdk/core');
const ecs = require("@aws-cdk/aws-ecs");
const ecs_patterns = require("@aws-cdk/aws-ecs-patterns");

class Server extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id);
    const {SERVER, CLUSTER, REDIS} = props
    const {NAME, JWT_KEY, SEC_PER_PULSE} = SERVER

    this.serverEcs = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'fjord-LB-' + NAME, {
      cluster: CLUSTER, // Required
      cpu: 256, // Default is 256
      desiredCount: 1, // Default is 1
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry("dockervahid/fjord-server"),
        environment: {
          JWT_KEY,
          SEC_PER_PULSE,
          REDIS_HOST: REDIS.cluster.attrRedisEndpointAddress,
          REDIS_PORT: REDIS.cluster.attrRedisEndpointPort,
          PORT: "80"
        },
      },
      memoryLimitMiB: 512, // Default is 512,
      assignPublicIp: true,
      publicLoadBalancer: true,
    });

    // add auto-scaling to our fargate service
    const autoScalingGroup = this.serverEcs.service.autoScaleTaskCount({
      minCapacity: 1, // default is 1
      maxCapacity: 2
    });

    // commented out to test only memory usage first
    // autoScalingGroup.scaleOnCpuUtilization('CPUScaling', {
    //   targetUtilizationPercent: 55,
    //   scaleInCooldown: cdk.Duration.seconds(60),
    //   scaleOutCooldown: cdk.Duration.seconds(60),
    // });

    // add auto-scaling rule for our fargate service (based on memory usage)
    autoScalingGroup.scaleOnMemoryUtilization('MemoryScaling', {
      targetUtilizationPercent: 35,
      scaleInCooldown: cdk.Duration.seconds(60),
      scaleOutCooldown: cdk.Duration.seconds(60),
    });

    this.serverEcs.service.connections.allowToDefaultPort(REDIS);
  }
}

module.exports = Server;
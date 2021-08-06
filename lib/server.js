/* eslint-disable max-lines-per-function */
/* eslint-disable no-new */
const cdk = require('@aws-cdk/core');
const ecs = require("@aws-cdk/aws-ecs");
const ecs_patterns = require("@aws-cdk/aws-ecs-patterns");

class Server extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id);
    const {SERVER, CLUSTER, REDIS} = props
    const {NAME, JWT_KEY, SEC_PER_PULSE, API_TOPICS} = SERVER

    const fjordECS = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'fjordECS-' + NAME, {
      cluster: CLUSTER, // Required
      cpu: 256, // Default is 256
      memoryLimitMiB: 512, // Default is 512,
      desiredCount: 2, // for safety
      assignPublicIp: true,
      publicLoadBalancer: true,
      taskImageOptions: {
        image: ecs.ContainerImage.fromRegistry("fjordframework/server"),
        environment: {
          JWT_KEY,
          SEC_PER_PULSE,
          API_TOPICS,
          REDIS_HOST: REDIS.cluster.attrRedisEndpointAddress,
          REDIS_PORT: REDIS.cluster.attrRedisEndpointPort,
          PORT: "80"
        },
      },
    });

    // Allow more connections per server beyond default limit
    fjordECS.taskDefinition.defaultContainer.addUlimits({
      name: ecs.UlimitName.NOFILE,
      softLimit: 50000,
      hardLimit: 65500
    });

    // add auto-scaling to our fargate service
    const scalableTaskCount = fjordECS.service.autoScaleTaskCount({
      minCapacity: 2, // default is 1
      maxCapacity: 15
    });

    // Auto-scaling rule for our fargate service based on CPU usage
    scalableTaskCount.scaleOnCpuUtilization('CPUScaling', {
      targetGroup: fjordECS.targetGroup,
      targetUtilizationPercent: 25,
      scaleInCooldown: cdk.Duration.seconds(20),
      scaleOutCooldown: cdk.Duration.seconds(20)
    });

    // Auto-scaling rule for our fargate service based on memory usage
    scalableTaskCount.scaleOnMemoryUtilization('MemoryScaling', {
      targetGroup: fjordECS.targetGroup,
      targetUtilizationPercent: 35,
      scaleInCooldown: cdk.Duration.seconds(20),
      scaleOutCooldown: cdk.Duration.seconds(20)
    });
    
    // Auto-scaling rule for our fargate service based on requests/min   
    scalableTaskCount.scaleOnRequestCount('RequestCountScaling', {
      targetGroup: fjordECS.targetGroup,
      requestsPerTarget: 4000,
      scaleInCooldown: cdk.Duration.seconds(20),
      scaleOutCooldown: cdk.Duration.seconds(20)
    });
    
    // change default ALB algorithm from round_robin (default) to Least outstanding requests (LOR)
    fjordECS.targetGroup.setAttribute('load_balancing.algorithm.type','least_outstanding_requests');

    fjordECS.service.connections.allowToDefaultPort(REDIS);
    
    fjordECS.loadBalancer.setAttribute("idle_timeout.timeout_seconds", "75");

  }
}

module.exports = Server;

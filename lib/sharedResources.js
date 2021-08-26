const cdk = require('@aws-cdk/core');
const ec2 = require("@aws-cdk/aws-ec2");
const ecs = require("@aws-cdk/aws-ecs");
const Redis = require('./redis');

class SharedResources extends cdk.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, "fjord-vpc", {
      maxAzs: 2 // Default is all AZs in region
    });

    this.vpc.publicSubnets.forEach((subnet, index) => {
      const EIP = subnet.node.tryFindChild('EIP');
      new cdk.CfnOutput(this, `NAT Gateway ${index+1} - IP:`, { value: EIP.ref });
    })

    this.cluster = new ecs.Cluster(this, "fjord-cluster", {
      vpc: this.vpc
    });

    this.redis = new Redis(this, "fjord-redis", {
      vpc: this.vpc
    });
  }
}

module.exports = SharedResources;
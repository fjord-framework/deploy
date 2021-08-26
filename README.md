<p align="center">
  <img src="./readme_materials/fjord.svg" width="500" height="200" />
</p>

# Deploying Fjord

## What's in this repo?

This repository contains the scripts needed to deploy all AWS resources that comprise Fjord using the AWS Cloud Development Kit (CDK).

The AWS CDK is a framework that can be used to define cloud infrastructure in code and provision it on AWS. The CDK is built on CloudFormation, and running `cdk synth` generates CloudFormation templates for all resources specified in the root of the construct tree, which is `FjordApp.js`.

In the `/lib` folder, you'll find the CDK stacks for the Fjord Consumer (`consumer.js`), the Fjord Server (`server.js`), and `sharedResources.js`, which is used to provision all AWS resources that these two stacks require (e.g., a VPC, subnets, an ECS cluster, and and Redis server). You'll also see `redis.js`, which is used to provision the AWS resources for the Elasticache construct that works with Redis.

## What's the easiest way to deploy Fjord?

The simplest way to deploy Fjord is actually to install the `fjord_cli` [npm package](https://www.npmjs.com/package/fjord_cli) and use the Fjord CLI to setup, deploy, and tear down Fjord. Please see the [cli repo](https://github.com/fjord-framework/cli) to see more detailed instructions for deploying Fjord using the Fjord CLI.

## What's the purpose of this repo?

You can use AWS CDK commands to deploy Fjord using the files in the `/lib` folder of this repository. This could be useful if you want to test out using Fjord with the AWS CDK without using the thin wrapper our CLI provides. If you wish to customize Fjord or how you deploy Fjord on AWS, this repo would be a good place to start.

## How do I deploy Fjord using this repo?

1. Before you use the AWS CDK you must first install the npm package globally.

`npm install -g aws-cdk`

2. After the CDK is installed, you can deploy Fjord on AWS using this repo. First, clone it in a new folder where you want your project to reside.

`git clone https://github.com/fjord-framework/deploy.git`

3. At this point, run `npm install` to download and install the additional AWS npm packages required to work with the CDK. These packages can be found in `package.json`. They are `@aws-cdk/core @aws-cdk/aws-ec2`, `@aws-cdk/aws-ecs`, `@aws-cdk/aws-ecs-patterns`, and `@aws-cdk/aws-elasticache`.

4. Finally, you'll need to edit the `FjordSettings.json` file to customize your Fjord deployment.

Below is an example of `FjordSettings.json`:

```
{
  "name": "ShoppingApp",
  "server": {
    "NAME": "APIs",
    "JWT_KEY": "",
    "API_TOPICS": "orders shipments",
    "SEC_PER_PULSE": "30"
  },
  "consumerGroups": [
    {
      "NAME": "MyGroup",
      "KAFKA_TOPICS": "orders shipments",
      "API_TOPICS": "orders shipments",
      "FROM_BEGINNINGS": "false false",
      "BROKERS": "157.347.243.212:9093",
      "SECURITY": "SASL-plain",
      "KAFKA_USERNAME": "safeUser",
      "KAFKA_PASSWORD": "LetMeIn123",
      "MEMBERS_COUNT": "1",
      "CONCURRENT_PARTITIONS": "1",
      "STARTING_DELAY_SEC": "60"
    }
  ]
}
```

### What information is in `FjordSettings.json`?

At the top level of the `JSON` object, you'll see three properties.

#### name

`name` represents a logical identifier for all AWS resources that are deployed with Fjord. This identifier may consist of alphanumeric characters, dashes, and underscores.

#### server

`server` contains details about the AWS stack that will be deployed for the Fjord Server. You can provide a name of your choosing (that consists of alphanumeric characters, dashes, and underscores) that will be used as a logical identifier for all AWS resources that are deployed for the Fjord Server. You can also add configuration details that the Fjord Server will use.

Details about `JWT_KEY` and `SEC_PER_PULSE` can be located in the [server repo](https://github.com/fjord-framework/server).

#### consumerGroups

`consumerGroups` represents a list of one or more Kafka consumer groups that will comprise your Fjord Consumer, where each object represents a consumer group that consists of one or more members. Here, `name` also represents a logical identifier for all AWS resources that are deployed for the Fjord Consumer.

`MEMBERS_COUNT` should be a space-delimited list of numbers that will be used to specify the number of members for each Kafka consumer group. If not specified, or if there are fewer numbers than there are consumer groups, the group will have one consumer by default.

Other pertinent details about all other properties, including `KAFKA_TOPICS`, `API_TOPICS`, `FROM_BEGINNINGS`, `CONCURRENT_PARTITIONS`, etc., can be found in the [consumer repo](https://github.com/fjord-framework/consumer).

5. Run `cdk synth`. This optional step generates the CloudFormation templates for each stack, if they are not already present, and places them in the `/cdk.out` directory.

6. Run `cdk deploy "*"`to deploy the `FjordApp` AWS resources.

## Useful AWS CDK commands

- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

## Additional Notes

The `cdk.json` file tells the CDK Toolkit how to execute your app. The build step is not required when using JavaScript.

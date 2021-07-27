# How To Deploy FjordApp

## Prereqs

1. Run `npm install -g aws-cdk`

## Steps

1. After pulling this version of the app, navigate to `FjordApp`
2. Run `npm install`
3. Run `npm install @aws-cdk/core @aws-cdk/aws-ec2 @aws-cdk/aws-ecs @aws-cdk/aws-ecs-patterns @aws-cdk/aws-elasticache`
4. Edit the FjordSettings.json file to customize Fjord with your Fjord server private key and your Kafka consumer details, and save
5. Run `cdk synth`. This generates the CloudFormation templates for each stack and places them in the `FjordApp/cdk.out` directory.
6. Run `cdk deploy "*"` to deploy the `FjordApp` AWS resources.

# Boilerplate CDK Material

The `cdk.json` file tells the CDK Toolkit how to execute your app. The build step is not required when using JavaScript.

## Useful commands

- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template

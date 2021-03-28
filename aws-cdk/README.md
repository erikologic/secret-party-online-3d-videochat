# AWS deployment IaaC

This AWS CDK IaaC project will:
- create the required resources
- launch a script to configure DuckDNS and run the servers*

## TL DR
- Follow the [setup](#setup)
- Log in to AWS on your shell
- `AWS_REGION=your-closest-aws-region npx cdk deploy` to launch the app
- wait 5 mins and then go to your app URL
- `AWS_REGION=your-closest-aws-region npx cdk destroy` when the party is over

### What resources will be created?
- A t3-medium Amazon Linux EC2
- The instance will be attached to the existing VPC and public subnet
- InstanceProfile to be able to login via Session Manager
- SecurityGroup to open HTTP/S and STUN/TURN ports
- Tags to make infrastructure managers happy 😀

This should be enough to host a session of 15-20 people.  
The running cost are ATM less than 2$/hour.  

### 🔔 *Passing the DuckDNS token in EC2 userdata 
In order to configure DuckDNS, its token will be passed unencrypted to the instance via userdata.  
This is an accepted security risk - if you agree, skip the section below.

If you don't feel comfortable with this choice, you will have to [manually deploy/launch the app](#manually-deploylaunch-the-app) on the instance

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Setup
- signup/log in DuckDNS
- create a domain
- copy the token
- shell in this project folder: `cd secret-party-online-3d-videochat/aws-cdk`
- create an .env configuration file from the example one: `cp .env.example .env`
- edit the content: `vi .env` 

## Deploy/launch the app
- get access to the AWS on the shell and confirm it's working: `aws sts get-caller-identity`
- optionally, you can review the CloudFormation template: `npx cdk synth`
- deploy the app: `npx cdk deploy`*
- in few minutes the resources will be deployed
- in a few mins more the app should have been launched and be available at your DuckDNS address - if you have not opted for manual deployment

### *AWS_REGION and dotenv not overwriting env var
The CDK code will read the configuration from env vars, or `.env` via `dotenv`   
`dotenv` will not overwrite an env var if it is already set  
It's likely you have already an `AWS_REGION` configured, if you normally work on AWS.  
E.g. you are in London, and your `AWS_REGION` is `eu-west-1` (Dublin)  
You might want to deploy in a region closer to you, e.g. `eu-west-2` (London)  
You can overwrite your env var like this: `AWS_REGION=eu-west-2 npx cdk deploy`  

## Manually deploy/launch the app
- disable all the safety/type checks around any `DUCKDNS_` env
- disable the deployment of userdata
- log in the EC2 via Session Manager  
- run the commands from `script/deploy.sh` on the instance manually

## Monitoring / troubleshooting
To debug the deployment you can:
- check in CloudFormation that the deployment went fine
- in the EC2 console, check that the instance is running 
- inspect the instance by logging into it via Session Manager: https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-sessions-start.html 


The logs of the deploy/launch script can be found:
- on the instance, under `/var/log/user-data.log`
- with some delay, in the EC2 web console logs section: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-console.html#instance-console-console-output

### How to fix a broken deployment
- log in the instance
- manually run the various commands in the `script/deploy.sh` file. 
- try to redeploy using the [manually deploy/launch the app](#manually-deploylaunch-the-app) procedure

## Destroy
When your party is over, just run `npx cdk destroy`  
It will remove all the resources and stop you from putting more cents into Bezos pockets!  

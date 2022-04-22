import * as cdk from "@aws-cdk/core";
import {
    AmazonLinuxGeneration,
    Instance,
    InstanceClass,
    InstanceSize,
    InstanceType,
    MachineImage,
    Peer,
    Port,
    SecurityGroup,
    SubnetType,
    UserData,
    Vpc,
} from "@aws-cdk/aws-ec2";
import { ManagedPolicy } from "@aws-cdk/aws-iam";
import { Tags } from "@aws-cdk/core";
import { readFileSync } from "fs";
import * as path from "path";

export interface AppConfigProps {
    duckDns: {
        token: string;
        domain: string;
    };
    email: string;
    appName: string;
}

export class VideochatApp extends cdk.Stack {
    constructor(
        scope: cdk.Construct,
        id: string,
        props: cdk.StackProps,
        appConfig: AppConfigProps
    ) {
        super(scope, id, props);

        const instanceType = InstanceType.of(
            InstanceClass.T3,
            InstanceSize.MEDIUM
        );
        // const vpc = Vpc.fromLookup(this, "DefaultVPC", { isDefault: true });
        const vpc = new Vpc(this, id + "Vpc", {
            cidr: "10.0.0.0/16",
            natGateways: 1,
            maxAzs: 3,
            subnetConfiguration: [
                {
                    name: "public-subnet-1",
                    subnetType: SubnetType.PUBLIC,
                    cidrMask: 24,
                },
            ],
        });
        const vpcSubnets = vpc.selectSubnets({ subnetType: SubnetType.PUBLIC });
        const machineImage = MachineImage.latestAmazonLinux({
            generation: AmazonLinuxGeneration.AMAZON_LINUX_2,
        });

        const securityGroup = new SecurityGroup(this, id + "SecurityGroup", {
            vpc,
            description: "Allow access to the app",
            allowAllOutbound: true,
        });
        securityGroup.addIngressRule(
            Peer.anyIpv4(),
            Port.tcp(80),
            "allow http access"
        );
        securityGroup.addIngressRule(
            Peer.anyIpv4(),
            Port.tcp(443),
            "allow https access"
        );
        securityGroup.addIngressRule(
            Peer.anyIpv4(),
            Port.tcp(3478),
            "allow turn access"
        );
        securityGroup.addIngressRule(
            Peer.anyIpv4(),
            Port.udp(3478),
            "allow turn access"
        );
        securityGroup.addIngressRule(
            Peer.anyIpv4(),
            Port.udpRange(49152, 65535),
            "allow turn access"
        );

        const userData = UserData.forLinux();
        userData.addCommands(
            `export DUCKDNS_DOMAIN=${appConfig.duckDns.domain}`
        );
        userData.addCommands(`export DUCKDNS_TOKEN=${appConfig.duckDns.token}`);
        userData.addCommands(
            `export URL=${appConfig.duckDns.domain}.duckdns.org`
        );
        userData.addCommands(`export EMAIL=${appConfig.email}`);
        const deployScript = readFileSync(
            path.resolve(process.cwd(), "./script/deploy.sh"),
            { encoding: "utf-8" }
        );
        const execDeployScriptWithLogging =
            `sudo --preserve-env=DUCKDNS_DOMAIN,DUCKDNS_TOKEN,URL,EMAIL -u ec2-user bash -c '${deployScript}' 2>&1 |` +
            `tee /var/log/user-data.log |` +
            `logger -t user-data -s 2>/dev/console`;
        userData.addCommands(execDeployScriptWithLogging);

        const instance = new Instance(this, id + "Instance", {
            instanceType,
            machineImage,
            securityGroup,
            userData,
            vpc,
            vpcSubnets,
        });
        instance.role.addManagedPolicy(
            ManagedPolicy.fromAwsManagedPolicyName(
                "AmazonSSMManagedInstanceCore"
            )
        );
        const tags = Tags.of(instance);
        tags.add("component", "secret-party");
        tags.add("owner", appConfig.email);
    }
}

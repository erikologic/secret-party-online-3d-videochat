#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {AppConfigProps, VideochatApp} from '../lib/videochat-app';
import {getEnvVar} from "../lib/get-env-var";

require('dotenv').config()

const domain = getEnvVar("DUCKDNS_DOMAIN", "You need to provide your DuckDNS (sub) domain");
const token = getEnvVar("DUCKDNS_TOKEN", "You need to provide your DuckDNS token");
const email = getEnvVar("EMAIL", "You need to provide an email for signing the Let's Encrypt HTTPS certificates");
const appName = domain + '_SecretParty';
const appConfig: AppConfigProps = { appName, email, duckDns: {domain, token} };

const stackConfig: cdk.StackProps = {
    env: {
        account: getEnvVar('AWS_ACCOUNT', 'You need to provide an AWS_ACCOUNT number'),
        region: getEnvVar('AWS_REGION', 'You need to provide the AWS_REGION')
    }
}

const app = new cdk.App();
new VideochatApp(app, 'myVideochatApp', stackConfig, appConfig); // TODO app name depnding on user

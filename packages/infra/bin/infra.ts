#!/usr/bin/env node
import {ManageWebStack} from '../lib/manage-web-stack';
import {App, Aspects} from "aws-cdk-lib";
import {AwsSolutionsChecks} from "cdk-nag";

const app = new App();
new ManageWebStack(app, 'ManageWebStack');

Aspects.of(app).add(new AwsSolutionsChecks());
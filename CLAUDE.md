# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is a monorepo containing multiple packages:

- **packages/infra** - AWS CDK infrastructure code for deploying applications
- **packages/manage-web** - SolidStart web application
- **packages/mcp-server** - MCP (Model Context Protocol) server implementation

## Key Commands

### Infrastructure (packages/infra)
```bash
# Build TypeScript to JavaScript
npm run build

# Watch for changes and compile
npm run watch

# Run tests
npm run test

# CDK commands
npm run cdk deploy      # Deploy stack to AWS
npm run cdk diff        # Compare deployed stack with current state
npm run cdk synth       # Generate CloudFormation template
```

### Web Application (packages/manage-web)
```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Architecture Overview

### Infrastructure Stack (ManageWebStack)
- Deploys a Lambda function with API Gateway HTTP API proxy
- Uses Lambda Web Adapter layer for running web applications
- Includes CloudWatch logging and CDK Nag security checks
- Lambda function expects:
  - `.output` directory from SolidStart build
  - `run.sh` script that executes `node ./server/index.mjs`

### SolidStart Application
- Built with Vinxi bundler
- Output directory: `.output` containing server code
- Lambda deployment requires both `.output` directory and `run.sh` script
- Uses Node.js 22+ runtime
- UI Components: shadcn-solid (Solid.js port of shadcn/ui)
- Styling: TailwindCSS with tailwindcss-animate
- Component utilities: class-variance-authority (cva) for variant management

### Database Architecture
- **DynamoDB One Table Design**: All entities stored in a single DynamoDB table
- Utilizes composite keys (PK/SK) for entity relationships
- Access patterns should be defined upfront for optimal query performance
- Consider using GSIs (Global Secondary Indexes) for additional access patterns

### CDK Security Considerations
- CDK Nag is enabled for AWS security best practices
- Various suppressions are in place for:
  - IAM managed policies (Lambda execution role)
  - API Gateway authorization (to be implemented with Cognito)
  - LogRetention Lambda functions

## Lambda Deployment Notes

When deploying the manage-web application to Lambda:
1. The build process runs `npm run build` which creates `.output` directory
2. The Lambda package must include:
   - All contents of `.output` directory
   - The `run.sh` script at the root
3. The Lambda handler is set to `run.sh`
4. AWS Lambda Web Adapter layer handles the HTTP request/response conversion

## Important Files

- `/packages/infra/lib/manage-web-stack.ts` - Main CDK stack definition
- `/packages/infra/bin/infra.ts` - CDK app entry point
- `/packages/manage-web/app.config.ts` - SolidStart configuration
- `/packages/manage-web/run.sh` - Lambda entry point script
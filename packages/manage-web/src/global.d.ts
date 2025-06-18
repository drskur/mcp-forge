/// <reference types="@solidjs/start/env" />

declare namespace NodeJS {
  interface ProcessEnv {
    readonly TABLE_NAME: string;
    readonly AWS_REGION: string;
  }
}

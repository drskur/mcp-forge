export interface InvocationItem {
  invocationType: "lambda" | "stepfunction";
  name: string;
  arn: string;
}

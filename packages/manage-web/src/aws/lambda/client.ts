import { LambdaClient, ListFunctionsCommand } from "@aws-sdk/client-lambda";
import { LambdaFunction } from "@/types/lambda";

const region = process.env.AWS_REGION || "us-east-1";

const lambdaClient = new LambdaClient({
  region,
});

export const listLambdaFunctions = async (
  marker?: string,
  maxItems?: number
): Promise<{
  functions: LambdaFunction[];
  nextMarker?: string;
}> => {
  try {
    const command = new ListFunctionsCommand({
      Marker: marker,
      MaxItems: maxItems || 50,
    });

    const response = await lambdaClient.send(command);

    const functions: LambdaFunction[] =
      response.Functions?.map(f => ({
        functionName: f.FunctionName ?? "",
        functionArn: f.FunctionArn ?? "",
        runtime: f.Runtime?.toString() ?? "",
        description: f.Description,
      })) ?? [];

    return {
      functions,
      nextMarker: response.NextMarker,
    };
  } catch (error) {
    console.error("Error listing Lambda functions:", error);
    throw error;
  }
};

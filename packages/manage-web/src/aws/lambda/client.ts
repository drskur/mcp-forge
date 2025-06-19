import {
  FunctionConfiguration,
  LambdaClient,
  ListFunctionsCommand,
} from "@aws-sdk/client-lambda";

const region = process.env.AWS_REGION || "us-east-1";

const lambdaClient = new LambdaClient({
  region,
});

export const listLambdaFunctions = async (
  marker?: string,
  maxItems?: number
): Promise<{
  functions: FunctionConfiguration[];
  nextMarker?: string;
}> => {
  try {
    const command = new ListFunctionsCommand({
      Marker: marker,
      MaxItems: maxItems || 50,
    });

    const response = await lambdaClient.send(command);

    return {
      functions: response.Functions ?? [],
      nextMarker: response.NextMarker,
    };
  } catch (error) {
    console.error("Error listing Lambda functions:", error);
    throw error;
  }
};

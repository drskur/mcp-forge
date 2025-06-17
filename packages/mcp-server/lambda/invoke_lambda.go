package lambda

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/lambda"
)

// InvokeLambda invokes a Lambda function and returns the response
func invokeLambda(ctx context.Context, region, functionName string, payload interface{}) ([]byte, error) {
	// Load AWS config
	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion(region),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to load AWS config: %w", err)
	}

	// Create Lambda client
	client := lambda.NewFromConfig(cfg)

	// Marshal payload to JSON
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal payload: %w", err)
	}

	log.Printf("%v", string(payloadBytes))

	// Invoke Lambda function
	output, err := client.Invoke(ctx, &lambda.InvokeInput{
		FunctionName: aws.String(functionName),
		Payload:      payloadBytes,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to invoke Lambda function: %w", err)
	}

	// Check for function error
	if output.FunctionError != nil {
		return nil, fmt.Errorf("Lambda function error: %s", *output.FunctionError)
	}

	return output.Payload, nil
}

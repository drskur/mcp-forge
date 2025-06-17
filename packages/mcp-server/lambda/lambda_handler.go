package lambda

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
)

func NewAwsLambdaHandlerFunc(region, functionName string, customPayload any) server.ToolHandlerFunc {
	return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		// Merge customPayload with request arguments
		var payload interface{}

		if customPayload != nil {
			// Convert customPayload to map if possible
			customMap := make(map[string]interface{})
			if customBytes, err := json.Marshal(customPayload); err == nil {
				err := json.Unmarshal(customBytes, &customMap)
				if err != nil {
					return nil, err
				}
			}

			// Merge with request arguments
			if args, ok := request.Params.Arguments.(map[string]interface{}); ok {
				// Temporary comment
				//for k, v := range args {
				//	customMap[k] = v
				//}

				// for bedrock agent
				parameters := []interface{}{}
				for k, v := range args {
					parameters = append(parameters, map[string]interface{}{
						"name":  k,
						"value": v},
					)
				}
				customMap["parameters"] = parameters

				payload = customMap
			} else {
				payload = customPayload
			}
		} else {
			payload = request.Params.Arguments
		}

		// Invoke Lambda function with the merged payload
		response, err := invokeLambda(ctx, region, functionName, payload)
		if err != nil {
			return mcp.NewToolResultError(fmt.Sprintf("Failed to invoke Lambda function: %v", err)), nil
		}

		// Parse response as JSON if possible
		var result interface{}
		if err := json.Unmarshal(response, &result); err != nil {
			// If not JSON, return as text
			return mcp.NewToolResultText(string(response)), nil
		}

		// Return formatted JSON response
		resultBytes, err := json.MarshalIndent(result, "", "  ")
		if err != nil {
			return mcp.NewToolResultText(string(response)), nil
		}

		return mcp.NewToolResultText(string(resultBytes)), nil
	}
}

package bedrock

import (
	"context"
	"fmt"
	"github.com/google/uuid"
	"github.com/mark3labs/mcp-go/mcp"
	"github.com/mark3labs/mcp-go/server"
	"log"
)

func NewAgentToolHandlerFunc(agentID string, agentAliasID string, region string) server.ToolHandlerFunc {
	return func(ctx context.Context, request mcp.CallToolRequest) (*mcp.CallToolResult, error) {
		// Get sessionId or generate a new one
		sessionId := request.GetString("sessionId", uuid.NewString())
		query, err := request.RequireString("query")
		if err != nil {
			return nil, err
		}

		// Check if this is a ROC response by looking for ROC-specific parameters
		invocationId := request.GetString("invocationId", "")
		actionGroup := request.GetString("actionGroup", "")
		function := request.GetString("function", "")
		isROCResponse := invocationId != "" && actionGroup != "" && function != ""

		var resp *AgentResponse
		if isROCResponse {
			// This is a ROC response
			log.Printf("Processing ROC response - InvocationId: %s, ActionGroup: %s, Function: %s",
				invocationId, actionGroup, function)

			opts := &InvokeOptions{
				IsROCResponse: true,
				UserInput:     query,
				InvocationId:  invocationId,
				ActionGroup:   actionGroup,
				Function:      function,
			}
			resp, err = invokeAgentWithOptions(ctx, agentID, agentAliasID, sessionId, query, "us-east-1", opts)
		} else {
			// This is a normal request
			resp, err = invokeAgent(ctx, agentID, agentAliasID, sessionId, query, "us-east-1")
		}
		if err != nil {
			log.Fatal(err)
		}

		// Format response based on return control status
		var result string
		if resp.HasReturnControl {
			// When ROC occurs, format response to indicate user input needed
			result = fmt.Sprintf(`[RETURN_OF_CONTROL]
Status: REQUIRES_HUMAN_APPROVAL
Action: The agent needs human input or approval to proceed
Required Action: Please ask the user for the necessary information or approval
Session ID: %s
Instructions: DO NOT attempt to answer this yourself. You MUST present this question/request to the human user and wait for their response.

To respond to this ROC request, use the 'hr-assistant' tool with:
- sessionId: "%s"
- query: [the user's answer]
- invocationId: "%s"
- actionGroup: "%s"
- function: "%s"`, sessionId, sessionId, resp.InvocationId, resp.ActionGroup, resp.Function)
		} else {
			// Include session ID in normal responses too for consistency
			result = fmt.Sprintf(`%s

[Session ID: %s]`, resp.Text, sessionId)
		}

		log.Printf("Response: %v", result)
		return mcp.NewToolResultText(result), nil
	}
}

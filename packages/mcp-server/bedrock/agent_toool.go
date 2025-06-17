package bedrock

import "github.com/mark3labs/mcp-go/mcp"

func NewBedrockAgentTool(name string, description string) mcp.Tool {
	tool := mcp.NewTool(name,
		mcp.WithDescription(description+" This tool handles both initial requests and Return of Control (ROC) responses."),
		mcp.WithString("sessionId", mcp.Description("Optional session ID (UUID format). If not provided, a new UUID will be generated. For follow-up questions or ROC responses, use the previously provided session ID.")),
		mcp.WithString("query", mcp.Required(), mcp.Description("Question for this agent OR user's response to a Return of Control request")),
		mcp.WithString("invocationId", mcp.Description("Required for ROC responses: The invocation ID from the ROC request")),
		mcp.WithString("actionGroup", mcp.Description("Required for ROC responses: The action group from the ROC request")),
		mcp.WithString("function", mcp.Description("Required for ROC responses: The function name from the ROC request")),
	)

	return tool
}

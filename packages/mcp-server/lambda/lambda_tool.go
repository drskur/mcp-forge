package lambda

import (
	"github.com/mark3labs/mcp-go/mcp"
	"mcp-server/tool"
)

func NewAwsLambdaTool(name string, description string, schema tool.InputSchema) mcp.Tool {
	options := tool.GetToolOptions(schema)

	return mcp.NewTool(name,
		append(
			[]mcp.ToolOption{mcp.WithDescription(description)},
			options...,
		)...,
	)
}

package tool

import (
	"github.com/mark3labs/mcp-go/mcp"
)

// InputType represents the type of input parameter
type InputType string

const (
	InputTypeString InputType = "string"
	InputTypeNumber InputType = "number"
	InputTypeBool   InputType = "boolean"
	InputTypeArray  InputType = "array"
	InputTypeEnum   InputType = "enum"
)

type InputItem struct {
	Name        string
	Description string
	Required    bool
	Type        InputType
	Enum        *[]string
}

type InputSchema = []InputItem

func (im *InputItem) NewToolOption() mcp.ToolOption {
	var tool mcp.ToolOption
	options := []mcp.PropertyOption{
		mcp.Description(im.Description),
	}
	if im.Required {
		options = append(options, mcp.Required())
	}

	switch im.Type {
	case InputTypeString:
		tool = mcp.WithString(im.Name, options...)
	case InputTypeNumber:
		tool = mcp.WithNumber(im.Name, options...)
	case InputTypeBool:
		tool = mcp.WithBoolean(im.Name, options...)
	case InputTypeArray:
		tool = mcp.WithArray(im.Name, options...)
	case InputTypeEnum:
		options = append(options, mcp.Enum(*im.Enum...))
		tool = mcp.WithArray(im.Name, options...)
	}

	return tool
}

func GetToolOptions(is InputSchema) []mcp.ToolOption {
	var options []mcp.ToolOption
	for _, item := range is {
		options = append(options, item.NewToolOption())
	}
	return options
}

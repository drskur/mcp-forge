package main

import (
	"github.com/mark3labs/mcp-go/server"
	"log"
	"mcp-server/bedrock"
	"mcp-server/lambda"
	"mcp-server/tool"
	"net/http"
)

func main() {

	http.HandleFunc("/bedrock/mcp", func(writer http.ResponseWriter, request *http.Request) {
		s := server.NewMCPServer("DEMO", "1.0.0",
			server.WithToolCapabilities(true),
		)

		agentTool := bedrock.NewBedrockAgentTool(
			"hr-assistant",
			"This bedrock agent provides answers to a variety of questions about hr issues(day off, etc).",
		)
		s.AddTool(agentTool, bedrock.NewAgentToolHandlerFunc("ECWOH4L8FW", "ODSAIZJ6UW", "us-east-1"))

		ss := server.NewStreamableHTTPServer(s)
		ss.ServeHTTP(writer, request)
	})

	http.HandleFunc("/lambda/mcp", func(writer http.ResponseWriter, request *http.Request) {
		s := server.NewMCPServer("HR Assistant", "1.0.0",
			server.WithToolCapabilities(true),
		)

		timeOffTool := lambda.NewAwsLambdaTool(
			"get_time_off",
			"HR Assistant tool for retrieving current time off balance. This tool queries and returns the remaining days for annual leave.",
			[]tool.InputItem{},
		)
		getTimeOffCustom := map[string]interface{}{
			"actionGroup": "GetTimeOff",
			"function":    "McpForge",
		}
		s.AddTool(timeOffTool, lambda.NewAwsLambdaHandlerFunc("us-east-1", "HrAssistantActionGroup", getTimeOffCustom))

		requestTimeOffTool := lambda.NewAwsLambdaTool(
			"RequestTimeOff",
			"HR Assistant tool for submitting time off requests. This tool allows employees to request annual leave by specifying the number of days and start date. The request will be processed through the HR system for approval.",
			[]tool.InputItem{
				{
					Name:        "number_of_days",
					Description: "The number of days user wants to request off",
					Required:    true,
					Type:        tool.InputTypeNumber,
					Enum:        nil,
				},
				{
					Name:        "start_date",
					Description: "The date that time off starts",
					Required:    true,
					Type:        tool.InputTypeString,
					Enum:        nil,
				},
			},
		)
		requestTimeOffCustom := map[string]interface{}{
			"actionGroup": "RequestTimeOff",
			"function":    "McpForge",
		}
		s.AddTool(requestTimeOffTool, lambda.NewAwsLambdaHandlerFunc("us-east-1", "HrAssistantActionGroup", requestTimeOffCustom))

		ss := server.NewStreamableHTTPServer(s)
		ss.ServeHTTP(writer, request)
	})

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal(err)
	}

}

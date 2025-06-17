package main

import (
	"github.com/mark3labs/mcp-go/server"
	"log"
	"mcp-server/bedrock"
	"net/http"
)

func main() {
	s := server.NewMCPServer("DEMO", "1.0.0",
		server.WithToolCapabilities(true),
		server.WithPromptCapabilities(true),
	)

	tool := bedrock.NewBedrockAgentTool(
		"hr-assistant",
		"This bedrock agent provides answers to a variety of questions about hr issues(day off, etc).",
	)
	s.AddTool(tool, bedrock.NewAgentToolHandlerFunc("ECWOH4L8FW", "ODSAIZJ6UW", "us-east-1"))

	ss := server.NewStreamableHTTPServer(s)

	http.HandleFunc("/mcp", ss.ServeHTTP)

	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		log.Fatal(err)
	}

}

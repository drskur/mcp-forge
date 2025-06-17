package bedrock

import (
	"context"
	"fmt"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/bedrockagentruntime"
	"github.com/aws/aws-sdk-go-v2/service/bedrockagentruntime/types"
)

type AgentResponse struct {
	Text              string
	HasReturnControl  bool
	ReturnControlInfo string
	InvocationInputs  []types.InvocationInputMember
	InvocationId      string // Store invocation ID for ROC
	ActionGroup       string // Store action group for ROC
	Function          string // Store function name for ROC
}

type InvokeOptions struct {
	IsROCResponse bool
	UserInput     string
	InvocationId  string
	ActionGroup   string
	Function      string
}

func invokeAgent(ctx context.Context, agentID, agentAliasID, sessionID, inputText, region string) (*AgentResponse, error) {
	return invokeAgentWithOptions(ctx, agentID, agentAliasID, sessionID, inputText, region, nil)
}

func invokeAgentWithOptions(ctx context.Context, agentID, agentAliasID, sessionID, inputText, region string, opts *InvokeOptions) (*AgentResponse, error) {
	cfg, err := config.LoadDefaultConfig(ctx,
		config.WithRegion(region),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to load AWS config: %w", err)
	}

	client := bedrockagentruntime.NewFromConfig(cfg)

	input := &bedrockagentruntime.InvokeAgentInput{
		AgentId:      aws.String(agentID),
		AgentAliasId: aws.String(agentAliasID),
		SessionId:    aws.String(sessionID),
		InputText:    aws.String(inputText),
	}

	// Add sessionState for ROC response
	if opts != nil && opts.IsROCResponse && opts.InvocationId != "" {
		// Create the return control invocation results
		// According to AWS docs, we need to provide the user's response as a result
		// Create function result based on user's response
		functionResult := &types.InvocationResultMemberMemberFunctionResult{
			Value: types.FunctionResult{
				ActionGroup: aws.String(opts.ActionGroup),
				Function:    aws.String(opts.Function),
				ResponseBody: map[string]types.ContentBody{
					"TEXT": {Body: aws.String(inputText)},
				},
			},
		}

		sessionState := &types.SessionState{
			InvocationId:                   aws.String(opts.InvocationId),
			ReturnControlInvocationResults: []types.InvocationResultMember{functionResult},
		}

		// Note: The exact structure of ReturnControlInvocationResults depends on
		// how the agent's action group is configured. This is a simplified version.
		// You may need to adjust based on your specific agent configuration.

		input.SessionState = sessionState
		log.Printf("ROC Response with sessionState - InvocationId: %s", opts.InvocationId)
	}

	output, err := client.InvokeAgent(ctx, input)
	if err != nil {
		return nil, fmt.Errorf("failed to invoke agent: %w", err)
	}

	response := &AgentResponse{
		Text:              "",
		HasReturnControl:  false,
		ReturnControlInfo: "",
	}

	eventStream := output.GetStream()
	defer func(eventStream *bedrockagentruntime.InvokeAgentEventStream) {
		err := eventStream.Close()
		if err != nil {
			log.Print(err)
		}
	}(eventStream)

	for event := range eventStream.Events() {
		switch v := event.(type) {
		case *types.ResponseStreamMemberChunk:
			if v.Value.Bytes != nil {
				response.Text += string(v.Value.Bytes)
			}
		case *types.ResponseStreamMemberReturnControl:
			response.HasReturnControl = true
			// Store invocation ID and inputs for next call
			if v.Value.InvocationId != nil {
				response.InvocationId = *v.Value.InvocationId
			}

			if v.Value.InvocationInputs != nil && len(v.Value.InvocationInputs) > 0 {
				response.InvocationInputs = v.Value.InvocationInputs
				response.ReturnControlInfo = "Human approval or input is required to continue"

				// Extract action group and function from invocation inputs
				for _, input := range v.Value.InvocationInputs {
					log.Printf("ROC InvocationInput type: %T", input)

					// Try to extract ActionGroup and Function based on input type
					switch inp := input.(type) {
					case *types.InvocationInputMemberMemberFunctionInvocationInput:
						if inp.Value.ActionGroup != nil {
							response.ActionGroup = *inp.Value.ActionGroup
							log.Printf("Found ActionGroup: %s", response.ActionGroup)
						}
						if inp.Value.Function != nil {
							response.Function = *inp.Value.Function
							log.Printf("Found Function: %s", response.Function)
						}
					default:
						log.Printf("Unknown InvocationInput type: %T", inp)
					}
				}
			}
		case *types.ResponseStreamMemberTrace:
			// Handle trace if needed
		case *types.ResponseStreamMemberFiles:
			// Handle files if needed
		}
	}

	if err := eventStream.Err(); err != nil {
		return nil, fmt.Errorf("error processing event stream: %w", err)
	}

	return response, nil
}

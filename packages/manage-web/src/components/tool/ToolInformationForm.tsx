import { Component, Setter } from "solid-js";
import {
  TextFieldRoot,
  TextFieldLabel,
  TextField,
} from "@/components/ui/textfield";
import { TextArea } from "@/components/ui/textarea";

interface ToolInformationFormProps {
  name: string;
  setName: Setter<string>;
  description: string;
  setDescription: Setter<string>;
}

export const ToolInformationForm: Component<ToolInformationFormProps> = (props) => {
  return (
    <div class="rounded-lg border bg-card">
      <div class="p-6 space-y-6">
        <div>
          <h2 class="text-lg font-semibold mb-4">Tool Information</h2>
          <p class="text-muted-foreground mb-6">
            Provide basic information about your tool.
          </p>
        </div>

        <div class="grid grid-cols-1 gap-6">
          <TextFieldRoot>
            <TextFieldLabel>Name</TextFieldLabel>
            <TextField
              value={props.name}
              onInput={e => props.setName(e.currentTarget.value)}
              placeholder="Enter tool name"
            />
          </TextFieldRoot>

          <TextFieldRoot>
            <TextFieldLabel>Description</TextFieldLabel>
            <TextArea
              value={props.description}
              onInput={e => props.setDescription(e.currentTarget.value)}
              placeholder="Describe what this tool does"
              rows={4}
            />
          </TextFieldRoot>
        </div>
      </div>
    </div>
  );
};
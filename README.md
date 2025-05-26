# AI CLI Integration

A powerful CLI tool that integrates [aichat](https://github.com/sigoden/aichat), [llm-functions](https://github.com/sigoden/llm-functions), [argc](https://github.com/sigoden/argc), and [jq](https://github.com/jqlang/jq) for enhanced AI-powered command-line interactions.

## Features

- **Chat with AI**: Interact with AI models directly from the command line
- **Function Calling**: Execute tools and operations using AI's function calling capability
- **Agent Support**: Use specialized AI agents for specific tasks
- **JSON Processing**: Process and transform JSON data using jq
- **Command-line Interface**: Built with TypeScript and proper CLI structure

## Prerequisites

Before using this tool, you need to have the following installed:

- [Node.js](https://nodejs.org/) (v14 or later)
- [aichat](https://github.com/sigoden/aichat)
- [argc](https://github.com/sigoden/argc)
- [jq](https://github.com/jqlang/jq)
- [llm-functions](https://github.com/sigoden/llm-functions) (setup and configured)

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-cli-integration.git
cd ai-cli-integration

# Install dependencies
npm install

# Build the project
npm run build

# Link the CLI tool globally
npm link
```

## Configuration

Create a `.env` file based on the `.env.example` template:

```
# AI Chat Configuration
OPENAI_API_KEY=your_openai_api_key_here
AICHAT_MODEL=gpt-4-turbo

# llm-functions Configuration
LLM_FUNCTIONS_DIR=path/to/llm-functions

# Log Level
LOG_LEVEL=info
```

Initialize the configuration:

```bash
aicli init
```

## Usage

### Basic Chat

```bash
# Start a chat with AI
aicli chat "Tell me about TypeScript"

# Use a specific model
aicli chat -m gpt-4-turbo "What's new in Node.js 18?"

# Set a custom system prompt
aicli chat -s "You are a helpful assistant specialized in JavaScript" "How do I use async/await?"
```

### Function Execution

```bash
# Execute a tool with parameters
aicli tool -n get_current_weather -p '{"location":"New York"}'

# Process the result with jq
aicli tool -n get_current_weather -p '{"location":"New York"}' -j '.temperature'
```

### Using Agents

```bash
# Use the todo agent
aicli agent -n todo "List all my todos"

# Use the coder agent with a specific model
aicli agent -n coder -m gpt-4-turbo "Create a React component for a contact form"
```

### JSON Processing

```bash
# Process JSON data with jq
echo '{"name":"John","age":30,"skills":["JavaScript","TypeScript"]}' | aicli jq -f '.skills[]'

# Process a file and extract specific data
aicli jq -f '.users[] | select(.active)' -i "$(cat users.json)"
```

### Checking Dependencies

```bash
# Check if all dependencies are properly installed and configured
aicli check
```

## API Usage

You can also use the project programmatically:

```typescript
import { AIChatService } from 'ai-cli-integration';

async function main() {
  const chatService = new AIChatService({
    model: 'gpt-4-turbo',
    temperature: 0.7,
  });
  
  const response = await chatService.sendMessage('Hello, how are you?');
  console.log(response.data);
}

main().catch(console.error);
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
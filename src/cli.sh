#!/usr/bin/env bash
set -e

# @describe AI-powered CLI tool integrating aichat, llm-functions, argc, and jq
# @flag -v --verbose Print more information
# @flag --debug Enable debug mode

# @cmd Start a chat with AI
# @option -m --model <model> AI model to use
# @option -t --temperature <num> Temperature for response generation
# @option -f --functions-dir <dir> Path to llm-functions directory
# @option -s --system <prompt> System prompt to use
# @arg message The message to send to the AI
chat() {
  node dist/index.js chat "$@"
}

# @cmd Execute an llm-functions tool
# @option -n --name! <name> Tool name to execute
# @option -f --functions-dir <dir> Path to llm-functions directory
# @option -p --params <json> Parameters for the tool in JSON format
# @option -j --jq <filter> JQ filter to apply to the result
tool() {
  node dist/index.js tool "$@"
}

# @cmd Use an llm-functions agent
# @option -n --name! <name> Agent name to use
# @option -f --functions-dir <dir> Path to llm-functions directory
# @option -m --model <model> AI model to use
# @arg message! The message to send to the agent
agent() {
  node dist/index.js agent "$@"
}

# @cmd Process JSON data with jq
# @option -f --filter! <filter> JQ filter expression
# @option -i --input <json> JSON input data (string)
# @option -r --raw-output Output raw strings, not JSON texts
# @option -s --slurp Treat input as array of JSON objects
jq_filter() {
  node dist/index.js jq "$@"
}

# @cmd Initialize configuration
# @option -c --config <path> Path to configuration file
init() {
  node dist/index.js init "$@"
}

# @cmd List available llm-functions tools
# @option -f --functions-dir <dir> Path to llm-functions directory
# @option --json Output as JSON
list_tools() {
  node dist/index.js list-tools "$@"
}

# @cmd List available llm-functions agents
# @option -f --functions-dir <dir> Path to llm-functions directory
# @option --json Output as JSON
list_agents() {
  node dist/index.js list-agents "$@"
}

# @cmd Check required dependencies and configuration
# @option -f --functions-dir <dir> Path to llm-functions directory
check() {
  node dist/index.js check "$@"
}

# See more details at https://github.com/sigoden/argc
eval "$(argc --argc-eval "$0" "$@")"
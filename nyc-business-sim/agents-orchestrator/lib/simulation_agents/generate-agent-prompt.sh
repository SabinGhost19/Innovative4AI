#!/bin/bash

# 🤖 Agent Implementation Prompt Generator
# Usage: ./generate-agent-prompt.sh <agent-name>
# Example: ./generate-agent-prompt.sh market-context-agent

set -e

AGENT_NAME=$1

if [ -z "$AGENT_NAME" ]; then
    echo "❌ Error: Agent name required"
    echo ""
    echo "Usage: ./generate-agent-prompt.sh <agent-name>"
    echo ""
    echo "Available agents:"
    echo "  - market-context-agent"
    echo "  - supplier-agent"
    echo "  - competition-agent"
    echo "  - customer-behavior-agent"
    echo "  - employee-agent"
    echo "  - financial-agent"
    echo "  - report-agent"
    echo ""
    exit 1
fi

# Validate agent name
valid_agents=("market-context-agent" "supplier-agent" "competition-agent" "customer-behavior-agent" "employee-agent" "financial-agent" "report-agent")

if [[ ! " ${valid_agents[@]} " =~ " ${AGENT_NAME} " ]]; then
    echo "❌ Error: Invalid agent name: $AGENT_NAME"
    echo ""
    echo "Valid agents: ${valid_agents[@]}"
    exit 1
fi

# Output file
OUTPUT_FILE="PROMPT_FOR_${AGENT_NAME}.md"

echo "🤖 Generating implementation prompt for: $AGENT_NAME"
echo "📁 Output file: $OUTPUT_FILE"
echo ""

# Read the base template
TEMPLATE_FILE="LLM_IMPLEMENTATION_PROMPT.md"

if [ ! -f "$TEMPLATE_FILE" ]; then
    echo "❌ Error: Template file not found: $TEMPLATE_FILE"
    exit 1
fi

# Read ARCHITECTURE.md
ARCHITECTURE_FILE="ARCHITECTURE.md"

if [ ! -f "$ARCHITECTURE_FILE" ]; then
    echo "❌ Error: ARCHITECTURE.md not found"
    exit 1
fi

# Create the prompt
cat > "$OUTPUT_FILE" << 'EOF'
# 🚀 IMPLEMENTATION PROMPT - Ready to Copy to Claude Sonnet 4.5

Copy everything below this line and paste into Claude.

---

EOF

# Replace {AGENT_NAME} in template and append
sed "s/{AGENT_NAME}/$AGENT_NAME/g" "$TEMPLATE_FILE" >> "$OUTPUT_FILE"

echo "✅ Prompt generated successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Open: $OUTPUT_FILE"
echo "2. Copy the entire content"
echo "3. Paste into Claude Sonnet 4.5"
echo "4. Attach ARCHITECTURE.md when asked"
echo "5. Claude will generate the complete agent implementation!"
echo ""
echo "🎯 Agent to implement: $AGENT_NAME"
echo ""

# Display file size
FILE_SIZE=$(wc -c < "$OUTPUT_FILE")
echo "📊 Prompt size: $FILE_SIZE bytes"

echo ""
echo "🔥 Ready to ship! Copy from $OUTPUT_FILE and paste to Claude."

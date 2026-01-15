#!/bin/sh

# 加载环境配置
. ./scripts/setup-env.sh

echo "🔍 Running TypeScript type check..."
bunx tsgo --incremental --noEmit
EXIT_CODE=$?

if [ $EXIT_CODE -ne 0 ]; then
  echo ""
  echo "❌ TypeScript type check failed. Please fix the errors above before pushing."
  exit $EXIT_CODE
fi

echo "✅ TypeScript type check passed."


#!/bin/bash

# Schema Element Editor 开发构建脚本
# 确保使用开发模式构建（保留 console 和调试开关）

set -e

echo "🔨 开始开发模式构建..."

# 确保是开发模式
echo "🔧 确保开发模式..."
sed -i '' 's/const IS_RELEASE_BUILD = true/const IS_RELEASE_BUILD = false/' vite.config.ts

# 执行构建
echo "📦 构建中..."
npx vite build

echo "✅ 构建完成！"


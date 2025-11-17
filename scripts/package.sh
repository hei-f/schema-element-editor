#!/bin/bash

# Schema Editor 打包脚本
# 用于创建可分发的插件包

set -e  # 遇到错误立即退出

echo "🚀 开始打包 Schema Editor..."

# 获取版本号
VERSION=$(grep '"version"' src/manifest.json | sed 's/.*"version": "\(.*\)".*/\1/')
echo "📦 版本号: v$VERSION"

# 清理并构建生产版本
echo "🧹 清理旧文件..."
rm -rf dist

echo "🔨 构建生产版本..."
npm run build

# 创建发布目录
RELEASE_DIR="releases"
mkdir -p "$RELEASE_DIR"

# 打包 dist 目录
PACKAGE_NAME="SchemaEditor-v${VERSION}"
ZIP_FILE="${RELEASE_DIR}/${PACKAGE_NAME}.zip"

echo "📦 打包文件..."
cd dist
zip -r "../${ZIP_FILE}" . -x "*.DS_Store"
cd ..

echo ""
echo "✅ 打包完成！"
echo "📁 输出文件: ${ZIP_FILE}"
echo ""
echo "📋 下一步："
echo "  1. 将 ${ZIP_FILE} 分享给用户"
echo "  2. 附上 INSTALL.md 安装说明"
echo ""
echo "🌐 发布到 Chrome Web Store:"
echo "  https://chrome.google.com/webstore/devconsole"
echo ""


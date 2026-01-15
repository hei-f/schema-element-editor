#!/bin/sh

# 环境设置脚本
# 用于在各种脚本中加载必要的环境配置（如 NVM）
# 使用方式: . ./scripts/setup-env.sh

# 加载 NVM 环境
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

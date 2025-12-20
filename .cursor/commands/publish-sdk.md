# Host-SDK NPM包发布流程

这是 `@schema-element-editor/host-sdk` npm包的发布流程，与Chrome插件发布流程独立。

你现在需要执行此发布流程。

## ⚠️ 强制执行规则

**禁止跳过任何步骤**。本发布流程的每个步骤都是必须执行的，不允许以任何理由跳过：

1. **顺序执行**：必须严格按照步骤 1 → 2 → 3 → ... → 11 的顺序执行
2. **完整执行**：每个步骤内的所有子步骤也必须完整执行，不能遗漏
3. **显式确认**：每完成一个主要步骤，必须在输出中明确标记 `✓ 步骤 X 完成`
4. **异常处理**：如果某个步骤无法执行，必须明确说明原因并标记为 `○ 步骤 X 跳过（原因：...）`
5. **禁止合并**：不允许将多个步骤合并执行或同时进行

## 发布流程步骤

### 1. 前置检查

**1.1 检查git工作区状态**

- 执行 `git status`
- 确认是否有未提交的改动，如有则在步骤2中进行原子化提交

**1.2 检查npm登录状态**

- 执行 `npm whoami`
- 如果未登录，提示用户执行 `npm login` 后再继续

**1.3 确认发布范围**

- 确认本次发布仅涉及 `packages/schema-element-editor-sdk` 目录下的改动
- 如果存在插件核心代码改动，提示用户先执行插件发布流程

### 2. 分析并原子化提交SDK改动

**2.1 分析工作区改动**

- 使用 `git status` 查看 `packages/schema-element-editor-sdk` 目录下的未提交文件
- 使用 `git diff packages/schema-element-editor-sdk` 分析具体改动内容
- 识别改动类型（新功能、bug修复、代码重构、性能优化等）

**2.2 原子化分组**

将SDK相关改动按照**原子化提交原则**进行分组：

- **原子化标准**：每组改动应聚焦于单一具体功能或改动点
- **重要**：暂时忽略版本号文件（packages/schema-element-editor-sdk/package.json中的version字段），版本号将在步骤5中单独提交
- **输出格式**：对每个提交组，明确列出：
  - 提交组编号
  - 功能描述
  - 涉及的文件及具体行号范围

**2.3 逐组提交功能改动**

按分组顺序，依次提交每组改动：

1. **生成commit message**，遵循以下规范：
   - **格式**：`{类型前缀}(sdk): {具体改动描述}`
   - **类型前缀**：feat / fix / refactor / perf / docs / style / test / chore
   - **示例**：`feat(sdk): 新增Vue composable支持`

2. **执行提交**：
   - `git add {文件路径}`
   - `git commit -m "{message}"`

3. **验证提交结果**：
   - 使用 `git show HEAD` 查看刚才的提交内容

### 3. 测试验证与质量检查

**3.1 TypeScript 类型检查**

- 进入SDK目录：`cd packages/schema-element-editor-sdk`
- 执行类型检查：`npx tsgo --noEmit`
- 类型检查必须100%通过
- 如果发现类型错误，**立即终止发布流程**，修复后重新开始

**3.2 构建验证**

- 执行构建命令：`npm run build:sdk`（在项目根目录）
- 确认构建成功，无错误输出
- 检查 `packages/schema-element-editor-sdk/dist` 目录下的产物是否完整

**3.3 完成检查**

```
步骤 3 检查清单：
- [x] 3.1 TypeScript 类型检查完成，错误数：0
- [x] 3.2 构建验证完成，产物完整
✓ 步骤 3 完成，可以进入步骤 4
```

### 4. 版本更新确认与分析

**4.1 分析上次SDK版本tag以来的commit历史**

- 获取当前SDK版本号：从 `packages/schema-element-editor-sdk/package.json` 中读取
- 查找上一个SDK版本tag：执行 `git tag -l "schema-element-editor-sdk-v*" --sort=-v:refname | head -1`
- 分析commit历史：执行 `git log <上次版本tag>..HEAD --oneline -- packages/schema-element-editor-sdk`
- 如果是首次发布或找不到tag，则分析所有SDK相关commit

**4.2 根据commit内容推荐版本更新级别**

根据**语义化版本规范**分析：

- **major（主版本）**：存在 BREAKING CHANGE 或不兼容的API变更
- **minor（次版本）**：存在 `feat:` 类型的新功能
- **patch（修订版本）**：仅有 `fix:` 或 `perf:` 类型的修复
- **注意**：如果检测到tag冲突（当前版本tag已存在但有新commit），必须强制更新版本号

**4.3 向用户确认版本更新**

- 列出自上次版本以来的所有SDK相关commit
- **检查tag冲突**：
  - 执行 `git log --oneline --decorate -- packages/schema-element-editor-sdk | head -10`
  - 如果当前版本号的tag已存在且指向不同的commit：
    - ⚠️ **警告**：检测到版本号冲突
    - 显示：`schema-element-editor-sdk-v{当前版本} tag指向: {旧commit hash}`
    - 显示：`当前HEAD位于: {新commit hash}`
    - 显示：`自tag以来SDK新增了 {N} 个commit`
    - **强制要求**：必须更新版本号（不允许选择"保持版本号不变"）
- 给出版本更新建议（major/minor/patch）
- 询问用户确认：
  - **接受建议**：按推荐的版本级别更新
  - **自定义**：用户指定版本级别（major/minor/patch）
  - **不更新版本**：仅当无tag冲突且无重要功能变更时可选
- 在得到用户明确的回答之后再执行后续步骤

### 5. 更新版本号（如需要）

更新 `packages/schema-element-editor-sdk/package.json` 中的 `version` 字段：

- 版本号格式：`major.minor.patch`（如 `1.2.3`）

### 6. 更新CHANGELOG（可选）

如果SDK目录下存在 `CHANGELOG.md`：

- 在文件顶部添加新版本的更新记录
- 格式：

  ```markdown
  ## [x.x.x] - YYYY-MM-DD

  ### Added

  - 新增功能描述

  ### Fixed

  - 修复问题描述

  ### Changed

  - 变更描述
  ```

### 7. 构建SDK

执行构建命令：`npm run build:sdk`

- 确认构建成功
- 检查 `packages/schema-element-editor-sdk/dist` 目录产物完整性：
  - `index.js`, `index.cjs`, `index.d.ts`
  - `core.js`, `core.cjs`, `core.d.ts`
  - `react.js`, `react.cjs`, `react.d.ts`
  - `vue.js`, `vue.cjs`, `vue.d.ts`

### 8. 提交版本号改动

```bash
git add packages/schema-element-editor-sdk/package.json
git commit -m "chore(sdk): release v{版本号}"
```

如果有CHANGELOG改动：

```bash
git add packages/schema-element-editor-sdk/CHANGELOG.md
git commit -m "docs(sdk): 更新CHANGELOG"
```

### 9. 发布到npm

执行发布命令：

```bash
npm run publish:sdk
```

- 该命令会自动执行 `prepublishOnly` 钩子进行构建
- 发布到npm registry（@schema-element-editor scope，public access）
- 如果发布失败，检查：
  - npm登录状态
  - 版本号是否已存在
  - 网络连接

### 10. 推送到远程并创建Tag

**10.1 推送commits**

```bash
git push
```

**10.2 检查tag状态**

- 检查当前SDK版本的tag是否已存在：`git tag -l "schema-element-editor-sdk-v{版本号}"`
- 如果tag已存在：
  - 检查tag指向：`git rev-parse "schema-element-editor-sdk-v{版本号}"`，并与 `git rev-parse HEAD` 的结果对比
  - 如果tag不在当前HEAD：
    - ⚠️ **错误**：tag已存在但指向不同commit，这不应该发生
    - 说明：步骤4应该已强制更新版本号
    - **操作**：终止流程，返回步骤4重新检查并更新版本号
  - 如果tag正好在当前HEAD：
    - 说明：tag已经存在且位置正确
    - **操作**：跳过tag创建，继续步骤11

**10.3 创建并推送新tag**

仅当tag不存在时执行：

- Tag命名格式：`schema-element-editor-sdk-v{版本号}`（如 `schema-element-editor-sdk-v1.2.3`）
- 创建tag：`git tag schema-element-editor-sdk-v{版本号}`
- 验证tag创建成功：`git tag -l "schema-element-editor-sdk-v{版本号}"`
- 推送tag：`git push origin schema-element-editor-sdk-v{版本号}`
- 验证tag位置：`git log --oneline --decorate -- packages/schema-element-editor-sdk | head -5`

### 11. 发布总结

向用户展示：

- 本次发布的SDK版本号
- npm包地址：`https://www.npmjs.com/package/@schema-element-editor/host-sdk`
- 改动摘要
- 安装命令：`npm install @schema-element-editor/host-sdk@{版本号}`

## 错误处理

任何步骤失败时：

1. 立即停止后续流程
2. 清晰告知失败的步骤和原因
3. 提供可能的解决建议
4. 等待用户处理后再继续

## 与插件发布的关系

- 本流程独立于Chrome插件发布流程
- 如果SDK改动影响了插件功能，建议先发布SDK，再更新插件依赖后发布插件
- 两者使用不同的Tag命名空间：
  - 插件：`v{版本号}`（如 `v1.17.0`）
  - SDK：`schema-element-editor-sdk-v{版本号}`（如 `schema-element-editor-sdk-v1.0.0`）

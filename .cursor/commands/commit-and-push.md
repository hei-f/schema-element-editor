# commit-and-push

分析工作区的文件改动点，将改动根据其相关功能点进行分类并原子化提交
提交时使用符合规范的中文 Git Commit Message，要求：

1. 遵循以下模板：
   <type>(<scope>): <subject>

<body>

<footer>

2. 注意事项：

- 每行不超过 72 个字符
- Header 必填，Body 和 Footer 可选
- 使用清晰的动词开头
- 提供必要的上下文信息

3. type 类型包括：

- feat: 新功能
- fix: 修复 bug
- docs: 文档更新
- style: 格式调整
- refactor: 重构
- test: 测试相关
- chore: 构建/工具相关

原子化提交完成之后将其push至远端。

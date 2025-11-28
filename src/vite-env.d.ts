/// <reference types="vite/client" />

// 声明 worker 模块导入类型
declare module '*?worker' {
  const workerConstructor: {
    new (): Worker
  }
  export default workerConstructor
}

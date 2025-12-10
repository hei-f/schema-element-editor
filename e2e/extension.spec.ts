import { chromium, expect, test } from '@playwright/test'
import path from 'path'

test.describe('Chrome扩展E2E测试', () => {
  let extensionId: string

  test.beforeAll(async () => {
    // 加载Chrome扩展
    const pathToExtension = path.join(__dirname, '../dist')
    const browserContext = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
      ],
    })

    // 获取扩展ID
    const page = await browserContext.newPage()
    await page.goto('chrome://extensions')

    // 提取扩展ID的逻辑
    // extensionId = ...

    await page.close()
  })

  test('测试页面 - 元素检测', async () => {
    const page = await chromium.launch().then((b) => b.newPage())

    // 打开测试页面
    await page.goto('file://' + path.join(__dirname, '../test/index.html'))

    // 等待页面加载
    await page.waitForSelector('#test-string-1')

    // 模拟按住Alt键
    await page.keyboard.down('Alt')

    // hover到测试元素上
    await page.hover('#test-string-1')

    // 应该显示tooltip
    await expect(page.locator('text=params1:')).toBeVisible()

    await page.keyboard.up('Alt')
  })

  test('测试页面 - 点击元素打开抽屉', async () => {
    const page = await chromium.launch().then((b) => b.newPage())

    await page.goto('file://' + path.join(__dirname, '../test/index.html'))
    await page.waitForSelector('#test-string-1')

    // 按住Alt并点击
    await page.keyboard.down('Alt')
    await page.click('#test-string-1')
    await page.keyboard.up('Alt')

    // 应该打开抽屉
    await expect(page.locator('text=Schema Element Editor')).toBeVisible()

    // 应该显示参数
    await expect(page.locator('text=string-simple')).toBeVisible()
  })

  test('配置页面 - 修改属性名', async () => {
    const page = await chromium.launch().then((b) => b.newPage())

    // 打开配置页面
    await page.goto(`chrome-extension://${extensionId}/src/options/options.html`)

    // 等待页面加载
    await page.waitForSelector('input[placeholder*="schema-params"]')

    // 修改属性名
    await page.fill('input[placeholder*="schema-params"]', 'custom-attr')

    // 点击保存
    await page.click('button:has-text("保存设置")')

    // 应该显示成功消息
    await expect(page.locator('text=设置已保存')).toBeVisible()
  })

  test('编辑器 - 序列化功能', async () => {
    const page = await chromium.launch().then((b) => b.newPage())

    await page.goto('file://' + path.join(__dirname, '../test/index.html'))
    await page.waitForSelector('#test-object-1')

    // 打开抽屉
    await page.keyboard.down('Alt')
    await page.click('#test-object-1')
    await page.keyboard.up('Alt')

    // 等待抽屉打开
    await page.waitForSelector('button:has-text("序列化")')

    // 点击序列化
    await page.click('button:has-text("序列化")')

    // 应该显示成功消息
    await expect(page.locator('text=序列化成功')).toBeVisible()
  })

  test('编辑器 - 反序列化功能', async () => {
    const page = await chromium.launch().then((b) => b.newPage())

    await page.goto('file://' + path.join(__dirname, '../test/index.html'))
    await page.waitForSelector('#test-object-1')

    // 打开抽屉
    await page.keyboard.down('Alt')
    await page.click('#test-object-1')
    await page.keyboard.up('Alt')

    // 先序列化
    await page.click('button:has-text("序列化")')
    await page.waitForTimeout(500)

    // 再反序列化
    await page.click('button:has-text("反序列化")')

    // 应该显示成功消息
    await expect(page.locator('text=反序列化成功')).toBeVisible()
  })

  test('超长参数 - 显示省略和tooltip', async () => {
    const page = await chromium.launch().then((b) => b.newPage())

    await page.goto('file://' + path.join(__dirname, '../test/index.html'))
    await page.waitForSelector('#test-long-param')

    // 打开抽屉
    await page.keyboard.down('Alt')
    await page.click('#test-long-param')
    await page.keyboard.up('Alt')

    // 应该显示省略的参数
    const paramTag = page.locator('.AttributeTag').first()
    await expect(paramTag).toHaveCSS('text-overflow', 'ellipsis')

    // hover应该显示tooltip
    await paramTag.hover()
    await expect(page.locator('[role="tooltip"]')).toBeVisible()
  })

  test('超多参数 - 自动换行', async () => {
    const page = await chromium.launch().then((b) => b.newPage())

    await page.goto('file://' + path.join(__dirname, '../test/index.html'))
    await page.waitForSelector('#test-many-params')

    // 打开抽屉
    await page.keyboard.down('Alt')
    await page.click('#test-many-params')
    await page.keyboard.up('Alt')

    // 应该显示所有10个参数
    for (let i = 1; i <= 10; i++) {
      await expect(page.locator(`text=params${i}:`)).toBeVisible()
    }

    // 格式化按钮应该仍然在右侧可见
    await expect(page.locator('button:has-text("格式化")')).toBeVisible()
  })

  test('无效元素 - 不应该打开抽屉', async () => {
    const page = await chromium.launch().then((b) => b.newPage())

    await page.goto('file://' + path.join(__dirname, '../test/index.html'))
    await page.waitForSelector('#test-invalid')

    // 尝试点击无效元素
    await page.keyboard.down('Alt')
    await page.click('#test-invalid')
    await page.keyboard.up('Alt')

    // 抽屉不应该打开
    await expect(page.locator('text=Schema Element Editor')).not.toBeVisible()
  })
})

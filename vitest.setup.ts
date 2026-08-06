// vitest.setup.ts
// 在每个测试文件之前运行，重置 #imports stub 的共享状态。
//
// 注意：#imports 的真实解析现在走 vitest.config.ts 的 resolve.alias，
// 指向 tests/test-utils/nuxt-imports-stub.ts。这里只需在每个测试前
// 重置 stub 的 cookieStore / mock 调用历史，保持测试隔离。
import { resetNuxtImportsStub } from './tests/test-utils/nuxt-imports-stub'

resetNuxtImportsStub()

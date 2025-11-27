<template>
  <div class="login-container">
    <div class="login-form">
      <h2 class="text-2xl font-bold mb-4">登录</h2>
      <form>
        <div class="mb-4">
          <label for="username" class="block text-sm font-medium text-gray-700">用户名</label>
          <input
            id="username"
            type="text"
            name="username"
            class="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            required
          />
        </div>
        <div class="mb-4">
          <label for="password" class="block text-sm font-medium text-gray-700">密码</label>
          <input
            id="password"
            type="password"
            name="password"
            class="mt-1 p-2 block w-full border border-gray-300 rounded-md"
            required
          />
        </div>
        <button type="submit" class="w-full p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">登录</button>
      </form>
    </div>
  </div>
</template>

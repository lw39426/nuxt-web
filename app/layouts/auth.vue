<template>
  <div
    class="relative min-h-screen bg-[#f7f8fc] text-slate-900 dark:bg-slate-950 dark:text-slate-100 lg:h-screen"
  >
    <div class="flex min-h-screen lg:h-screen">
      <aside
        class="relative hidden lg:flex lg:w-3/5 overflow-hidden border-r border-slate-200/60 dark:border-slate-800"
      >
        <div class="absolute inset-0 bg-[#e9eef8] dark:bg-slate-900" />
        <div
          class="pointer-events-none absolute left-[-260px] top-[14%] h-[760px] w-[980px]"
          style="
            background: linear-gradient(
              154deg,
              rgba(7, 7, 9, 0.082) 30%,
              hsl(var(--primary) / 30%) 48%,
              rgba(7, 7, 9, 0.082) 64%
            );
            -webkit-filter: blur(100px);
            filter: blur(100px);
          "
        />
        <div
          class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(255,255,255,.7),transparent_62%)] dark:bg-[radial-gradient(circle_at_20%_18%,rgba(148,163,184,.12),transparent_62%)]"
        />
        <div
          class="pointer-events-none absolute -left-12 top-[32%] h-7 w-7 rounded-full bg-blue-500/30 blur-sm"
        />
        <div
          class="pointer-events-none absolute left-[30%] top-[28%] h-5 w-10 rounded-full bg-indigo-500/25 blur-sm"
        />

        <div class="relative z-10 flex w-full flex-col px-14 py-8">
          <div class="flex items-center gap-3">
            <div class="i-carbon-smile h-9 w-9 text-blue-600" />
            <NuxtLink
              to="/"
              class="text-2xl font-semibold tracking-tight text-slate-800 dark:text-slate-100"
            >
              CoreDB
            </NuxtLink>
          </div>

          <div class="my-auto flex flex-col items-center text-center">
            <p
              class="mt-12 max-w-[760px] text-[26px] font-semibold leading-[1.15] tracking-tight text-slate-800 dark:text-slate-100"
            >
              一个还行的网站呢
            </p>
            <p class="mt-4 text-[18px] text-slate-600 dark:text-slate-300">哈哈哈哈</p>
          </div>
        </div>
      </aside>

      <main
        class="relative flex w-full flex-col overflow-y-auto bg-white/92 backdrop-blur-sm dark:bg-slate-950/96 lg:w-2/5 lg:overflow-hidden"
      >
        <div class="flex items-center justify-between px-6 pt-5 lg:justify-end lg:px-10 lg:pt-6">
          <div class="flex items-center gap-2 lg:hidden">
            <span class="text-2xl font-semibold tracking-tight text-slate-800 dark:text-slate-100"
              >CoreDB</span
            >
          </div>

          <div
            class="flex items-center gap-2 rounded-full border border-slate-200/80 bg-slate-100/90 p-1.5 dark:border-slate-700 dark:bg-slate-800/80"
          >
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-white hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <span class="i-carbon-language h-4.5 w-4.5" />
            </button>
            <button
              type="button"
              class="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-600 transition hover:bg-white hover:text-blue-600 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <span class="i-carbon-moon h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        <div class="flex min-h-0 flex-1 items-center px-6 pb-6 pt-4 sm:px-10 lg:px-14 lg:pt-3">
          <div class="mx-auto w-full max-w-[430px] lg:max-w-[390px]">
            <slot />
          </div>
        </div>

        <div
          class="px-6 pb-4 text-center text-xs text-slate-500 dark:text-slate-400 lg:px-16 lg:pb-5"
        >
          Copyright © 2024 Vben
        </div>
      </main>
    </div>
  </div>
</template>

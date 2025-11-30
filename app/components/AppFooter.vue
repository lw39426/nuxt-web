<template>
  <footer class="bg-black text-white py-12 md:py-16 border-t border-white/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-12">
        <!-- Brand Column -->
        <div class="col-span-1 lg:col-span-2 flex flex-col gap-6">
          <div class="flex items-center gap-2">
            <div class="h-8 w-8 bg-white rounded-lg flex items-center justify-center text-black">
              <div class="i-carbon-cube w-5 h-5 text-white/90" />
            </div>
            <span class="font-bold text-xl">CoreDB</span>
          </div>
          <p class="text-gray-400 text-sm leading-relaxed max-w-xs">
            The modern way to manage your databases. Deploy, scale, and manage your databases with
            ease.
          </p>
          <div class="flex gap-4">
            <a href="#" class="text-gray-400 hover:text-white transition-colors">
              <div class="i-carbon-logo-x w-5 h-5 text-white/90" />
            </a>
            <a href="#" class="text-gray-400 hover:text-white transition-colors">
              <div class="i-carbon-logo-github w-5 h-5 text-white/90" />
            </a>
          </div>
        </div>

        <!-- Links Columns -->
        <div>
          <h3 class="font-bold text-sm mb-4">Solutions</h3>
          <ul class="flex flex-col gap-3 text-sm text-gray-400">
            <li><a href="#" class="hover:text-white transition-colors">Marketing</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Analytics</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Automation</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Commerce</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Insights</a></li>
          </ul>
        </div>

        <div>
          <h3 class="font-bold text-sm mb-4">Support</h3>
          <ul class="flex flex-col gap-3 text-sm text-gray-400">
            <li><a href="#" class="hover:text-white transition-colors">Submit ticket</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Documentation</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Guides</a></li>
          </ul>
        </div>

        <div>
          <h3 class="font-bold text-sm mb-4">Company</h3>
          <ul class="flex flex-col gap-3 text-sm text-gray-400">
            <li><a href="#" class="hover:text-white transition-colors">About</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Blog</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Jobs</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Press</a></li>
          </ul>
        </div>

        <div>
          <h3 class="font-bold text-sm mb-4">Legal</h3>
          <ul class="flex flex-col gap-3 text-sm text-gray-400">
            <li><a href="#" class="hover:text-white transition-colors">Terms of service</a></li>
            <li><a href="#" class="hover:text-white transition-colors">Privacy policy</a></li>
            <li><a href="#" class="hover:text-white transition-colors">License</a></li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div
        class="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4"
      >
        <p class="text-gray-500 text-sm">© 2025 CoreDB. All rights reserved.</p>
        <button class="text-gray-500 hover:text-white transition-colors">
          <div class="i-carbon-sun w-5 h-5" />
        </button>
      </div>
    </div>
  </footer>
</template>

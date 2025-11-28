<script setup lang="ts">
// 模拟Logo墙数据
const _brands = [
  'Anthropic',
  'Coinbase',
  'Microsoft',
  'Perplexity',
  'HubSpot',
  'X',
  'Cursor',
  'PayPal'
]

const routeLink = [
  {
    name: 'Home',
    link: '/'
  },
  {
    name: 'gsap-performance-test',
    link: '/gsap-performance-test'
  },
  {
    name: 'navbar-60fps-test',
    link: '/navbar-60fps-test'
  },
  {
    name: 'navbar-performance-comparison',
    link: '/navbar-performance-comparison'
  },
  {
    name: 'performance-test',
    link: '/performance-test'
  },
  {
    name: 'navbar-performance-simple',
    link: '/navbar-performance-simple'
  }
]
// 模拟特性数据
const features = [
  {
    badge: 'LLMS.TXT & MCP',
    title: 'Built for both people and AI',
    desc: 'Ensure your product shows up in the AI workflows users already rely on. We support llms.txt, MCP, and whatever comes next.',
    visualType: 'code'
  },
  {
    badge: 'AGENT',
    title: 'Self-updating knowledge management',
    desc: 'Draft, edit, and maintain content with a context-aware agent. Move faster and more consistently without documentation debt.',
    visualType: 'icons'
  }
]
useHead({
  link: [
    { rel: 'preload', as: 'image', href: '/bg-light.svg' },
    { rel: 'preconnect', href: 'https://images.unsplash.com' },
    { rel: 'dns-prefetch', href: 'https://images.unsplash.com' }
  ]
})
</script>

<template>
  <main>
    <AppNavbarLayout />
    <!-- 1. Hero Section -->
    <section class="relative overflow-hidden">
      <!-- 背景模拟：使用渐变模拟天空插画，实际项目中应替换为 CSS background-image: url(...) -->
      <div class="bg-image-hero z-9 select-none pointer-events-none"></div>
      <!-- Overlay gradient to make text readable -->
      <div
        class="flex flex-col items-center justify-center pt-[4.5rem] md:pb-24 pb-[4.5rem] max-md:px-6 dark"
      />

      <div class="relative z-10 section-container text-center">
        <h1
          class="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight mb-6 font-display drop-shadow-md"
        >
          The Intelligent <br />
          Documentation Platform
        </h1>
        <p
          class="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 font-medium drop-shadow-sm"
        >
          Meet the next generation of documentation. AI-native, beautiful out-of-the-box, and built
          for collaboration.
        </p>

        <!-- Email Input Form -->
        <div
          class="max-w-md mx-auto bg-white/20 backdrop-blur-md p-1.5 rounded-full border border-white/30 flex mb-20 shadow-lg"
        >
          <input
            type="email"
            placeholder="Email address"
            class="flex-1 bg-transparent border-none outline-none text-white placeholder-white/70 px-4 text-sm"
          />
          <button
            class="bg-white text-mint-900 px-6 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition"
          >
            Start now
          </button>
        </div>

        <!-- Product Mockup (Browser Window) -->
        <div
          class="relative max-w-5xl mx-auto rounded-xl bg-white shadow-hero border-gray-200 overflow-hidden animate-fade-in-up"
        >
          <!-- Mockup Header -->
          <div class="bg-gray-50 border-b border-gray-100 h-10 flex items-center px-4 gap-2">
            <div class="flex gap-1.5">
              <div class="w-3 h-3 rounded-full bg-red-400/80" />
              <div class="w-3 h-3 rounded-full bg-yellow-400/80" />
              <div class="w-3 h-3 rounded-full bg-green-400/80" />
            </div>
            <div
              class="mx-auto bg-white border border-gray-200 rounded px-3 py-0.5 text-[10px] text-gray-400 flex items-center gap-1 w-64"
            >
              <div class="i-carbon-locked" />
              mintlify.com/docs
            </div>
          </div>
          <!-- Mockup Content (Simplified Image Placeholder) -->
          <div class="bg-white p-0 aspect-[16/9] relative">
            <!-- 实际开发中这里可以使用 img 标签引用你的截图，或者用 HTML 写出那个界面 -->
            <div class="absolute inset-0 flex">
              <!-- Sidebar -->
              <div class="w-64 border-r border-gray-100 p-6 hidden md:block text-left">
                <div class="h-4 w-24 bg-gray-100 rounded mb-8"></div>
                <div class="space-y-3">
                  <div
                    class="h-3 w-full bg-mint-50 text-mint-600 rounded px-2 py-1 text-xs font-bold"
                  >
                    Get Started
                  </div>
                  <div class="h-3 w-32 bg-gray-50 rounded ml-2"></div>
                  <div class="h-3 w-28 bg-gray-50 rounded ml-2"></div>
                </div>
              </div>
              <!-- Main -->
              <div class="flex-1 p-8 text-left">
                <div class="h-8 w-48 bg-gray-100 rounded mb-4"></div>
                <div class="h-4 w-full max-w-lg bg-gray-50 rounded mb-2"></div>
                <div class="h-4 w-3/4 bg-gray-50 rounded mb-8"></div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="bg-gray-50 h-32 rounded-lg border border-gray-100"></div>
                  <div class="bg-gray-50 h-32 rounded-lg border border-gray-100"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. Logos Section -->
    <section class="py-16 bg-white content-visibility-auto">
      <div class="section-container">
        <div
          class="grid grid-cols-2 md:grid-cols-4 gap-12 items-center justify-items-center opacity-60 grayscale hover:grayscale-0 transition duration-500"
        >
          <!-- Mock Logos using text for demo -->
          <NuxtLink
            v-for="brand in routeLink"
            :key="brand.name"
            :to="brand.link"
            class="text-xl font-bold font-display text-gray-800"
          >
            {{ brand.name }}
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- 3. Features Bento Grid -->
    <section class="py-24 bg-gray-50/50 content-visibility-auto">
      <div class="section-container">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-4xl font-bold font-display mb-4">Built for the intelligence age</h2>
          <p class="text-gray-500 text-lg">
            Integrate AI into every part of your docs lifecycle. Woven into how your knowledge is
            written, maintained, and understood.
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          <div
            v-for="(feat, idx) in features"
            :key="idx"
            class="bg-white rounded-3xl p-8 border border-gray-100 shadow-card flex flex-col h-full hover:shadow-lg transition duration-300"
          >
            <div class="mb-6">
              <span class="badge-green">{{ feat.badge }}</span>
            </div>
            <h3 class="text-2xl font-bold mb-3">{{ feat.title }}</h3>
            <p class="text-gray-500 leading-relaxed mb-8">{{ feat.desc }}</p>

            <!-- Visual Mockup Area inside Card -->
            <div
              class="mt-auto bg-gray-50 rounded-xl h-48 border border-gray-100 relative overflow-hidden flex items-center justify-center"
            >
              <div
                v-if="feat.visualType === 'code'"
                class="text-xs font-mono text-gray-400 p-4 w-full"
              >
                <div class="bg-white p-3 rounded shadow-sm border border-gray-200 w-3/4 mx-auto">
                  $ npm install mintlify
                </div>
              </div>
              <div v-else class="flex gap-4">
                <div
                  class="w-10 h-10 rounded-full bg-mint-500 text-white flex items-center justify-center shadow-lg"
                >
                  <div class="i-carbon-checkmark" />
                </div>
                <div
                  class="w-10 h-10 rounded-full bg-mint-500 text-white flex items-center justify-center shadow-lg"
                >
                  <div class="i-carbon-idea" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Assistant Feature (Full Width) -->
        <div
          class="mt-8 bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-card text-center"
        >
          <span class="badge-green mb-4 inline-block">ASSISTANT</span>
          <h3 class="text-3xl font-bold mb-4">Intelligent assistance for your users</h3>
          <p class="text-gray-500 max-w-2xl mx-auto mb-12">
            Turn every documentation visit into a guided conversation.
          </p>

          <!-- Mock UI for Chat -->
          <div
            class="max-w-3xl bg1 mx-auto bg-gray-50 rounded-xl border border-gray-200 p-6 aspect-[2/1] flex items-center justify-center"
          >
            <div
              class="bg-white rounded-full shadow-sm border border-gray-200 px-6 py-3 w-full max-w-md text-left text-gray-400 text-sm flex justify-between"
            >
              <span>Ask AI anything...</span>
              <div class="i-carbon-send-filled text-mint-500" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Enterprise Dark Section -->
    <section class="py-24 bg-white content-visibility-auto">
      <div class="section-container">
        <div class="mb-12">
          <span class="badge-green mb-2 inline-block">ENTERPRISE-REINVENTION</span>
          <h2 class="text-4xl font-bold font-display mb-4">
            Bring intelligence to enterprise knowledge
          </h2>
          <div class="flex justify-between items-end">
            <p class="text-gray-500 max-w-xl">
              Modernize without the rebuild with enterprise-grade professional service & security.
            </p>
            <button class="bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium">
              Explore for enterprise
            </button>
          </div>
        </div>

        <!-- Dark Banner Card -->
        <div
          class="bg-dark-bg rounded-3xl overflow-hidden relative text-white min-h-[500px] flex flex-col md:flex-row"
        >
          <div class="p-12 md:w-1/2 z-10 flex flex-col justify-center">
            <span class="text-xs font-bold tracking-widest uppercase text-gray-400 mb-2"
              >CUSTOMER STORY</span
            >
            <h3 class="text-3xl md:text-4xl font-bold font-display mb-6">
              See how Anthropic accelerates AI development with Mintlify
            </h3>
            <a
              href="#"
              class="flex items-center gap-2 text-mint-500 font-medium hover:text-mint-400"
            >
              Read story
              <div class="i-carbon-arrow-right" />
            </a>

            <div class="mt-16 grid grid-cols-2 gap-12">
              <div>
                <div class="text-4xl font-bold">2M+</div>
                <div class="text-sm text-gray-400 mt-1">Monthly active developers</div>
              </div>
              <div>
                <div class="text-4xl font-bold">3+</div>
                <div class="text-sm text-gray-400 mt-1">Products serviced: Claude API, MCP</div>
              </div>
            </div>
          </div>

          <!-- Artistic visual (Right Side) - Using CSS Gradient/Shape to mimic the Yellow Arch -->
          <div
            class="md:w-1/2 relative min-h-[300px] md:min-h-auto bg-gradient-to-br from-[#1a1d24] to-[#0B0C10]"
          >
            <!-- Abstract Arch Representation -->
            <div
              class="absolute bottom-0 right-10 w-64 h-96 bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-full opacity-90 blur-sm"
            ></div>
            <div class="absolute bottom-0 right-20 w-44 h-80 bg-dark-bg rounded-t-full z-10"></div>
            <!-- Landscape overlay -->
            <div
              class="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80')] mix-blend-overlay opacity-40"
            ></div>
          </div>
        </div>
      </div>
    </section>

    <!-- 5. Customers Carousel -->
    <section class="py-24 content-visibility-auto">
      <div class="section-container">
        <div class="text-center mb-16">
          <span class="text-mint-600 text-xs font-bold tracking-wider uppercase">CUSTOMERS</span>
          <h2 class="text-4xl font-bold font-display mt-2 mb-4">
            Unlock knowledge for any industry
          </h2>
        </div>

        <div class="grid md:grid-cols-3 gap-6">
          <!-- Card 1 -->
          <div class="group cursor-pointer">
            <div class="bg-dark-card rounded-xl aspect-video mb-4 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80"
                class="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition"
                loading="lazy"
                decoding="async"
                fetchpriority="low"
              />
              <div class="absolute inset-0 flex items-center justify-center">
                <h4 class="text-white text-xl font-bold">perplexity</h4>
              </div>
            </div>
            <p class="text-sm text-gray-600 mb-2">
              How Perplexity transformed its documentation...
            </p>
            <span class="text-xs font-medium flex items-center gap-1"
              >Read story
              <div class="i-carbon-chevron-right"
            /></span>
          </div>
          <!-- Card 2 -->
          <div class="group cursor-pointer">
            <div class="bg-dark-card rounded-xl aspect-video mb-4 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80"
                class="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition"
                loading="lazy"
                decoding="async"
                fetchpriority="low"
              />
              <div class="absolute inset-0 flex items-center justify-center">
                <h4 class="text-white text-xl font-bold">CURSOR</h4>
              </div>
            </div>
            <p class="text-sm text-gray-600 mb-2">How Cursor scaled with just 12 employees...</p>
            <span class="text-xs font-medium flex items-center gap-1"
              >Read story
              <div class="i-carbon-chevron-right"
            /></span>
          </div>
          <!-- Card 3 -->
          <div class="group cursor-pointer">
            <div class="bg-dark-card rounded-xl aspect-video mb-4 overflow-hidden relative">
              <img
                src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80"
                class="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition"
                loading="lazy"
                decoding="async"
                fetchpriority="low"
              />
              <div class="absolute inset-0 flex items-center justify-center">
                <h4 class="text-white text-xl font-bold">X</h4>
              </div>
            </div>
            <p class="text-sm text-gray-600 mb-2">
              How X is using Mintlify to power the developer experience...
            </p>
            <span class="text-xs font-medium flex items-center gap-1"
              >Read story
              <div class="i-carbon-chevron-right"
            /></span>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. Bottom CTA -->
    <section class="py-24 bg-white text-center">
      <div class="section-container">
        <h2 class="text-4xl md:text-5xl font-bold font-display mb-6">
          Make documentation your <br />
          winning advantage
        </h2>
        <p class="text-gray-500 mb-10">
          Join the leaders of tomorrow to future proof your documentation today.
        </p>
        <div class="flex justify-center gap-4">
          <button
            class="bg-black text-white px-8 py-3 rounded-full font-medium hover:scale-105 transition"
          >
            Get started for free
          </button>
          <button
            class="bg-white border border-gray-200 text-gray-900 px-8 py-3 rounded-full font-medium hover:bg-gray-50 transition"
          >
            Get a demo
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.content-visibility-auto {
  content-visibility: auto;
  contain-intrinsic-size: 1px 800px;
}
.bg-image-hero {
  background-image: url('/bg-light.svg');
  background-position: 50%;
  background-repeat: no-repeat;
  background-size: cover;
  width: 100%;
  height: 90%;
  position: absolute;
  top: -10rem;
  -webkit-mask-image: linear-gradient(
    #000 0%,
    rgba(0, 0, 0, 0.99) 18.5%,
    rgba(0, 0, 0, 0.953) 34.3%,
    rgba(0, 0, 0, 0.894) 47.6%,
    rgba(0, 0, 0, 0.824) 58.5%,
    rgba(0, 0, 0, 0.74) 67.5%,
    rgba(0, 0, 0, 0.647) 74.7%,
    rgba(0, 0, 0, 0.55) 80.3%,
    rgba(0, 0, 0, 0.45) 84.7%,
    rgba(0, 0, 0, 0.353) 88%,
    rgba(0, 0, 0, 0.26) 90.5%,
    rgba(0, 0, 0, 0.176) 92.5%,
    rgba(0, 0, 0, 0.106) 94.2%,
    rgba(0, 0, 0, 0.047) 95.9%,
    rgba(0, 0, 0, 0.01) 97.7%,
    transparent 100%
  );
  mask-image: linear-gradient(
    #000 0%,
    rgba(0, 0, 0, 0.99) 18.5%,
    rgba(0, 0, 0, 0.953) 34.3%,
    rgba(0, 0, 0, 0.894) 47.6%,
    rgba(0, 0, 0, 0.824) 58.5%,
    rgba(0, 0, 0, 0.74) 67.5%,
    rgba(0, 0, 0, 0.647) 74.7%,
    rgba(0, 0, 0, 0.55) 80.3%,
    rgba(0, 0, 0, 0.45) 84.7%,
    rgba(0, 0, 0, 0.353) 88%,
    rgba(0, 0, 0, 0.26) 90.5%,
    rgba(0, 0, 0, 0.176) 92.5%,
    rgba(0, 0, 0, 0.106) 94.2%,
    rgba(0, 0, 0, 0.047) 95.9%,
    rgba(0, 0, 0, 0.01) 97.7%,
    transparent 100%
  );
}
.bg1 {
  background-image: url('https://www.mintlify.com/_next/image?url=%2Fcustomers%2Ftogetherai.png&w=1080&q=75');
  background-position: 50%;
  background-repeat: no-repeat;
  background-size: cover;
}
/* 简单的淡入上浮动画 */
.animate-fade-in-up {
  animation: fadeInUp 0.8s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>

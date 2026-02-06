<script setup lang="ts">
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
</script>

<template>
  <section class="py-18 dark:bg-home-black content-visibility-auto">
    <div class="section-container">
      <div class="text-center max-w-3xl mx-auto mb-16">
        <h2 class="text-4xl font-bold font-display mb-4">Built for the intelligence age</h2>
        <p class="text-gray-500 dark:text-home-gray text-lg">
          Integrate AI into every part of your docs lifecycle. Woven into how your knowledge is
          written, maintained, and understood.
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-8">
        <div
          v-for="(feat, idx) in features"
          :key="idx"
          class="bg-white dark:bg-dark-card rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-card flex flex-col h-full hover:shadow-lg transition duration-300"
        >
          <div class="mb-6">
            <span class="badge-green">{{ feat.badge }}</span>
          </div>
          <h3 class="text-2xl font-bold mb-3">{{ feat.title }}</h3>
          <p class="text-gray-500 dark:text-home-gray leading-relaxed mb-8">{{ feat.desc }}</p>

          <!-- Visual Mockup Area inside Card -->
          <div
            class="mt-auto bg-gray-50 dark:bg-[#202327] rounded-xl h-48 border border-gray-100 dark:border-gray-600 relative overflow-hidden flex items-center justify-center"
          >
            <div
              v-if="feat.visualType === 'code'"
              class="text-xs font-mono text-gray-400 p-4 w-full"
            >
              <div
                class="bg-white dark:bg-home-black p-3 rounded shadow-sm border border-gray-200 dark:border-gray-700 w-3/4 mx-auto"
              >
                $ npm install mintlify
              </div>
            </div>
            <div v-else class="flex gap-4">
              <div
                class="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg"
              >
                <div class="i-carbon-checkmark" />
              </div>
              <div
                class="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg"
              >
                <div class="i-carbon-idea" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Assistant Feature (Full Width) -->
      <div
        class="mt-8 bg-white dark:bg-dark-card rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-gray-700 shadow-card text-center"
      >
        <span class="badge-green mb-4 inline-block">ASSISTANT</span>
        <h3 class="text-3xl font-bold mb-4">Intelligent assistance for your users</h3>
        <p class="text-gray-500 dark:text-home-gray max-w-2xl mx-auto mb-12">
          Turn every documentation visit into a guided conversation.
        </p>

        <!-- Mock UI for Chat -->
        <div
          class="max-w-3xl bg1 mx-auto bg-card-light dark:bg-[#202327] rounded-xl border border-gray-200 dark:border-gray-700 p-6 aspect-[2/1] flex items-center justify-center"
        >
          <div
            class="bg-white dark:bg-home-black rounded-full shadow-sm border border-gray-200 dark:border-gray-700 px-6 py-3 w-full max-w-md text-left text-gray-400 text-sm flex justify-between"
          >
            <span>Ask AI anything...</span>
            <div class="i-carbon-send-filled dark:text-[#0fba81]" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.content-visibility-auto {
  content-visibility: auto;
  contain-intrinsic-size: 1px 800px;
}
</style>

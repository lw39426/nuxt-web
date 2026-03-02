<script setup lang="ts">
import { useCharacterData } from '~/composables/useCharacterData'
import gsap from 'gsap'

definePageMeta({
  hideNavbar: true,
  hideFooter: false,
  hideFloatingMenu: false
})

const route = useRoute()
const router = useRouter()
const { regions } = useCharacterData()

// State
const currentRegionId = computed(() => (route.params.id as string) || 'mondstadt')
const charIndex = computed(() => parseInt((route.query.char as string) || '0'))

const currentRegion = computed(() => regions[currentRegionId.value] || regions['mondstadt'])
const currentCharacter = computed(
  () => currentRegion.value.characters[charIndex.value] || currentRegion.value.characters[0]
)

// Navigation
const switchRegion = (regionId: string) => {
  if (regionId === currentRegionId.value) return
  router.push({ params: { id: regionId }, query: { char: 0 } })
}

const switchCharacter = (index: number) => {
  if (index === charIndex.value) return
  router.push({ query: { ...route.query, char: index } })
}

// Animation References
const bgRef = ref(null)
const charImgRef = ref(null)
const infoRef = ref(null)

// Watchers for animations (simplified for now, will enhance later)
watch(currentRegionId, () => {
  // Region change animations
  gsap.fromTo(bgRef.value, { opacity: 0 }, { opacity: 1, duration: 1 })
})

watch(charIndex, () => {
  // Character change animations
  gsap.fromTo(charImgRef.value, { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5 })
  gsap.fromTo(
    infoRef.value,
    { x: -30, opacity: 0 },
    { x: 0, opacity: 1, duration: 0.5, delay: 0.1 }
  )
})

onMounted(() => {
  // Initial animation
  gsap.from(charImgRef.value, { x: 50, opacity: 0, duration: 0.8 })
  gsap.from(infoRef.value, { x: -30, opacity: 0, duration: 0.8, delay: 0.2 })
})
</script>

<template>
  <div class="relative w-full h-screen mt-[-5rem] overflow-hidden bg-black text-white font-sans">
    <!-- 1. Background Layer -->
    <div ref="bgRef" class="absolute inset-0 z-0 transition-all duration-700 ease-in-out">
      <!-- Use a placeholder if image fails, or real image -->
      <img
        :src="currentRegion.background"
        class="w-full h-full object-cover opacity-60"
        alt="Background"
      />
      <!-- Big Region Name Watermark -->
      <div
        class="absolute right-10 top-20 text-9xl font-bold text-white/5 select-none pointer-events-none uppercase tracking-widest"
      >
        {{ currentRegion.englishName }}
      </div>
    </div>

    <!-- 2. 侧边栏 Sidebar (Region Selector) -->
    <div
      class="absolute left-0 top-0 h-full w-24 z-30 flex flex-col items-center justify-center space-y-8 bg-gradient-to-r from-black/80 to-transparent"
    >
      <div
        v-for="(region, key) in regions"
        :key="key"
        class="cursor-pointer group flex flex-col items-center transition-all duration-300"
        :class="
          currentRegionId === region.id ? 'opacity-100 scale-110' : 'opacity-50 hover:opacity-80'
        "
        @click="switchRegion(region.id)"
      >
        <!-- Icon Placeholder -->
        <div
          class="w-10 h-10 rounded-full border-2 flex items-center justify-center mb-1 transition-colors"
          :class="
            currentRegionId === region.id
              ? 'border-blue-400 bg-blue-400/20'
              : 'border-white/30 group-hover:border-white/60'
          "
        >
          <span class="text-xs">{{ region.englishName.substring(0, 2) }}</span>
        </div>
        <span class="text-xs tracking-widest">{{ region.name }}</span>
      </div>
    </div>

    <!-- 3. 主要内容 Main Content (Character Details) -->
    <div class="absolute inset-0 z-10 pointer-events-none flex">
      <!-- Left: Text Info -->
      <div
        ref="infoRef"
        class="w-1/2 h-full flex flex-col justify-center pl-32 pr-10 pointer-events-auto"
      >
        <!-- Name -->
        <h1 class="text-6xl font-bold mb-2 text-shadow-lg">{{ currentCharacter.name }}</h1>

        <!-- CV Info -->
        <div class="flex items-center space-x-4 mb-6 text-[#ffcb61]/80">
          <div class="flex items-center">
            <span class="i-carbon-microphone mr-1"></span>
            <span>CV: {{ currentCharacter.cv }}</span>
          </div>
          <div class="w-px h-4 bg-white/30"></div>
          <div class="text-white/60 text-sm">{{ currentCharacter.element }} Element</div>
        </div>

        <!-- Description Box (Frosted Glass) -->
        <div
          class="bg-black/40 backdrop-blur-md p-6 rounded-lg border-l-4 border-[#ffcb61] max-w-md mb-6"
        >
          <p class="text-gray-200 leading-relaxed text-sm">
            {{ currentCharacter.description }}
          </p>
        </div>

        <!-- Quote -->
        <div class="italic text-white/60 text-lg border-l-2 border-white/20 pl-4">
          "{{ currentCharacter.quote }}"
        </div>
      </div>

      <!-- Right: Character Image -->
      <div class="w-1/2 h-full relative pointer-events-none">
        <img
          ref="charImgRef"
          :src="currentCharacter.image"
          class="absolute bottom-0 right-0 h-[95%] object-contain drop-shadow-2xl z-20"
          style="filter: drop-shadow(0 0 20px rgba(0, 0, 0, 0.5))"
          alt="Character Art"
        />
      </div>
    </div>

    <!-- 4. Bottom Carousel (Character Selector) -->
    <div
      class="absolute bottom-8 left-0 w-full z-30 flex justify-center items-end pointer-events-auto"
    >
      <div class="flex items-center justify-between gap-8 no-scrollbar mask-gradient">
        <div
          v-for="(char, index) in currentRegion.characters"
          :key="char.id"
          class="relative cursor-pointer transition-all duration-300 group flex-shrink-0"
          @click="switchCharacter(index)"
        >
          <!-- Avatar Frame -->
          <div
            class="w-[110px] rounded-lg overflow-hidden border-2 transition-colors relative bg-gray-800"
            :class="
              charIndex === index
                ? 'border-[#ffcb61] shadow-[0_0_15px_rgba(250,204,21,0.5)]'
                : 'border-white/20 group-hover:border-white/60'
            "
          >
            <img :src="char.avatar" class="w-full h-full object-cover" />
            <!-- Active Overlay -->
            <div
              v-if="charIndex !== index"
              class="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"
            ></div>
          </div>

          <!-- Name Tag (Only visible when active or hovered) -->
          <div
            class="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-medium whitespace-nowrap transition-opacity duration-300"
            :class="
              charIndex === index
                ? 'opacity-100 text-[#ffcb61]'
                : 'opacity-0 group-hover:opacity-100 text-white'
            "
          >
            {{ char.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.text-shadow-lg {
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
/* Mask gradient for smooth fade at edges of carousel if needed */
.mask-gradient {
  /* mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); */
}
</style>

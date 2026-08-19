<script setup lang="ts">
import { useCharacterData, type Region } from '~/composables/useCharacterData';
import gsap from 'gsap';
import { useRegionApi } from '~/composables/api/region';

definePageMeta({
  hideNavbar: false,
  forceCapsule: true,
  hideFooter: true,
  hideFloatingMenu: false
});

const route = useRoute();
const router = useRouter();
const { fetchRegionsList, fetchRegionDetails, preloadAllRegionsIdle, idlePreloadNextRegion } =
  useCharacterData();
const { getRegions, getRegionDetail } = useRegionApi();

const DEFAULT_BACKGROUND =
  'https://uploadstatic.mihoyo.com/contentweb/20200211/2020021114220951905.jpg';

type CharacterImageCacheGlobal = {
  imageCache: Map<string, HTMLImageElement>;
};

const characterImageDebugGlobal = (() => {
  const key = '__CHARACTER_IMAGE_CACHE_GLOBAL__';
  const target = globalThis as typeof globalThis & {
    __CHARACTER_IMAGE_CACHE_GLOBAL__?: CharacterImageCacheGlobal;
  };

  if (!target[key]) {
    target[key] = {
      imageCache: new Map<string, HTMLImageElement>()
    };
  }

  return target[key];
})();

// State
const regions = ref<Record<string, Region>>({});
const displayBackground = ref(DEFAULT_BACKGROUND);
const backgroundSwitchToken = ref(0);
const carouselContainer = ref<HTMLElement | null>(null);

const scheduleIdleTask = (task: () => void) => {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(task, { timeout: 2500 });
    return;
  }

  setTimeout(task, 1200);
};

// currentRegionSlug 就是路由参数，即新数据模型中 Region.id、mondstadt、liyue 等等
const currentRegionSlug = computed(() => {
  return ((route.params.id as string) || 'mondstadt').toLowerCase();
});

const loadRegionCharacters = async (slug: string) => {
  // 如果已经有角色数据，就不再请求
  if (
    regions.value[slug] &&
    regions.value[slug].characters &&
    regions.value[slug].characters.length > 0
  ) {
    return;
  }

  try {
    // 尝试从 API 获取数据，地区详情接口已经包含了角色列表
    const apiRegion = await getRegionDetail(slug);

    if (apiRegion) {
      const rawChars = apiRegion.characters || [];
      const chars = rawChars.map((c) => ({
        id: c.id,
        name: c.name,
        element: c.element || '',
        cv_cn: c.cv_cn || '',
        cv_jp: c.cv_jp || '',
        quote: c.quote || '',
        description: c.description || '',
        avatar: c.avatar_url || '',
        coverImg: c.cover_img_url || '',
        audio_enter: c.audio_enter_url || ''
      }));

      regions.value[slug] = {
        ...regions.value[slug],
        id: apiRegion.code,
        name: apiRegion.name,
        bgDay: apiRegion.bg_day_url || regions.value[slug]?.bgDay || '',
        characters: chars
      };
      return;
    }
  } catch (err) {
    console.warn(`API request failed for ${slug}, falling back to local data`, err);
  }

  const detail = await fetchRegionDetails(slug);
  if (detail) {
    // 合并原有基础数据和详细数据
    regions.value[slug] = {
      ...regions.value[slug],
      ...detail
    };
  }
};

// 当 mondstadt、liyue地区 变化时，切换背景图、预加载图片，并停止当前音频
watch(currentRegionSlug, async (newSlug) => {
  // 背景图基础数据已存在，可直接更新背景图
  void updateBackgroundImage(regions.value[newSlug]?.bgDay);

  // 切换地区时停止当前音频
  if (currentAudio.value) {
    currentAudio.value.pause();
    currentAudio.value = null;
  }

  // 获取当前新地区的角色数据
  await loadRegionCharacters(newSlug);

  // 切换地区时预加载该地区所有角色的立绘和头像
  preloadImages(regions.value[newSlug]);

  // 切换地区时对下一个地区进行 idle 预加载
  idlePreloadNextRegion(Object.values(regions.value), newSlug);
});

const charIndex = computed(() => parseInt((route.query.char as string) || '0'));

// --- 轮播图逻辑 ---
const carouselOffset = ref(0);
const CAROUSEL_VISIBLE_COUNT = 6;
const CAROUSEL_ITEM_WIDTH = 110;
const CAROUSEL_GAP = 32; // gap-8 = 32px
const _CAROUSEL_STEP = CAROUSEL_ITEM_WIDTH + CAROUSEL_GAP;

// 移动端轮播设置
const isMobile = ref(false);
const MOBILE_CAROUSEL_ITEM_WIDTH = 96; // w-24 = 96px
const MOBILE_CAROUSEL_GAP = 16; // gap-4 = 16px
const MOBILE_CAROUSEL_STEP = MOBILE_CAROUSEL_ITEM_WIDTH + MOBILE_CAROUSEL_GAP;
const MOBILE_PRELOAD_LOOKAHEAD = 2;

// 处理窗口大小改变
const handleResize = () => {
  isMobile.value = window.innerWidth < 640;
};

// 获取当前轮播步长
const carouselStep = computed(() => {
  return isMobile.value ? MOBILE_CAROUSEL_STEP : _CAROUSEL_STEP;
});

const maxCarouselOffset = computed(() => {
  const charCount = currentRegion.value.characters.length;
  if (charCount <= CAROUSEL_VISIBLE_COUNT) return 0;
  return charCount - CAROUSEL_VISIBLE_COUNT;
});

const slideCarousel = (direction: 'left' | 'right') => {
  if (direction === 'left' && carouselOffset.value > 0) {
    carouselOffset.value--;
  } else if (direction === 'right' && carouselOffset.value < maxCarouselOffset.value) {
    carouselOffset.value++;
  }
};

// 监听地区切换，重置轮播图位置
watch(currentRegionSlug, () => {
  carouselOffset.value = 0;
});

const currentRegion = computed(
  () =>
    regions.value[currentRegionSlug.value] || {
      id: '',
      name: '加载中...',
      bgDay: '',
      characters: []
    }
);

// Optimization: Display character for animation control
const displayCharacter = ref(currentRegion.value.characters[charIndex.value] || null);
// The target character we want to switch to
const targetCharacter = computed(() => currentRegion.value?.characters[charIndex.value] || null);
// Use displayCharacter in template
const currentCharacter = computed(() => displayCharacter.value);

const updateBackgroundImage = async (bgUrl?: string) => {
  const nextBg = bgUrl || DEFAULT_BACKGROUND;
  const token = ++backgroundSwitchToken.value;

  const ok = await cacheImage(nextBg);

  if (token !== backgroundSwitchToken.value) return;

  if (ok) {
    displayBackground.value = nextBg;
    return;
  }

  if (nextBg !== DEFAULT_BACKGROUND) {
    const fallbackOk = await cacheImage(DEFAULT_BACKGROUND);

    if (token !== backgroundSwitchToken.value) return;

    if (fallbackOk) {
      displayBackground.value = DEFAULT_BACKGROUND;
    }
  }
};

// 音频实例缓存，切换角色时自动停止上一个音频
const currentAudio = ref<HTMLAudioElement | null>(null);

const playEntryVoice = () => {
  const url = currentCharacter.value?.audio_enter;
  if (!url) return;
  if (currentAudio.value) {
    currentAudio.value.pause();
    currentAudio.value = null;
  }
  const audio = new Audio(url);
  currentAudio.value = audio;
  audio.play().catch(() => {});
};

// Navigation
type SidebarCity = {
  slug: string;
  name: string;
  disabled?: boolean;
};

// Sidebar 城市列表，包含所有可能的地区，并根据实际数据动态禁用不可用的选项
const sidebarCities = computed<SidebarCity[]>(() => {
  const base: SidebarCity[] = [
    { slug: 'mondstadt', name: '蒙德城' },
    { slug: 'liyue', name: '璃月港' },
    { slug: 'inazuma', name: '稻妻城' },
    { slug: 'sumeru', name: '须弥城' },
    { slug: 'fontaine', name: '枫丹廷' },
    { slug: 'natlan', name: '纳塔' },
    { slug: 'nodkrai', name: '挪德卡莱' },
    { slug: 'coming-soon', name: '敬请期待', disabled: true }
  ];

  const available = new Set(Object.keys(regions.value));

  return base.map((item) => {
    if (item.disabled) return item;
    return {
      ...item,
      disabled: !available.has(item.slug)
    };
  });
});

// 移动端地区下拉选项（复用 sidebarCities 数据）
const regionOptions = computed(() =>
  sidebarCities.value.map((city) => ({
    label: city.name,
    value: city.slug,
    disabled: city.disabled
  }))
);

const changeRegion = (value: string | number | boolean | null) => {
  router.push({ params: { id: String(value) }, query: { char: 0 } });
};

const switchCharacter = (index: number) => {
  // Prevent animation if clicking the same character
  if (index === charIndex.value) return;
  router.push({ query: { ...route.query, char: index } });
};

// --- GSAP Transition Hooks ---
const onBgBeforeEnter = (el: Element) => {
  gsap.killTweensOf(el);
  gsap.set(el, { opacity: 0 });
};

const onBgEnter = (el: Element, done: () => void) => {
  gsap.to(el, {
    opacity: 0.6,
    duration: 0.7,
    ease: 'power3.out',
    overwrite: 'auto',
    onComplete: done
  });
};

const onBgLeave = (el: Element, done: () => void) => {
  gsap.to(el, {
    opacity: 0,
    duration: 0.4,
    ease: 'power2.inOut',
    overwrite: 'auto',
    onComplete: done
  });
};

const onMarkBeforeEnter = (el: Element) => {
  gsap.killTweensOf(el);
  gsap.set(el, { opacity: 0, x: 16, force3D: true });
};

const onMarkEnter = (el: Element, done: () => void) => {
  gsap.to(el, {
    opacity: 1,
    x: 0,
    duration: 0.55,
    ease: 'power4.out',
    overwrite: 'auto',
    force3D: true,
    onComplete: done
  });
};

const onMarkLeave = (el: Element, done: () => void) => {
  gsap.to(el, {
    opacity: 0,
    x: -10,
    duration: 0.28,
    ease: 'power2.in',
    overwrite: 'auto',
    force3D: true,
    onComplete: done
  });
};

const onArtBeforeEnter = (el: Element) => {
  gsap.killTweensOf(el);
  if (isMobile.value) {
    (el as HTMLElement).style.opacity = '0';
    return;
  }
  gsap.set(el, { opacity: 0, x: 56, force3D: true });
};

const onArtEnter = (el: Element, done: () => void) => {
  if (isMobile.value) {
    (el as HTMLElement).style.opacity = '1';
    done();
    return;
  }

  gsap.to(el, {
    opacity: 1,
    x: 0,
    duration: 0.56,
    ease: 'power4.out',
    overwrite: 'auto',
    force3D: true,
    onComplete: done
  });
};

const onArtLeave = (el: Element, done: () => void) => {
  if (isMobile.value) {
    (el as HTMLElement).style.opacity = '0';
    done();
    return;
  }

  gsap.to(el, {
    opacity: 0,
    x: -42,
    duration: 0.32,
    ease: 'power2.in',
    overwrite: 'auto',
    force3D: true,
    onComplete: done
  });
};

const onInfoBeforeEnter = (el: Element) => {
  if (isMobile.value) {
    // Keep mobile info visible even if enter hook gets interrupted.
    const root = el as HTMLElement;
    root.style.opacity = '1';
    const items = root.querySelectorAll<HTMLElement>('.info-item');
    items.forEach((item) => {
      item.style.opacity = '1';
      item.style.transform = 'none';
    });
    return;
  }

  gsap.killTweensOf(el);

  gsap.killTweensOf((el as HTMLElement).querySelectorAll('.info-item'));
  gsap.set(el, { opacity: 0, x: -24, force3D: true });
  gsap.set((el as HTMLElement).querySelectorAll('.info-item'), {
    opacity: 0,
    y: 10,
    force3D: true
  });
};

const onInfoEnter = (el: Element, done: () => void) => {
  if (isMobile.value) {
    (el as HTMLElement).style.opacity = '1';
    done();
    return;
  }

  const infoItems = (el as HTMLElement).querySelectorAll('.info-item');
  const tl = gsap.timeline({ onComplete: done });

  tl.to(el, {
    opacity: 1,
    x: 0,
    duration: 0.46,
    ease: 'power4.out',
    overwrite: 'auto',
    force3D: true
  }).to(
    infoItems,
    {
      opacity: 1,
      y: 0,
      duration: 0.44,
      ease: 'power3.out',
      stagger: 0.06,
      overwrite: 'auto',
      force3D: true
    },
    '-=0.34'
  );
};

const onInfoLeave = (el: Element, done: () => void) => {
  if (isMobile.value) {
    (el as HTMLElement).style.opacity = '0';
    done();
    return;
  }

  gsap.killTweensOf((el as HTMLElement).querySelectorAll('.info-item'));
  gsap.to(el, {
    opacity: 0,
    x: -18,
    duration: 0.22,
    ease: 'power2.in',
    overwrite: 'auto',
    force3D: true,
    onComplete: done
  });
};

// --- GSAP Micro-interactions ---
const onAvatarEnter = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement | null;
  if (!target) return;
  gsap.to(target, {
    y: -6,
    scale: 1.01,
    duration: 0.28,
    ease: 'power3.out',
    overwrite: 'auto',
    force3D: true
  });
};

const onAvatarLeave = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement | null;
  if (!target) return;
  gsap.to(target, {
    y: 0,
    scale: 1,
    duration: 0.26,
    ease: 'power3.out',
    overwrite: 'auto',
    force3D: true
  });
};

// Image Cache to prevent GC and unnecessary network requests
const imageCache = characterImageDebugGlobal.imageCache;

/**
 * @param url 预加载缓存的图片URL
 */
const cacheImage = (url?: string, options: { decode?: boolean } = {}): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }

    const cached = imageCache.get(url);
    if (cached?.complete) {
      resolve(true);
      return;
    }

    const img = cached || new Image();
    if (!cached) {
      imageCache.set(url, img);
      img.src = url;
    }

    if (img.complete) {
      resolve(true);
      return;
    }

    const done = (ok: boolean) => {
      img.onload = null;
      img.onerror = null;
      resolve(ok);
    };

    img.onload = async () => {
      try {
        if (options.decode !== false && 'decode' in img) {
          await img.decode();
        }
      } catch {
        // ignore decode error, image is still usable
      }
      done(true);
    };
    img.onerror = () => done(false);
  });
};

let switchToken = 0;
watch(
  targetCharacter,
  async (newChar, oldChar) => {
    if (!newChar) {
      displayCharacter.value = null;
      return;
    }

    if (newChar.id === oldChar?.id) return;

    const token = ++switchToken;
    await cacheImage(newChar.coverImg, { decode: !isMobile.value });
    void cacheImage(newChar.avatar, { decode: false });

    if (token !== switchToken) return;
    displayCharacter.value = newChar;
  },
  { immediate: true }
);
// Optimization: 预加载当前地区所有角色的立绘和头像，最小化等待时间
const preloadImages = (region: Region | undefined) => {
  if (!region?.characters) return;
  const chars = region.characters;
  const active = Number.isNaN(charIndex.value) ? 0 : Math.max(0, charIndex.value);

  void cacheImage(region.bgDay, { decode: !isMobile.value });

  if (!isMobile.value) {
    chars.forEach((char) => {
      void cacheImage(char.coverImg, { decode: false });
      void cacheImage(char.avatar, { decode: false });
    });
    return;
  }

  const highPriority = new Set<number>([active]);
  for (let i = 1; i <= MOBILE_PRELOAD_LOOKAHEAD; i++) {
    if (active + i < chars.length) highPriority.add(active + i);
    if (active - i >= 0) highPriority.add(active - i);
  }

  highPriority.forEach((index) => {
    const char = chars[index];
    if (!char) return;
    void cacheImage(char.coverImg, { decode: false });
    void cacheImage(char.avatar, { decode: false });
  });

  // 其余资源放到空闲时段，避免移动端切换时触发主线程抢占
  scheduleIdleTask(() => {
    chars.forEach((char, index) => {
      if (highPriority.has(index)) return;
      void cacheImage(char.coverImg, { decode: false });
      void cacheImage(char.avatar, { decode: false });
    });
  });
};

onMounted(async () => {
  // 检查是否为移动设备
  handleResize();
  window.addEventListener('resize', handleResize);

  // 1. 获取所有地区列表（基础信息，无角色数据）
  let regionsList: Region[] = [];
  try {
    const apiRegions = await getRegions();
    if (apiRegions && apiRegions.length > 0) {
      regionsList = apiRegions.map((r) => ({
        id: r.code,
        name: r.name,
        bgDay: r.bg_day_url || '',
        characters: []
      }));
    } else {
      throw new Error('No regions from API');
    }
  } catch (err) {
    console.warn('API getRegions failed, falling back to mock data', err);
    regionsList = await fetchRegionsList();
  }

  regions.value = regionsList.reduce(
    (acc, region) => {
      acc[region.id] = region;
      return acc;
    },
    {} as Record<string, Region>
  );

  // 2. 获取当前 URL 对应地区的详细数据（包含角色）
  await loadRegionCharacters(currentRegionSlug.value);

  await updateBackgroundImage(currentRegion.value.bgDay);

  // 3. 预加载当前地区所有图片
  preloadImages(currentRegion.value);

  // 4. 立绘加载保护、等待首位角色立绘解码完成再展示，确保 GSAP 出场时已就绪
  const initialChar =
    currentRegion.value.characters[charIndex.value] || currentRegion.value.characters[0];
  if (initialChar) {
    await Promise.all([cacheImage(initialChar.coverImg), cacheImage(initialChar.avatar)]);
    displayCharacter.value = initialChar;
  }

  // 5. 利用浏览器空闲时间，全量预加载所有地区的基础背景图，并预加载下一个地区的角色
  scheduleIdleTask(() => {
    preloadAllRegionsIdle(Object.values(regions.value));
    idlePreloadNextRegion(Object.values(regions.value), currentRegionSlug.value);
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  gsap.globalTimeline.clear();
});
</script>

<template>
  <div class="relative w-full h-screen overflow-hidden bg-black text-white font-sans">
    <!-- 1. 背景层 Background Layer -->
    <div class="absolute inset-0 z-0">
      <Transition
        appear
        :css="false"
        @before-enter="onBgBeforeEnter"
        @enter="onBgEnter"
        @leave="onBgLeave"
      >
        <img
          :key="`bg-${displayBackground}`"
          :src="displayBackground"
          class="absolute inset-0 w-full h-full object-cover opacity-60"
          alt="Background"
        />
      </Transition>

      <!-- Big Region Name Watermark 地域名水印-->
      <Transition
        appear
        :css="false"
        @before-enter="onMarkBeforeEnter"
        @enter="onMarkEnter"
        @leave="onMarkLeave"
      >
        <div
          :key="`wm-${currentRegion.id}`"
          class="hidden sm:block absolute right-10 top-20 text-9xl font-bold text-white/5 select-none pointer-events-none uppercase tracking-widest"
        >
          {{ currentRegion.id.toUpperCase() }}
        </div>
      </Transition>
    </div>

    <!-- 2. 侧边栏 Sidebar (Region Selector) -->
    <ul class="character__sidebar hidden sm:block">
      <li
        v-for="city in sidebarCities"
        :key="city.slug"
        class="character__city"
        :class="{
          'character__city--active': city.slug === currentRegionSlug,
          'character__city--disable': city.disabled
        }"
      >
        <NuxtLink v-if="!city.disabled" :to="{ params: { id: city.slug }, query: { char: 0 } }">
          {{ city.name }}
        </NuxtLink>
        <span v-else>{{ city.name }}</span>
      </li>
    </ul>

    <!-- 移动端地区选择 (Region Selector) -->
    <BaseSelect
      class="sm:hidden absolute top-24 left-4 z-20"
      :fluid="false"
      variant="overlay"
      size="sm"
      :model-value="currentRegionSlug"
      :options="regionOptions"
      placeholder="选择地区"
      @update:model-value="changeRegion"
    />

    <!-- 3. 主要内容 Main Content (Character Details) -->
    <div
      class="absolute inset-0 z-10 pointer-events-none flex flex-col sm:block overflow-hidden sm:overflow-visible pb-36 sm:pb-0"
    >
      <!-- Left: 文字信息 Text Info (Absolute Positioning) -->
      <div
        class="sm:absolute sm:left-[18%] sm:top-[18vh] sm:w-[35%] sm:min-w-[460px] sm:max-w-[640px] sm:pointer-events-auto absolute left-4 top-[35vh] w-[52vw] pt-0 px-0 sm:z-20 z-30 pointer-events-auto"
      >
        <Transition
          appear
          :css="false"
          @before-enter="onInfoBeforeEnter"
          @enter="onInfoEnter"
          @leave="onInfoLeave"
        >
          <div
            v-if="currentCharacter"
            :key="`info-${currentCharacter.id}`"
            class="relative sm:absolute sm:inset-0 will-change-transform will-change-opacity left-0 right-0 max-w-none sm:max-w-none"
          >
            <!-- Name -->
            <h1
              class="info-item info-item-1 text-6xl sm:text-6xl font-bold mb-2 sm:mb-2 text-shadow-lg leading-none"
            >
              {{ currentCharacter.name }}
            </h1>

            <!-- CV Info + Entry Voice -->
            <div
              class="info-item info-item-2 flex items-center flex-wrap gap-x-2 sm:gap-x-4 gap-y-1 mb-3 sm:mb-6 text-[13px] sm:text-sm text-[#ffcb61]/80"
            >
              <div class="flex items-center gap-1.5">
                <span class="i-carbon-microphone"></span>
                <span class="hidden sm:inline">CN {{ currentCharacter.cv_cn }}</span>
                <span class="sm:hidden">CN {{ currentCharacter.cv_cn?.substring(0, 6) }}</span>
                <span class="text-white/30">|</span>
                <span class="hidden sm:inline">JP {{ currentCharacter.cv_jp }}</span>
                <span class="sm:hidden">JP {{ currentCharacter.cv_jp?.substring(0, 6) }}</span>
              </div>
              <div class="w-px h-4 bg-white/30 hidden sm:block"></div>
              <div class="text-white/60 text-[13px] sm:text-sm">{{ currentCharacter.element }}</div>
              <!-- 入队语音按钮，有 audio_enter 才显示 -->
              <button
                v-if="currentCharacter.audio_enter"
                class="flex items-center gap-1 text-xs text-white/40 hover:text-[#ffcb61] transition-colors duration-200"
                title="播放入队语音"
                @click="playEntryVoice"
              >
                <span class="i-carbon-volume-up text-base"></span>
                <span class="hidden sm:inline">入队语音</span>
              </button>
            </div>

            <!-- Description Box (Frosted Glass) -->
            <div
              class="info-item info-item-3 bg-black/58 backdrop-blur-md p-3 sm:p-6 rounded-lg border-l-4 border-[#ffcb61] w-[50vw] sm:max-w-md mb-3 sm:mb-6"
            >
              <p class="text-gray-200 leading-relaxed text-xs sm:text-sm">
                {{ currentCharacter.description }}
              </p>
            </div>

            <!-- Quote -->
            <div
              class="info-item info-item-4 italic text-white/60 text-sm sm:text-lg border-l-2 border-white/20 pl-4 pb-2 sm:pb-0 w-[50vw] sm:max-w-none leading-snug"
            >
              "{{ currentCharacter.quote }}"
            </div>
          </div>

          <div v-else class="relative sm:absolute sm:inset-0 flex items-center text-white/70">
            暂无角色呢 ^-^
          </div>
        </Transition>

        <div class="h-[360px] hidden sm:block"></div>
      </div>

      <!-- Right: 人物图 Character Image (Absolute Positioning) -->
      <div
        class="hidden sm:block absolute right-0 top-0 h-full w-full pointer-events-none z-10 relative"
      >
        <Transition
          appear
          :css="false"
          @before-enter="onArtBeforeEnter"
          @enter="onArtEnter"
          @leave="onArtLeave"
        >
          <img
            v-if="currentCharacter"
            :key="`art-${currentCharacter.id}`"
            :src="currentCharacter.coverImg"
            class="character-art absolute top-0 right-0 h-full object-contain drop-shadow-2xl"
            style="filter: drop-shadow(0 0 20px rgba(0, 0, 0, 0.5))"
            alt="Character Art"
          />
        </Transition>
      </div>

      <!-- 移动端人物展示 -->
      <div class="sm:hidden absolute top-[14vh] w-[100vw] h-[70vh] pointer-events-none z-[5]">
        <Transition
          appear
          :css="false"
          @before-enter="onArtBeforeEnter"
          @enter="onArtEnter"
          @leave="onArtLeave"
        >
          <img
            v-if="currentCharacter"
            :key="`art-mobile-${currentCharacter.id}`"
            :src="currentCharacter.coverImg"
            class="character-art-mobile w-full h-full object-cover object-bottom"
            decoding="async"
            fetchpriority="high"
            alt="Character Art"
          />
        </Transition>
      </div>
    </div>

    <!-- 4. 角色选择器 Bottom Carousel (Character Selector) -->
    <div
      class="absolute bottom-0 left-0 w-full h-auto sm:h-[190px] z-30 flex justify-center items-end pointer-events-auto pb-6 sm:pb-4 px-2 sm:px-0 bg-gradient-to-t from-black/75 via-black/45 to-transparent"
    >
      <div class="relative flex items-center w-full sm:w-auto">
        <!-- Left Arrow -->
        <button
          :disabled="carouselOffset === 0"
          class="hidden sm:flex absolute -left-16 w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white/70 hover:bg-black/80 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed z-40"
          @click="slideCarousel('left')"
        >
          <span class="i-carbon-chevron-left text-2xl"></span>
        </button>

        <!-- Carousel Container -->
        <!-- Desktop: 6 * 110px + 5 * 32px = 820px -->
        <!-- Mobile: responsive width -->
        <div
          ref="carouselContainer"
          class="w-full sm:w-[820px] overflow-x-auto pt-6 sm:pt-6 -mt-6 pb-4 -mb-4 snap-x snap-mandatory sm:overflow-hidden"
        >
          <div
            class="flex items-center gap-4 sm:gap-8 no-scrollbar transition-transform duration-500 ease-out px-2 sm:px-0"
            :style="{ transform: `translateX(-${carouselOffset * carouselStep}px)` }"
          >
            <div
              v-for="(char, index) in currentRegion.characters"
              :key="char.id"
              class="relative cursor-pointer transition-all duration-300 group flex-shrink-0 snap-center"
              @click="switchCharacter(index)"
              @mouseenter="onAvatarEnter"
              @mouseleave="onAvatarLeave"
            >
              <!-- Card Container -->
              <div
                class="w-24 sm:w-[110px] rounded-md overflow-hidden border-2 flex flex-col transition-all duration-300 bg-gray-400"
                :class="
                  charIndex === index
                    ? 'border-white shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                    : 'border-[#333] opacity-85 group-hover:opacity-100 group-hover:border-white/60'
                "
              >
                <!-- Avatar Image -->
                <div class="relative w-full aspect-square bg-gray-900">
                  <img :src="char.avatar" class="w-full h-full object-cover" loading="lazy" />
                </div>

                <!-- Name Tag -->
                <div
                  class="w-full py-1 text-center text-xs sm:text-sm font-bold transition-colors duration-300"
                  :class="charIndex === index ? 'bg-white text-black' : 'bg-black text-white '"
                >
                  {{ char.name }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Arrow -->
        <button
          :disabled="carouselOffset >= maxCarouselOffset"
          class="hidden sm:flex absolute -right-16 w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center text-white/70 hover:bg-black/80 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed z-40"
          @click="slideCarousel('right')"
        >
          <span class="i-carbon-chevron-right text-2xl"></span>
        </button>
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
  mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
}

.character-art {
  will-change: opacity, transform;
  backface-visibility: hidden;
  transform: translateZ(0);
}

.character-art-mobile {
  will-change: opacity, transform;
  backface-visibility: hidden;
  transform: translateZ(0);
  contain: layout paint style;
  filter: none;
}

.info-item {
  opacity: 0;
  transform: translate3d(0, 8px, 0);
  will-change: opacity, transform;
}

.character__sidebar {
  position: absolute;
  z-index: 99;
  top: 0;
  left: 0;
  width: 370px;
  height: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 187px 0 0;
  list-style: none;
}
.character__sidebar::before {
  position: absolute;
  top: 0;
  left: 37px;
  display: block;
  content: '';
  width: 2px;
  height: 1280px;
  background: rgba(255, 255, 255, 0.14);
}

.character__city {
  width: 100%;
  height: 54px;
  line-height: 54px;
  font-size: 18px;
  color: #fff;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  padding-left: 56px;
  background: 18px center no-repeat;
  /* background-image: url(''); */
  background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQyIDc5LjE2MDkyNCwgMjAxNy8wNy8xMy0wMTowNjozOSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpERTgyOUEzQkFBMDQxMUU5QjQ2REMwOUFGODE3Qzc5MiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpERTgyOUEzQ0FBMDQxMUU5QjQ2REMwOUFGODE3Qzc5MiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkRFODI5QTM5QUEwNDExRTlCNDZEQzA5QUY4MTdDNzkyIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkRFODI5QTNBQUEwNDExRTlCNDZEQzA5QUY4MTdDNzkyIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+8pIp1gAAAHhJREFUeNrs18EKgCAQRVGNftsJ6sNHW0QuXNUzBroPZiUMB0ZFs7unyFlS8AAECBAgQIAAAQLsY62KtOP5YBXV5neKqu8MnBQ5C3fF3vZX7EF/uPbpHrTIIx4hZYdkFV4IezfWQ9U08y8GCBAgQIAAAQL8NbAKMAD/HXfdYwQY6gAAAABJRU5ErkJggg==);
  background-size: 40px;
  user-select: none;
}

.character__city a,
.character__city span {
  display: inline-block;
  width: 40%;
  height: 100%;
  color: inherit;
  text-decoration: none;
}

.character__city a {
  cursor: pointer;
}

.character__city--active {
  text-shadow: none;
  padding-left: 70px;
  background: left center no-repeat;
  background-image: url(data:image/png;base64,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UmVhZHlxyWU8AAADIWlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDIgNzkuMTYwOTI0LCAyMDE3LzA3LzEzLTAxOjA2OjM5ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2NDFFRjZEN0IyQUUxMUU5ODU1QkFCMjQ5NTREREZBOSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2NDFFRjZENkIyQUUxMUU5ODU1QkFCMjQ5NTREREZBOSIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QTQ2NzVEOTNBRDNBMTFFOTg1MDU5MEQwQjhBQTc1MDAiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QTQ2NzVEOTRBRDNBMTFFOTg1MDU5MEQwQjhBQTc1MDAiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7Xwo20AAAYAklEQVR42uydf6wc11XH77k7u88v9rPfSwJJm8hOnN9pQtSkVP1BS9SWUCIQIEWkWIUqoiogQAKkIjV/AIIi0ar0rwohtUVKSdJWjSX+QaqqqjRpHFoiKtfBMY2T2HHsNMWJSfzr/diZe7j3zsy+eeP749yZO7vv+e1Kz7uenZ2ZnZ37me/5cc+BhYWFvWxjPNDxGg3L1UM4tiEsr8vtqWVQPFf/j5Vl1c+W/89q26ivY3otKp+pflYYjqncB6sdA1rWR8s+XO+5lqPheNDz5zoHpvfrv6np/8yyHdf6GPA+C9ym67Xv/+i4xpEwBoRlvNjWt63DHOtjg7FJHc9t1unkwTcwFLHFtrCAnOsBtX1BbZ9gOC5hWKc8z0jYH7N83rbPNucBCK9d+4HAfbi+K3o+iy321fQ6o8BjnNf9ugDGJnkg38AHD4TByokDiHu2Dw6FaIIgOO7o9e2KwEHJLcAMvetTocQsN5KQO77tRgQBv3VMGMIY9gMRYA2R15vClXg+NwoYqxcZZdDaTOTQCwMMx8AJsEbDekBQq2jYH3jcAxSLAC0wBcv5pKpyIKhJ6NA8M61DuWmMCwo44c9TfrtJnp+pYox4kaEDOEgcxJS7OVoGvvAoAvRAoA4K7lEZSFAFPrVZKlOwnDNsoEQwcD2f+wKIcA2FCUYCSJPrFTYoGDbqcUd78Ivou1BBBwbYCM8g4waQCcPFX4cpEsx/6ndyAdJ310cCtH03lRAfI9YUKRCOGz0qdJLXTSxXT5tjw3U+vqZgXCc/EEUZcMeFSlWYIeYrBJooFKBxghJBg9uAG2ADhm2U7gHwDABXIMgWQW2j3mBMMMAxAQFb7gNafIcY4N9U5vX6ASOA6w8Jplaos5uqFGwmETeshw4TEwgKwORjFB7Yg2E5J0AOiS4A2+dFA+Uaoga7NEVDTXNsuA0gvh/b3J8GVlqez2RiEFzzX+6/gIAholj7oyOGXgimlJss8OiruYfgMAGxBqrMANtqriI1yGLKTwPmD1a4FBg2VGi+FKbqMvQsM5nUYoJKknoj6VJljcOMn8T5XPeP8YKxAsQ1MJTLgbvFKwoh1+IVJgosPyPfs11EwnOhuQAClkHM2dpABuUCFh7VLtiFqUFggG8dYq6AVOZRPWD5PBhMcxtIhQNqyOwpT9gC1jEGsYgAGR9QKOcbO4IWdrTuZnng+MBYQHEExBKGkL8BpdlsPExcNadRCUchX5RgRQ3IAo71i58zew4hOky/6owXcADDNMCBNU9C930WCIOO8t3rg7O6bv0G4FKCzAFC08BDx3pUCMYMarRRfW1+W4rS7lpZYsTzOVWMraFYAWIJQ/n/fDkrXq9VihKLyEDyT74WkoNcQ7IApHqrgCPUlKMraOEaGPXIMhjMYkG4oMAAmZCLERx+OuExSdX+UiIIgPmj8sKiulwmMbMA0bY9n3pvO+OJ+p1jKSmXayWmCqbMyoqhRjcVQJOJQVE+K5jJFwx6Pf2sZaNeZ5UJmIlcJUrTWZnT6pllmWZhblFrOHKFULk9NChHmxozKSObUqJeFFgDk2luNXUwVH2QdZULNTiZTNq6CsSWKoVyE/DlbqJHgdpuAMJxk8BIMIkNAl9+aEzI4IQ+OwVjLChqGBYg1M9c/vXU8l6+jlaRXKtJVCZ0IhQVAbMM1Z9GIaQSg/J1AVLtcMzy2EbNrBYB5ozrru9TOD5zkTPzPGr0qDRk7vQkMECQMhDrUxFtCjn0xmAz0yg3Bdf3i+WqCD2GNhAbl8Jqu5/Qm/4UjF1BkfcSBUQGiYJiUsCxp9eVkIQ1vkaRm8yYpUoyMjEcqq3Il1yyMdWKSgdm5OclHKFQjsyhHEMVW31gmtSkaSCbgGm6CIXDfDQBTxiOL3QQuCLENjj44MoIbokuoQERwBbzuJBw81svcJyqyLGA0QdF/ddjPEmA9wdcK0e5jMtlWi2WQZmRH1GyL00V+FCuh2K4IhViqrcv1SMX6bCEoyjgaAvIoMd/Z/IJoUf1mOAn2IVlzWzmY5nKU4cdWqBpghsGDh5oOVCoPi2KL6+NH5AymNvCciOYqW18ll0FuKZgDIUi7/eBJ30FxXy5hKN+L9Emtobm6FdToZcsRZ5mIBUigoSiUpsSjlI/rqi1NUgkHJFJOLJeDws4ZgY4UtSRK/panYmSOUxHYLQkapPJCYEqiBJhNdUTbBOZDXXst43St1GbISk/MWEwzpk7baLc1HWnwZf2bLT5FEulKKE4GPDeYEbCsM/1/xMFxr5SjfCXf/wHu9V2/vYfv3hEmc+YSSs6S0EpRZH0JRSXIVNikfNMLlP70ianhCMDBcI8CNNTcCRAL6uZrJzgUxQGcFKKgoJHRfpMb2o0Fx3mOaXwaWjUnHl8irbAV6ivsslxUm4sXaSuhMCmzX7Hleoz9TG2VYv6Ja9EmSW3FPwUFCUMeQlF3h+95iUYH/zEA9d+5N57dmkKSKh+5sv/8pJK2ZHQg2xFqs00hazHlWqUknBJpe4IHaEWiY5YY57zuOY4DCY1MHsFb5+5bFNjvovV5JNDA2RFDdq2+o2mBycAlzLAmjrjm6YgNR30Idug3BBimPRNlPA4Zsi09cFuJsUIvdnZ2ftjgrGiFrWvMDeflbmc5OZzMuDJli1cQbE3I/8GW+Sz/ut96hMPXLPnV35p17nFpXSYpuKuW268dH5+gX//0HNnFGTVtnLo6eh1XiQB83mBOo2nBGC+SOQ5jqw6ddBmgnCLWqNciJR6hq66gb48QtO+hAfi9YHnCgKgw33QtF6ir/bkOFVZU78q9VoIUdRdfT9osa1puo7hnHQARsgjzCO/Ym/Vr9gfQE8qRD6Y6Y2guKWA4sc/ds2eD39w11kJxb/+50cPP/7MoVPvve3mhTtvun5hfn4Hf/q5F84wZZqzPA0SCyAyNX9aKUatFhmsglIty3MdK2AEi4/N5g/zXUymAA14fIU+/57rQjVFyW3VxdFjhiNBUYWaqdSyZtgCEBRl6zOPQ8xn6AB8VFhDh0AN3cdmAih0BcZcLfIi4CLN5J4KsEjF2FNQlKZzsmW2VyrFv3jgo7skFHcqKH764b3P7z96fPHNpRVx9Kcnz7/zxt3b337D7vntc3P86UOHT2N5IWMhFovgTB6kyQQT2Wh5oRaxVmzClGLTxIwEh8KyQck0i8NVZVwQfXgmpQoeYPlA5ZtnDgRzq40PzVdkogmwQ90kbXyXrpsBBJzTJmDb9IVm15ViHCVpS7XIq2pRp+X0CzBKGCq/olKMq0px57ml5fRvHt77wv4jLy8mEpwfvPP2hYW5uf4TB3/8xp27dyo47pjfsZ3/4NnnTgsh9GDTSd65YmR58rcK0qh0x4xps1oDco0pbavIHercD1VUaAGzS03aBhe1oo+vcg1j7YIvFHg2AUobJdnGFxpDEVFBF9OsHUee5KZ7xAOj0Yzu589JCcWBDrbwwq+ofYqF+Syh+PzTzx89v3XbNikmZ3vvv+2m+d/6hXdc+fxPX1v84YvHTr/t6rdsu+P6aws4/vi0gp+aO13MiBGYDlEHafLpgqtTA5VNnc+Ocd1xheeujx5/HjMoQEoFbV8VG+bZlg2avo6DPjVGKWWGASDEiLCMkTRNLWLRRL1hREA17Y4Ikfex2R4dNcMqCkIUc6LzvESeT4JWwRmlJFX0ec+HP5T7FB/6+uF9hw6f7fX7MBgMetJsTtQ6gyThe973zivn57b1v/L4939yfmk5u+8X33PVn++5bxdPVA5kwosUIG2uj+ZgF88BFwF3qCpbAVzbrA8e6FfjHoi4Ctz60nlcc5V950Z4lFCIy4FSbILa5Ew0gDMVAiGBotCgEkXdQgPATaqnzUX96L6Cd6kky7nREpIP/uHHd++59x4VfR6qQMu+g8+dVWa4UpbJYABbZga9Gaks1cdnB/3eb/z8z/3M3CWX9L707SePSzim93/gfVd/8nfu36XNdT2tsFfsoscAgNKSoF5lRwRcyMJy7pAAH8pF6qvGDA6fZQgwwPNduWU5MHpjq7rZH1phHSPAAwi+vSbgaNJl0rceTsG2PnyMnYGxLCU2+u00sYD91Z/+0XUf/bV7rzlz7vzwk1/44v88ceDZN6s5jypg05dKMamUH1NwvO9db79ipp/wz+79tyNKZX7knrt3fur3fvfaInVHQ7Gs7chWy5r5Lmr03CBM4OQVaIBBWboa2QO7MNgjAi568EDZpRQxQMGA5dl07hjBZeBzLTAWVn8y6qXakSJrMu1wPUNu2gyrWwEJ0YyAssZthB9ZOAY4JWJbV2pNG2H5/HOuGS0hagUdihFbwiBkPSB+9zbd8kL8m7ELMYSej3H6+0Kj8pvKFxk/+DKqswisqJqTR6d1NZ2Ef++/9r+xsLDA33HbrZfdfecdlx555dVzx06eGqq0nr40n2dnBnzQ7/Mb3vKzs9dfcfklatOLK8Ns7w/2/69Umemf/OqHdm6d3ZJ87VvfPfb3X37oiJommK0so1hZFmI4zIMwOhCTZSoYU0nbcfnafP4fDPRx2QIj9QvS1M7V9L4gXtRVX15oqbTQweBK1/EVmI1VJsvVeGw9DORJQSfEzJ+a4mMFYzlHugi+5Ms0IPm+H/23huNdt9506Xtuv2X+hROvnj3++qmVRK4/k8h/ewm7/srLZ29+6xVbFRT/9ekDJ0+fO5c+8IH3XnXJlpnk69/53vHPfeVrR4dLSyJbVkBcyfQ8alVYQlXayXTEmhnAaBs41EinLzE4NFEaPeBlBBO4CiDhUSC+6LoNZqEpLzEKSNgGrSDAIEb16hjzp8fV5XBaqHZDgBG0s1C+7I2mCarXvIgeq0jyvgMH35yfnwc17U/NcHnxxE/Onnj9/4aJfD+VYu/2nVdtvU7C8ZEn/vPVs+cXs4/d/e63Sij2Hnv8qRP/8Mg3XkqXlrJsZSnTSnFFQnF5SalFpRoxT+FJixkx5QwZdJmzJhXoKgRhS9ehzHChpPHUIWszKV0gQ49LwLcvF0ipc319/XXaQqXNHF9qcKpNG9e2+YrTaXwbHoxsTaMrKMzpPEWHr/Z14TyBMgH8qQPPnp7fsQPuuvmGBQnH+cPHXzl74uTrK5kE22Vz25KDx145e+rMmeHv3/P+q0sofu7hb7y0snheQnFZpEvnRW5Cr2CuFlcESjCKbFgmeAud/L22iIRPzfjKVLkgKpi55Bgl79EGKBNghQXWvpkWgqhEfWqvSbe7LkxDJO4DJwAWIPweXSnOkJvK1JTuGoz5Wc6hWPCRFb1cVvu7lCZ1nmLDnjpw8PT2bduUclx49603zh9++cSZEydfWzn+2qnl7bMzvT/79V/epc3nf3/yxOcfeezYytJiptRhtrSofIsajNnyoio5pl4jpmnefzoHo54NYzCjqT7Eui/GlvhsKyRhU3Im9QUE2DGHT9GnTCkKlApGyg2E4mKgqjqK6sOA4wo1pZvCfFzQaeOmmKrPzsE4ylkENvqnbAXIoXy/ksqTL/uPZ6Ry3L5dK8d3STgeevHo6ct3zCUP/vZvXre18Cl+/tHHjg1zIGaZepZ/uRm9pM1nMZSv06yYL60bZ+nuMGxtEQkT7FytBUxw8KkuyrS/qrqkKDPfYBAOAFNBFtpTJaSRlCttiLFmM2NCKvc0UYxtwTHuQrWx/JXTR1dgLM3p8rRDCcTS4O7xQluuXjr79j/z5o7tc0z7HG+/ZeHuO952mYo+f/Vb3335sw999VhaAnFpEeWz8i2qSLR81ma0hKNUiyoqLTQci3nSKCr+RcbskWEbZEyApJT0orRCME09pKgdE/xMx1T9LsDC2jNQwewzcX19vNvUWqQUxY1hOndR4QbHAMvY68IUjC3AmDd6HuVWF/8UUwQZK/tGwyoUi99FZPjkD3/0hlaOt9506aCf8Ee/+e2XPvOlh46q4EruU1xMlS8xW9FqMQel8i3K96QJLVTrAx14Gc2VLnawtrqOTxUA8+f11U1dcMDKpehMvsOQoEb1kTncARQztI2S81XstgGXkmQeqpbatmEYpx8yli8zNsQ2fWGKuBW8K9WzFZhUn2cVGdbd/dIhKi+jAlyxtq42nbcuyLCs4P3pL/zTC7z4Ef5ubWsDkSvDoQ6yZEXeog66qJRFFYUu03PKQrW6Ao8IURvVwSZaqhBfA3kTwJjDxPcNYl4z0X3BF9N0vVhFD5DwXULMXexwgLatMNTElI7R0TAmWHEdHMf6utssLCzsjbvFbpphYZppRajhmOaQVInc8rXKXcyKZli5Wsx7TGMBaOEZBPWeL2hQerbOfdXPmIrECsN7ptf1ZdX3MsN2TfsThu0Jx2dE7RzU98Esx+86BtNfyOdsy1yRe9fnmeO18GyPNdimzTpgzF3ZnaqqfWldVBeJT/GHKu8mN6713Msa4zfDKlSjajWgIi6FYhtJuFHneR0cyTQU5bMQCpiptX2qKNqnjuC4BpbpME/JuRCKPqVoalYPFrOWVZWu4cKkOuupPUhczeZ9UxZDC8ZSqliHBm4oyten0JrMoOlS7cRq6RrzGNeT4rtYVCZ001eaAEe1jshbtog8fSdlQqvFavGJ3NjWs1h0lW6hzGeW+xEVLId5LcZVKELe62AERV85f9+Py5m9qb0PVpQK2Lb2qdQWASEmogtETRo+gcXf6nNVUI7XlwPoUy8x24diwLZxAnCi1M4cF8wuFhMck+427YajanMqFzLI5F+PI2S6+ndeVBbyudZ5i4JV8ziv0q2EZiqKQrV5So7aSa4URU0pctasw1vVz2jq3FdXljafoUk9IevOd2UDOTRQFqKBP9WVME/NOTRth7OwauGTKhwRGzjUtCLRAlCb3p9oeiSdbt0CR921SvkeFRghQxDKtyihV7ZblauONpEVahCL3MQiWFOa2avzobEMtvj6MPuUlyl9x6UcbSqqui3OLmyF2kQ5AXP3tPYVlwVGTx6nDB4faIG1KywLAe6C0GNt40YYF2Sm0LoowWiBo4pWF0oPJRU1IIuq36gCNWtu5wqGrGh6pQIp1SZYq1AcrdvQFDQNIGG5OOuQ9LU/rapKly8S2IURZaoC9UWwfcED4fieFOXiSuiuLwtRU01UYRu/Xts0lUlU02nabOxi8wtuAB+jD47K7JVmc1lQVgFNm87KjM4MP1QOw/wCyJVi2U+69CmWPV5C7/7UddGjZoBdmOZDrXBjMh+xpjTrcKnDmDcwp6rHbPJ3+lwQlFqKXQYfYqkpagAoptJcT0qQeiybSr0mY9tTBY75WS4AqTPCIa+67fp02fVvzQZZNfps+uG4xbwMjdLaaiL6Er+R4PvLaqZu3c9Xb2XAidDyma22mTjVY84cgyJ0MIXOlaZ8NuZgjVHJBtj4AzBd7GOzJ3hjMt7dFee2AsgaJJ0/Pq7Nv1ktKWa/SESDi90WIaZc9LbjERbIogGavoo/vumINlXoApDNddDWF9l05kwTYLYFSwyfZewqPpMqdLvZfZuQTGS3NZ4hZsgA3D/8agXu+txbV8CBGpW2JXiHPjgRxiY/YkjKjOsc2Aaob6qha/44FRpURU4dgNjRQI0NVwqssCNAUX2M00BOwG/H18+hoOvP1r/EV1lEePxirnxDSun3qvlrAp1p37Z2qyxgv9xyDrhD3fo61rUJjnTt+G/SerTt9tqqMUpXxBiFGZpWGJo+iANsXRPcAUTb4KR23+MOgLrUoy3YwQl3aNd8Z0oBiSYtSX0BJFtlHqrJ2wRA1OKyXfZX7qrILqX5WVe5jhDx+7MJbWuipvRGAaOvnUBM6AMRAJSpfdS2pPXIdnn8QFSppvQe043Etl+TouWGc0lVlegxW2GMgw8mNMgnabriGM5P19uamtIdXqScoEIp/jlqN0FG2JbNbDf5AYVHMTKCqnQdF7VTHLKw9q+mquehv2esHjE+ReUzzZtCZpwzX2IDCjvY5lQxjkE9UkwVwfwJ0sjsPj5KsMJlHrn6PVPnKPOIA5BahYVqzoYoRtf5oGwDIw/Q0CmBXSakdwFPjDTGLkYz+aJSjNBgGXeAJST9xOTH48yd+mI6lrqCMhV1AOaPmHKLWW06Pt/3aKMSIEBVUd0ftnPIOzSlYZ1dw6HH1lQxhrbG3UwP2GimNKUNaF01Mo9qc5mZpkBEVYm6TGxwHIcpktyk452r2C4lx9IFWEEAvs1n6FPdocoqdt/kGGZ6m22MO1XI9RtN8mYR250S7fH/AgwAcLo2Eoki2tsAAAAASUVORK5CYII=);
  background-size: contain;
  pointer-events: none;
}

.character__city--disable {
  opacity: 0.7;
}

.character__city--disable,
.character__city--disable span {
  cursor: not-allowed;
}

/* 移动端响应式调整 */
@media (max-width: 640px) {
  .character__sidebar {
    display: none;
  }
}
</style>

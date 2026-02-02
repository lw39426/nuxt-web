<script setup lang="ts">
import { useHomeApi } from '~/composables/api/home'
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

const _routeLink = [
  {
    name: 'Home',
    link: '/'
  },
  {
    name: 'navbar-60fps-test',
    link: '/navbar-60fps-test'
  },
  {
    name: 'performance-test',
    link: '/performance-test'
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
    { rel: 'preload', as: 'image', href: '/bg-light.png' },
    { rel: 'preconnect', href: 'https://images.unsplash.com' },
    { rel: 'dns-prefetch', href: 'https://images.unsplash.com' }
  ]
})

const { getHomeConfig } = useHomeApi()
// 获取首页配置数据
const { data: homeConfig } = await useAsyncData('home-config', () => getHomeConfig())

// 设置动态背景图样式
const heroStyle = computed(() => {
  if (homeConfig.value?.hero?.backgroundImage) {
    return {
      backgroundImage: `url('${homeConfig.value.hero.backgroundImage}')`
    }
  }
  return {}
})
</script>

<template>
  <main>
    <!-- 1. Hero Section -->
    <section class="relative">
      <!-- 背景-->
      <div class="bg-image-hero z-9 select-none pointer-events-none" :style="heroStyle" />
      <!-- 英雄标题板块 -->
      <div class="relative z-10 section-container text-center">
        <h1
          class="text-5xl pt-[9rem] md:pt-24 md:text-7xl font-bold text-white tracking-tight leading-tight mb-6 font-display drop-shadow-md"
          v-html="homeConfig?.hero?.title || 'The Intelligent <br /> Documentation Platform'"
        ></h1>
        <p
          class="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 font-medium drop-shadow-sm"
        >
          {{
            homeConfig?.hero?.subtitle ||
            'Meet the next generation of documentation. AI-native, beautiful out-of-the-box, and built for collaboration.'
          }}
        </p>

        <!-- 毛玻璃搜索 Email Input Form -->
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

        <!-- 苹果浏览器窗口板块 -->
        <div
          class="relative max-w-5xl mx-auto rounded-xl bg-white dark:bg-gray-900 shadow-hero border border-gray-200 dark:border-gray-800 overflow-hidden animate-fade-in-up"
        >
          <!-- 苹果窗口样式 -->
          <div class="bg-white dark:bg-gray-900 p-0 aspect-[16/9] relative">
            <!-- 实际开发中这里可以使用 img 标签引用你的截图，或者用 HTML 写出那个界面 -->
            <div class="absolute inset-0 flex">
              <img
                alt="Hero illustration"
                width="1080"
                height="656"
                decoding="async"
                data-nimg="1"
                class="w-full h-auto block dark:hidden select-none bg-background-main"
                style="color: transparent"
                src="https://www.mintlify.com/hero/hero-image-light.svg"
              />
              <img
                alt="Hero illustration"
                width="1080"
                height="656"
                decoding="async"
                data-nimg="1"
                class="w-full h-auto hidden dark:block select-none bg-background-main"
                style="color: transparent"
                src="https://www.mintlify.com/hero/hero-image-dark.svg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. Logos Section -->
    <section
      class="md:px-8 md:pt-18 pt-24 md:pb-18 pb-24 mx-auto flex items-center flex-col justify-between"
    >
      <div
        class="flex flex-wrap justify-center md:grid md:gap-y-7 gap-2 md:max-w-5xl w-full items-center md:grid-cols-2"
      >
        <div
          class="md:h-16 h-10 flex items-center justify-center max-md:w-[120px] md:w-auto"
          aria-label="Lovable"
          role="img"
          title="Lovable"
        >
          <div aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="107"
              height="18"
              viewBox="0 0 107 18"
              fill="none"
              class="max-md:h-[14px]"
            >
              <g clip-path="url(#clip0_12108_66238)">
                <path
                  d="M100.132 17.9289C98.8247 17.9289 97.6891 17.6797 96.7251 17.1814C95.7611 16.6749 95.0095 15.9151 94.4704 14.9022C93.9394 13.8892 93.6738 12.6351 93.6738 11.1401C93.6738 9.71863 93.9516 8.49321 94.5072 7.46387C95.0627 6.42635 95.8306 5.638 96.8109 5.09882C97.7913 4.55963 98.9064 4.29004 100.156 4.29004C101.357 4.29004 102.423 4.55147 103.355 5.0743C104.286 5.59715 105.009 6.3569 105.524 7.35358C106.046 8.35025 106.308 9.54298 106.308 10.9318C106.308 11.4301 106.304 11.8264 106.296 12.1204H96.5291V9.54707H103.931L102.534 10.025C102.534 9.35509 102.436 8.79549 102.24 8.34617C102.052 7.88868 101.774 7.54557 101.406 7.31681C101.039 7.08808 100.593 6.9737 100.071 6.9737C99.5232 6.9737 99.0412 7.1085 98.6245 7.37808C98.2161 7.63951 97.8974 8.03165 97.6688 8.55448C97.4481 9.07733 97.3378 9.70638 97.3378 10.4416V11.7038C97.3378 12.4554 97.4522 13.0926 97.681 13.6154C97.9097 14.1383 98.2365 14.5345 98.6613 14.8041C99.0861 15.0655 99.5885 15.1962 100.169 15.1962C100.806 15.1962 101.333 15.0328 101.749 14.7061C102.166 14.3711 102.427 13.9014 102.534 13.2968H106.247C106.132 14.2445 105.81 15.0655 105.279 15.7599C104.756 16.4543 104.057 16.9895 103.183 17.3653C102.309 17.741 101.292 17.9289 100.132 17.9289Z"
                  fill="currentColor"
                ></path>
                <path d="M88.8506 0H92.5636V17.5724H88.8506V0Z" fill="currentColor"></path>
                <path
                  d="M82.5324 17.9278C81.8298 17.9278 81.2008 17.8053 80.6453 17.5602C80.0979 17.3151 79.6323 16.9475 79.2483 16.4574C78.8644 15.959 78.5785 15.3462 78.3906 14.6192L78.7826 14.7295V17.5724H75.1064V4.64433H78.8194V7.5363L78.4028 7.60983C78.5907 6.91543 78.8766 6.32315 79.2606 5.83298C79.6527 5.33465 80.1307 4.95476 80.6943 4.69334C81.258 4.42375 81.8912 4.28895 82.5937 4.28895C83.6476 4.28895 84.5625 4.56263 85.3387 5.10998C86.1148 5.65733 86.7111 6.44569 87.1278 7.47503C87.5443 8.49621 87.7527 9.70938 87.7527 11.1145C87.7527 12.5115 87.5403 13.7246 87.1155 14.754C86.6907 15.7752 86.082 16.5594 85.2896 17.1068C84.5053 17.6542 83.5863 17.9278 82.5324 17.9278ZM81.3806 15.0971C81.9361 15.0971 82.4017 14.9337 82.7775 14.607C83.1615 14.2802 83.4474 13.8186 83.6353 13.2222C83.8313 12.6259 83.9295 11.9233 83.9295 11.1145C83.9295 10.3057 83.8313 9.60317 83.6353 9.0068C83.4474 8.41043 83.1615 7.94886 82.7775 7.62209C82.4017 7.28713 81.9361 7.11967 81.3806 7.11967C80.8332 7.11967 80.3635 7.28713 79.9713 7.62209C79.5874 7.94886 79.2973 8.41452 79.1013 9.01906C78.9053 9.61543 78.8071 10.3139 78.8071 11.1145C78.8071 11.9233 78.9053 12.6259 79.1013 13.2222C79.2973 13.8186 79.5874 14.2802 79.9713 14.607C80.3635 14.9337 80.8332 15.0971 81.3806 15.0971ZM75.1064 0H78.8194V4.64433H75.1064V0Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M65.7863 17.9289C64.9774 17.9289 64.2503 17.7696 63.605 17.451C62.9678 17.1324 62.4653 16.679 62.0978 16.0907C61.7382 15.4944 61.5586 14.8001 61.5586 14.0076C61.5586 12.7985 61.9139 11.8754 62.6247 11.2381C63.3354 10.5928 64.3607 10.172 65.7005 9.97597L67.943 9.65736C68.3923 9.592 68.7477 9.51031 69.0091 9.41228C69.2705 9.31425 69.4625 9.18353 69.585 9.02015C69.7076 8.84859 69.7688 8.63209 69.7688 8.37067C69.7688 8.10108 69.6953 7.856 69.5483 7.63543C69.4094 7.40669 69.197 7.22695 68.9111 7.09624C68.6333 6.95736 68.2942 6.88793 67.8939 6.88793C67.2567 6.88793 66.7462 7.0554 66.3622 7.39035C65.9782 7.71712 65.7699 8.16644 65.7373 8.7383H61.9016C61.9344 7.87234 62.1958 7.10441 62.686 6.43452C63.1843 5.75646 63.8746 5.22952 64.7569 4.85373C65.6391 4.47794 66.6604 4.29004 67.8204 4.29004C69.0377 4.29004 70.067 4.4902 70.9085 4.8905C71.75 5.28263 72.3831 5.84632 72.8079 6.58157C73.2408 7.31681 73.4573 8.19503 73.4573 9.21621V14.608C73.4573 15.1881 73.4982 15.7273 73.5799 16.2256C73.6697 16.7157 73.7964 17.0262 73.9598 17.1569V17.5736H70.0997C70.0099 17.2223 69.9404 16.8261 69.8914 16.3849C69.8423 15.9437 69.8137 15.478 69.8056 14.988L70.406 14.7306C70.2509 15.3106 69.9649 15.8457 69.5483 16.3359C69.1397 16.8178 68.6129 17.2059 67.9675 17.5C67.3302 17.786 66.6031 17.9289 65.7863 17.9289ZM67.1587 15.2085C67.6815 15.2085 68.1431 15.0941 68.5434 14.8653C68.9437 14.6284 69.2501 14.3017 69.4625 13.8851C69.6831 13.4684 69.7933 12.9946 69.7933 12.4636V10.7725L70.0997 10.944C69.9036 11.2055 69.6586 11.4056 69.3644 11.5445C69.0785 11.6834 68.6904 11.8019 68.2002 11.8999L67.2567 12.0837C66.6277 12.2062 66.1538 12.3941 65.8353 12.6474C65.5249 12.9007 65.3696 13.256 65.3696 13.7135C65.3696 14.171 65.5371 14.5345 65.872 14.8041C66.207 15.0737 66.6359 15.2085 67.1587 15.2085Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M48.9297 4.64453H52.8755L56.2699 15.7346H55.0813L58.3408 4.64453H62.1764L57.7036 17.5726H53.5739L48.9297 4.64453Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M43.1257 17.9289C41.8431 17.9289 40.7157 17.6512 39.7436 17.0956C38.7795 16.5402 38.0321 15.7477 37.501 14.7183C36.9782 13.689 36.7168 12.484 36.7168 11.1034C36.7168 9.72272 36.9782 8.5218 37.501 7.50064C38.0321 6.47128 38.7795 5.67885 39.7436 5.12332C40.7157 4.56781 41.8431 4.29004 43.1257 4.29004C44.4083 4.29004 45.5316 4.56781 46.4956 5.12332C47.4595 5.67885 48.203 6.47128 48.7258 7.50064C49.2569 8.5218 49.5223 9.72272 49.5223 11.1034C49.5223 12.484 49.2569 13.689 48.7258 14.7183C48.203 15.7477 47.4595 16.5402 46.4956 17.0956C45.5316 17.6512 44.4083 17.9289 43.1257 17.9289ZM43.1257 15.086C43.6649 15.086 44.1264 14.9388 44.5104 14.6448C44.8944 14.3425 45.1884 13.8973 45.3927 13.3091C45.597 12.7128 45.699 11.9774 45.699 11.1034C45.699 9.80441 45.4744 8.81999 45.025 8.1501C44.5757 7.47203 43.9426 7.13301 43.1257 7.13301C42.5865 7.13301 42.1209 7.28414 41.7287 7.58641C41.3448 7.88051 41.0506 8.32574 40.8465 8.92211C40.6422 9.51031 40.54 10.2374 40.54 11.1034C40.54 11.9693 40.6422 12.7005 40.8465 13.2968C41.0506 13.8932 41.3448 14.3425 41.7287 14.6448C42.1209 14.9388 42.5865 15.086 43.1257 15.086Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M25.8633 0H29.7111V14.8342L29.0248 14.0377C29.0248 14.0377 30.9306 14.0377 34.209 14.0377C37.4873 14.0377 37.0391 17.5724 37.0391 17.5724H25.8633V0Z"
                  fill="currentColor"
                ></path>
                <mask
                  id="mask0_12108_66238"
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="18"
                  height="18"
                  style="mask-type: alpha"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M5.7887 0C8.65241 0 10.9739 2.32761 10.9739 5.19885V7.17474H12.6995C15.5633 7.17474 17.8847 9.50235 17.8847 12.3735C17.8847 15.2448 15.5633 17.5724 12.6995 17.5724H0.603516V5.19885C0.603516 2.32761 2.925 0 5.7887 0Z"
                    fill="url(#paint0_linear_12108_66238)"
                  ></path>
                </mask>
                <g mask="url(#mask0_12108_66238)">
                  <g filter="url(#filter0_f_12108_66238)">
                    <path
                      d="M8.18533 21.0777C14.646 21.0777 19.8834 15.8403 19.8834 9.37967C19.8834 2.91902 14.646 -2.31836 8.18533 -2.31836C1.72469 -2.31836 -3.5127 2.91902 -3.5127 9.37967C-3.5127 15.8403 1.72469 21.0777 8.18533 21.0777Z"
                      fill="#4B73FF"
                    ></path>
                  </g>
                  <g filter="url(#filter1_f_12108_66238)">
                    <path
                      d="M9.47032 14.6587C17.7447 14.6587 24.4524 9.42136 24.4524 2.96072C24.4524 -3.49992 17.7447 -8.7373 9.47032 -8.7373C1.19597 -8.7373 -5.51172 -3.49992 -5.51172 2.96072C-5.51172 9.42136 1.19597 14.6587 9.47032 14.6587Z"
                      fill="#FF66F4"
                    ></path>
                  </g>
                  <g filter="url(#filter2_f_12108_66238)">
                    <path
                      d="M11.9138 11.0331C18.3745 11.0331 23.6119 6.43357 23.6119 0.759729C23.6119 -4.91411 18.3745 -9.51367 11.9138 -9.51367C5.4532 -9.51367 0.21582 -4.91411 0.21582 0.759729C0.21582 6.43357 5.4532 11.0331 11.9138 11.0331Z"
                      fill="#FF0105"
                    ></path>
                  </g>
                  <g filter="url(#filter3_f_12108_66238)">
                    <path
                      d="M9.67873 9.99321C13.5642 9.99321 16.7139 6.84345 16.7139 2.95803C16.7139 -0.927392 13.5642 -4.07715 9.67873 -4.07715C5.79331 -4.07715 2.64355 -0.927392 2.64355 2.95803C2.64355 6.84345 5.79331 9.99321 9.67873 9.99321Z"
                      fill="#FE7B02"
                    ></path>
                  </g>
                </g>
              </g>
              <defs>
                <filter
                  id="filter0_f_12108_66238"
                  x="-8.75529"
                  y="-7.56096"
                  width="33.8817"
                  height="33.8817"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  ></feBlend>
                  <feGaussianBlur
                    stdDeviation="2.6213"
                    result="effect1_foregroundBlur_12108_66238"
                  ></feGaussianBlur>
                </filter>
                <filter
                  id="filter1_f_12108_66238"
                  x="-10.7543"
                  y="-13.9799"
                  width="40.4491"
                  height="33.8817"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  ></feBlend>
                  <feGaussianBlur
                    stdDeviation="2.6213"
                    result="effect1_foregroundBlur_12108_66238"
                  ></feGaussianBlur>
                </filter>
                <filter
                  id="filter2_f_12108_66238"
                  x="-5.02678"
                  y="-14.7563"
                  width="33.8817"
                  height="31.0321"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  ></feBlend>
                  <feGaussianBlur
                    stdDeviation="2.6213"
                    result="effect1_foregroundBlur_12108_66238"
                  ></feGaussianBlur>
                </filter>
                <filter
                  id="filter3_f_12108_66238"
                  x="-2.59904"
                  y="-9.31975"
                  width="24.5555"
                  height="24.5555"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  ></feBlend>
                  <feGaussianBlur
                    stdDeviation="2.6213"
                    result="effect1_foregroundBlur_12108_66238"
                  ></feGaussianBlur>
                </filter>
                <linearGradient
                  id="paint0_linear_12108_66238"
                  x1="6.41895"
                  y1="3.08804"
                  x2="11.6839"
                  y2="17.5658"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0.025" stop-color="#FF8E63"></stop>
                  <stop offset="0.56" stop-color="#FF7EB0"></stop>
                  <stop offset="0.95" stop-color="#4B73FF"></stop>
                </linearGradient>
                <clipPath id="clip0_12108_66238">
                  <rect
                    width="105.794"
                    height="18"
                    fill="white"
                    transform="translate(0.603516)"
                  ></rect>
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
        <div
          class="md:h-16 h-10 flex items-center justify-center max-md:w-[120px] md:w-auto"
          aria-label="Lovable"
          role="img"
          title="Lovable"
        >
          <div aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="107"
              height="18"
              viewBox="0 0 107 18"
              fill="none"
              class="max-md:h-[14px]"
            >
              <g clip-path="url(#clip0_12108_66238)">
                <path
                  d="M100.132 17.9289C98.8247 17.9289 97.6891 17.6797 96.7251 17.1814C95.7611 16.6749 95.0095 15.9151 94.4704 14.9022C93.9394 13.8892 93.6738 12.6351 93.6738 11.1401C93.6738 9.71863 93.9516 8.49321 94.5072 7.46387C95.0627 6.42635 95.8306 5.638 96.8109 5.09882C97.7913 4.55963 98.9064 4.29004 100.156 4.29004C101.357 4.29004 102.423 4.55147 103.355 5.0743C104.286 5.59715 105.009 6.3569 105.524 7.35358C106.046 8.35025 106.308 9.54298 106.308 10.9318C106.308 11.4301 106.304 11.8264 106.296 12.1204H96.5291V9.54707H103.931L102.534 10.025C102.534 9.35509 102.436 8.79549 102.24 8.34617C102.052 7.88868 101.774 7.54557 101.406 7.31681C101.039 7.08808 100.593 6.9737 100.071 6.9737C99.5232 6.9737 99.0412 7.1085 98.6245 7.37808C98.2161 7.63951 97.8974 8.03165 97.6688 8.55448C97.4481 9.07733 97.3378 9.70638 97.3378 10.4416V11.7038C97.3378 12.4554 97.4522 13.0926 97.681 13.6154C97.9097 14.1383 98.2365 14.5345 98.6613 14.8041C99.0861 15.0655 99.5885 15.1962 100.169 15.1962C100.806 15.1962 101.333 15.0328 101.749 14.7061C102.166 14.3711 102.427 13.9014 102.534 13.2968H106.247C106.132 14.2445 105.81 15.0655 105.279 15.7599C104.756 16.4543 104.057 16.9895 103.183 17.3653C102.309 17.741 101.292 17.9289 100.132 17.9289Z"
                  fill="currentColor"
                ></path>
                <path d="M88.8506 0H92.5636V17.5724H88.8506V0Z" fill="currentColor"></path>
                <path
                  d="M82.5324 17.9278C81.8298 17.9278 81.2008 17.8053 80.6453 17.5602C80.0979 17.3151 79.6323 16.9475 79.2483 16.4574C78.8644 15.959 78.5785 15.3462 78.3906 14.6192L78.7826 14.7295V17.5724H75.1064V4.64433H78.8194V7.5363L78.4028 7.60983C78.5907 6.91543 78.8766 6.32315 79.2606 5.83298C79.6527 5.33465 80.1307 4.95476 80.6943 4.69334C81.258 4.42375 81.8912 4.28895 82.5937 4.28895C83.6476 4.28895 84.5625 4.56263 85.3387 5.10998C86.1148 5.65733 86.7111 6.44569 87.1278 7.47503C87.5443 8.49621 87.7527 9.70938 87.7527 11.1145C87.7527 12.5115 87.5403 13.7246 87.1155 14.754C86.6907 15.7752 86.082 16.5594 85.2896 17.1068C84.5053 17.6542 83.5863 17.9278 82.5324 17.9278ZM81.3806 15.0971C81.9361 15.0971 82.4017 14.9337 82.7775 14.607C83.1615 14.2802 83.4474 13.8186 83.6353 13.2222C83.8313 12.6259 83.9295 11.9233 83.9295 11.1145C83.9295 10.3057 83.8313 9.60317 83.6353 9.0068C83.4474 8.41043 83.1615 7.94886 82.7775 7.62209C82.4017 7.28713 81.9361 7.11967 81.3806 7.11967C80.8332 7.11967 80.3635 7.28713 79.9713 7.62209C79.5874 7.94886 79.2973 8.41452 79.1013 9.01906C78.9053 9.61543 78.8071 10.3139 78.8071 11.1145C78.8071 11.9233 78.9053 12.6259 79.1013 13.2222C79.2973 13.8186 79.5874 14.2802 79.9713 14.607C80.3635 14.9337 80.8332 15.0971 81.3806 15.0971ZM75.1064 0H78.8194V4.64433H75.1064V0Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M65.7863 17.9289C64.9774 17.9289 64.2503 17.7696 63.605 17.451C62.9678 17.1324 62.4653 16.679 62.0978 16.0907C61.7382 15.4944 61.5586 14.8001 61.5586 14.0076C61.5586 12.7985 61.9139 11.8754 62.6247 11.2381C63.3354 10.5928 64.3607 10.172 65.7005 9.97597L67.943 9.65736C68.3923 9.592 68.7477 9.51031 69.0091 9.41228C69.2705 9.31425 69.4625 9.18353 69.585 9.02015C69.7076 8.84859 69.7688 8.63209 69.7688 8.37067C69.7688 8.10108 69.6953 7.856 69.5483 7.63543C69.4094 7.40669 69.197 7.22695 68.9111 7.09624C68.6333 6.95736 68.2942 6.88793 67.8939 6.88793C67.2567 6.88793 66.7462 7.0554 66.3622 7.39035C65.9782 7.71712 65.7699 8.16644 65.7373 8.7383H61.9016C61.9344 7.87234 62.1958 7.10441 62.686 6.43452C63.1843 5.75646 63.8746 5.22952 64.7569 4.85373C65.6391 4.47794 66.6604 4.29004 67.8204 4.29004C69.0377 4.29004 70.067 4.4902 70.9085 4.8905C71.75 5.28263 72.3831 5.84632 72.8079 6.58157C73.2408 7.31681 73.4573 8.19503 73.4573 9.21621V14.608C73.4573 15.1881 73.4982 15.7273 73.5799 16.2256C73.6697 16.7157 73.7964 17.0262 73.9598 17.1569V17.5736H70.0997C70.0099 17.2223 69.9404 16.8261 69.8914 16.3849C69.8423 15.9437 69.8137 15.478 69.8056 14.988L70.406 14.7306C70.2509 15.3106 69.9649 15.8457 69.5483 16.3359C69.1397 16.8178 68.6129 17.2059 67.9675 17.5C67.3302 17.786 66.6031 17.9289 65.7863 17.9289ZM67.1587 15.2085C67.6815 15.2085 68.1431 15.0941 68.5434 14.8653C68.9437 14.6284 69.2501 14.3017 69.4625 13.8851C69.6831 13.4684 69.7933 12.9946 69.7933 12.4636V10.7725L70.0997 10.944C69.9036 11.2055 69.6586 11.4056 69.3644 11.5445C69.0785 11.6834 68.6904 11.8019 68.2002 11.8999L67.2567 12.0837C66.6277 12.2062 66.1538 12.3941 65.8353 12.6474C65.5249 12.9007 65.3696 13.256 65.3696 13.7135C65.3696 14.171 65.5371 14.5345 65.872 14.8041C66.207 15.0737 66.6359 15.2085 67.1587 15.2085Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M48.9297 4.64453H52.8755L56.2699 15.7346H55.0813L58.3408 4.64453H62.1764L57.7036 17.5726H53.5739L48.9297 4.64453Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M43.1257 17.9289C41.8431 17.9289 40.7157 17.6512 39.7436 17.0956C38.7795 16.5402 38.0321 15.7477 37.501 14.7183C36.9782 13.689 36.7168 12.484 36.7168 11.1034C36.7168 9.72272 36.9782 8.5218 37.501 7.50064C38.0321 6.47128 38.7795 5.67885 39.7436 5.12332C40.7157 4.56781 41.8431 4.29004 43.1257 4.29004C44.4083 4.29004 45.5316 4.56781 46.4956 5.12332C47.4595 5.67885 48.203 6.47128 48.7258 7.50064C49.2569 8.5218 49.5223 9.72272 49.5223 11.1034C49.5223 12.484 49.2569 13.689 48.7258 14.7183C48.203 15.7477 47.4595 16.5402 46.4956 17.0956C45.5316 17.6512 44.4083 17.9289 43.1257 17.9289ZM43.1257 15.086C43.6649 15.086 44.1264 14.9388 44.5104 14.6448C44.8944 14.3425 45.1884 13.8973 45.3927 13.3091C45.597 12.7128 45.699 11.9774 45.699 11.1034C45.699 9.80441 45.4744 8.81999 45.025 8.1501C44.5757 7.47203 43.9426 7.13301 43.1257 7.13301C42.5865 7.13301 42.1209 7.28414 41.7287 7.58641C41.3448 7.88051 41.0506 8.32574 40.8465 8.92211C40.6422 9.51031 40.54 10.2374 40.54 11.1034C40.54 11.9693 40.6422 12.7005 40.8465 13.2968C41.0506 13.8932 41.3448 14.3425 41.7287 14.6448C42.1209 14.9388 42.5865 15.086 43.1257 15.086Z"
                  fill="currentColor"
                ></path>
                <path
                  d="M25.8633 0H29.7111V14.8342L29.0248 14.0377C29.0248 14.0377 30.9306 14.0377 34.209 14.0377C37.4873 14.0377 37.0391 17.5724 37.0391 17.5724H25.8633V0Z"
                  fill="currentColor"
                ></path>
                <mask
                  id="mask0_12108_66238"
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="18"
                  height="18"
                  style="mask-type: alpha"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M5.7887 0C8.65241 0 10.9739 2.32761 10.9739 5.19885V7.17474H12.6995C15.5633 7.17474 17.8847 9.50235 17.8847 12.3735C17.8847 15.2448 15.5633 17.5724 12.6995 17.5724H0.603516V5.19885C0.603516 2.32761 2.925 0 5.7887 0Z"
                    fill="url(#paint0_linear_12108_66238)"
                  ></path>
                </mask>
                <g mask="url(#mask0_12108_66238)">
                  <g filter="url(#filter0_f_12108_66238)">
                    <path
                      d="M8.18533 21.0777C14.646 21.0777 19.8834 15.8403 19.8834 9.37967C19.8834 2.91902 14.646 -2.31836 8.18533 -2.31836C1.72469 -2.31836 -3.5127 2.91902 -3.5127 9.37967C-3.5127 15.8403 1.72469 21.0777 8.18533 21.0777Z"
                      fill="#4B73FF"
                    ></path>
                  </g>
                  <g filter="url(#filter1_f_12108_66238)">
                    <path
                      d="M9.47032 14.6587C17.7447 14.6587 24.4524 9.42136 24.4524 2.96072C24.4524 -3.49992 17.7447 -8.7373 9.47032 -8.7373C1.19597 -8.7373 -5.51172 -3.49992 -5.51172 2.96072C-5.51172 9.42136 1.19597 14.6587 9.47032 14.6587Z"
                      fill="#FF66F4"
                    ></path>
                  </g>
                  <g filter="url(#filter2_f_12108_66238)">
                    <path
                      d="M11.9138 11.0331C18.3745 11.0331 23.6119 6.43357 23.6119 0.759729C23.6119 -4.91411 18.3745 -9.51367 11.9138 -9.51367C5.4532 -9.51367 0.21582 -4.91411 0.21582 0.759729C0.21582 6.43357 5.4532 11.0331 11.9138 11.0331Z"
                      fill="#FF0105"
                    ></path>
                  </g>
                  <g filter="url(#filter3_f_12108_66238)">
                    <path
                      d="M9.67873 9.99321C13.5642 9.99321 16.7139 6.84345 16.7139 2.95803C16.7139 -0.927392 13.5642 -4.07715 9.67873 -4.07715C5.79331 -4.07715 2.64355 -0.927392 2.64355 2.95803C2.64355 6.84345 5.79331 9.99321 9.67873 9.99321Z"
                      fill="#FE7B02"
                    ></path>
                  </g>
                </g>
              </g>
              <defs>
                <filter
                  id="filter0_f_12108_66238"
                  x="-8.75529"
                  y="-7.56096"
                  width="33.8817"
                  height="33.8817"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  ></feBlend>
                  <feGaussianBlur
                    stdDeviation="2.6213"
                    result="effect1_foregroundBlur_12108_66238"
                  ></feGaussianBlur>
                </filter>
                <filter
                  id="filter1_f_12108_66238"
                  x="-10.7543"
                  y="-13.9799"
                  width="40.4491"
                  height="33.8817"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  ></feBlend>
                  <feGaussianBlur
                    stdDeviation="2.6213"
                    result="effect1_foregroundBlur_12108_66238"
                  ></feGaussianBlur>
                </filter>
                <filter
                  id="filter2_f_12108_66238"
                  x="-5.02678"
                  y="-14.7563"
                  width="33.8817"
                  height="31.0321"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  ></feBlend>
                  <feGaussianBlur
                    stdDeviation="2.6213"
                    result="effect1_foregroundBlur_12108_66238"
                  ></feGaussianBlur>
                </filter>
                <filter
                  id="filter3_f_12108_66238"
                  x="-2.59904"
                  y="-9.31975"
                  width="24.5555"
                  height="24.5555"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood>
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    result="shape"
                  ></feBlend>
                  <feGaussianBlur
                    stdDeviation="2.6213"
                    result="effect1_foregroundBlur_12108_66238"
                  ></feGaussianBlur>
                </filter>
                <linearGradient
                  id="paint0_linear_12108_66238"
                  x1="6.41895"
                  y1="3.08804"
                  x2="11.6839"
                  y2="17.5658"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0.025" stop-color="#FF8E63"></stop>
                  <stop offset="0.56" stop-color="#FF7EB0"></stop>
                  <stop offset="0.95" stop-color="#4B73FF"></stop>
                </linearGradient>
                <clipPath id="clip0_12108_66238">
                  <rect
                    width="105.794"
                    height="18"
                    fill="white"
                    transform="translate(0.603516)"
                  ></rect>
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. Features Bento Grid -->
    <section class="py-24 bg-gray-50/50 dark:bg-gray-900 content-visibility-auto">
      <div class="section-container">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <h2 class="text-4xl font-bold font-display mb-4">Built for the intelligence age</h2>
          <p class="text-gray-500 dark:text-gray-400 text-lg">
            Integrate AI into every part of your docs lifecycle. Woven into how your knowledge is
            written, maintained, and understood.
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8">
          <div
            v-for="(feat, idx) in features"
            :key="idx"
            class="bg-white dark:bg-gray-800 rounded-3xl p-8 border border-gray-100 dark:border-gray-700 shadow-card flex flex-col h-full hover:shadow-lg transition duration-300"
          >
            <div class="mb-6">
              <span class="badge-green">{{ feat.badge }}</span>
            </div>
            <h3 class="text-2xl font-bold mb-3">{{ feat.title }}</h3>
            <p class="text-gray-500 dark:text-gray-400 leading-relaxed mb-8">{{ feat.desc }}</p>

            <!-- Visual Mockup Area inside Card -->
            <div
              class="mt-auto bg-gray-50 dark:bg-gray-700 rounded-xl h-48 border border-gray-100 dark:border-gray-600 relative overflow-hidden flex items-center justify-center"
            >
              <div
                v-if="feat.visualType === 'code'"
                class="text-xs font-mono text-gray-400 p-4 w-full"
              >
                <div
                  class="bg-white dark:bg-gray-900 p-3 rounded shadow-sm border border-gray-200 dark:border-gray-700 w-3/4 mx-auto"
                >
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
          class="mt-8 bg-white dark:bg-gray-800 rounded-3xl p-8 md:p-12 border border-gray-100 dark:border-gray-700 shadow-card text-center"
        >
          <span class="badge-green mb-4 inline-block">ASSISTANT</span>
          <h3 class="text-3xl font-bold mb-4">Intelligent assistance for your users</h3>
          <p class="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-12">
            Turn every documentation visit into a guided conversation.
          </p>

          <!-- Mock UI for Chat -->
          <div
            class="max-w-3xl bg1 mx-auto bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 aspect-[2/1] flex items-center justify-center"
          >
            <div
              class="bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 px-6 py-3 w-full max-w-md text-left text-gray-400 text-sm flex justify-between"
            >
              <span>Ask AI anything...</span>
              <div class="i-carbon-send-filled text-mint-500" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4. Enterprise Dark Section -->
    <section class="py-24 bg-white dark:bg-gray-950 content-visibility-auto">
      <div class="section-container">
        <div class="mb-12">
          <span class="badge-green mb-2 inline-block">ENTERPRISE-REINVENTION</span>
          <h2 class="text-4xl font-bold font-display mb-4">
            Bring intelligence to enterprise knowledge
          </h2>
          <div class="flex justify-between items-end">
            <p class="text-gray-500 dark:text-gray-400 max-w-xl">
              Modernize without the rebuild with enterprise-grade professional service & security.
            </p>
            <button
              class="bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-full text-sm font-medium"
            >
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
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
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
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              How Cursor scaled with just 12 employees...
            </p>
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
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
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
    <section class="py-24 bg-white dark:bg-gray-900 text-center">
      <UMarquee :repeat="3" :duration="20000">
        <UIcon name="i-carbon-logo-github" class="size-10 shrink-0 mx-8" />
        <UIcon name="i-carbon-logo-discord" class="size-10 shrink-0 mx-8" />
        <UIcon name="i-carbon-logo-twitter" class="size-10 shrink-0 mx-8" />
        <UIcon name="i-carbon-logo-instagram" class="size-10 shrink-0 mx-8" />
        <UIcon name="i-carbon-logo-linkedin" class="size-10 shrink-0 mx-8" />
        <UIcon name="i-carbon-logo-facebook" class="size-10 shrink-0 mx-8" />
      </UMarquee>
      <div class="section-container mt-12">
        <h2 class="text-4xl md:text-5xl font-bold font-display mb-6">
          Make documentation your <br />
          winning advantage
        </h2>
        <p class="text-gray-500 dark:text-gray-400 mb-10">
          Join the leaders of tomorrow to future proof your documentation today.
        </p>
        <div class="flex justify-center gap-4">
          <button
            class="bg-black dark:bg-white text-white dark:text-black px-8 py-3 rounded-full font-medium hover:scale-105 transition"
          >
            Get started for free
          </button>
          <button
            class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white px-8 py-3 rounded-full font-medium hover:bg-gray-50 transition"
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
  background-position: 50%;
  background-repeat: no-repeat;
  background-size: contain;
  width: 100%;
  height: 80%;
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

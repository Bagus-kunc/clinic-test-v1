<template>
  <div class="flex justify-center h-full relative card bg-transparent overflow-hidden">
    <div ref="fullscreenDiv" class="flex justify-center max-h-[100svh]">
      <!-- Pagination -->
      <div class="swiper-pagination-container !top-7 left-1/2 w-full flex justify-center z-10">
        <div class="swiper-pagination" />
      </div>

      <!-- Navigation Buttons -->
      <button
        v-show="products.length > 1 && isInitialized && !coverSubMenu"
        class="px-3 bg-transparent"
        :disabled="!isInitialized"
        @click="handlePrev"
      >
        <Icon name="ic:baseline-arrow-circle-left" size="30" :style="{ color: isInitialized ? '#AAAAAAFC' : '#ccc' }" />
      </button>

      <div :class="['relative w-full flex justify-center items-center', isFullScreen ? 'bg-white' : 'bg-transparent']">
        <Swiper
          ref="swiperRef"
          :modules="swiperModules"
          :slides-per-view="1"
          :loop="products.length > 1"
          :speed="500"
          :space-between="30"
          :pagination="paginationOptions"
          :navigation="navigationOptions"
          :autoplay="autoplayOptions"
          :lazy="{ loadPrevNext: true, loadOnTransitionStart: true }"
          class="max-h-[100dvw] md:w-[100dvh]"
          :class="{
            ' md:max-h-[100dvh] max-w-[110dvh] !m-0': isFullScreen,
            'md:max-h-[91dvh]': !isFullScreen,
          }"
          @swiper="handleSwiperInit"
          @slideChange="onSlideChange"
          @lazy-image-load="handleImageLoad"
        >
          <!-- Empty State -->
          <SwiperSlide v-if="coverSubMenu !== ''" class="relative !w-[100%]">
            <div class="relative w-full md:h-full max-h-full">
              <img
                placeholder
                :src="coverSubMenu"
                alt="Cover Image"
                format="webp"
                class="object-cover md:h-full mx-auto"
                loading="lazy"
                fetchpriority="high"
                :sizes="{ sm: '320px', md: '768px', lg: '1024px' }"
                @loadstart="handleImageStartLoad"
                @load="handleImageLoad"
                @error="handleImageError"
              />
              <Icon
                class="absolute bottom-4 right-4 z-10 p-2 rounded-full bg-black/80 hover:bg-black/50 transition-colors"
                :name="isFullScreen ? 'ic:baseline-fullscreen-exit' : 'ic:sharp-fullscreen'"
                size="35"
                @click="toggleFullscreen"
              />
            </div>
          </SwiperSlide>

          <!-- Content Slides -->
          <SwiperSlide
            v-else
            v-for="(product, index) in products"
            :key="`${product.id}-${index}`"
            class="relative !w-[100%]"
          >
            <!-- Image Content -->
            <div v-if="isImageType(product)" class="relative w-full md:h-full max-h-full">
              <img
                placeholder
                :src="product.url"
                :alt="product.title || 'Content Image'"
                format="webp"
                class="object-cover md:h-full mx-auto"
                loading="lazy"
                fetchpriority="high"
                :sizes="{ sm: '320px', md: '768px', lg: '1024px' }"
                @loadstart="handleImageStartLoad"
                @load="handleImageLoad"
                @error="handleImageError"
              />

              <!-- Fullscreen Button -->
              <Icon
                class="absolute bottom-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/60 transition-colors"
                :name="isFullScreen ? 'ic:baseline-fullscreen-exit' : 'ic:sharp-fullscreen'"
                size="35"
                @click="toggleFullscreen"
              />
            </div>
            <!-- Video Content -->
            <div
              v-else-if="isVideoType(product)"
              class="relative w-full md:h-full max-h-full flex items-center justify-center"
            >
              <img
                v-if="isVideoType(product)"
                src="/images/contents/not-found.jpg"
                format="webp"
                layout="fill"
                class="top-0 left-0 w-full md:h-full"
                alt="Background Image"
                fetchpriority="high"
              />
              <div class="absolute w-full aspect-[16/9]">
                <iframe
                  :src="getEmbedUrl(product.url)"
                  class="top-0 left-0 w-full h-full"
                  :title="product.title || 'Video content'"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  @load="handleImageLoad"
                />
                <!-- allowfullscreen -->
              </div>

              <!-- Fullscreen Button -->
              <Icon
                class="absolute bottom-4 right-4 z-10 p-2 rounded-full bg-black/50 hover:bg-black/60 transition-colors"
                :name="isFullScreen ? 'ic:baseline-fullscreen-exit' : 'ic:sharp-fullscreen'"
                size="35"
                @click="toggleFullscreen"
              />
            </div>
          </SwiperSlide>
        </Swiper>
      </div>

      <!-- Next Button -->
      <button
        v-show="products.length > 1 && isInitialized && !coverSubMenu"
        class="px-3 bg-transparent"
        :disabled="!isInitialized"
        @click="handleNext"
      >
        <Icon
          name="ic:baseline-arrow-circle-right"
          size="30"
          :style="{ color: isInitialized ? '#AAAAAAFC' : '#ccc' }"
        />
      </button>
    </div>
  </div>
</template>

<script setup>
import { Pagination, Navigation, Autoplay, EffectCreative } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { useMenuStore } from '~/composables/menuStore';

const props = defineProps({
  // data: {
  //   type: Array,
  //   required: true,
  //   default: [],
  // },
  cover: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['image-loaded']);
const menuStore = useMenuStore();

// Refs
const swiperRef = ref(null);
const swiperInstance = ref(null);
const fullscreenDiv = ref(null);
const isFullScreen = ref(false);
const isLoading = ref(true);
const isInitialized = ref(false);
const products = ref([]);
const coverSubMenu = ref('');

// Computed
const swiperModules = computed(() => [Pagination, Navigation, Autoplay, EffectCreative]);

const paginationOptions = computed(() => ({
  clickable: true,
  el: '.swiper-pagination',
  type: 'bullets',
  dynamicBullets: false,
  renderBullet: (index, className) => `
    <div class="${className} swiper-bullet-wrapper py-3 cursor-pointer flex justify-center items-center !bg-transparent">
      <span class="bullet-visual block h-1 w-full bg-[#000080] rounded-full"></span>
    </div>
  `,
}));

const navigationOptions = computed(() => ({
  prevEl: '.swiper-button-prev',
  nextEl: '.swiper-button-next',
}));

const autoplayOptions = computed(() => ({
  delay: 5000,
  disableOnInteraction: false,
  pauseOnMouseEnter: true,
  enabled: props.autoplay,
}));

// Methods
const isImageType = (product) => product.type === 'image' || product.type === 1;
const isVideoType = (product) => product.type === 'iframe' || product.type === 2;

const handleImageError = (event) => {
  event.target.src = '/images/contents/not-found.jpg';
  console.error('Gambar gagal dimuat, menampilkan gambar cadangan.');
};

const getEmbedUrl = (url) => {
  if (!url) return '';

  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;
    const pathname = urlObj.pathname;

    const validHosts = ['youtube.com', 'www.youtube.com', 'youtu.be'];

    if (validHosts.some((host) => hostname.includes(host))) {
      let videoId = null;

      if (hostname.includes('youtube.com')) {
        videoId = urlObj.searchParams.get('v') || (pathname.startsWith('/shorts/') ? pathname.split('/')[2] : null);
      } else if (hostname.includes('youtu.be')) {
        videoId = pathname.slice(1);
      }

      return videoId ? `https://www.youtube.com/embed/${videoId}?enablejsapi=1&fs=0` : url;
    }

    return url;
  } catch (error) {
    console.error('Invalid URL:', url, error);
    return url;
  }
};

const handleSwiperInit = (swiper) => {
  swiperInstance.value = swiper;
  isInitialized.value = true;
};

const handleNext = () => {
  if (swiperInstance.value && isInitialized.value) {
    swiperInstance.value.slideNext();
  }
};

const handlePrev = () => {
  if (swiperInstance.value && isInitialized.value) {
    swiperInstance.value.slidePrev();
  }
};

const onSlideChange = () => {
  if (!swiperInstance.value) return;

  const iframes = document.querySelectorAll('iframe');
  iframes.forEach((iframe) => {
    const src = iframe.src;
    if (src.includes('youtube.com') || src.includes('youtu.be')) {
      iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
    }
  });
};

const toggleFullscreen = async () => {
  var isInFullScreen =
    (document.fullscreenElement && document.fullscreenElement !== null) ||
    (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
    (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
    (document.msFullscreenElement && document.msFullscreenElement !== null);

  var docElm = fullscreenDiv.value;
  if (!isInFullScreen) {
    if (docElm.requestFullscreen) {
      docElm.requestFullscreen();
    } else if (docElm.mozRequestFullScreen) {
      docElm.mozRequestFullScreen();
    } else if (docElm.webkitRequestFullScreen) {
      docElm.webkitRequestFullScreen();
    } else if (docElm.msRequestFullscreen) {
      docElm.msRequestFullscreen();
    }

    const wrapper = document.querySelector('.swiper-wrapper').classList
    wrapper.add('!h-[100dvh]')
    isFullScreen.value = true;
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
     const wrapper = document.querySelector('.swiper-wrapper').classList
    wrapper.remove('!h-[100dvh]')
    isFullScreen.value = false;
  }
};

const handleImageStartLoad = () => {
  isLoading.value = true;
  menuStore.setLoading(true);
};

const handleImageLoad = () => {
  isLoading.value = false;
  menuStore.setLoading(false);
  menuStore.setImagesLoaded(false);
};

// Lifecycle
onMounted(async () => {
  const handleFullscreenChange = () => {
    isFullScreen.value = !!document.fullscreenElement;
  };

  document.addEventListener('fullscreenchange', handleFullscreenChange);

  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
  });
});

watchEffect(() => {
  products.value = menuStore.dataSideMenu || [];
  if (props.cover !== coverSubMenu.value) {
    coverSubMenu.value = props.cover;
  }
});

onMounted(() => {
  const paginationContainer = document.querySelector('.swiper-pagination');

  if (paginationContainer) {
    const observer = new MutationObserver(() => {
      const bullets = paginationContainer.querySelectorAll('.swiper-pagination-bullet');
      console.log('Jumlah bullets:', bullets.length);
      swiperInstance.value.slideTo(0);

      const adjustBulletSize = () => {
        const windowWidth = window.innerWidth;
        const swiperContainer = document.querySelector('.swiper-pagination-container').classList
        let bulletWidth;

        if (windowWidth > 768) {
          if (bullets.length >= 5 && bullets.length < 7) {
            bulletWidth = '80px';
          } else if (bullets.length >= 7 && bullets.length < 11) {
            bulletWidth = '60px';
          } else if (bullets.length >= 11 && bullets.length <= 12) {
            bulletWidth = '40px';
          } else if (bullets.length > 12) {
            bulletWidth = '30px';
          }
        } else {
          if (bullets.length < 5) {
            bulletWidth = '';
          } else if (bullets.length >= 5 && bullets.length < 7) {
            bulletWidth = '60px';
          } else if (bullets.length >= 7 && bullets.length < 11) {
            bulletWidth = '50px';
          } else if (bullets.length >= 11 && bullets.length <= 12) {
            bulletWidth = '30px';
          } else if (bullets.length > 12) {
            bulletWidth = '20px';
          }
        }

        bullets.forEach((bullet) => {
          bullet.style.width = bulletWidth;
        });
      };

      adjustBulletSize();

      window.addEventListener('resize', adjustBulletSize);

      onBeforeUnmount(() => {
        window.removeEventListener('resize', adjustBulletSize);
        observer.disconnect();
      });
    });

    observer.observe(paginationContainer, { childList: true, subtree: true });
  }
});
</script>

<style scoped>
.swiper-pagination-container {
  position: absolute;
  transform: translateX(-50%);
  z-index: 998;
  padding: 4px;
  background-color: transparent;
  border-radius: 15px;
}

:deep(.swiper-wrapper) {
  height: 91dvh;
}

:deep(.swiper-pagination-bullet) {
  @apply lg:w-28 md:w-20 sm:w-12 w-10 h-1 rounded-full opacity-50;
  margin: 0 4px !important;

  transition: all 0.3s ease;
}

:deep(.swiper-pagination-bullet-active) {
  @apply bg-[#000080] opacity-100;
}

.card {
  @apply overflow-hidden;
}
</style>

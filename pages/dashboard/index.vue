<template>
  <SplashScreen v-show="coverIsReady" />

  <div v-if="!apiDataStore.loading" class="w-full h-[100svh] flex flex-col" style="font-family: 'Lato', sans-serif">
    <Header v-model:selected="selectedHeader" />

    <div class="flex flex-1">
      <Sidebar :data="sidebarData" />

      <div class="flex-1 flex flex-col relative md:pl-[250px]">
        <div v-if="menuStore.loading && !menuStore.imagesLoaded" class="spinner-overlay"></div>
        <div v-if="menuStore.imagesLoaded" class="spinner-overlay">
          <ProgressSpinner />
        </div>

        <CustomCarousel class="flex-1" :cover="menuStore.cover" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useApiDataStore } from '~/composables/useApiDataStores';
import { useMenuStore } from '~/composables/menuStore';
import Sidebar from '~/components/Sidebar.vue';
import Header from '~/components/Header.vue';
import CustomCarousel from '~/components/CustomCarousel.vue';
import ProgressSpinner from 'primevue/progressspinner';

definePageMeta({
  middleware: 'auth',
});

const apiDataStore = useApiDataStore();
const menuStore = useMenuStore();

const selectedHeader = ref();
const coverIsReady = ref(true);

const sidebarData = computed(() => {
  const filter = apiDataStore.data.categories.find((item) => item.id === menuStore.selected);
  return filter?.data || [];
});

let intervalCheckAllImages;
const checkAllImageLoaded = async () => {
  const { data } = storeToRefs(apiDataStore);

  const images = [];
  data.value.categories.forEach((category) => {
    category.data.forEach((menu) => {
      if (menu.cover) {
        images.push(menu.cover);
      }
    });
  });

  intervalCheckAllImages = setInterval(async () => {
    const response = await checkImageOnCache(images);

    if (!response) {
      clearInterval(intervalCheckAllImages);
      console.log('All cover are loaded');
      coverIsReady.value = false;
    }
  }, 1000);
};

onMounted(() => {
  setTimeout(() => {
    menuStore.setImagesLoaded(false);
    checkAllImageLoaded();
  }, 2000);
});
</script>

<style scoped>
/* Main Layout */
.spinner-overlay {
  top: 0;
  left: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  z-index: 1000;
}

.not-found {
  position: absolute;
  top: 0;
  left: 0;
  padding-left: 250px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  font-size: 3rem;
  color: #687489;
  justify-content: center;
  background-position: center;
  z-index: 999;
}

.sidebar {
  width: 250px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

/* Fade transition for elements */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

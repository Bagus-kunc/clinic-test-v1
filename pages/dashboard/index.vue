<template>
  <div>
    <SplashScreen v-show="coverIsReady" />

    <div v-if="!apiDataStore.loading" class="w-full h-[100svh] flex flex-col" style="font-family: 'Lato', sans-serif">
      <!-- <Header v-model:selected="selectedHeader" /> -->
      <Header :selected="selectedHeader" @update:selected="(val) => (selectedHeader = val)" />

      <div class="flex flex-1">
        <Sidebar :data="sidebarData" />

        <div class="flex-1 flex flex-col relative md:pl-[250px]">
          <div v-if="menuStore.loading && !menuStore.imagesLoaded" class="spinner-overlay"></div>

          <div v-if="!imageCacheStore.allImagesCached" class="spinner-overlay">
            <ProgressSpinner />
          </div>

          <CustomCarousel class="flex-1" :cover="menuStore.cover" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useApiDataStore } from '~/composables/useApiDataStores';
import { useMenuStore } from '~/composables/menuStore';
import { useImageCacheStore } from '~/composables/imageCacheStore';
import Sidebar from '~/components/Sidebar.vue';
import Header from '~/components/Header.vue';
import CustomCarousel from '~/components/CustomCarousel.vue';
import ProgressSpinner from 'primevue/progressspinner';

definePageMeta({
  middleware: 'auth',
});

const apiDataStore = useApiDataStore();
const menuStore = useMenuStore();
const imageCacheStore = useImageCacheStore();

const selectedHeader = ref(1);

menuStore.setSelected(selectedHeader.value);

// syncronize first state and change when header clicked
watch(
  selectedHeader,
  (newVal) => {
    menuStore.setSelected(newVal);
  },
  { flush: 'sync' },
);

/**
 * coverIsReady is now reactive to imageCacheStore.allImagesCached
 * When all images are cached, splash screen is hidden (coverIsReady = false)
 */
const coverIsReady = computed(() => !imageCacheStore.allImagesCached);

const sidebarData = computed(() => {
  const filter = apiDataStore.data.categories.find((item) => item.id === menuStore.selected);
  return filter?.data || [];
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

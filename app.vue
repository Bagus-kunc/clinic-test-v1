<template>
  <div>
    <Toast />
    <NuxtPwaManifest />
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { watch, onBeforeUnmount, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import Toast from 'primevue/toast';
import { useApiDataStore } from '@/composables/useApiDataStores';
import { useImageCacheStore } from '@/composables/imageCacheStore';
import { backgroundCacher } from '@/utils/backgroundImageCache';

const apiDataStore = useApiDataStore();
const imageCacheStore = useImageCacheStore();

/**
 * Collect image URLs by priority
 * Priority 0: First category menus (critical)
 * Priority 1: Other categories (normal)
 * Priority 2: Sub-items (low priority)
 */
const collectImagesByPriority = () => {
  const { data } = storeToRefs(apiDataStore);
  const criticalImages = []; // Priority 0
  const normalImages = []; // Priority 1
  const lowPriorityImages = []; // Priority 2

  data.value.categories?.forEach((category, categoryIndex) => {
    category.data?.forEach((menu, menuIndex) => {
      if (menu.cover) {
        // First category menus are critical
        if (categoryIndex === 0 && menuIndex < 3) {
          criticalImages.push(menu.cover);
        } else {
          normalImages.push(menu.cover);
        }
      }

      menu.data?.forEach((submenu) => {
        submenu.data?.forEach((item) => {
          if (item.url && (item.url.endsWith('.jpg') || item.url.endsWith('.png') || item.url.endsWith('.jpeg'))) {
            lowPriorityImages.push(item.url);
          }
        });
      });
    });
  });

  return { criticalImages, normalImages, lowPriorityImages };
};

/**
 * Start background image caching with priority
 * Does NOT block the UI - caches happen in background
 */
const startBackgroundImageCaching = () => {
  const { criticalImages, normalImages, lowPriorityImages } = collectImagesByPriority();

  // Add images with decreasing priority (lower = higher priority)
  if (criticalImages.length > 0) {
    backgroundCacher.addToQueue(criticalImages, 0);
  }

  if (normalImages.length > 0) {
    backgroundCacher.addToQueue(normalImages, 1);
  }

  if (lowPriorityImages.length > 0) {
    backgroundCacher.addToQueue(lowPriorityImages, 2);
  }

  // Start centralized polling for all images
  const allImages = [...criticalImages, ...normalImages, ...lowPriorityImages];
  if (allImages.length > 0) {
    imageCacheStore.startPolling(allImages);
  }
};

watch(
  () => apiDataStore.data,
  (state) => {},
  { deep: true },
);

onBeforeUnmount(() => {
  // Clean up polling when app is about to unmount
  imageCacheStore.reset();
});

onMounted(async () => {
  await apiDataStore.fetchData();
  // Start background caching WITHOUT blocking - UI shows immediately
  startBackgroundImageCaching();
});
</script>

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
import { fetchAndCacheImage } from '@/utils/fetchAndCacheImage';

const apiDataStore = useApiDataStore();
const imageCacheStore = useImageCacheStore();

/**
 * Collect all image URLs from API data
 */
const collectAllImageUrls = () => {
  const { data } = storeToRefs(apiDataStore);
  const urls = [];

  data.value.categories?.forEach((category) => {
    category.data?.forEach((menu) => {
      if (menu.cover) {
        urls.push(menu.cover);
      }
      menu.data?.forEach((submenu) => {
        submenu.data?.forEach((item) => {
          if (item.url && (item.url.endsWith('.jpg') || item.url.endsWith('.png') || item.url.endsWith('.jpeg'))) {
            urls.push(item.url);
          }
        });
      });
    });
  });

  return urls;
};

const loadDataImage = async () => {
  const { data } = storeToRefs(apiDataStore);

  await Promise.all(
    data.value.categories.map(async (category) => {
      await Promise.all(
        category.data.map(async (menu) => {
          if (menu.cover) {
            await fetchAndCacheImage(menu.cover);
          }
        }),
      );
    }),
  );

  await Promise.all(
    data.value.categories.map(async (category) => {
      await Promise.all(
        category.data.map(async (menu) => {
          await Promise.all(
            menu.data.map(async (submenu) => {
              await Promise.all(
                submenu.data.map(async (item) => {
                  if (
                    item.url &&
                    (item.url.endsWith('.jpg') || item.url.endsWith('.png') || item.url.endsWith('.jpeg'))
                  ) {
                    await fetchAndCacheImage(item.url);
                  }
                }),
              );
            }),
          );
        }),
      );
    }),
  );

  // Start centralized polling after initial image fetching
  const allImageUrls = collectAllImageUrls();
  if (allImageUrls.length > 0) {
    imageCacheStore.startPolling(allImageUrls);
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
  loadDataImage();
});
</script>

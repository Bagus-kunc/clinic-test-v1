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
import Toast from 'primevue/toast';
import { useApiDataStore } from '@/composables/useApiDataStores';

const apiDataStore = useApiDataStore();

const loadDataImage = async () => {
  const { data } = storeToRefs(apiDataStore);

  await Promise.all(
    data.value.categories.map(async (category) => {
      await Promise.all(
        category.data.map(async (menu) => {
          if (menu.cover) {
            console.log('cover');
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
                    console.log('img');
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
};

watch(
  () => apiDataStore.data,
  (state) => {},
  { deep: true },
);

onMounted(async () => {
  await apiDataStore.fetchData();
  loadDataImage();
});
</script>

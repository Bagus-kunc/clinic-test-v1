<template>
  <div
    class="sticky w-full z-[998] flex items-center justify-center gap-1 p-2 border-b border-[#cdd5e0] min-h-[80px] md:ml-[250px] md:max-w-[calc(100vw-250px)]"
  >
    <div class="flex md:hidden items-center flex-none mr-1">
      <Button class="!bg-white !border-gray-300 !text-gray-500" icon="pi pi-bars" @click="sidebarStore.toggle()">
        <Icon name="ic:menu" size="24" />
      </Button>
    </div>
    <div class="flex-1 overflow-x-auto">
      <ul class="flex text-nowrap sm:justify-center gap-3 md:gap-6 text-[#AAAAAAFC]">
        <li
          v-for="item in data.categories || []"
          :key="item.id"
          class="transition-colors duration-200 cursor-pointer px-1 rounded block"
          :class="{
            'bg-[#AAAAAAFC] text-white hover:text-white': selected === item.id,
            'hover:bg-[#f0f0f0] hover:text-[#AAAAAAFC]': selected !== item.id,
          }"
          @click="handleItem(item.data, item.id)"
        >
          {{ item.title?.toUpperCase() || 'UNTITLED' }}
        </li>
      </ul>
    </div>
    <div class="flex items-center gap-2">
      <div class="w-3 h-3 rounded-full" :class="{ 'bg-green-500': isOnline, 'bg-red-500': !isOnline }"></div>
      <p
        :class="{
          'text-green-500 md:flex sm:flex hidden': isOnline,
          'text-red-500 md:flex sm:flex hidden': !isOnline,
        }"
      >
        {{ isOnline ? 'ONLINE' : 'OFFLINE' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { useApiDataStore } from '@/composables/useApiDataStores';
import { useMenuStore } from '@/composables/menuStore';
import { useOnlineStore } from '~/composables/onlineStore';

const menuStore = useMenuStore();

const apiDataStore = useApiDataStore();
const onlineStore = useOnlineStore();
const { data } = storeToRefs(apiDataStore);
const { isOnline } = storeToRefs(onlineStore);

const sidebarStore = useSidebar();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps({
  // eslint-disable-next-line vue/require-default-prop
  selected: { type: Number, required: true },
});

const emit = defineEmits(['update:selected']);

const handleItem = (dataMenu, id) => {
  if (dataMenu.length === 0) {
    console.log('data', dataMenu.length);
  }

  if (menuStore.selected !== id) {
    menuStore.setSelected(id);
    menuStore.setCover('/images/contents/not-found.jpg');
  }

  emit('update:selected', id);
};

const updateOnlineStatus = () => {
  onlineStore.setOnline(navigator.onLine);
};
onMounted(() => {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();
});
onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});

onMounted(async () => {
  if (!apiDataStore.data || !apiDataStore.data.categories?.length) {
    await apiDataStore.fetchData();
  }

  if (apiDataStore.data?.categories?.length) {
    menuStore.setCover('');
    const firstCategory = apiDataStore.data.categories[0];
    handleItem(firstCategory.data, firstCategory.id);
  }
});
</script>

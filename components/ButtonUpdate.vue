<template>
  <div class="px-1 flex justify-center">
    <Toast />
    <Button
      id="updateButton"
      class="rounded-full !bg-transparent !border-none !text-gray-500 !px-6"
      :class="isLoading ? '!text-black' : className"
      :disabled="isLoading"
      :aria-label="label"
      @click="updateCache"
    >
      <Icon name="ic:baseline-refresh" size="28" />
    </Button>
  </div>
</template>

<script setup>
import { useToast } from 'primevue/usetoast';

const toast = useToast();

const onlineStore = useOnlineStore();
const { isOnline } = storeToRefs(onlineStore);

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  className: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['click']);

const isLoading = ref(false);

const updateCache = () => {
  if (!isOnline.value) {
    return toast.add({
      severity: 'error',
      summary: 'Update Failed',
      detail: 'Please check your internet connection',
      life: 3000,
    });
  }

  isLoading.value = true;

  toast.add({ severity: 'info', summary: 'Updating...', detail: 'Cache update in progress', life: 3000 });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.active?.postMessage({
          action: 'update-cache',
        });
      })
      .catch((error) => {
        console.error('Service Worker error:', error);

        toast.add({ severity: 'error', summary: 'Error', detail: 'Cache update failed', life: 3000 });

        isLoading.value = false;
      });
  }

  emit('click', true);

  setTimeout(() => {
    toast.add({ severity: 'success', summary: 'Success', detail: 'Cache has been updated', life: 3000 });

    setTimeout(() => {
      emit('click', false);
      isLoading.value = false;
      // window.location.reload(true);
      window.location.href = window.location.href.split('?')[0] + '?nocache=' + new Date().getTime();
    }, 1000);
  }, 4000);
};

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CACHE_UPDATED') {
      console.log('Cache telah diperbarui!');
    }
  });
}
</script>

<style scoped>
.btn-update {
  padding: 10px 20px;
  text-align: center;
  cursor: pointer;
}

.btn-update:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>

import { defineStore } from 'pinia';

export const useOnlineStore = defineStore('online', {
  state: () => ({
    isOnline: false,
  }),
  actions: {
    setOnline(params: boolean) {
      this.isOnline = params;
    },
  },
});

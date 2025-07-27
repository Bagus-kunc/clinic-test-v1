export const useSidebar = defineStore('sidebar', {
  state: () => ({
    open: false,
  }),
  actions: {
    setOpen(params: boolean) {
      this.open = params;
    },
    toggle() {
      this.open ? (this.open = false) : (this.open = true);
    },
  },
});

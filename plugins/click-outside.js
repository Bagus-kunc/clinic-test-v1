export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.directive("click-outside", {
    mounted(el, binding) {
      el.clickOutsideEvent = function (event) {
        // Periksa apakah klik berada di luar elemen
        if (!(el === event.target || el.contains(event.target))) {
          // Panggil metode yang diberikan sebagai nilai directive
          binding.value(event);
        }
      };
      document.body.addEventListener("click", el.clickOutsideEvent);
    },
    unmounted(el) {
      document.body.removeEventListener("click", el.clickOutsideEvent);
    },
  });
});

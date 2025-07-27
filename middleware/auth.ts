export default defineNuxtRouteMiddleware(async () => {
  const TOKEN = useCookie('TOKEN');

  if (TOKEN.value) {
    const isValid = verifyToken(TOKEN.value);

    if (!isValid) {
      setTimeout(() => {
        TOKEN.value = null;
        return navigateTo('/');
      }, 500);
    }
  }

  if (!TOKEN.value) {
    return navigateTo('/');
  }
});

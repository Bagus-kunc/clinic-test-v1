export default defineNuxtRouteMiddleware(async () => {
  const TOKEN = useCookie('TOKEN');

  if (TOKEN.value) {
    const isValid = verifyToken(TOKEN.value);

    if (!isValid) {
      TOKEN.value = null;
      return navigateTo('/');
    }

    return navigateTo('/dashboard');
  }
});

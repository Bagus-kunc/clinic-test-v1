<template>
  <div class="loading-screen flex flex-col">
    <img src="/images/logo-img.png" alt="Loading" class="loading-image w-[180px] md:w-[250px]" />
    <h5 class="mt-4 font-bold text-lg text-black tracking-widest animate-pulse">LOADING...</h5>
  </div>
</template>

<style scoped>
/* Loading Screen */
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.loading-image {
  height: auto;
  animation:
    fadeIn 0.5s ease-in-out,
    pulse 1.3s ease-in-out infinite;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  from {
    transform: scale3d(1, 1, 1);
  }

  50% {
    transform: scale3d(1.05, 1.05, 1.05);
  }

  to {
    transform: scale3d(1, 1, 1);
  }
}
</style>

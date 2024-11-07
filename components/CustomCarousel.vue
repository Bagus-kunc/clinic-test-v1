<template>
  <div class="flex justify-center w-full h-full mt-4 ml-4 card">
    <Carousel
      :value="products"
      :numVisible="1"
      :numScroll="1"
      :showIndicators="false"
      class="h-full"
      contentClass="max-h-[110vh] max-w-[110vh]"
    >
      <template #item="{ data }">
        <div class="flex items-center justify-center h-full m-2 border rounded">
          <img
            :src="getImageSrc(data)"
            alt="Contents"
            class="object-cover w-full h-full"
          />
        </div>
      </template>
    </Carousel>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getCachedData, setCachedData } from "~/utils/cacheHelper";

const products = ref([
  { id: "1000", image: "/assets/images/contents/clinic1.jpg" },
  { id: "2000", image: "/assets/images/contents/clinic2.jpg" },
  { id: "3000", image: "/assets/images/contents/clinic3.jpg" },
  {
    id: "4000",
    image:
      "https://th.bing.com/th/id/OIP.DxxPRawG5eqjzSt_pax0XgHaEK?w=326&h=183&c=7&r=0&o=5&dpr=1.3&pid=1.7",
  },
]);

const imageCache = ref({});

const getImageSrc = (data) => {
  return imageCache.value[data.id] || data.image;
};

onMounted(async () => {
  for (const product of products.value) {
    let cachedImage = await getCachedData(product.image);
    if (!cachedImage) {
      await setCachedData(product.image, product.image, true);
      cachedImage = await getCachedData(product.image);
    }
    imageCache.value[product.id] = cachedImage;
  }
});
</script>

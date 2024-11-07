<template>
  <div class="flex w-full">
    <div v-if="selectedCategory && selectedCategory.data">
      <Card class="h-[200px] w-[300px] ml-4 mt-4 shadow-lg">
        <template #content>
          <div class="flex flex-col items-center gap-1">
            <div class="mb-4">
              <img :src="logoUrl" class="h-20" alt="Header Logo" />
            </div>
            <div>
              <ul class="grid grid-cols-2 gap-4 text-center text-gray-700">
                <li
                  v-for="category in categories"
                  :key="category.id"
                  @click="toggleSubMenu(category.id)"
                  class="transition-colors duration-200 cursor-pointer"
                  :class="{
                    'bg-blue-500 text-white px-1':
                      selectedCategoryId === category.id,
                    'hover:text-blue-500': selectedCategoryId !== category.id,
                  }"
                >
                  {{ category.title.toUpperCase() }}
                </li>
              </ul>
            </div>
          </div>
        </template>
      </Card>

      <Sidebar :category="selectedCategory" />
    </div>

    <CustomCarousel />
  </div>
</template>

<script setup>
import Header from "~/components/Header.vue";
import Sidebar from "~/components/Sidebar.vue";
import CustomCarousel from "~/components/CustomCarousel.vue";
import { ref, onMounted } from "vue";
import { getCachedData, setCachedData } from "~/utils/cacheHelper";

const categories = ref([]);
const selectedCategory = ref(null);
const selectedCategoryId = ref(null);
const logoUrl = ref("../../assets/images/logo.png"); // URL default logo

const fetchData = async () => {
  try {
    // Mencoba mengambil data dari cache
    const cachedData = await getCachedData("/dataClinic.json");

    if (cachedData) {
      // Jika data ada di cache
      categories.value = cachedData.categories;
      selectedCategory.value = cachedData.categories[0];
    } else {
      // Jika tidak ada di cache, fetch data dari jaringan
      const response = await fetch("/dataClinic.json");
      const data = await response.json();

      categories.value = data.categories;
      selectedCategory.value = data.categories[0];

      // Menyimpan data ke cache
      await setCachedData("/dataClinic.json", data);
    }

    // Mengambil logo gambar dari cache atau jaringan
    const cachedLogo = await getCachedData("logo.png");
    if (!cachedLogo) {
      await setCachedData("logo.png", logoUrl.value, true);
    } else {
      logoUrl.value = cachedLogo;
    }
  } catch (error) {
    console.log("Error fetching or accessing cache:", error);
  }
};

const toggleSubMenu = (id) => {
  const category = categories.value.find((cat) => cat.id === id);
  if (category && category.data) {
    selectedCategory.value = category;
    selectedCategoryId.value = id;
  } else {
    selectedCategory.value = null;
  }
};

onMounted(() => {
  fetchData();
});
</script>

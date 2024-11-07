<template>
  <div class="!max-h-[40vh] w-[300px] ml-4 mt-4 relative">
    <Listbox
      v-if="accordionItems.length"
      v-model="selectedBox"
      :options="accordionItems"
      class="w-full hidden-scrollbar"
      listStyle="max-height:70vh"
      @click="toggleSubMenu"
      optionLabel="title"
    >
      <template #option="{ option }">
        <div class="flex justify-between cursor-pointer">
          <div>{{ option.title }}</div>
        </div>
      </template>
    </Listbox>

    <!-- Teleport for Submenu -->
    <Teleport to="#teleports" v-if="isVisibel">
      <div
        class="submenu rounded-md"
        :style="{ top: submenuPosition.top, left: submenuPosition.left }"
        ref="refSubMenu"
      >
        <Listbox
          v-model="selectedSubItem"
          :options="selectedSubMenuItems"
          optionLabel="title"
          class="w-full sublist"
          listStyle="max-height:550px"
          @change="handleItemClick"
        >
        </Listbox>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from "vue";

// Mendefinisikan props untuk menerima data category
const props = defineProps({
  category: {
    type: Object,
    required: true,
  },
});

// Menyimpan data kategori dari props
const selectedBox = ref(props.category.title); // Set initial selectedBox based on category
const selectedSubItem = ref(null);
const selectedSubMenu = ref(null);
const refSubMenu = ref(null);
const isVisibel = ref(false);
const submenuPosition = ref({ top: "0px", left: "0px" });

const accordionItems = computed(() => props.category?.data || []);

// Retrieve the submenu data inside 'selectedBox.value.data'
const selectedSubMenuItems = computed(() => {
  // If selectedBox exists, return an array of 'data' in each item in it
  return selectedBox.value?.data || [];
});

// Cek data category di console untuk memastikan datanya
console.log(props.category);

// Ambil data accordion berdasarkan category atau fetch dari API
onMounted(() => {
  // Bisa menggunakan data dari props.category untuk menentukan data yang ditampilkan
  accordionItems.value = props.category.data || []; // Misalnya, category memiliki properti `items`

  if (!accordionItems.value.length) {
    fetch("/dataClinic.json")
      .then((response) => response.json())
      .then((data) => {
        accordionItems.value = data;
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }
});

// Toggle submenu berdasarkan category
const toggleSubMenu = () => {
  if (selectedBox.value && selectedSubMenuItems.value.length) {
    isVisibel.value = !isVisibel.value;

    nextTick(() => {
      const itemElement = document.querySelector(".p-listbox-option-selected");

      if (itemElement) {
        const rect = itemElement.getBoundingClientRect();

        // The initial position of the submenu: half above and half below the clicked element
        let adjustedTop = rect.top + window.scrollY + rect.height / 2;
        let adjustedLeft = rect.left + window.scrollX + rect.width + 10;

        submenuPosition.value = {
          top: `${adjustedTop}px`,
          left: `${adjustedLeft}px`,
        };

        nextTick(() => {
          const bodyRect = document.body.getBoundingClientRect();

          if (refSubMenu.value) {
            const rectSubmenu = refSubMenu.value.getBoundingClientRect();

            if (rectSubmenu.bottom > bodyRect.bottom) {
              adjustedTop =
                rect.bottom + window.scrollY - rectSubmenu.height / 2;
            }

            if (rectSubmenu.right > bodyRect.right) {
              adjustedLeft =
                rect.left + window.scrollX - rectSubmenu.width - 10;
            }

            submenuPosition.value = {
              top: `${adjustedTop - rectSubmenu.height / 2}px`,
              left: `${adjustedLeft}px`,
            };
          }
        });
      }
    });
  } else {
    isVisibel.value = false;
  }
};

// Handle item click
const handleItemClick = (clickableItem) => {
  console.log(
    `Item clicked: ${clickableItem.label}, Action: ${clickableItem.action}`
  );
};
</script>

<style scoped>
.scrollable-container {
  max-height: 70vh;
  overflow-y: auto;
  /* Hide scrollbar */
  scrollbar-width: none; /* For Firefox */
}
.scrollable-container::-webkit-scrollbar {
  display: none; /* For Chrome, Safari, and Opera */
}

.submenu {
  position: absolute;
  z-index: 1000;
  background: rgb(255, 255, 255);
  border: 1px solid #ddd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
</style>

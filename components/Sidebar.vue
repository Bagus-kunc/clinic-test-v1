<template>
  <div
    class="absolute bg-white md:bg-transparent top-0 min-w-[250px] menu-sidebar flex flex-col h-full pb-10 w-[250px] md:left-0 transition-all"
    :class="sidebarStore.open ? 'left-0 !fixed z-[1000]' : '-left-[250px]'"
  >
    <div class="sticky top-0 z-[1010] flex flex-col justify-center gap-5 pl-4 mb-4 px-4">
      <NuxtImg src="/images/logo-img.png" class="relative h-auto w-[220px]" alt="Header Logo" />
    </div>

    <div class="overflow-y-auto bg-transparent" style="max-height: calc(100vh - 20vh)" @scroll="handleScroll">
      <h1 class="px-7 unselectable text-gray-scorpion">Our Treatment:</h1>
      <Listbox
        v-if="accordionItems.length > 0"
        v-model="state.selectedBox"
        class="w-full bg-transparent border-none rounded-none menu custom-listbox"
        :options="accordionItems"
        listStyle="max-height:calc(100%); scrollbar-width:none;"
        pt:list:class="gap-[5px]"
        pt:option:class="!p-0"
      >
        <template #option="{ option }">
          <img v-if="isOptionSelected(option)" src="~/assets/images/bg-diamond.jpg" class="bg-img" />
          <div v-if="isOptionSelected(option)" class="bg-color" />
          <div
            class="relative z-50 flex items-center justify-between w-full h-full bg-transparent cursor-pointer menu-item"
            :class="{ 'menu-item-selected text-[#000080]': isOptionSelected(option) }"
            @click="handleMainClick(option)"
          >
            <div class="flex justify-between pl-6">{{ option.title }}</div>
            <div
              class="flex items-center justify-center h-full pl-4 pr-6"
              @click.stop="handleArrowClick(option, $event)"
            >
              <img
                v-if="isOptionSelected(option)"
                src="~/assets/icons/double-arrow-blue.svg"
                alt="double arrow icon"
                width="18"
              />
              <img v-else src="~/assets/icons/double-arrow-gray.svg" alt="double arrow icon" width="18" />
            </div>
          </div>
        </template>
      </Listbox>

      <!-- Teleport for Submenu -->
      <Teleport to="#teleports">
        <transition name="fade">
          <div
            v-if="isVisible"
            ref="refSubMenu"
            v-click-outside="handleClickOutside"
            class="submenu"
            :style="submenuPosition"
          >
            <Listbox
              v-if="isVisible && state.selectedSubMenu?.data?.length > 0"
              :options="state.selectedSubMenu.data"
              :model-value="state.selectedSubItem"
              optionLabel="title"
              pt:root:class="bg-image-submenu"
              class="w-full sublist"
              listStyle="max-height:550px"
              pt:option:class="!p-0"
            >
              <template #option="{ option, selected }">
                <div class="flex justify-between w-full px-3 py-2" @click.stop="handleItemClick(option)">
                  <span> {{ option.title }} </span>
                  <div class="flex-none w-6 ml-2">
                    <ProgressSpinner
                      v-if="option.loading"
                      style="width: 24px; height: 24px"
                      pt:circle:class="!text-gray-300"
                      strokeWidth="3"
                    />
                  </div>
                </div>
              </template>
            </Listbox>
          </div>
        </transition>
      </Teleport>

      <ButtonUpdate label="Update" class="mt-2" />
    </div>
  </div>
  <div
    v-if="sidebarStore.open"
    tabindex="0"
    class="fixed bg-black/40 inset-0 z-[999]"
    @click="sidebarStore.setOpen(false)"
  ></div>
</template>

<script setup>
import { useMenuStore } from '~/composables/menuStore';

const props = defineProps({
  data: { type: Array, required: true, default: () => {} },
});

const toast = useToast();
const menuStore = useMenuStore();
const sidebarStore = useSidebar();

// State management
const state = ref({
  selectedBox: null,
  selectedSubMenu: null,
  selectedSubItem: null,
  activeOption: null,
  currentCover: '',
  submenuVisible: false,
  loading: false,
  openedBox: null,
});

const accordionItems = ref([]);
const isClicked = ref(false);
const submenuPosition = ref({ top: '0px', left: '0px' });
const isVisible = computed(() => state.value.submenuVisible);
const refSubMenu = ref(null);

const isOptionSelected = (option) => state.value.activeOption?.id === option.id;

const handleMainClick = (option) => {
  if (!(option?.id === state.value.activeOption?.id && option?.title === state.value.activeOption?.title)) {
    menuStore.setLoading(true);
  }

  menuStore.setCover(option.cover);

  state.value.activeOption = option;
  state.value.selectedSubItem = null;
  sidebarStore.setOpen(false);
};

const handleArrowClick = async (option, event) => {
  const menuItem = event.target.closest('.menu-item');
  if (!menuItem) {
    console.warn('Menu item tidak ditemukan');
    return;
  }

  if (option?.data?.length > 0) {
    state.value.openedBox = option;
  } else {
    handleMainClick(option);
  }

  state.value.selectedSubMenu = {
    ...option,
    data: await Promise.all(
      option.data.map(async (subMenu) => {
        const images = subMenu.data.map((item) => item.url).filter(Boolean);
        return {
          ...subMenu,
          loading: await checkImageOnCache(images),
        };
      }),
    ),
  };

  state.value.submenuVisible = true;

  requestAnimationFrame(() => {
    const rect = menuItem.getBoundingClientRect();
    const menuItemWidth = 250;
    const menuItemHeight = 48;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let leftPosition = rect.right - 12 + window.scrollX;
    let topPosition = rect.top - 4 + window.scrollY;
    const submenu = refSubMenu.value.getBoundingClientRect();

    if (leftPosition + menuItemWidth > viewportWidth) {
      leftPosition = rect.left - 24;
      topPosition = rect.top + menuItemHeight + window.scrollY;
    }

    if (topPosition + submenu.height > viewportHeight) {
      topPosition = topPosition - (topPosition + submenu.height - viewportHeight);
    }

    submenuPosition.value = {
      top: `${topPosition}px`,
      left: `${leftPosition}px`,
    };
  });
};

const handleClickOutside = () => {
  state.value.submenuVisible = false;
};

const handleItemClick = (item) => {
  if (!(item?.id === state.value.selectedSubItem?.id && item?.title === state.value.selectedSubItem?.title)) {
    menuStore.setLoading(true);
  }
  state.value.selectedSubItem = item;
  state.value.activeOption = state.value.openedBox;

  menuStore.setCover('');

  if (item.data.length === 0) {
    menuStore.setNotFound(true);
    menuStore.setCover('/images/contents/not-found.jpg');
    menuStore.setLoading(false);
  } else {
    menuStore.setNotFound(false);
    menuStore.setDataSideMenu(item.data);
    console.log('ada');
  }

  setTimeout(() => {
    state.value.submenuVisible = false;
    sidebarStore.setOpen(false);
  }, 100);
};

watchEffect(() => {
  if (state.value.selectedBox) {
    const item = state.value.selectedBox;
  }
});

const checkLoadedMenu = () => {
  return accordionItems.value.every((menu) => !menu.loading);
};

const setAccordionItems = async (data) => {
  accordionItems.value = await Promise.all(
    data.map(async (item) => {
      const images = [];
      if (item.cover) {
        images.push(item.cover);
      }

      const subItems = item.data.map((subItem) => ({
        ...subItem,
        clicked: false,
        data: subItem.data.map((i) => {
          if (i.url) {
            images.push(i.url);
          }
          return { ...i };
        }),
      }));

      return {
        ...item,
        clicked: false,
        loading: await checkImageOnCache(images),
        data: subItems,
      };
    }),
  );
};

let intervalCheckMenu;
watch(
  () => props.data,
  async (newData) => {
    clearInterval(intervalCheckMenu);

    setAccordionItems(newData);

    intervalCheckMenu = setInterval(() => {
      setAccordionItems(newData);

      if (checkLoadedMenu()) {
        clearInterval(intervalCheckMenu);
      }
    }, 1000);
  },
  { immediate: true },
);

const setSelectedSubMenu = async () => {
  state.value.selectedSubMenu = {
    ...state.value.selectedSubMenu,
    data: await Promise.all(
      state.value.selectedSubMenu.data.map(async (subMenu) => {
        const images = subMenu.data.map((item) => item.url).filter((item) => item);

        return {
          ...subMenu,
          loading: await checkImageOnCache(images),
        };
      }),
    ),
  };
};

const checkLoadedSelectedSubMenu = () => {
  return state.value.selectedSubMenu.data.every((subMenu) => !subMenu.loading);
};

let intervalCheckAllImages;
const checkAllImageLoaded = async () => {
  const apiDataStore = useApiDataStore();
  const { data } = storeToRefs(apiDataStore);

  const images = [];

  data.value.categories.map((category) => {
    category.data.map((menu) => {
      if (menu.cover) {
        images.push(menu.cover);
      }
      menu.data.map((submenu) => {
        submenu.data.map((item) => {
          if (item.url) {
            images.push(item.url);
          }
        });
      });
    });
  });

  intervalCheckAllImages = setInterval(async () => {
    const response = await checkImageOnCache(images);

    if (!response) {
      clearInterval(intervalCheckAllImages);
      console.log('All images are loaded');
      toast.add({ severity: 'info', summary: 'Info', detail: 'All images are loaded', life: 5000 });
    }
  }, 1000);
};

let intervalCheckSubMenu;
watchEffect(async () => {
  if (isVisible.value) {
    intervalCheckSubMenu = setInterval(() => {
      setSelectedSubMenu();

      if (checkLoadedSelectedSubMenu()) {
        clearInterval(intervalCheckSubMenu);
      }
    }, 1000);
  }

  if (!isVisible.value) {
    clearInterval(intervalCheckSubMenu);
  }
});

const handleScroll = () => {
  state.value.submenuVisible = false;
};
watch(
  () => menuStore.selected,
  (selected) => {
    state.value.selectedBox = null;
    state.value.activeOption = null;
    state.value.selectedSubItem = null;
    state.value.openedBox = null;
  },
);

// Lifecycle hooks
onMounted(() => {
  checkAllImageLoaded();
  state.value.loading = true;
  menuStore.setCover('/images/contents/not-found.jpg');
});

const unwatch = watchEffect(() => {});

onUnmounted(() => {
  unwatch();
  clearInterval(intervalCheckSubMenu);
  clearInterval(intervalCheckMenu);
  clearInterval(intervalCheckAllImages);
  state.value.selectedSubMenu = [];
  accordionItems.value = [];
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Aguafina+Script&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');

.unselectable {
  pointer-events: none;
  user-select: none;
  font-size: 25px;
  font-family: 'BirdOfParadise', cursive;
  font-weight: 400;
}
.menu-sidebar {
  z-index: 1000;
  font-size: 16px;
  font-weight: 600;
  border-right: 1px solid #cdd5e0;
  display: flex;
  flex-direction: column;
}

.menu {
  color: #687489 !important;
  overflow: hidden;
}

.menu-item-selected {
  background-color: rgba(133, 167, 218, 0.1);
}

.submenu {
  position: fixed;
  color: #687489;
  font-weight: 600;
  margin-left: 25px;
  z-index: 1010;
  border-radius: 10px;
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15); */
  width: auto;
}

.menu-item {
  position: relative;
  /* padding: 1rem 0.8rem; */
}

.menu-item img {
  position: relative;
  z-index: 1;
}

.sublist {
  background-size: cover;
  background-image: url('~/assets/images/bg-diamond.jpg') !important;
}

.bg-img {
  position: absolute;
  top: -5px;
  left: 50px;
  transform: scaleX(-1);
  transform: origin;
  background-position: left bottom;
}

.bg-color {
  position: absolute;
  inset: 0;
  background: #85a7da94;
  border-radius: 4px;
  color: #000080 !important;
}

.spinner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  margin-left: 250px;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  z-index: 999;
}

.btn-update {
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

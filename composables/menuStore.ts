import { defineStore } from 'pinia';

export const useMenuStore = defineStore('menu', {
  state: () => ({
    category: {} as object,
    dataSideMenu: [] as Array<any>,
    selected: 1 as number | null,
    cover: '',
    imagesLoaded: false,
    loading: false,
    notFound: false,
  }),
  actions: {
    setCategory(isCategory: object) {
      if (typeof isCategory === 'object' && !Array.isArray(isCategory)) {
        this.category = isCategory;
      } else {
        console.error('Invalid category data: Expected an object');
      }
    },

    setDataSideMenu(idDataSideMenu: Array<any>) {
      if (Array.isArray(idDataSideMenu)) {
        this.dataSideMenu = idDataSideMenu;
      } else {
        console.error('Invalid dataSideMenu data: Expected an array');
      }
    },

    setSelected(isSelectedId: number | null) {
      if (typeof isSelectedId === 'number' || isSelectedId === null) {
        this.selected = isSelectedId;
      } else {
        console.error('Invalid selected id: Expected a number or null');
      }
    },

    setCover(isCover: string) {
      if (typeof isCover === 'string') {
        this.cover = isCover;
      } else {
        console.error('Invalid cover data: Expected a string');
      }
    },

    setLoading(isLoading: boolean) {
      if (typeof isLoading === 'boolean') {
        this.loading = isLoading;
      } else {
        console.error('Invalid loading state: Expected a boolean');
      }
    },

    setNotFound(isNotFound: boolean) {
      if (typeof isNotFound === 'boolean') {
        this.notFound = isNotFound;
      } else {
        console.error('Invalid notFound state: Expected a boolean');
      }
    },

    setImagesLoaded(isImagesLoaded: boolean) {
      if (typeof isImagesLoaded === 'boolean') {
        this.notFound = isImagesLoaded;
      } else {
        console.error('Invalid notFound state: Expected a boolean');
      }
    },
  },
});

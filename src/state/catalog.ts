import { configureStore, createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CatalogSort = "featured" | "recent" | "name";
export type CatalogLayout = "grid" | "list";

const initialState = {
  query: "",
  category: "",
  sort: "featured" as CatalogSort,
  layout: "grid" as CatalogLayout,
  page: 1,
};

const catalog = createSlice({
  name: "catalog",
  initialState,
  reducers: {
    setQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
      state.page = 1;
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload;
      state.page = 1;
    },
    setSort: (state, action: PayloadAction<CatalogSort>) => {
      state.sort = action.payload;
      state.page = 1;
    },
    setLayout: (state, action: PayloadAction<CatalogLayout>) => {
      state.layout = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
  },
});

export const { setQuery, setCategory, setSort, setLayout, setPage } = catalog.actions;
export const makeCatalogStore = () => configureStore({ reducer: { catalog: catalog.reducer } });
export type CatalogState = ReturnType<ReturnType<typeof makeCatalogStore>["getState"]>;

// noinspection JSVoidFunctionReturnValueUsed
import {FILTERS, SHOP_KEY, TABLES} from "@/const";
import {ProductTransformer} from "@/transformers/ProductTransformer";
import EvenService from "@/services/EvenService";

export default {
    namespaced: true,
    state() {
        return {
            productList: [],
            unfilteredList:[],
            adminList: [],
            modifiedItems:[],
        };
    },
    getters: {
        getProducts(state) {
            return state.productList;
        },
        getAdminList(state) {
            return state.adminList;
        },
        getModifiedItemsList(state) {
            return state.modifiedItems;
        },
        getUnfilteredList(state) {
            return state.unfilteredList;
        },
    },
    mutations: {
        setProducts(state, data) {
            state.productList = data;
        },
        setAdminList(state, data) {
            state.adminList = data;
        },
        setModifiedItemsList(state, data) {
            state.modifiedItems = data;
        },
        setUnfilteredList(state, data) {
            state.unfilteredList = data;
        }
    },
    actions: {
        loadUnfilteredList({commit}, data) {
            commit("setUnfilteredList", data);
        },
        loadLocal({commit}) {
            let data = JSON.parse(localStorage.getItem(`${SHOP_KEY}-${TABLES.PRODUCTS}`));
            commit("setLocalState", data);
        },
        /**
         * Fetch,process and save data to state
         * @param commit
         * @param dispatch
         */
        saveProducts: function ({commit}) {
            let products = [];
            let jsonProducts = [];
            EvenService.getJsonProducts()
                .then(response => {
                    jsonProducts = response.data.results;
                    if (jsonProducts !== null) jsonProducts.forEach(item => {
                        products.push(ProductTransformer.transform(item));
                    });
                    commit("setUnfilteredList",products);
                    commit("setProducts", products);
                    console.log(products);
                })
                .catch(error => console.log(error));
        },
        /**
         * @param commit
         * @param newProducts
         */
        saveModifiedProducts: function ({commit}, newProducts) {
            commit("setProducts", newProducts);
        },
        /**
         * @param commit
         * @param getters
         * @param {Product} product
         */
        // saveProduct: function ({commit, getters}, {product}) {
        //     let products = getters['getProducts'] ?? [];
        //
        //     commit("setProducts", []); // vuejs2
        //     products = products.filter(item => item.id !== product.id); // TODO: optimize find product by id and update it
        //     products.push(product);
        //     commit("setProducts", products); // vuejs2
        //
        //     let productsObj = product.map(item => ProductTransformer.reverseTransform(item));
        //     localStorage.setItem(`${SHOP_KEY}-${TABLES.PRODUCTS}`, JSON.stringify(productsObj));
        // },
        deleteProducts({commit, state}) {
            let data =
                localStorage.removeItem(`${SHOP_KEY}-${TABLES.PRODUCTS}`);
            commit("setProducts", data);
            state.productList = [];
        },
        saveAdminTable({commit}) {
            let jsonProducts = [];
            EvenService.getJsonProducts()
                .then(response => {
                    jsonProducts = response.data.results;
                    commit("setAdminList", jsonProducts);
                })
                .catch(error => console.log(error));
        },
        saveModifedItemsList({commit},newData){
            commit("setModifiedItemsList", newData);
        },
        deleteAdminTable({state}) {
            state.adminList = [];
        },
        /**
         * Sort filter for selected option in select sortList HTML element
         * @param commit
         * @param state
         * @param param{String}
         */
        sortProducts({state, dispatch}, param) {
            switch (Number(param)) {
                case FILTERS.PRICE_ASC:
                    state.productList.sort((a, b) => {
                        return a.price - b.price;
                    });
                    break;
                case FILTERS.PRICE_DESC:
                    state.productList.sort((a, b) => {
                        return b.price - a.price;
                    });
                    break;
                case FILTERS.A_Z:
                    state.productList.sort((a, b) => {
                        let fa = a.title.toLowerCase(),
                            fb = b.title.toLowerCase();
                        return fa < fb ? -1 : fa > fb ? 1 : 0;
                    });
                    break;
                case FILTERS.Z_A:
                    state.productList.sort((a, b) => {
                        let fa = a.title.toLowerCase(),
                            fb = b.title.toLowerCase();
                        return fa < fb ? 1 : fa > fb ? -1 : 0;
                    });
                    break;
                default:
                    dispatch("saveProducts");
                    break;
            }
        },
        /**
         * Search product function in product list.
         * @param commit
         * @param getters
         * @param searched {String}
         */
        searchProduct({commit, getters}, searched) {
            if (!searched) {
                commit("setProducts",getters["getUnfilteredList"]);
            } else {
                let text = getters["getUnfilteredList"];
                let found = [];
                let search = searched.split(' ');
                search.forEach(word =>{
                    if(word !== ''){
                        if(found.length > 0 ){
                            found = found.filter((item) => item.title.toLowerCase().includes(word.toLowerCase()));
                            commit("setProducts", found);
                            return;
                        }
                        let local = text.filter((item) => item.title.toLowerCase().includes(word.toLowerCase()));
                        if(local.length > 0){
                            found.push(...local);
                            commit("setProducts", found);
                        }
                    }
                });
            }
        }
    },
};

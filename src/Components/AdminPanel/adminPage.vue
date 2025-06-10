<style scoped>
  .form{
    /* margin-top: 20px; */
    text-align: center;
    height: 100vh;
    display: flex;
    align-items: flex-start;
  }

  .profile {
    background-color: #6b81e4;  
  }

  .container {
    height: 100vh;
    display: flex;
    justify-content: center;
    flex-direction: column;
    overflow: hidden; 
  }

  .container__title {
    margin: 0 0 30px;
    font-size: 28px;
    text-align: center;
  }

  input:focus {
    border-color:#1f38af;
  }

  input {
    height: 25px;
    border: 1px solid #ddd;
    border-radius: 10px;
    padding-left: 5px;
    margin-left: 15px;
    cursor: pointer;
    outline: none;
    transition: border-color 0.3s ease;
  }
</style>

<template>
  <div class="container">
      <section class = "container__form form">
          <AdminNav :active-tab="activeTab" @change-tab="changeTab" />
          <tableInfo v-if="activeTab === 'Promotions'" :data = "data" :columns = "columns" :isPromoTable="true" @delete-row="deleteRow" @emit-add="addRow" @edit-row="editRow" />
          <tableInfo v-else-if="activeTab === 'Stores'" :data = "data" :columns = "columns" :isPromoTable="true" @delete-row="deleteRow" @emit-add="addRow" @edit-row="editRow" />
          <tableInfo v-else-if="activeTab === 'Users'" :data = "data" :columns = "columns" :isPromoTable="true" :hide-add-button="activeTab === 'Users'" @delete-row="deleteRow" @edit-row="editRow" />
          <tableInfo v-else-if="activeTab === 'category'" :data = "data" :columns = "columns" :isPromoTable="true" @delete-row="deleteRow" @emit-add="addRow" @edit-row="editRow"/>
          <AddPromo v-show="showAddPromo" @close="close" :mode="formMode" :promoData="selectedPromo"/>
          <AddCategory v-show="showAddCategory" @close="close" :mode="formMode" :categoryData="selectedcategories"/>
          <ChangeRole v-show="showChangeRole" @close="close" :user="selectedUser"/>
          <AddStore v-show="showAddStore" @close="close" :mode="formMode" :storeData="selectedStore"/>
        </section>
  </div>
</template>

<script>
import AdminNav from '../AdminPanel/AdminNav.vue';
import tableInfo from '../AdminPanel/tableInfo.vue';
import { ref } from 'vue';
import axios from 'axios';
import AddPromo from './AddingComponents/AddPromo.vue';
import AddCategory from './AddingComponents/AddCategory.vue';
import ChangeRole from './AddingComponents/ChangeRole.vue';
import AddStore from './AddingComponents/AddStore.vue';

export default {
  components: {AdminNav, tableInfo, AddPromo, AddCategory, ChangeRole, AddStore},
  name: 'AdminPage',

  setup() {
    const activeTab = ref('');
    const data = ref([]);
    const columns = ref([]);
    const showAddPromo = ref(false);
    const showChangeRole = ref(false);
    const showAddCategory = ref(false);
    const showAddStore = ref(false);
    const formMode = ref('add'); // 'add' или 'edit'
    const selectedPromo = ref(null);
    const selectedcategories = ref(null);
    const selectedUser = ref(null);
    const selectedStore = ref(null);

  const loadInformation = async(table) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/${table}`, 
      { withCredentials: true ,
        headers: {
        'Cache-Control': 'no-cache' // Отключаем кэширование
      }});
      data.value = response.data;
      columns.value = Object.keys(data.value[0]);
    } catch (error) {
      console.error('Полная ошибка:', error);
      console.error('Ответ сервера:', error.response?.data);
    }
  };

  const deleteRow = async (item) => {
    try{
      const table = activeTab.value;
      const idField = getPrimaryKeyField(table);
      const id = item[idField];

      await axios.delete(`http://localhost:3000/api/${table}/${id}`, { withCredentials: true });
      location.reload();
      alert('Запись успешно удалена!');
    }
    catch(e){
      console.error('Не удалось удалить запись: ',e);
    }
  };

  const addRow = () => {
    if(activeTab.value === 'Promotions') {
      formMode.value = 'add';
      showAddPromo.value = true;
    }
    if(activeTab.value === 'Stores') {
      showAddStore.value = true;
      formMode.value = 'add';
      selectedStore.value = null;
    }
    if(activeTab.value === 'Users') {
      showChangeRole.value = true;
      selectedUser.value = null;
    }
    if(activeTab.value === 'category') {
      showAddCategory.value = true;
      selectedcategories.value = null;
      formMode.value = 'add';
    }
  };

const editRow = (promo) => {
  if(activeTab.value === 'Promotions') {
    formMode.value = 'edit';

    selectedPromo.value = {
      ...promo,
      categories: promo.categories ? 
        (Array.isArray(promo.categories) ? promo.categories : JSON.parse(promo.categories)) 
        : []
    };
    showAddPromo.value = true;
  };

  if(activeTab.value === 'Stores') {
    formMode.value = 'edit';
    showAddStore.value = true;
      selectedStore.value = { ...promo };
    }
  if(activeTab.value === 'Users') {
      showChangeRole.value = true;
      selectedUser.value = { ...promo };
    }

  if(activeTab.value === 'category') {
    formMode.value = 'edit';
    // Глубокое копирование объекта и обработка categories
    selectedcategories.value = { ...promo };
    showAddCategory.value = true;
  }
};

  const close = () => {
    if(activeTab.value === 'Promotions') {
      showAddPromo.value = false;
    }
    if(activeTab.value === 'Stores') {
      showAddStore.value = false;
    }
    if(activeTab.value === 'Users') {
      showChangeRole.value = false;
    }
    if(activeTab.value === 'category') {
      showAddCategory.value = false;
    }
  }

const getPrimaryKeyField = (table) => {
  const fields = {
    'Users': 'user_id',
    'Promotions': 'Promotion_id',
    'Stores': 'Store_id',
    'category': 'category_id'
  };
  return fields[table] || 'id';
};

  const changeTab = async(tab) => {
    await loadInformation(tab);
    activeTab.value = tab;
  };

    return {
      activeTab,
      data,
      columns,
      formMode,
      selectedcategories,
      selectedPromo,
      selectedUser,
      selectedStore,
      showChangeRole,
      showAddCategory,
      showAddStore,
      showAddPromo,
      changeTab,
      editRow,
      getPrimaryKeyField,
      deleteRow,
      addRow,
      close,
      loadInformation,
    }
  }
}

</script>
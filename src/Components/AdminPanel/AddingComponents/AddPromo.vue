<script>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
  name: 'AddPromo',
  props: {
    promoData: {
      type: Object,
      default: null
    },
    mode: {
      type: String,
      default: 'add', // 'add' или 'edit'
      validator: value => ['add', 'edit'].includes(value)
    }
  },
  emit: ['close'],
  setup(props, { emit }) {
    const code = ref('');
    const title = ref('');
    const userRole = ref('');
    const description = ref('');
    const full_description = ref('');
    const discount_type = ref('');
    const discount_value = ref(0);
    const start_date = ref('');
    const end_date = ref('');
    const image = ref('');
    const databaseImages = ref([]);
    const categories = ref([]);
    const availableCategories = ref([]);
    const stores = ref([]);
    const storeId = ref('');
    const selectedStore = ref('');
    const isLoading = ref(false);
    const errors = ref({});

    // Загрузка данных
    const loadImagesStoresCategories = async () => {
      try {
        const [imagesRes, storesRes, categoriesRes] = await Promise.all([
          axios.get('http://localhost:3000/api/images'),
          axios.get('http://localhost:3000/api/Stores'),
          axios.get('http://localhost:3000/api/category')
        ]);
        
        databaseImages.value = imagesRes.data;
        // Фильтруем магазины для менеджера
        if (userRole.value === 5) {
          stores.value = storesRes.data.filter(store => store.Store_id === selectedStore.value);
        } else {
          stores.value = storesRes.data;
        }
        availableCategories.value = categoriesRes.data;
        
        if (props.mode === 'edit' && props.promoData) {
          if (Object.keys(props.promoData).length > 0) {
            fillFormWithPromoData();
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    // Заполнение формы данными для редактирования
    const fillFormWithPromoData = () => {
  const promo = props.promoData;
  code.value = promo.code || '';
  title.value = promo.title;
  description.value = promo.description;
  full_description.value = promo.full_description;
  discount_type.value = promo.discount_type;
  discount_value.value = promo.discount_value;
  start_date.value = promo.start_date.split('T')[0];
  end_date.value = promo.end_date.split('T')[0];
  image.value = promo.image;
  
  // Добавляем проверку на существование categories
  categories.value = promo.categories 
    ? promo.categories.map(c => c.category_id || c)
    : [];
    
  selectedStore.value = promo.store_id;
};

    // Валидация формы
    const validateForm = () => {
      errors.value = {};

      const currentDate = new Date();
      const startDate = new Date(start_date.value);
      const endDate = new Date(end_date.value);

      if (!title.value) errors.value.title = 'Введите название промокода/скидки';
      if (!description.value) errors.value.description = 'Введите краткое описание';
      if (!full_description.value) errors.value.full_description = 'Введите полное описание';
      if (!discount_type.value) errors.value.discount_type = 'Выберите тип скидки';
      if (!discount_value.value) errors.value.discount_value = 'Введите значение скидки';
      if (!selectedStore.value) errors.value.store = 'Выберите магазин';
      if (!categories.value.length) errors.value.categories = 'Выберите хотя бы одну категорию';
      if (!image.value) errors.value.image = 'Выберите изображение';
      
      // Для режима добавления проверяем даты
      if (props.mode === 'add') {
        if (currentDate > startDate) errors.value.startDate = 'Дата начала акции не может быть в прошлом';
        if (endDate < startDate) errors.value.endDate = 'Дата конца акции не может быть раньше начала акции';
        if (currentDate > endDate) errors.value.endDate = 'Дата конца акции не может быть в прошлом';
      }

      return Object.keys(errors.value).length === 0;
    };

    // Сохранение/обновление промокода
    const savePromo = async () => {
      if (!validateForm()) {
        alert('Пожалуйста, заполните все обязательные поля');
        return;
      }

      isLoading.value = true;

      try {
        const payload = {
          code: code.value,
          title: title.value,
          description: description.value,
          full_description: full_description.value,
          discount_type: discount_type.value,
          discount_value: discount_value.value,
          start_date: start_date.value,
          end_date: end_date.value,
          image: image.value,
          categories: categories.value,
          store_id: selectedStore.value
        };

        let response;
        
        if (props.mode === 'add') {
          response = await axios.post('http://localhost:3000/api/addPromo', payload);
        } else {
          // Для редактирования добавляем ID промокода
          payload.id = props.promoData.Promotion_id;
          
          response = await axios.put('http://localhost:3000/api/updatePromo', payload, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
        }
        
        if (response.data.success) {
          alert(props.mode === 'add' ? 'Промокод успешно добавлен' : 'Промокод успешно обновлен');
          location.reload();
        }
      } catch (e) {
        alert(`Ошибка при ${props.mode === 'add' ? 'создании' : 'обновлении'} промокода: ${e.message}`);
      } finally {
        isLoading.value = false;
      }
    };

    const close = () => {
      code.value = '';
  title.value = '';
  description.value = '';
  full_description.value = '';
  discount_type.value = '';
  discount_value.value = '';
  start_date.value = '';
  end_date.value ='';
  image.value = '';
  errors.value = {};
      emit('close');
    };

    const checkUserRole = async () => {
      try{
        const response1 = await axios.get('http://localhost:3000/token', { withCredentials: true });
        const userData = response1.data;
        userRole.value = userData.roles_id;
        if (userRole.value === 5) {
          const response = await axios.get('http://localhost:3000/getManagerStore', {
            params: {
              id: userData.id
            }
          });
          storeId.value = response.data.store;
          selectedStore.value = response.data.id;
        }
      }
      catch(e){
        console.error('Ошибка', e.message);
      }
    };

    onMounted(() => {
      loadImagesStoresCategories();
      checkUserRole();
    });

// Добавляем watch для отслеживания открытия формы
watch(() => props.promoData, (newVal) => {
  if (newVal) {
    loadImagesStoresCategories();
    checkUserRole();
  }
}, { immediate: true });

    return {
      code,
      userRole,
      title,
      storeId,
      databaseImages,
      description,
      full_description,
      discount_type,
      discount_value,
      savePromo,
      start_date,
      end_date,
      image,
      categories,
      availableCategories,
      stores,
      selectedStore,
      isLoading,
      checkUserRole,
      errors,
      close,
      loadImagesStoresCategories,
    }
  }
}
</script>

<template>
  <div class = "modal" @click.self="close">
    <div class="popup-close" @click="close"></div>
    <div class = overlay>
      <div class="column">
      <div class="row">
        <label>
          Код(если скидка - оставить пустым)
        </label>
        <input type="text" placeholder="ВАШКОД2025" v-model="code">
      </div>
        <div class="row">
          <label>
            Магазин
          </label>
          <select v-if="!selectedStore" v-model="selectedStore" required :class = "{ error: errors.store }"  size="4" 
            style="overflow-y: auto;" >
            <option value="">Выберите магазин</option>
            <option
                v-for="store in stores"
                :key="store.Store_id"
                :value="store.Store_id"
            >
              {{ store.name }}
            </option>
          </select>
          <select v-else v-model="selectedStore" required class="select-input" :class = "{ error: errors.store }" size="2">
            <option
                value="selectedStore"
            >
              {{ storeId }}
            </option>
          </select>
          <small class="error-text" v-if="errors.store">{{ errors.store }}</small>
        </div>
      <div class="row">
        <label>
          Промокод/Скидка
        </label>
        <select v-model="title" :class= "{ error: errors.title}">
          <option value="">Выбрать</option>
          <option>Промокод</option>
          <option>Скидка</option>
        </select>
        <small class="error-text" v-if="errors.title">{{ errors.title }}</small>
      </div>
      <div class="row">
        <label>
          Краткое описание
        </label>
        <textarea class="area" v-model="description" rows="2" :class = "{ error: errors.description}"></textarea>
        <small class="error-text" v-if="errors.description">{{ errors.description }}</small>
      </div>
      <div class="row">
        <label>
          Полное описание
        </label>
        <textarea class="area" v-model="full_description" rows="4" :class = "{ error: errors.full_description}"></textarea>
        <small class="error-text" v-if="errors.full_description">{{ errors.full_description }}</small>
      </div>
      <div class="row">
        <label>
          Тип скидки
        </label>
        <select v-model="discount_type" :class = "{ error: errors.discount_type}">
          <option value="">Выбрать</option>
          <option>BYN</option>
          <option>percentage</option>
        </select>
        <small class="error-text" v-if="errors.discount_type">{{ errors.discount_type }}</small>
      </div>
      </div>
      <div class="column">
      <div class="row">
        <label>
          Значение скидки
        </label>
        <input type="number" placeholder="50" v-model="discount_value" :class = "{ error: errors.discount_value}">
        <small class="error-text" v-if="errors.discount_value">{{ errors.discount_value }}</small>
      </div>
        <div class="row">
          <label>
            Категории (можно выбрать несколько)
          </label>
          <select v-model="categories" multiple required :class = "{ error: errors.categories }" >
            <option 
              v-for="category in availableCategories" 
              :key="category.category_id" 
              :value="category.category_id"
            >
              {{ category.name }}
            </option>
          </select>
          <small>Зажмите Ctrl (Cmd на Mac) для выбора нескольких категорий</small>
          <small class="error-text" v-if="errors.categories">{{ errors.categories }}</small>
        </div>
      <div class="row">
        <label>
          Дата начала
        </label>
        <input type="date" placeholder="2025-03-01" v-model="start_date" :class = "{ error: errors.startDate }">
        <small class="error-text" v-if="errors.startDate">{{ errors.startDate }}</small>
      </div>
      <div class="row">
        <label>
          Дата окончания
        </label>
        <input type="date" placeholder="2025-03-15" v-model="end_date" :class = "{ error: errors.endDate }">
        <small class="error-text" v-if="errors.endDate">{{ errors.endDate }}</small>
      </div>
      <div class="row">
        <label>
          Фотография
        </label>
        <div class="image-select-container">
          <select 
            v-model="image" 
            class="image-select"
            :class="{ 'error': errors.image }"
            size="3"
          >
            <option value="">Выберите изображение</option>
            <option 
              v-for="img in databaseImages" 
              :key="img.id" 
              :value="img.image"
            >
              {{ img.image }}
            </option>
          </select>
          <div v-if="image" class="image-preview">
            <img :src="`/images/${image}`" alt="Preview">
          </div>
          <small class="error-text" v-if="errors.image">{{ errors.image }}</small>
        </div>
      </div>
        <button 
          @click="savePromo" 
          :disabled="isLoading"
        >
        {{ isLoading ? (mode === 'add' ? 'Создание...' : 'Обновление...') : (mode === 'add' ? 'Создать промокод' : 'Обновить промокод') }}
        </button>
      </div>
    </div>
  </div>

</template>

<style scoped>
.modal {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
}

.active {
  display: flex;
}

.select-input {
  height: 28.4px;
  overflow-y: auto;
}

.overlay {
  width: 800px;
  height: 700px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: -5px 5px 5px rgba(0, 0, 0, 0.2);
  text-align: left;
  display: flex;
  justify-content: space-around;
  padding: 20px;
  overflow-y: auto;
  margin-top: 10px;
}

.popup-close {
  position: relative;
  top: -330px;
  right: -825px;
  width: 28px;
  height: 28px;
  z-index: 1000;
  cursor: pointer;
  background: url(/images/icon-close.svg) center no-repeat;
}

.row {
  display: flex;
  flex-direction: column;
  width: 350px;
}

.column {
  height: 95%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.area {
  height: 50px;
  white-space: pre-wrap; /* Перенос строк */
  overflow-wrap: break-word; /* Перенос длинных слов */
  word-wrap: break-word; /* Для поддержки в старых браузерах */
  resize: none;
}

.area, input, select {
  border-radius: 5px;
  padding: 5px;
  border: 1px solid #ddd;
  cursor: pointer;
  outline: none;
  transition: border-color 0.3s ease;
}

.area:focus, input:focus, select:focus {
  border-color: #1f38af;
}

.image-select {
  margin: 0;
}

.image-select-container {
  width: 100%;
}

.image-preview {
  margin-top: 10px;
  border: 2px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  background: #f9f9f9;
  text-align: center;
}

.image-preview img {
  max-width: 150px;
  max-height: 150px;
  object-fit: contain;
  border-radius: 4px;
}

select[multiple] {
  height: 120px;
  width: 100%;
  padding: 5px;
}

select {
  width: 100%;
  padding: 5px;
  border-radius: 5px;
  border: 1px solid #ddd;
  margin-bottom: 5px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #1f38af;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #152a8f;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

small {
  color: #666;
  font-size: 0.8em;
  margin-top: 2px;
}

.error {
  border-color: #ff4444 !important;
}

.error-text {
  color: #ff4444;
  font-size: 0.8em;
  margin-top: 4px;
}

label {
  margin-bottom: 5px;
}
</style>
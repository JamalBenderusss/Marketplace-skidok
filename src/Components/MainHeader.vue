
<script>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

export default {
  name: 'MainHeader',
  emits: ['toggleShowPromotion', 'search'],
  props: {
    userRole: Number
  },
  setup(props, {emit}) {
    const isCategory = ref(false);
    const isOpen = ref(false);
    const searchValue = ref('');
    const categories = ref([]);
    const toggleShowPromotion = () => {
      emit('toggleShowPromotion');
    }
    
    const search = () => {
      emit('search', searchValue.value);
    }

    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/category');
        categories.value = response.data;
      } catch (error) {
        console.error('Ошибка при получении категорий:', error);
      }
    }

    onMounted(fetchCategories);

    return {
      isCategory,
      isOpen,
      searchValue,
      categories,
      toggleShowPromotion,
      search,
      fetchCategories,
      userRole: computed(() => props.userRole),
    }
  }
}
</script>

<template>
  <header>
    <nav>
      <div class = "nav n1">
        <button @click = "$router.push('/')">Маркетplace</button></div>
      <div class = "nav-center">
        <div class = "nav n2 categoryDiv"
             @mouseenter="isCategory = true"
             @mouseleave="isCategory = false"
        >Категории
          <div v-if = "isCategory" class = "submenu">
            <ul>
              <li v-for = "category in categories" :key = "category.id">
                <button type = "button" @click = "$router.push(`/category/${category.category_id}`)">{{ category.name }}</button>
              </li>
            </ul>
          </div>
        </div><div>
        <div class = "nav n3" @click="toggleShowPromotion">Как пользоваться промокодами</div>
      </div>
        <div class = "nav-center2">
          <input type="text" placeholder="Введите нужный магазин" v-model = "searchValue" @keyup.enter = "search">
          <button @click = "search">Найти</button>
        </div>
      </div>
      <div class = "nav n4">
        <button v-if="userRole === 1" class = "regBtn" @click = "$router.push('/registration')">Войти</button>
        <button v-else class = "regBtn" @click = "$router.push('/user/profile')">Профиль</button>
      </div>
    </nav>
  </header>
</template>

<style scoped>
header {
  display: flex;
  justify-content: center;
  align-items:start;
  padding: 20px 0;
  position: sticky;
  top: 0;
  z-index: 1001;
  background-color: #6b81e4;
  text-align: center;
  margin-bottom: 20px;

}

nav {
  display: flex;
  justify-content: space-between;
  width: 80%;
}

.n1:hover,.n2:hover,.n3:hover,.n4:hover{
  color: #fff;
}

.nav {
  cursor: pointer;
}

.nav-center {
  display: flex;
  justify-content: space-between;
  width: 75%;
  min-width: 650px;
}
.nav-center2 {
  display: flex;
  justify-content: space-between;
  width: 350px;
}

.nav-center2 > input:focus {
  border-color:#1f38af;
}

.nav-center2 > input {
  width: 75%;
  height: 25px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding-left: 5px;
  margin-left: 15px;
  cursor: pointer;
  outline: none;
  transition: border-color 0.3s ease;
}

.nav-center2 > button {
  width: 80px;
  height: 25px;
  margin-left: 10px;
  text-align: center;
  background-color: #ff8000;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.nav-center2 > button:hover {
  background-color: #e67800;
}

.regBtn {
  border: none;
  background-color: transparent;
  cursor: pointer;
}

.regBtn:hover {
  color: white;
}

.n1 > button {
  border: none;
  background-color: transparent;
}
.n1 > button:hover {
  color: white;
}

.submenu {
  position: absolute;
  top: 100%;
  left: -50px;
  background-color: #ffffff;
  border: 1px solid #ccc;
  border-radius: 10px;
  box-shadow: -9px 0 5px  rgba(0, 0, 0, .25 );;
  padding: 10px;
  z-index: 100;
  width: 600px;
  height: 250px;
}

.submenu ul {
  list-style:none ;
  margin: 0;
  padding: 0;
  column-count: 3;
}

.submenu li {
  margin: 0 0 18px;
  text-align: left;
  font-size: 16px;
}

.submenu li button {
  border: none;
  cursor: pointer;
  background-color: transparent;
  transition: background 0.3s ease;
}

.submenu button:hover {
  color: #007bff; /* Синий цвет текста при наведении */
}

/* Стили для прокрутки, если элементов много */
.submenu::-webkit-scrollbar {
  width: 8px; /* Ширина полосы прокрутки */
}

.submenu::-webkit-scrollbar-thumb {
  background-color: #ccc; /* Цвет ползунка */
  border-radius: 4px; /* Скругление краев */
}

.submenu::-webkit-scrollbar-track {
  background-color: #f1f1f1; /* Цвет фона полосы прокрутки */
}

.submenu li button:hover {
  text-decoration-line: underline;
  color:#ff8000
}

.categoryDiv {
  margin-right: 10px;
}

.nav-center {
  position: relative;
}


</style>
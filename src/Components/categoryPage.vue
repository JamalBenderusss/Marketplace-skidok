<style scoped>
* {
  font-size: 16px;
  font-family:Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
}

main {
  width: 100%;
}

.promoModal {
  display: flex;
  justify-content: center;
}

.whitebl {
  width: 60%;
  border: none;
  border-radius: 10px;
  height: 130px;
  display: flex;
  background-color: #6b81e4;
  min-width: 650px;
}

.blueBlock {
  width: 95%;
  border-radius: 10px;
  background-color: #fff;
  margin: auto;
  height: 100px;
  padding: 5px;
}

section {
  margin: 0 auto 20px;
  width: 83%;
  text-align: center;
}

.simpleBtn{
  background-color: #e0e0e0;
  border: none;
  border-radius: 20px;
  padding: 10px 10px;
  margin: 0 5px;
  cursor: pointer;
  color: #333;
  font-weight: bold;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.simpleBtn:hover {
  background-color: #6b81e4;
  color: #fff;
}

.focus {
  background-color: #1f38af;
  color: white;
  border: none;
}

.showMore:hover {
  background-color: #4a5dd2;
}

.showMore{
  background-color: #1f38af;
  color: #fff;
  border: none;
  width: 400px;
  cursor: pointer;
  margin-bottom: 20px;
  border-radius: 20px;
  padding: 10px 10px;
  font-weight: bold;
  transition: background-color 0.3s ease, color 0.3s ease;

}

.btn3 {
  display: flex;
}

a {
  text-decoration: none;
  color: black;
}

.loginDiv {
  text-align: center;
  margin: 20px;
}

.loginDiv__title {
  margin-bottom: 20px;
}
</style>

<template>
  <MainHeader v-if="isLoadingUser" @toggleShowPromotion="toggleShowPromo" @search="searchCardsByInput" :user-role="userRole" />
  <main v-if="isLoadingUser">
    <section class="promoModal">
      <div class="whitebl" v-show="isOpen">
        <div class="blueBlock">
          <h2>Как использовать промокоды?</h2>
          <p>1. Выберите предложенный промокод и скопируйте его. </p>
          <p>2. Перейдите в интернет-магазин с помощью нашей ссылки. </p>
          <p>3. Добавьте товары в корзину, введите промокод на этапе оформления заказа. </p>
          <p>4. Наслаждайтесь скидкой!</p>
        </div>
      </div>
    </section>
    <h1 style="text-align: center; margin-bottom: 20px; font-size:28px;">Промокоды в разделе "{{ categoryName }}"</h1>
    <section class="promotions">
      <div class="btn3">
        <button class="simpleBtn" 
          :class="{focus: selectedBtn === 'all'}"
          @click="changeBtn('all')">Все</button>
        <button class="simpleBtn"
          :class="{focus: selectedBtn === 'promo'}"
          @click="changeBtn('promo')">Только промокоды</button>
        <button class="simpleBtn"
          :class="{focus: selectedBtn === 'first'}"
          @click="changeBtn('first')">Только скидки</button>
      </div>
    </section>
    <div v-if="userRole <= 2" class="loginDiv">
      <h2 class="loginDiv__title">Для просмотра промокодов необходимо войти в систему</h2>
      <button class="simpleBtn" @click="$router.push('/autarization')">Войти</button>
    </div>
    <section v-else>
      <card
        v-for="promo in filtredDiscounts.slice(0, visibleCount)"
        :key="promo.Promotion_id"
        :title="promo.title"
        :description="promo.description"
        :full_description="promo.full_description"
        :discount_value="promo.discount_value"
        :discount_type="promo.discount_type"
        :start_date="promo.start_date"
        :end_date="promo.end_date"
        :image="promo.image"
        :market="promo.store_name"
        :code="promo.code"
      />
    </section>
    <div style="text-align: center;" v-if="visibleCount < filtredDiscounts.length">
      <button class="showMore" @click="loadMore">Показать еще</button>
    </div>
  </main>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import axios from 'axios';
import Card from '@/Components/card.vue';
import MainHeader from '@/Components/MainHeader.vue';

export default {
  name: 'CategoryPage',
  components: {
    Card,
    MainHeader
  },
  setup() {
    const route = useRoute();
    const promotions = ref([]);
    const categoryName = ref('');
    const isOpen = ref(false);
    const selectedBtn = ref('all');
    const visibleCount = ref(6);
    const addCard = ref(3);
    const filtredDiscounts = ref([]);
    const search = ref('');
    const userRole = ref(null);
    const isLoadingUser = ref(false);
    
    const checkUserRole = async () => {
      try{
        const response = await axios.get('http://localhost:3000/token', { withCredentials: true });
        const userData = response.data;
        userRole.value = userData.roles_id;
      }
      catch(e) {
        console.error('Ошибка пан');
        userRole.value = 1;
      }
    };
    
    const loadCategoryPromotions = async (categoryId) => {
      try {
        // Получаем название категории
        const categoryResponse = await axios.get(`http://localhost:3000/api/category/${categoryId}`);
        categoryName.value = categoryResponse.data.name;

        if (userRole.value <= 2) {
          promotions.value = [];
          filtredDiscounts.value = [];
          return;
        }        
        
        // Получаем промокоды для категории
        const response = await axios.get(`http://localhost:3000/api/promotions/category/${categoryId}`);
        promotions.value = response.data;
        filtredDiscounts.value = response.data;
      } catch (error) {
        console.error('Ошибка при загрузке промокодов категории:', error);
      }
    };

    const loadMore = () => {
      visibleCount.value += addCard.value;
    };

    const searchCardsByInput = (searchValue) => {
      const result = searchValue.toLowerCase().trim();
      
      filtredDiscounts.value = promotions.value.filter((card) => 
        card.store_name.toLowerCase().includes(result)
      );
      if (filtredDiscounts.value.length === 0) {
        alert('Введите действительное название магазина');
        filtredDiscounts.value = promotions.value;
      }
    };

    const toggleShowPromo = () => {
      isOpen.value = !isOpen.value;
    };

    const changeBtn = (promo) => {
      selectedBtn.value = promo;
      if (promo === 'all') {
        filtredDiscounts.value = promotions.value;
      } else if (promo === 'promo') {
        filtredDiscounts.value = promotions.value.filter((card) =>
          card.title === 'Промокод'
        );
      } else if (promo === 'first') {
        filtredDiscounts.value = promotions.value.filter((card) =>
          card.title === 'Скидка'
        );
      }
    };

    onMounted(async () => {
      await checkUserRole();
      isLoadingUser.value = true;
      await loadCategoryPromotions(route.params.id);
    });

    watch(() => route.params.id, (newId) => {
      loadCategoryPromotions(newId);
      visibleCount.value = 6; // Сбрасываем количество видимых карточек при смене категории
    });

    return {
      promotions,
      categoryName,
      isOpen,
      selectedBtn,
      visibleCount,
      isLoadingUser,
      userRole,
      filtredDiscounts,
      search,
      loadMore,
      searchCardsByInput,
      loadCategoryPromotions,
      toggleShowPromo,
      changeBtn,
    }
  }
}
</script>
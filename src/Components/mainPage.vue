<style scoped>
  main {
    width: 100%;
  }

  .promoModal {
    display: flex;
    justify-content: center;
  }

  .whitebl {
    width: 70%;
    border: none;
    border-radius: 10px;
    height: 150px;
    display: flex;
    background-color: #5978aa;
    min-width: 650px;
  }

  .blueBlock {
    width: 95%;
    border-radius: 10px;
    background-color: #fff;
    margin: auto;
    height: 120px;
    padding: 5px;

  }

  section {
    margin: 0 auto;
    width: 83%;
    text-align: center;
    margin-bottom: 20px;
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

  .btn3 {
    display: flex;
  }

  a{
    text-decoration: none;
    color: black;
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

  .promotions {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  .loginDiv {
  text-align: center;
  margin: 20px;
}

.loginDiv__title {
  margin-bottom: 20px;
}

.title {
  text-align: center; margin-bottom: 20px; font-size:28px;
}

.blueBlock h2 {
    font-size: 1.3rem;
  }

  .blueBlock p {
    font-size: 0.9rem; 
    text-align: left;
    line-height: 1.3rem;
    width: 90%;
    margin: auto;
  }


@media screen and (max-width: 576px) {
  .title {
    font-size: 1rem;
  }

  .simpleBtn {
  font-size: 0.65rem;
  padding: 5px;
  }

  .promotions {
    margin: 0 0 20px; 
    justify-content: space-around;
  }

  section {
    width: 90%;
  }

  .showMore {
    font-size: 0.65rem;
    width: 180px;
  }
} 

@media screen and (min-width: 576px) and (max-width: 1000px){

  .simpleBtn {
    font-size: 0.9rem;
  }

  section {
    width: 90%;
  }

  .showMore {
  font-size: 1rem;
  }
}
</style>

<template>
<MainHeader v-if="isLoadingUser" @toggleShowPromotion = "toggleShowPromo" @search = "searchCardsByInput" :user-role="userRole" />
  <main v-if="isLoadingUser">
    <section class = "promoModal">
      <div class = "whitebl" v-show = "isOpen">
        <div class = "blueBlock">
          <h2>Как использовать промокоды?</h2>
          <p>1. Выберите предложенный промокод и скопируйте его. <br>
2. Перейдите в интернет-магазин с помощью нашей ссылки. <br>
3. Добавьте товары в корзину, введите промокод на этапе оформления заказа. <br> 
4. Наслаждайтесь скидкой!</p>
        </div>
        </div>
    </section>
    <h1 class="title" @click = "fetchDiscounts">Свежие промокоды</h1>
    <section class = "promotions">
      <div class = "btn3">
        <button class = "simpleBtn" 
        :class = "{focus: selectedBtn === 'all'}"
        @click = "changeBtn('all')">Все</button>
        <button class = "simpleBtn"
        :class = "{focus: selectedBtn === 'promo'}"
        @click = "changeBtn('promo')">Только промокоды</button>
        <button class = "simpleBtn"
        :class = "{focus: selectedBtn === 'first'}"
        @click = "changeBtn('first')">Только скидки</button>
        <button class = "simpleBtn"
        :class = "{focus: selectedBtn === 'best'}"
        @click = "changeBtn('best')">Лучшие</button>
      </div>
    </section>
    <div v-if="userRole <= 2" class="loginDiv">
      <h2 class="loginDiv__title">Для просмотра промокодов необходимо войти в систему</h2>
      <button class="simpleBtn" @click="$router.push('/autarization')">Войти</button>
    </div>
    <section v-else>
      <card 
      v-for = "(disc, index) in visibleDiscounts"
      :key = index
      :title = "disc.title"
      :image = "disc.image"
      :discount_value = "disc.discount_value"
      :discount_type = "disc.discount_type"
      :description = "disc.description"
      :full_description = "disc.full_description"
      :market = "disc.store_name"
      :start_date = "disc.start_date"
      :end_date = "disc.end_date"
      :code = "disc.code"
      >
    </card>
  </section>
    <div style="text-align: center;" v-if = "visibleCount < filtredDiscounts.length ">
      <button class = "showMore" @click = "loadMore">Показать еще</button>
    </div>
  </main>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import card from './card.vue';
import MainHeader from "@/Components/MainHeader.vue";

export default {
  components: {MainHeader, card },
  setup() {
    const search = ref('');
    const selectedBtn = ref('all');
    const isOpen = ref(false);
    const isCategory = ref(false);
    const visibleCount = ref(8);
    const addCard = ref(4);
    const discounts = ref([]);
    const filtredDiscounts = ref([]);
    const userRole = ref(null);
    const isLoadingUser = ref(false);

    const toggleShowPromo = () => {
      isOpen.value = !isOpen.value;
    }

    const checkUserRole = async () => {
      try{
        const response = await axios.get('http://localhost:3000/token', { withCredentials: true });
        const userData = response.data;
        console.log(userData);
        userRole.value = userData.roles_id;
      }
      catch(e){
        console.error('Ошибка пан');
        userRole.value = 1;
      }
    };

    // Получение скидок с сервера
    const fetchDiscounts = async () => {
      try {
        if (userRole.value <= 2) {
          discounts.value = [];
          filtredDiscounts.value = [];
          return;
        }

        const response = await axios.get('http://localhost:3000/api/Promotions');
        discounts.value = response.data;
        filtredDiscounts.value = response.data;
      } catch (e) {
        console.error('Ошибка при получении данных:', e);
      }
    };

    // Отфильтрованные скидки, видимые пользователю
    const visibleDiscounts = computed(() =>  {
      if (selectedBtn.value === 'best') {
        return [...filtredDiscounts.value].sort(compareDiscounts).slice(0, visibleCount.value)
      } else {
        return filtredDiscounts.value.slice(0, visibleCount.value);
      }
    });

    // Функция для загрузки большего количества карточек
    const loadMore = () => {
      visibleCount.value += addCard.value;
    };

    // Поиск карточек по вводу
    const searchCardsByInput = (search) => {
      const result = search.toLowerCase().trim();
      filtredDiscounts.value = visibleDiscounts.value.filter((card) =>
          card.full_description.toLowerCase().includes(result)
      );

      if (filtredDiscounts.value.length === 0) {
        alert('Введите действительное описание магазина');
        filtredDiscounts.value = discounts.value;
        changeBtn('all');
      }
    };

    // Изменение фильтра кнопок
    const changeBtn = (promo) => {
      selectedBtn.value = promo;
      if (promo === 'all') {
        filtredDiscounts.value = discounts.value;
      } else if (promo === 'promo') {
        filtredDiscounts.value = discounts.value.filter(
            (card) => card.title === 'Промокод'
        );
      } else if (promo === 'first') {
        filtredDiscounts.value = discounts.value.filter(
            (card) => card.title === 'Скидка'
        );
      }
    };

    const compareDiscounts = (a, b) => {
      if (a.discount_type === '%' && b.discount_type !== '%') return -1;
      if (a.discount_type !== '%' && b.discount_type === '%') return 1; 

      return b.discount_value - a.discount_value;
};

    // Вызов fetchDiscounts при монтировании
    onMounted(async () => {
      await checkUserRole();
      isLoadingUser.value = true;
      await fetchDiscounts();
    });

    return {
      search,
      selectedBtn,
      isOpen,
      isCategory,
      visibleCount,
      addCard,
      discounts,
      filtredDiscounts,
      visibleDiscounts,
      isLoadingUser,
      userRole,
      fetchDiscounts,
      compareDiscounts,
      loadMore,
      searchCardsByInput,
      changeBtn,
      compareDiscounts,
      toggleShowPromo,
    };
  },
};
</script>
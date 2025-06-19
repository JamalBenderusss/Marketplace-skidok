<style scoped>
  .menu {
    /* margin-left: 20px;
    width: 10%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    flex-direction: column;
    flex-wrap: wrap; */
    height: 100vh;
    width: 128px;
    background-color: #1e293b;
    padding: 0 20px;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-around;
  }
  
  .menu__submit-btn {
    /* width: 100%;
    padding: 10px 20px;
    margin-bottom: 15px;
    border-radius: 8px;
    font-size: 14px;
    border: none;   
    background-color: #f0f0f0;
    color: #333;
    transition: background-color 0.5s ease; */
    display: block;
    background: none;
    border: none;
    color: #cbd5e1;
    text-align: left;
    padding: 12px 16px;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s, color 0.3s;
}

.menu__submit-btn:hover {
  /* background-color: #6b81e4;   */
  background-color: #334155;
  color: #ffffff;
}

  .profile {
    /* background-color: #425edd;   */
    background-color: #3b82f6;
    color: white;
  }
</style>

<template>
    <div class="menu">
        <div class="menu__submit-btn" :class="{'profile': activeTab === 'Promotions'}" @click = "emitChangeTab('Promotions')">Промокоды</div>
        <div class="menu__submit-btn" :class="{'profile': activeTab === 'Stores'}" @click = "emitChangeTab('Stores')">Магазины</div>
        <div class="menu__submit-btn" :class="{'profile': activeTab === 'Users'}" @click = "emitChangeTab('Users')">Пользователи</div>
        <div class="menu__submit-btn" :class="{'profile': activeTab === 'category'}" @click = "emitChangeTab('category')">Категории</div>
        <div class="menu__submit-btn" @click = "$router.push('/')">Вернутся в главное меню</div>
        <div class="menu__submit-btn" @click = "logOut">Выйти</div>
    </div>
</template>

<script>
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'profileNav',
  props: {
    activeTab: String
  },
  emit: ['change-tab'],
  setup(props, { emit }) {
    const router = useRouter();
    const emitChangeTab = (tab) => {
      emit('change-tab', tab);
    };

    const logOut = async() => {
      const response = await axios.post('http://62.217.178.172:3000/logout',{},{withCredentials: true});
      if (response.data.success) {
        router.push('/');
      }else {
        console.log(response.data.message);
      }
    }

    return {
      router,
      emitChangeTab,
      logOut
    }
  }
}

</script>
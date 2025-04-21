<style scoped>
  .user {
    width: 100%;
    height: 45px;
    border:#6b81e4 1px solid;
    margin-bottom: 10px;
    align-items: center;
    display: flex;
    justify-content: center;
    transition: background-color 0.3s ease;
  }

  .user:hover {
    background-color: #6b81e4;  
  }

  .profile {
    background-color: #425edd;  
  }
</style>

<template>

    <div class="menu">
        <div class="user" :class="{'profile': activeTab === 'profile'}" @click = "emitChangeTab('profile')">Мой профиль</div>
        <div class="user" :class="{'profile': activeTab === 'editing'}" @click = "emitChangeTab('editing')">Редактировать</div>
        <div class="user" @click = "$router.push('/')">Вернутся в главное меню</div>
        <div class="user" @click = "logOut">Выйти</div>
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
      const response = await axios.post('http://localhost:3000/logout',{},{withCredentials: true});
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
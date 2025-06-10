<style scoped>
  .user {
  height: 50px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  padding: 0 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: white;
  color: #333;
  }

  .user:hover {
    background-color: #f5f7ff;
  border-color: #6b81e4;
  transform: translateX(5px);
  }

  .profile {
    background-color: #f0f3ff;
  border-color: #6b81e4;
  color: #425edd;
  font-weight: 500;
  }

  .icon {
  width: 20px;
  height: 20px;
  vertical-align: middle;
  margin-right: 10px;
}

@media screen and (max-width: 576px) {
  .user {
    font-size: 0;
    width: 30px;
    padding: 0 0 0 10px;
  } 

}
</style>

<template>

    <div class="menu">
        <div class="user" :class="{'profile': activeTab === 'profile'}" @click = "emitChangeTab('profile')">
          <svg class="icon" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
      </svg>
        Мой профиль</div>
        <div class="user" :class="{'profile': activeTab === 'editing'}" @click = "emitChangeTab('editing')">
          <svg class="icon" viewBox="0 0 24 24">
        <path fill="currentColor" d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"/>
      </svg>
          Редактировать</div>
        <div class="user" @click = "$router.push('/admin')" v-if="userRole > 3">
          <svg class="icon" viewBox="0 0 24 24">
        <path fill="currentColor" d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.1 14.8,9.5C14.8,10.9 13.4,12 12,12C10.6,12 9.2,10.9 9.2,9.5C9.2,8.1 10.6,7 12,7M12,14.3C14.5,14.3 16.8,15.6 18,17.5C16.2,19.5 13.4,20.7 12,20.7C10.6,20.7 7.8,19.5 6,17.5C7.2,15.6 9.5,14.3 12,14.3Z"/>
      </svg>
          Админ панель</div>
        <div class="user" @click = "$router.push('/')">
          <svg class="icon" viewBox="0 0 24 24">
        <path fill="currentColor" d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z"/>
      </svg>
          Вернутся в главное меню</div>
        <div class="user" @click = "logOut">
          <svg class="icon" viewBox="0 0 24 24">
        <path fill="currentColor" d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z"/>
      </svg>
          Выйти</div>
    </div>
</template>

<script>
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import axios from 'axios';

export default {
  name: 'profileNav',
  props: {
    activeTab: String
  },
  emit: ['change-tab'],
  setup(props, { emit }) {
    const router = useRouter();
    const userRole = ref(null);
    const emitChangeTab = (tab) => {
      emit('change-tab', tab);
    };

    const checkUserRole = async () => {
      try{
        const response = await axios.get('http://localhost:3000/token', { withCredentials: true });
        const userData = response.data;
        userRole.value = userData.roles_id;
      }
      catch(e){
        console.error('Ошибка пан');
      }
    };

    const logOut = async() => {
      const response = await axios.post('http://localhost:3000/logout',{},{withCredentials: true});
      if (response.data.success) {
        router.push('/');
      }else {
        console.log(response.data.message);
      }
    };

    onMounted(checkUserRole);

    return {
      router,
      userRole,
      emitChangeTab,
      logOut,
      checkUserRole,
    }
  }
}

</script>
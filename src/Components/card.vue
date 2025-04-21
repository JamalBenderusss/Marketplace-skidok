<style scoped>
.promo {
  width: 230px;
  position: relative;
  display: inline-block;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.7s ease, box-shadow 0.3s ease;
  border-radius: 10px;
  margin-bottom: 20px;
  margin-right: 40px;
  cursor: pointer;
  border: 1px solid black;
}

.promo:hover {
  transform: translateY(-15px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.promo img {
  border-radius: 10px;
  max-width: 120px;
  display: flex;
  margin: 30px auto 10px;
}

.promo__title {
  padding-left: 10px;
  margin-bottom: 10px;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  color: #e63946;
}

.promo__decription {
  padding-left: 10px;
  text-align: center;
  color: black;
  width: 201px;
  height: 54px;
  margin: 0 auto 15px;
}

.promo__footer-promo {
  background-color: #c0c0c0;
  margin: 0 !important;
  padding: 5px;
  color: black;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  text-align: center;
}

.promo__skidka {
  position: absolute; /* Позиционируем относительно .card */
  top: -15px;
  right: -20px;
  background-color: #ff2626; /* Цвет фона */
  color: white; /* Цвет текста */
  border-radius: 50%; /* Делает элемент круглым */
  width: 50px;
  height: 50px;
  display: flex; /* Центрируем текст внутри */
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* Тень для объема */
}

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

.modal__overlay {
  width: 600px;
  height: 400px;
  background-color: #fff;
  border-radius: 10px;
  text-align: center;
  box-shadow: -5px 5px 5px rgba(0, 0, 0, 0.5);
}

.modal__popup-close {
    position: relative;
    top: -180px;
    right: -590px;
    width: 28px;
    height: 28px;
    z-index: 1000;
    cursor: pointer;
    background: url(/images/icon-close.svg) center no-repeat;
}

.modal__image {
  width: 20%;
}

.modal__header {
  width: 100%;
  height: 40px;
  margin-bottom: 15px;
  background-color: #6b81e4;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

.modal__header p {
  font-size: 24px;
  text-align: left;
  padding: 5px 5px 5px 30px;
  font-weight: 700;
}

.modal__overlay img {
  border-radius: 10px;
}

.Copy:hover {
  color: #1f38af;
  text-decoration: underline;
}

.Copy {
  background: url(/images/icon_copy.svg) center no-repeat;
  background-size: contain;
  position: relative;
  top: -35px;
  right: -165px;
  width: 35px;
  height: 35px;
  cursor: pointer;
  z-index: 1000;
  padding-left: 80px;
  color: #262626; 
}

.modal__take-promo input:focus {
  border-color:#1f38af;
}

.modal__take-promo input {
  height: 30px;
  font-size: 20px;
  border-radius: 10px;
  outline: none;
  padding-left: 10px;
  border: 1px solid black; 
  width: 190px;
}

.modal__take-promo {
  width: 250px;
  text-align: left;
  margin: auto;
}

.modal__decription{
  margin: 20px 0;
  font-size: 18px;
}

.modal__title {
  font-size: 24px;
}
</style>

<template>
        <div class = "promo" @click = "openModal">
          <img :src="pathimage" alt="Discount image">
          <h3 class="promo__title">{{ title }}</h3>
          <p class = "promo__decription">{{ description }}</p>
          <p class = "promo__footer-promo">От {{ market }}</p>
          <div class = "promo__skidka" v-if = "(discount_type === 'percentage')">{{discount_value}} %</div>
          <div class = "promo__skidka" v-else-if="(discount_type === 'BYN')">{{ discount_value }} BYN</div>
        </div>
        <div v-if = "isOpenModal" class = "modal" @click.self = "closeModal">
          <div class="modal__popup-close" @click.self = "closeModal"></div>
          <div class = "modal__overlay">
              <div class = "modal__header"><p>
                Ваш промокод для {{ market }}
              </p>
            </div>
            <div class = "modal__take-promo">
              <input type="text" v-model = "localCode"><div class = "Copy" @click = "copyText"> скопировать</div>
            </div>
              <img :src="pathimage" alt="Discount image" class="modal__image">
              <h3 class="modal__title">{{ title }}</h3>
              <p class = "modal__decription">{{ full_description }}. Акция действует с {{ formatedDate(start_date) }} по {{ formatedDate(end_date) }}</p>
            </div>
          </div>
        
</template>

<script>
export default {
  props: {
    title: String,
    image: String, // ожидается, например, "my-image.png"
    discount_value: Number,
    discount_type: String,
    start_date: Date,
    end_date: Date,
    description: String,
    full_description: String,
    market: String,
    code: String,
  },
  data() {
    return {
      isOpenModal: false,
      localCode: this.code,
      localImage: this.image,
    };
  },
  watch: {
    // Если prop image изменится, обновляем localImage
    image(newVal) {
      this.localImage = newVal;
    },
    code(newVal) {
      this.localCode = newVal;
    }
  },
  computed: {
    pathimage() {
      return `/images/${this.image}`;
    }
  },
  methods: {
    openModal() {
      this.isOpenModal = true;
    },
    closeModal() {
      this.isOpenModal = false;
    },
    formatedDate(a) {
      const date = new Date(a);
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    },
    copyText() {
      navigator.clipboard.writeText(this.code);
      alert('Промокод скопирован');
    }
  }
}
</script>

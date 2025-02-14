<template>
  <div class="container">
    <!-- Header -->
    <div class="card-header">{{ formTitle }}</div>
	
	<div class="card" style="text-align:left;">
    *表示必填問題
    </div>

    <!-- 活動圖片 -->
    <div class="card" v-for="(img, index) in eventImages" :key="index">
      <img :src="img.src" :alt="img.alt" class="custom-img" />
    </div>

    <!-- 使用條款 -->
    <div class="card">
      <h2>
	  報名紀錄使用條款(請下滑至底部並勾選確認)
	  </h2>
      <div id="termsContainer" class="content">
        <p :ref="titleRefList.set">親愛的玩家：</p>
        <p>為了提升網站安全性和服務品質，我們將會收集 Cookie。</p>
        <b>相關資訊將會經加密演算法處理，避免產生可以直接識別您身份的個人資料。</b>
        <a href="https://cryptojs.gitbook.io/docs/">演算法參考文檔</a>

        <p :ref="titleRefList.set">我們使用 Cookies 的目的：</p>
        <ul>
          <li>確保活動正常運作。</li>
          <li>提升活動品質。</li>
          <li>監測和預防潛在的惡意行為。</li>
        </ul>

        <p>您的選擇：</p>
        <p :ref="titleRefList.set">您可以選擇是否接受 Cookies，若拒絕可能無法使用本表單。</p>

        <p>聯繫方式：</p>
        <ul>
          <li>聯繫 Icy: icysdungeon@gmail.com</li>
          <li>
            桃推相關粉專：
            <a href="https://linktr.ee/tyntrpg" :ref="titleRefList.set">https://linktr.ee/tyntrpg</a>
          </li>
        </ul>

      </div>
	  <p>閱讀率：{{ readRate.toFixed(1) }}%</p>
	  <h2>我已詳閱上述須知</h2>
			<toggle-proactive
			  class="hand"
			  id="confirmCheckbox"
			  v-model="value"
			  :disabled
			  size="4rem"
			  fur-color="#DFC57B"
			  pad-color="#FFF"
			  trackInactiveClass="#DFDFDF"
			  trackActiveClass="green"
			  thumbClass="#FFF"
			/>
    </div>

	<!-- robot -->
	<div class="card">
		推廣會小精靈，加入並訂閱通知。成功報名小精靈會有通知提醒你唷
		<br>(<ゝω・) 綺羅星☆
		<img src="../../img/bar.jpg" alt="bot" class="custom-img">
	</div>
    <!-- 報名表單 -->
    <form @submit.prevent="submitForm">
	  <div class="card">
		我瞭解並同意以上注意事項（強調：報名失敗才會有專人通知，無通知代表報名自動成功）<br><br>
		<label class="radio-button-container">是
			<input type="radio" name="ruleCheck" value="是">
			<span class="checkmark"></span>
		</label>
	  </div>
	
	  <div class="card">
			報名場次（若要報名2場請填2次單）（強調：無特別通知代表報名成功，當天請準時來參加活動。）<br><br>
			<div id="warning">註：目前報名人數較多，可能會被排為候補。<br><br></div>
			<label class="radio-button-container" id="eventDateLabel">
				<input type="radio" name="date" id="eventDateRadio">
				<span class="checkmark"></span>
			</label>
	  </div>
	
      <div class="card">
        <label for="name">報名ID(活動當天以此簽到)*</label>
        <input type="text" id="name" v-model="form.name" placeholder="您的姓名" required />
      </div>

      <div class="card">
        <label>請問是否有玩過TRPG?*</label>
		<br>
        <div v-for="option in trpgOptions" :key="option.value" class="radio-button-container">
          <input type="radio" v-model="form.trpgexp" :value="option.value" />
          <span class="checkmark"></span> <span v-html="option.label"></span>
        </div>
        <input type="text" v-model="form.otherTrpg" v-if="form.trpgexp === '其他'" placeholder="請說明" />
      </div>

      <div class="card">
        <label for="commNum">請問你的聯絡方式？（手機）*</label>
        <input type="text" id="commNum" v-model="form.commNum" placeholder="您的回答" required />
      </div>

      <div class="card">
        <label for="commMail">請問你的聯絡方式？（E-mail）</label>
        <input type="email" id="commMail" v-model="form.commMail" placeholder="您的回答" />
      </div>

      <div class="card">
        <label>報名總人數（2人以上團體請分開填單）*</label>
        <select v-model="form.regnum" required>
          <option disabled value="">請選擇人數</option>
          <option value="1">1</option>
          <option value="2">2</option>
        </select>
      </div>

      <div class="card">
        <label>請問參加者年齡?*</label>
        <div v-for="option in ageOptions" :key="option.value" class="radio-button-container">
          <input type="radio" v-model="form.regage" :value="option.value" />
          <span class="checkmark"></span> {{ option.label }}
        </div>
      </div>

      <div class="card">
        <label for="memo">備註欄（多人報名請註明新手人數）</label>
        <input type="text" id="memo" v-model="form.memo" placeholder="您的回答" />
      </div>
	  
	  <div class="card">
		<label>請問您是如何得知本活動的?</label>
		<br><br>
		<div class="custom-checkbox">
			<input type="checkbox" id="howtoknow1" name="howtoknow" value="Discord" style="display: none;">
			<label for="howtoknow1">Discord</label><br><br>
			<input type="checkbox" id="howtoknow2" name="howtoknow" value="FB" style="display: none;">
			<label for="howtoknow2">FB</label><br><br>
			<input type="checkbox" id="howtoknow3" name="howtoknow" value="IG" style="display: none;">
			<label for="howtoknow3">IG</label><br><br>
			<input type="checkbox" id="howtoknow4" name="howtoknow" value="Line" style="display: none;">
			<label for="howtoknow4">Line</label><br><br>
			<input type="checkbox" id="howtoknow5" name="howtoknow" value="桃推網站" style="display: none;">
			<label for="howtoknow5">桃推網站</label><br><br>
			<input type="checkbox" id="howtoknow6" name="howtoknow" value="噗浪" style="display: none;">
			<label for="howtoknow6">噗浪</label><br><br>
			<input type="checkbox" id="howtoknow7" name="howtoknow" value="朋友介紹" style="display: none;">
			<label for="howtoknow7">朋友介紹</label>
		</div>
	  </div>
	  
	  <div class="card">
            <label>活動場地資訊</label>
			<br><br>
            骰子貓商店：<a href="https://goo.gl/maps/gvSftUF7p4fGNvc3A">https://goo.gl/maps/gvSftUF7p4fGNvc3A</a>
			<br>來店指南：<a href="https://goo.gl/Crhf3Q">https://goo.gl/Crhf3Q</a>
			<br>(或Google Map搜尋”骰子貓商店”定位)

			<br>聯絡信箱：icysdungeon@gmail.com (主辦：Icy)
        </div>

      <div class="card">
        <button type="submit" :disabled="!termsAccepted">提交</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue'
import { ref, reactive, onMounted, computed } from "vue";
import { useTemplateRefsList } from '@vueuse/core'
import { map, pipe } from 'remeda'
import { useElementVisibilityTime } from '../composables/use-element-visibility-time'
import { useRouter } from 'vue-router'
import ToggleProactive from '../toggle-proactive.vue' 

const formTitle = ref("");
const termsAccepted = ref(false);
const isSubmitting = ref(false);

const titleRefList = useTemplateRefsList<HTMLElement>()

const timeList = ref<ComputedRef<number>[]>([])
onMounted(() => {
  timeList.value = titleRefList.value.map((el) => {
    const { totalVisibleTime } = useElementVisibilityTime(el)
    return totalVisibleTime
  })
})

/** 最小閱讀時間 */
const MIN_READ_MS = 1000

/** 閱讀率 */
const readRate = computed(() => pipe(
  timeList.value,
  map((time) => time.value > MIN_READ_MS ? MIN_READ_MS : time.value),
  (timeList) => {
    const total = timeList.reduce((acc, time) => acc + time, 0)
    if (total === 0)
      return 0

    return total / (MIN_READ_MS * timeList.length) * 100
  },
))

const disabled = computed(() => readRate.value < 100)
const value = ref(false)

const form = reactive({
  ruleCheck: "",
  name: "",
  date: "",
  trpgexp: "",
  otherTrpg: "",
  commNum: "",
  commMail: "",
  regnum: "",
  regage: "",
  trpgExp: "",
  memo: "",
  userId: "",
  hashId: "",
  howtoknow: [],
});

const eventImages = [
  { src: "img/TRPG.001.jpeg", alt: "活動須知" },
  { src: "img/new_time.png", alt: "活動時間" },
  { src: "img/01215.001.jpeg", alt: "活動分配" },
  { src: "img/t2.004.jpeg", alt: "人滿須知" },
  { src: "img/bar.jpg", alt: "機器人"},
];

const trpgOptions = [
  { value: "有", label: "有" },
  { value: "沒有", label: "沒有" },
  { value: "有，但不到3次", label: "有，但不到3次" },
  { value: "其他", label: "其他：" },
];

const ageOptions = [
  { value: "12歲以下", label: "12歲以下" },
  { value: "13歲到45歲", label: "13歲到45歲" },
  { value: "46歲以上", label: "46歲以上" },
];

const webAppUrl = ref("https://your-api-endpoint.com"); // 替換成你的 API 端點

const submitForm = async () => {
  if (!termsAccepted.value) {
    alert("請閱讀並同意條款");
    return;
  }

  if (!form.name || !form.commNum || !form.date || !form.commMail) {
    alert("請填寫所有必填欄位");
    return;
  }

  const formData = {
    ruleCheck: form.ruleCheck,
    date: form.date,
    name: form.name,
    trpgExp: form.trpgExp,
    commNum: form.commNum,
    commMail: form.commMail,
    regnum: form.regnum,
    regage: form.regage,
    memo: form.memo,
    howtoknow: form.howtoknow.join(", "),
    userId: form.userId, // 這應該是從 Cookie 或隨機產生的
    hashId: form.hashId, // 這應該是從瀏覽器指紋獲取的
  };

  try {
    isSubmitting.value = true;
    const response = await fetch(webAppUrl.value, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const result = await response.json();
    if (response.ok) {
	  const router = useRouter()
      alert("提交成功！");
      router.push("/finish");
    } else {
      alert("提交失敗：" + result.error);
    }
  } catch (error) {
    console.error("表單提交錯誤:", error);
    alert("提交時發生錯誤，請稍後再試！");
  } finally {
    isSubmitting.value = false;
  }
};

const fetchEventData = () => {
  // 在這裡加入你的 API 請求邏輯，如果有的話
};

onMounted(() => {
  fetchEventData();
});
</script>

<style scoped lang="sass">
// 這裡加入你原本的 CSS
  div#app
    font-family: Arial, sans-serif;
    background-color: #DBB3B3;
    padding: 20px;

@media screen and (max-width: 600px)
  .container
    width: 100%

  .card
    max-width: 100%
    margin: 0 auto // 這會將卡片置中
    background: #fff
    margin-bottom: 20px
    padding: 20px
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2)
    border-radius: 8px
    overflow: hidden // 確保子元素不超出卡片邊界

    &-header
      max-width: 100%
      margin: 0 auto
      background: #01814A
      margin-bottom: 20px
      padding: 20px
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2)
      border-radius: 8px
      overflow: hidden
      color: #FFF
      font-size: 24px
      font-weight: bold
  .hand
    margin-left: 25%


// 大於 600px 寬的設備
@media screen and (min-width: 601px)
  .card
    position: relative
    max-width: 80%
    margin: 0 auto
    background: #fff
    margin-bottom: 20px
    padding: 20px
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2)
    border-radius: 8px
    overflow: hidden

  .card-header
    max-width: 60%
    margin: 0 auto
    background: #01814A
    margin-bottom: 20px
    padding: 20px
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2)
    border-radius: 8px
    overflow: hidden
    color: #FFF
    font-size: 24px
    font-weight: bold
  .hand
    margin-left: 40%

body
  font-family: Arial, sans-serif
  background-color: #DBB3B3
  padding: 20px

.custom-img
  color: black
  width: 100%
  height: auto

.radio-button-container
  display: inline-block
  margin-right: 10px
  position: relative
  padding-left: 25px
  cursor: pointer
  user-select: none

.radio-button-container input[type="radio"]
  opacity: 0
  position: absolute
  cursor: pointer

.checkmark
  position: absolute
  top: 0
  left: 0
  height: 20px
  width: 20px
  background-color: #eee
  border-radius: 50%
  border: 1px solid #ddd

.radio-button-container input:checked ~ .checkmark
  background-color: #2196F3
  animation: ripple 0.2s linear

@keyframes ripple
  0%
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.1), 0 0 0 10px rgba(33, 150, 243, 0.1), 0 0 0 20px rgba(33, 150, 243, 0.1), 0 0 0 30px rgba(33, 150, 243, 0.1)
  100%
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0), 0 0 0 10px rgba(33, 150, 243, 0), 0 0 0 20px rgba(33, 150, 243, 0), 0 0 0 30px rgba(33, 150, 243, 0)

input[type="text"],
input[type="email"],
select
  width: 90%
  padding: 10px
  padding-right: 30px
  margin-bottom: 5px
  border-radius: 4px
  border: 1px solid #ddd

input[type="button"]
  display: block
  margin: 0 auto
  background-color: #007bff
  color: white
  padding: 15px 30px
  font-size: 24px
  border: none
  border-radius: 6px
  cursor: pointer

input[type="button"]:hover
  background-color: #0056b3

.custom-checkbox input[type="checkbox"]
  display: none

.custom-checkbox label:before
  content: ''
  display: inline-block
  width: 20px
  height: 20px
  margin-right: 10px
  border: 2px solid #007bff
  border-radius: 4px
  vertical-align: middle

.custom-checkbox input[type="checkbox"]:checked + label:before
  background-color: #007bff
  background-image: url('data:image/svg+xml;utf8,<svg fill="%23ffffff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M13.485 1.929a1.571 1.571 0 0 1 2.222 2.222L7.343 12.514a1.571 1.571 0 0 1-2.222 0L.293 7.686a1.571 1.571 0 1 1 2.222-2.222L5.12 8.07 13.485 1.93z"/></svg>')
  background-repeat: no-repeat
  background-position: center center

.custom-checkbox label
  cursor: pointer

.form-container
  background-color: white
  max-width: 500px
  margin: 0 auto
  padding: 20px
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1)

#termsContainer
  color: black
  height: 320px
  overflow-y: scroll
  border: 1px solid #ccc
  padding: 10px
  position: relative
  text-align: left
  font-size: 20px

#scrollToBottomButton
  position: sticky
  left: 100%
  bottom: 10px
  opacity: 0.5
  background-color: #007bff
  color: white
  border: none
  border-radius: 5px
  padding: 5px 10px
  cursor: pointer
  transition: opacity 0.3s

#scrollToBottomButton:hover
  opacity: 0.7

.content 
    width: 100% /* 或指定其他寬度 */
    padding: 15px
    box-sizing: border-box
    word-wrap: break-word
    overflow-wrap: break-word
	
.hidden 
    display: none
	
.custom-checkbox 
    display: flex
    flex-direction: column
    align-items: flex-start

.custom-checkbox label 
    display: inline-block
    cursor: pointer

#notifyButton 
    background-color: #4CAF50 /* Green */
    border: none
    color: white
    padding: 15px 32px
    text-align: center
    text-decoration: none
    display: inline-block
    font-size: 16px
    margin: 4px 2px
    cursor: pointer
		
		
#warning 
    color: red
    font-weight: bold
    display: none
		
</style>

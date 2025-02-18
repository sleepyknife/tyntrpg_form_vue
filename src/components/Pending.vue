<template>
  <div class="container">
    
	<div class="form-container">
		<wrapper-cat-ear
			  main-color="#03a1fc"
			  inner-color="#8f003e" >
			<h1>{{formTitle}}</h1>
			<br>
			<br>{{formTitle}}的活動尚未開始報名，不好意思，麻煩稍待相關資訊公布。
			<br>{{EventDate1}}
			<br>敬請關注桃園TRPG推廣活動相關社群，期待您的參加！
			<br>
			<br>
			<br>
			<br>--
			<!-- <br>活動細節預計會在前一個月15日前後公布，詳細仍請關注相關連結 -->
			<br>桃推相關資訊連結：<a href="https://linktr.ee/tyntrpg">https://linktr.ee/tyntrpg</a>
		</wrapper-cat-ear>	
	</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import WrapperCatEar from '../wrapper-cat-ear.vue'

const formTitle = ref("");
const EventDate1 = ref("");

onMounted(() => {

  // 讀取 env.json（單獨的 async 函數）
  loadEnvData();
})

async function loadEnvData() {
  try {
    const baseUrl = import.meta.env.BASE_URL; // 取得專案的根路徑
    const response = await fetch(`${baseUrl}env.json`); // ✅ 正確取得 env.json
    if (!response.ok) {
      throw new Error("Failed to fetch env.json");
    }
    const data = await response.json();
    formTitle.value = data.TitleDate + '，桃園TRPG推廣活動報名表'; // 設定表單標題
	
	setTimeout(() => {
      EventDate1.value = data.ThisEventDate; // ✅ 延遲設定，避免 Vue 預選 radio
    }, 100);
  } catch (error) {
    console.error("Error loading env.json:", error);
  }
}

</script>

<style scoped lang="sass">
// 這裡加入你原本的 CSS
  div#app
    font-family: Arial, sans-serif;
    background-color: #DBB3B3;
    padding: 20px;

@media screen and (max-width: 600px)
  .container
    position: relative
    width: 100%
    z-index: 1

  .card
    position: relative
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
  .container
    position: relative
    width: 100%
    z-index: 1
	
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
	
.radio-group 
    display: flex
    flex-direction: column /* ✅ 確保每個選項獨立一行 */
    gap: 12px /* ✅ 設定選項之間的間距 */


.radio-button-container 
    display: flex
    align-items: center
    gap: 8px /* ✅ 確保 radio 與文字之間有間距 */
    cursor: pointer


.radio-button-container input[type="radio"] 
    width: 16px
    height: 16px
    accent-color: #01814A /* ✅ 調整選中顏色 */


.radio-label 
    font-size: 16px


/* 額外「其他」輸入框的樣式 */
.other-input-container 
    margin-left: 24px /* ✅ 讓額外輸入框與選項對齊 */


.other-input-container input 
    width: 100% /* ✅ 讓輸入框填滿可用空間 */
    padding: 8px
    font-size: 14px
    border: 1px solid #ccc
    border-radius: 4px

button
  width: 100%
  padding: 12px
  font-size: 16px
  border: none
  border-radius: 6px
  cursor: pointer
  transition: background-color 0.3s

  &.enabled-btn
    background-color: #01814A // ✅ 當可提交時變為綠色
    color: white

  &.disabled-btn
    background-color: #ccc // ❌ 當不可提交時變為灰色
    color: #666
    cursor: not-allowed

		
</style>

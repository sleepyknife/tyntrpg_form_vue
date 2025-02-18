<template>
  <div class="container">
    <!-- Header -->
    <div  id="head-ear" class="card-header">
		<wrapper-cat-ear
			  main-color="#3b3b3b"
			  inner-color="#ffc2b8"
			>
			<h2>
				{{ formTitle }}
			</h2>
		</wrapper-cat-ear>
	</div>
	
	<div class="card" style="text-align:left;">
    *表示必填問題
    </div>

    <!-- 活動圖片 -->
    <div class="card" v-for="(img, index) in eventImages" :key="index">
      <img :src="img.src" :alt="img.alt" class="custom-img" />
    </div>

    <!-- 使用條款 -->
    <div class="card">
	  <wrapper-cat-ear
			  main-color="#3b3b3b"
			  inner-color="#ffc2b8"
			>
      <h2>
	  報名紀錄使用條款(請蒐集貓貓並勾選確認)
	  </h2>
      <div id="termsContainer" class="content">
        <p :ref="titleRefList.set">🐈親愛的玩家：🐈</p>
        <p>為了提升網站安全性和服務品質，我們將會收集 Cookie。</p>
        <b>相關資訊將會經加密演算法處理，避免產生可以直接識別您身份的個人資料。</b>
        <a href="https://cryptojs.gitbook.io/docs/">演算法參考文檔</a>

        <p :ref="titleRefList.set">🐈我們使用 Cookies 的目的：🐈</p>
        <ul>
          <li>確保活動正常運作。</li>
          <li>提升活動品質。</li>
          <li>監測和預防潛在的惡意行為。</li>
        </ul>

        <p>您的選擇：</p>
        <p :ref="titleRefList.set">🐈您可以選擇是否接受 Cookies，若拒絕可能無法使用本表單。🐈</p>

        <p>聯繫方式：</p>
        <ul>
          <li>聯繫 Icy: icysdungeon@gmail.com</li>
          <li>
            🐈桃推相關粉專🐈：
            <a href="https://linktr.ee/tyntrpg" :ref="titleRefList.set">https://linktr.ee/tyntrpg</a>
          </li>
        </ul>

      </div>
	  <p>閱讀率：{{ readRate.toFixed(1) }}%</p>
	  <h2>我已詳閱上述須知</h2>
			<toggle-proactive
			  class="hand"
			  id="confirmCheckbox"
			  v-model="License"
			  :disabled
			  size="4rem"
			  fur-color="#DFC57B"
			  pad-color="#FFF"
			  trackInactiveClass="#DFDFDF"
			  trackActiveClass="green"
			  thumbClass="#FFF"
			/>
		</wrapper-cat-ear>	
    </div>

    <!-- 報名表單 -->
    <form @submit.prevent="submitForm">
	  <div class="card">
		我瞭解並同意以上注意事項（強調：報名失敗才會有專人通知，無通知代表報名自動成功）<br><br>
		<label class="radio-button-container">是
			<input type="radio" v-model="form.ruleCheck" value="是">
			<span class="checkmark"></span>
		</label>
	  </div>
	
	  <div class="card">
			報名場次（若要報名2場請填2次單）（強調：無特別通知代表報名成功，當天請準時來參加活動。）<br><br>
			<div id="warning">註：目前報名人數較多，可能會被排為候補。<br><br></div>
			<label class="radio-button-container">
				<input type="radio" v-model="form.date" :value="EventDate1" v-if="EventDate1">
				<span class="checkmark"></span> 
				<span class="radio-label">{{ EventDate1 }}</span>
			</label>
	  </div>
	
      <div class="card">
        <label for="name">報名ID(活動當天以此簽到)*</label>
        <input type="text" id="name" v-model="form.name" placeholder="您的姓名" required />
      </div>

      <div class="card">
        <label>請問是否有玩過TRPG?*</label>
		<br>
        <div class="radio-group">
		  <label v-for="option in trpgOptions" :key="option.value" class="radio-button-container">
			<input type="radio" v-model="form.trpgexp" :value="option.value" />
			<span class="checkmark"></span> 
			<span class="radio-label" v-html="option.label"></span>
		  </label>

		  <!-- 額外的輸入框，僅當選擇「其他」時顯示 -->
		  <div v-if="form.trpgexp === '其他'" class="other-input-container">
			<input type="text" v-model="form.otherTrpg" placeholder="請說明" />
		  </div>
		</div>
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
		<label v-for="option in ageOptions" :key="option.value" class="radio-button-container">
			<input type="radio" v-model="form.regage" :value="option.value" />
			<span class="checkmark"></span> 
			<span class="radio-label" v-html="option.label"></span>
		  </label>      
      </div>

      <div class="card">
        <label for="memo">備註欄（多人報名請註明新手人數）</label>
        <input type="text" id="memo" v-model="form.memo" placeholder="您的回答" />
      </div>
	  
	  <div class="card">
		<label>請問您是如何得知本活動的?</label>
		<br><br>
		<div class="custom-checkbox">
			<input type="checkbox" id="howtoknow1" value="Discord" v-model="form.howtoknow">
			<label for="howtoknow1">Discord</label><br><br>

			<input type="checkbox" id="howtoknow2" value="FB" v-model="form.howtoknow">
			<label for="howtoknow2">FB</label><br><br>

			<input type="checkbox" id="howtoknow3" value="IG" v-model="form.howtoknow">
			<label for="howtoknow3">IG</label><br><br>

			<input type="checkbox" id="howtoknow4" value="Line" v-model="form.howtoknow">
			<label for="howtoknow4">Line</label><br><br>

			<input type="checkbox" id="howtoknow5" value="桃推網站" v-model="form.howtoknow">
			<label for="howtoknow5">桃推網站</label><br><br>

			<input type="checkbox" id="howtoknow6" value="噗浪" v-model="form.howtoknow">
			<label for="howtoknow6">噗浪</label><br><br>

			<input type="checkbox" id="howtoknow7" value="朋友介紹" v-model="form.howtoknow">
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
        <button type="submit" 
		:disabled="!termsAccepted"
		:class="{ 'enabled-btn': termsAccepted, 'disabled-btn': !termsAccepted }"
		>提交</button>
      </div>
    </form>
  </div>
  <br><br><br><br><br>
</template>

<script setup lang="ts">
import type { ComputedRef } from 'vue'
import { ref, onMounted, computed, watch } from "vue";
import { useTemplateRefsList } from '@vueuse/core'
import { map, pipe } from 'remeda'
import { useElementVisibilityTime } from '../composables/use-element-visibility-time'
import ToggleProactive from '../toggle-proactive.vue' 
import CryptoJS from "crypto-js";
import WrapperCatEar from '../wrapper-cat-ear.vue'

const formTitle = ref("");
const EventDate1 = ref("");
const SubmitwebAppUrl = ref("");
const License = ref(false);


const termsAccepted = computed(() => {
	return (
		form.value.ruleCheck !== "" &&
		form.value.name.trim() !== "" &&
		form.value.date !== "" &&
		form.value.trpgexp !== "" &&
		form.value.commNum.trim() !== "" &&
		form.value.regnum !== "" &&
		form.value.regage !== "" &&
		License.value
  );
});

const titleRefList = useTemplateRefsList<HTMLElement>()

const timeList = ref<ComputedRef<number>[]>([])
onMounted(() => {
  timeList.value = titleRefList.value.map((el) => {
    const { totalVisibleTime } = useElementVisibilityTime(el)
    return totalVisibleTime
  });
  
  // 讀取 env.json（單獨的 async 函數）
  loadEnvData();
})

// ✅ 把 fetch 移到獨立的 async 函數
async function loadEnvData() {
  try {
    const baseUrl = import.meta.env.BASE_URL; // 取得專案的根路徑
    const response = await fetch(`${baseUrl}env.json`); // ✅ 正確取得 env.json
    if (!response.ok) {
      throw new Error("Failed to fetch env.json");
    }
    const data = await response.json();
    formTitle.value = data.TitleDate + '，桃園TRPG推廣活動報名表'; // 設定表單標題
	SubmitwebAppUrl.value = data.webAppUrl;
	
	setTimeout(() => {
      EventDate1.value = data.ThisEventDate; // ✅ 延遲設定，避免 Vue 預選 radio
    }, 100);
  } catch (error) {
    console.error("Error loading env.json:", error);
  }
}

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

// 計算 disabled 狀態
const disabled = computed(() => readRate.value < 100);

// 監聽 readRate，當等於 100 時啟用 license
watch(readRate, (newRate) => {
  if (newRate === 100) {
    License.value = true;
  }
});

const form = ref({
  ruleCheck: "",
  name: "",
  date: "",
  trpgexp: "",
  otherTrpg: "",
  commNum: "",
  commMail: "",
  regnum: "",
  regage: "",
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


const submitForm = async () => {
  console.log("提交表單", form.value);
  alert("表單提交成功");
  
  form.value.userId = getCookie("userId");
  if (!form.value.userId) 
  {
	form.value.userId = generateRandomId(12);
	setCookie("userId", form.value.userId, 365); 
  }
  checkAndResetCookie('hashId',[6, 8, 11, 22, 23, 25, 33, 36, 38, 45, 52], 'taoyuantrpg');
  
  
  const formData = new URLSearchParams();
	formData.append("ruleCheck", form.value.ruleCheck);
	formData.append("date", form.value.date);
	formData.append("name", form.value.name);
	formData.append("trpgExp", form.value.trpgexp);
	formData.append("commNum", form.value.commNum);
	formData.append("commMail", form.value.commMail);
	formData.append("regnum", form.value.regnum);
	formData.append("regage", form.value.regage);
	formData.append("memo", form.value.memo);
	formData.append("howtoknow", form.value.howtoknow.join(",")); // 如果是陣列，轉為逗號分隔字串
	formData.append("userId", form.value.userId);
	formData.append("hashId", form.value.hashId);

	fetch(SubmitwebAppUrl.value, {
	  method: "POST",
	  headers: {
		"Content-Type": "application/x-www-form-urlencoded",
	  },
	  body: formData.toString(), // 使用 URL 編碼格式
	})
	  .then(response => {
		if (response.ok) {
		  window.location.href = "finish.html";
		} else {
		  throw new Error("提交過程中出現錯誤");
		}
	  })
	  .catch(error => {
		alert(error.message);
	  });



	// try {
		// const response = await fetch(SubmitwebAppUrl.value, {
			// method: 'POST',
			// mode: "cors", // 確保是跨域模式
			// headers: {
				// 'Content-Type': 'application/json'
			// },
			// body: JSON.stringify(formData)
		// });

		// if (response.ok) {
			// window.location.href = "finish.html";
		// } else {
			// throw new Error("提交過程中出現錯誤。");
		// }
	// } catch (error) {
		// alert("Error");
		// const submitButton = document.getElementById('submitForm') as HTMLInputElement;
		// if (submitButton) {
			// submitButton.disabled = false;
			// submitButton.value = '提交';
		// }
	// }

  
  License.value = false;
};

function generateBrowserFingerprint(): string{
	const navigatorData = window.navigator;
	const screenData = window.screen;

	// Basic browser informations
	const userAgent = navigatorData.userAgent;
	const language = navigatorData.language;
	const platform = navigatorData.platform;
	const screenWidth = screenData.width;
	const screenHeight = screenData.height;
	const colorDepth = screenData.colorDepth;

	// gather data
	const fingerprint = [
		userAgent,
		language,
		platform,
		screenWidth,
		screenHeight,
		colorDepth
	].join('|');

	// 使用crypto-js 生成哈希值
	const hash: string = CryptoJS.SHA256(fingerprint).toString();

	return insertStringIntoHash(hash, "taoyuantrpg", [6, 8, 11, 22, 23, 25, 33, 36, 38, 45, 52]);
}

function insertStringIntoHash(hash: string, str: string, positions: number[]): string {
	let result = "";
	let strIndex = 0;
	for (let i = 0; i < hash.length; i++) {
		// 如果当前索引是指定位置之一，则使用"taoyuantrpg"中的字符替换
		if (positions.includes(i) && strIndex < str.length) {
			result += str[strIndex];
			strIndex++;
		} else {
			result += hash[i];
		}
	}
	// 如果"taoyuantrpg"还有剩余字符，将它们追加到结果的末尾
	if (strIndex < str.length) {
		result += str.slice(strIndex);
	}
	return result;
}


function generateRandomId(length: number) {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let charactersLength = characters.length;
	for ( var i = 0; i < length; i++ ) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}
function setCookie(name: string, value: string, days: number) {
	let expires = "";
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days*24*60*60*1000));
		expires = "; expires=" + date.toUTCString();
	}
	document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

function getCookie(name: string): string{
	let nameEQ = name + "=";
	let ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return "";
}

// 根据指定位置检查cookie值
function checkAndResetCookie(cookieName: string, positions: number[], matchString: string) {
	let cookieValue = getCookie(cookieName);
	if (cookieValue) {
		let extractedString = positions.map(pos => cookieValue[pos-1] || '').join('');
		if (extractedString !== matchString) {
			deleteCookie(cookieName); // 如果不匹配，则删除cookie
			form.value.hashId = generateBrowserFingerprint();
			setCookie("hashId", form.value.hashId, 365);
		}
	} else {
		form.value.hashId = generateBrowserFingerprint();
		setCookie("hashId", form.value.hashId, 365); // 如果cookie不存在，也设置cookie
	}
}

// 删除cookie的函数
function deleteCookie(name: string) {
	document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
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

  .card-header
    position: relative
    max-width: 70%
    margin: 0 auto
    background: #01814A
    margin-bottom: 20px
    padding: 20px
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2)
    border-radius: 8px
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

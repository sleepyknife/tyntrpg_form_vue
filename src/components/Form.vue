<template>
  <div class="container">
    <!-- Header -->
    <div class="card-header">{{ formTitle }}</div>

    <!-- 活動圖片 -->
    <div class="card" v-for="(img, index) in eventImages" :key="index">
      <img :src="img.src" :alt="img.alt" class="custom-img" />
    </div>

    <!-- 使用條款 -->
    <div class="card">
      <h1>報名紀錄使用條款(請下滑至底部並勾選確認)</h1>
      <div id="termsContainer" class="content" @scroll="handleScroll">
        <p>親愛的玩家：</p>
        <p>為了提升網站安全性和服務品質，我們將會收集 Cookie。</p>
        <b>相關資訊將會經加密演算法處理，避免產生可以直接識別您身份的個人資料。</b>
        <a href="https://cryptojs.gitbook.io/docs/">演算法參考文檔</a>

        <p>我們使用 Cookies 的目的：</p>
        <ul>
          <li>確保活動正常運作。</li>
          <li>提升活動品質。</li>
          <li>監測和預防潛在的惡意行為。</li>
        </ul>

        <p>您的選擇：</p>
        <p>您可以選擇是否接受 Cookies，若拒絕可能無法使用本表單。</p>

        <p>聯繫方式：</p>
        <ul>
          <li>聯繫 Icy: icysdungeon@gmail.com</li>
          <li>
            桃推相關粉專：
            <a href="https://linktr.ee/tyntrpg">https://linktr.ee/tyntrpg</a>
          </li>
        </ul>

        <button id="scrollToBottomButton" @click="scrollToBottom">滑至底部</button>
      </div>
      <input type="checkbox" id="confirmCheckbox" v-model="termsAccepted" />
      <label for="confirmCheckbox">我已閱讀並同意上述條款</label>
    </div>

    <!-- 報名表單 -->
    <form @submit.prevent="submitForm">
      <div class="card">
        <label for="name">報名ID(活動當天以此簽到)*</label>
        <input type="text" id="name" v-model="form.name" placeholder="您的姓名" required />
      </div>

      <div class="card">
        <label>請問是否有玩過TRPG?*</label>
        <div v-for="option in trpgOptions" :key="option.value" class="radio-button-container">
          <input type="radio" v-model="form.trpgexp" :value="option.value" />
          <span class="checkmark"></span> {{ option.label }}
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
        <button type="submit" :disabled="!termsAccepted">提交</button>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  data() {
    return {
      formTitle: "",
      termsAccepted: false,
      form: {
        name: "",
        trpgexp: "",
        otherTrpg: "",
        commNum: "",
        commMail: "",
        regnum: "",
        regage: "",
        memo: "",
        howtoknow: [],
      },
      eventImages: [
        { src: "img/TRPG.001.jpeg", alt: "活動須知" },
        { src: "img/new_time.png", alt: "活動時間" },
        { src: "img/01215.001.jpeg", alt: "活動分配" },
        { src: "img/t2.004.jpeg", alt: "人滿須知" },
      ],
      trpgOptions: [
        { value: "有", label: "有" },
        { value: "沒有", label: "沒有" },
        { value: "有，但不到3次", label: "有，但不到3次" },
        { value: "其他", label: "其他：" },
      ],
      ageOptions: [
        { value: "12歲以下", label: "12歲以下" },
        { value: "13歲到45歲", label: "13歲到45歲" },
        { value: "46歲以上", label: "46歲以上" },
      ],
    };
  },
  methods: {
	  async submitForm() {
		// 確保使用者勾選條款
		if (!this.termsAccepted) {
		  alert("請閱讀並同意條款");
		  return;
		}

		// 驗證必填欄位
		if (!this.form.name || !this.form.commNum || !this.form.date) {
		  alert("請填寫所有必填欄位");
		  return;
		}

		// 組裝表單數據
		const formData = {
		  ruleCheck: this.form.ruleCheck,
		  date: this.form.date,
		  name: this.form.name,
		  trpgExp: this.form.trpgExp,
		  commNum: this.form.commNum,
		  commMail: this.form.commMail,
		  regnum: this.form.regnum,
		  regage: this.form.regage,
		  memo: this.form.memo,
		  howtoknow: this.form.howtoknow.join(", "), // 多選轉為字串
		  userId: this.userId,  // 這應該是你從 Cookie 或隨機產生的
		  hashId: this.hashId   // 這應該是從瀏覽器指紋獲取的
		};

		try {
		  this.isSubmitting = true; // 禁用按鈕，避免重複提交
		  const response = await fetch(this.webAppUrl, {
			method: "POST",
			headers: {
			  "Content-Type": "application/json",
			},
			body: JSON.stringify(formData),
		  });

		  const result = await response.json();
		  if (response.ok) {
			alert("提交成功！");
			this.$router.push("/finish"); // 導向成功頁面
		  } else {
			alert("提交失敗：" + result.error);
		  }
		} catch (error) {
		  console.error("表單提交錯誤:", error);
		  alert("提交時發生錯誤，請稍後再試！");
		} finally {
		  this.isSubmitting = false; // 允許再次點擊
		}
	  }
	},
  mounted() {
    this.fetchEventData();
  },
};
</script>

<style scoped>
/* 這裡加入你原本的 CSS */

@media screen and (max-width: 600px) {
			.container {
				width: 100%;
			}

			.card {
				color: black;
				max-width: 100%;
				margin: 0 auto; /* 這會將卡片置中 */
				background: #fff;
				margin-bottom: 20px;
				padding: 20px;
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
				border-radius: 8px;
				overflow: hidden; /* 確保子元素不超出卡片邊界 */

			}
			
			.card-header {
				max-width: 100%;
				margin: 0 auto; /* 這會將卡片置中 */
				background: #01814A;
				margin-bottom: 20px;
				padding: 20px;
				box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
				border-radius: 8px;
				overflow: hidden; /* 確保子元素不超出卡片邊界 */
				color: #000;
				font-size: 24px;
				font-weight: bold;
			}

			/* 其他針對小屏幕的樣式 */
		}
	
		/* 大於 600px 寬的設備 */
		@media screen and (min-width: 601px) {
			/* 針對大屏幕的樣式 */
			.card {
				max-width: 60%;
				margin: 0 auto; /* 這會將卡片置中 */
				background: #fff;
				margin-bottom: 20px;
				padding: 20px;
				box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
				border-radius: 8px;
				overflow: hidden; /* 確保子元素不超出卡片邊界 */

			}
			
			.card-header {
				max-width: 60%;
				margin: 0 auto; /* 這會將卡片置中 */
				background: #01814A;
				margin-bottom: 20px;
				padding: 20px;
				box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
				border-radius: 8px;
				overflow: hidden; /* 確保子元素不超出卡片邊界 */
				color: #FFF;
				font-size: 24px;
				font-weight: bold;
			}
			
		}

        body {
            font-family: Arial, sans-serif;
            background-color: #DBB3B3;
            padding: 20px;
        }

        
		
		/* 圖片樣式 */
        .custom-img {
			color: black;
            width: 100%; /* 圖片寬度將適應卡片的寬度 */
            height: auto; /* 保持圖片的原始比例 */
        }

        .radio-button-container {
            display: inline-block;
            margin-right: 10px;
            position: relative;
            padding-left: 25px;
            cursor: pointer;
            user-select: none;
        }

        /* 隱藏原生的radio button */
        .radio-button-container input[type="radio"] {
            opacity: 0;
            position: absolute;
            cursor: pointer;
        }

        /* 創建一個自定義的radio button */
        .checkmark {
            position: absolute;
            top: 0;
            left: 0;
            height: 20px;
            width: 20px;
            background-color: #eee;
            border-radius: 50%;
            border: 1px solid #ddd;
        }

        /* 當radio button被選中時的樣式和動畫 */
        .radio-button-container input:checked ~ .checkmark {
            background-color: #2196F3;
            animation: ripple 0.2s linear;
        }

        /* 選中時的動畫效果 */
        @keyframes ripple {
            0% {
                box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.1), 0 0 0 10px rgba(33, 150, 243, 0.1), 0 0 0 20px rgba(33, 150, 243, 0.1), 0 0 0 30px rgba(33, 150, 243, 0.1);
            }
            100% {
                box-shadow: 0 0 0 0 rgba(33, 150, 243, 0), 0 0 0 10px rgba(33, 150, 243, 0), 0 0 0 20px rgba(33, 150, 243, 0), 0 0 0 30px rgba(33, 150, 243, 0);
            }
        }

        input[type="text"],
        input[type="email"],
        select {
            width: 90%;
            padding: 10px;
			padding-right: 30px;
            margin-bottom: 5px;
            border-radius: 4px;
            border: 1px solid #ddd;
        }

        input[type="button"] {
			display: block;
			margin: 0 auto;
			background-color: #007bff;
			color: white;
			padding: 15px 30px; /* 增加內邊距以放大按鈕 */
			font-size: 24px; /* 增加字體大小 */
			border: none;
			border-radius: 6px; /* 稍微增加邊框圓角 */
			cursor: pointer;
		}

		input[type="button"]:hover {
			background-color: #0056b3;
		}

		/* 隱藏原生的checkbox */
		.custom-checkbox input[type="checkbox"] {
			display: none;
		}

		/* 創建一個新的方框來代替checkbox */
		.custom-checkbox label:before {
			content: '';
			display: inline-block;
			width: 20px;
			height: 20px;
			margin-right: 10px;
			border: 2px solid #007bff;
			border-radius: 4px;
			vertical-align: middle;
		}

		/* 當checkbox被選中時 */
		.custom-checkbox input[type="checkbox"]:checked + label:before {
			background-color: #007bff;
			background-image: url('data:image/svg+xml;utf8,<svg fill="%23ffffff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M13.485 1.929a1.571 1.571 0 0 1 2.222 2.222L7.343 12.514a1.571 1.571 0 0 1-2.222 0L.293 7.686a1.571 1.571 0 1 1 2.222-2.222L5.12 8.07 13.485 1.93z"/></svg>');
			background-repeat: no-repeat;
			background-position: center center;
		}

		/* 標籤文字的樣式 */
		.custom-checkbox label {
			cursor: pointer;
		}

		
		.form-container {
            background-color: white;
            max-width: 500px;
            margin: 0 auto;
            padding: 20px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

		#termsContainer {
			color: black;
            height: 320px;
            overflow-y: scroll;
            border: 1px solid #ccc;
            padding: 10px;
			position: relative;
        }
		#scrollToBottomButton {
			position: sticky; /* 改为absolute，相对于termsContainer定位 */
			left: 100%;
			bottom: 10px;
			opacity: 0.5;
			background-color: #007bff; /* 按鈕背景顏色 */
			color: white;
			border: none;
			border-radius: 5px;
			padding: 5px 10px;
			cursor: pointer;
			transition: opacity 0.3s;
		}

		#scrollToBottomButton:hover {
			opacity: 0.7; /* 鼠標懸停時變更透明度 */
		}
		.content {
			width: 100%; /* 或指定其他寬度 */
			padding: 15px;
			box-sizing: border-box;
			word-wrap: break-word;
			overflow-wrap: break-word;
		}
        .hidden {
            display: none;
        }
		
		#notifyButton {
		  background-color: #4CAF50; /* Green */
		  border: none;
		  color: white;
		  padding: 15px 32px;
		  text-align: center;
		  text-decoration: none;
		  display: inline-block;
		  font-size: 16px;
		  margin: 4px 2px;
		  cursor: pointer;
		}
		
		#warning {
		  color: red;
		  font-weight: bold;
		  display: none;
		}
</style>

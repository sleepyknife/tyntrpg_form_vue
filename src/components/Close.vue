<template>
  <div class="container">
		<div class="form-container">
			    <div class="h-full flex justify-center">
					<card-futuristic
						v-on-click-outside="() => toggleSelect(false)"
						:visible
						:selected
						class="font-orbitron"
						@click="toggleSelect(true)"
					  >
							<div class="text-xl font-bold">
								<h1>{{formTitle}}</h1>
							</div>
							<div>
								<br>{{formTitle}}活動已額滿，報名截止，不好意思。可現場排隊候補。
								<br>敬請關注桃園TRPG推廣活動相關社群，期待次月活動！
								<br>
								<br>查看報名成功列表：<a href="https://tinyurl.com/yc664u7y">https://tinyurl.com/yc664u7y</a>
								<br>
								<br>--
								<br>預計下個月的活動時間為：{{NextDate}}
								<!-- <br>相關活動細節預計會在前一個月15日前後公布 -->
								<br>桃推相關資訊連結：<a href="https://linktr.ee/tyntrpg">https://linktr.ee/tyntrpg</a>
							</div>
					</card-futuristic>
				</div>
				
				<div class="flex flex-wrap items-center justify-center gap-10">
				  <card-futuristic
					v-for="item, i in list"
					:key="i"
					v-on-click-outside="() => item.selected = false"
					v-bind="item"
					class="font-orbitron"
					@click="item.selected = true"
				  >
					<div class="flex flex-col">
					  <div
						v-if="item.title"
						:class="item.titleClass"
					  >
						{{ item.title }}
					  </div>

					  <div
						v-if="item.text"
						:class="item.textClass"
					  >
						{{ item.text }}
					  </div>
					</div>
				  </card-futuristic>
				</div>
		</div>
  </div>
  
  

</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import WrapperCatEar from '../wrapper-cat-ear.vue'
import { useToggle } from '@vueuse/core'
import { vOnClickOutside } from '@vueuse/components'
import CardFuturistic from '../card-futuristic.vue'
import { map, pipe } from 'remeda'

const visible = ref(true)

type CardProp = Writable<ExtractComponentProps<typeof CardFuturistic>> & {
  title?: string;
  titleClass?: string;
  text?: string;
  textClass?: string;
}

const formTitle = ref("");
const NextDate = ref("");

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
      NextDate.value = data.NextEventDate; // ✅ 延遲設定，避免 Vue 預選 radio
    }, 100);
  } catch (error) {
    console.error("Error loading env.json:", error);
  }
}

const [selected, toggleSelect] = useToggle(false)

</script>

<style scoped lang="sass">
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@100..900&family=Orbitron:wght@400..900&family=Oxanium:wght@200..800&display=swap')

.font-orbitron
  font-family: "Orbitron", sans-serif

.font-oxanium
  font-family: "Oxanium", sans-serif

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

  .hand
    margin-left: 25%


// 大於 600px 寬的設備
@media screen and (min-width: 601px)
  .container
    position: relative
    width: 100%
    z-index: 1
	
body
  font-family: Arial, sans-serif
  background-color: #DBB3B3
  padding: 20px

@keyframes ripple
  0%
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.1), 0 0 0 10px rgba(33, 150, 243, 0.1), 0 0 0 20px rgba(33, 150, 243, 0.1), 0 0 0 30px rgba(33, 150, 243, 0.1)
  100%
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0), 0 0 0 10px rgba(33, 150, 243, 0), 0 0 0 20px rgba(33, 150, 243, 0), 0 0 0 30px rgba(33, 150, 243, 0)

.form-container
  background-color: white
  max-width: 80%
  margin: 0 auto
  padding: 20px
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1)

.content 
    width: 100% /* 或指定其他寬度 */
    padding: 15px
    box-sizing: border-box
    word-wrap: break-word
    overflow-wrap: break-word

</style>

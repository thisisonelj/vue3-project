import './index.scss';

import { createApp, ref } from 'vue';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
const app = createApp({
  setup() {
    const title = ref('这是多页面页面1');
    const content = ref('这是多页面页面1内容;需要你这边自定义打包规则');
    const btnClick = () => {
      btnContent.value = `这是多页面1按钮点击事件`;
    };
    const btnContent = ref();
    return {
      title,
      content,
      btnClick,
      btnContent,
    };
  },
});
app.use(ElementPlus);
app.mount('#app');

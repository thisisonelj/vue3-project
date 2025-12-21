// 设置window全局变量
declare interface Window {
  testFunc: () => void;
  testVariable: string;
}

const func = (str: string) => {
  console.log(`${str}`);
};
const variable = '测试输出window变量';
window.testVariable = variable;
window.testFunc = () => {
  func(window.testVariable);
};
window.testFunc();

/**
 * 数字减法运算，解决浮点数精度问题
 * @param num1 被减数
 * @param num2 减数
 * @returns 减法结果
 */
export function numSub(num1: number, num2: number): number {
  let baseNum1;
  let baseNum2;
  try {
    baseNum1 = num1.toString().split(".")[1].length;
  } catch (e) {
    baseNum1 = 0;
  }
  try {
    baseNum2 = num2.toString().split(".")[1].length;
  } catch (e) {
    baseNum2 = 0;
  }
  const baseNum = Math.pow(10, Math.max(baseNum1, baseNum2));
  const precision = baseNum1 >= baseNum2 ? baseNum1 : baseNum2;
  return Number(((num1 * baseNum - num2 * baseNum) / baseNum).toFixed(precision));
}

/**
 * 生成带日期前缀的随机编号
 * @returns 格式为MMDD+4位随机数的字符串
 */
export function generateNo(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomNum = Math.floor(Math.random() * 10000);
  return month + day + String(randomNum).padStart(4, '0');
}
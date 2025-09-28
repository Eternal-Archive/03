// 背景 Worker 示例：消费 QStash/队列或执行异步上链
// 生产中请接入你的真实逻辑
async function main() {
  // eslint-disable-next-line no-console
  console.log('ea-worker started at', new Date().toISOString());
  // ... 拉取/消费/处理
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// 简单 Cron 任务：用于对账/巡检/聚合等
async function tick() {
  // eslint-disable-next-line no-console
  console.log('cron tick', new Date().toISOString());
}
tick().catch((e) => {
  console.error(e);
  process.exit(1);
});

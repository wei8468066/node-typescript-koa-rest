import { CronJob } from 'cron';
import config from '../config/config';

export default new CronJob(config.cronJobExpression, () => {
  console.log('Executing cron job once every hour');
});

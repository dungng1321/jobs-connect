// use day.js , startdate must be before enddate
import dayjs from 'dayjs';

export const validateDateOrder = (startDate: Date, endDate: Date) => {
  if (!startDate || !endDate) return false;
  if (dayjs(startDate).isAfter(dayjs(endDate))) {
    return false;
  }
  return true;
};

import { createContext, useContext } from 'react';

/* 影时间彩蛋：首页时钟拨到零点后进入，整站转为绿色调 */
export const DarkHourContext = createContext({ active: false, enter: () => {}, enterNow: () => {}, exit: () => {}, spinRef: { current: null } });
export const useDarkHour = () => useContext(DarkHourContext);

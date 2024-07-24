export function getWeekOfMonth(date = new Date()) {
    const dayOfMonth = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    // 获取当前月份第一天
    const startOfMonth = new Date(year, month, 1);
    // 获取当前月份第一天是星期几 (0 - Sunday, 1 - Monday, ... , 6 - Saturday)
    const startDay = startOfMonth.getDay();

    // 计算当前日期是第几周
    // startDay 对7取整，这样可以拿到 startDay 所在周的周一
    const firstWeekResidual = (startDay + 6) % 7;
    // (dayOfMonth + startDay - 1) / 7 取整即可得到当前周数, 外函数 Math.ceil 是为了确保 1 ~ 7号 也在第一周
    const weekNumber = Math.ceil((dayOfMonth + firstWeekResidual) / 7);
    return weekNumber;
}

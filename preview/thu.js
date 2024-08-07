const HT = {};

HT.Date = {
  trimDatetimeSecond(datetime, isDate) {
    if (!datetime) {
      return '--';
    }

    if (
      datetime.indexOf('0000-00-00') === 0 ||
      (!isDate && datetime.indexOf('1970-01-01') === 0)
    ) {
      return '--';
    }

    return datetime
      .split(':')
      .slice(0, 2)
      .join(':');
  },
  trimDateDay(datetime, isDate) {
    if (!datetime) {
      return '--';
    }

    if (
      datetime.indexOf('0000-00-00') === 0 ||
      (!isDate && datetime.indexOf('1970-01-01') === 0)
    ) {
      return '--';
    }
    return datetime.split(' ')[0];
  },
  joinStartatAndEndat(startAt, endAt, isDate) {
    // 此方法把开始时间与结束时间  用 “ - ” 连接
    if (
      !startAt ||
      !endAt ||
      startAt.indexOf('0000-00-00') === 0 ||
      endAt.indexOf('0000-00-00') === 0 ||
      (!isDate && startAt.indexOf('1970-01-01') === 0) ||
      (!isDate && endAt.indexOf('1970-01-01') === 0)
    ) {
      return '--';
    }
    const start = startAt.split(' ').slice(0, 1);
    const end = endAt.split(' ').slice(0, 1);

    if (start.toString() == end.toString()) {
      return `${startAt
        .split(':')
        .slice(0, 2)
        .join(':')} - ${endAt
        .split(' ')
        .slice(1)
        .join(':')
        .split(':')
        .slice(0, 2)
        .join(':')}`;
    }
    return `${start} 至 ${end}`;
  },
  toDateString(date, withTime) {
    if (date && date.getFullYear) {
      const year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      let hh = date.getHours();
      let mm = date.getMinutes();
      let ss = date.getSeconds();
      month = month < 10 ? `0${month}` : month;
      day = day < 10 ? `0${day}` : day;
      hh = hh < 10 ? `0${hh}` : hh;
      mm = mm < 10 ? `0${mm}` : mm;
      ss = ss < 10 ? `0${ss}` : ss;

      let str = `${year}-${month}-${day}`;
      if (withTime) {
        str += ` ${hh}:${mm}:${ss}`;
      }

      return str;
    }

    return date;
  },
  toString(date, format) {
    format = format || 'yyyy-MM-dd';
    if (date && date.getFullYear) {
      const year = date.getFullYear();
      let month = date.getMonth() + 1;
      let day = date.getDate();
      let hh = date.getHours();
      let mm = date.getMinutes();
      let ss = date.getSeconds();
      month = month < 10 ? `0${month}` : month;
      day = day < 10 ? `0${day}` : day;
      hh = hh < 10 ? `0${hh}` : hh;
      mm = mm < 10 ? `0${mm}` : mm;
      ss = ss < 10 ? `0${ss}` : ss;

      // yyyy-MM-dd HH:mm:ss
      let str = format.replace('yyyy', year);
      str = str.replace('MM', month);
      str = str.replace('dd', day);
      str = str.replace('HH', hh);
      str = str.replace('mm', mm);
      str = str.replace('ss', ss);

      return str;
    }

    return date;
  },
  isNullDateTime(datetime) {
    if (
      datetime.indexOf('0000-00-00') === 0 ||
      datetime.indexOf('1970-01-01') === 0
    ) {
      return true;
    }

    return false;
  },
  handleNullDateTime(datetime, isDate) {
    if (
      datetime.indexOf('0000-00-00') === 0 ||
      (!isDate && datetime.indexOf('1970-01-01') === 0)
    ) {
      return '--';
    }

    return datetime;
  },
  // 接收两个时间参数，返回这两个时间相差的小时数
  calculateHoursDifference(startTime, endTime) {
    const startTimeMillis = startTime.getTime();
    const endTimeMillis = endTime.getTime();

    // 计算两个时间的毫秒差，并转换成小时数
    // 1小时 = 3600000毫秒
    const hoursDifference = (endTimeMillis - startTimeMillis) / 3600000;

    return hoursDifference.toFixed(2);
  },
  now() {
    return HT.Date.toString(new Date(), 'yyyy-MM-dd HH:mm:ss');
  },
  today() {
    return HT.Date.toString(new Date());
  },
  getLastMonthDate(date, format) {
    const today = date;
    today.setMonth(today.getMonth() - 1);
    return HT.Date.toString(today, format);
  },
  yesterday() {
    const today = new Date();
    today.setTime(today.getTime() - 24 * 3600 * 1000);
    return HT.Date.toString(today);
  },
  tomorrow() {
    const today = new Date();
    today.setTime(today.getTime() + 24 * 3600 * 1000);
    return HT.Date.toString(today);
  },
  addDay(dateString, day) {
    const date = new Date(dateString);
    date.setTime(date.getTime() + 24 * 3600 * 1000 * day);
    return HT.Date.toString(date);
  },
  startAndEndOfTimeSecond(startAt, endAt, isDate) {
    // 此方法把开始时间与结束时间  用 “ - ” 连接
    if (
      !startAt ||
      !endAt ||
      startAt.indexOf('0000-00-00') === 0 ||
      endAt.indexOf('0000-00-00') === 0 ||
      (!isDate && startAt.indexOf('1970-01-01') === 0) ||
      (!isDate && endAt.indexOf('1970-01-01') === 0)
    ) {
      return '--';
    }
    const start = startAt.split(' ').slice(0, 1);
    const end = endAt.split(' ').slice(0, 1);

    if (start.toString() == end.toString()) {
      return `${startAt
        .split(' ')
        .slice(1)
        .join(':')
        .split(':')
        .slice(0, 2)
        .join(':')}-${endAt
        .split(' ')
        .slice(1)
        .join(':')
        .split(':')
        .slice(0, 2)
        .join(':')}`;
    }
    return `${start}-${end}`;
  },
  durationFormat(time, isZeroNeedUnit = false) {
    time = Number(time);
    if (time == 0) {
      if (isZeroNeedUnit) {
        return '0秒';
      }
      return 0;
    }
    if (time >= 3600 * 24) {
      // 超过天不显示分和秒
      const day = parseInt(time / (3600 * 24));
      const hour = Math.floor((time - day * 3600 * 24) / 3600);
      return hour == 0 ? `${day}天` : `${day}天${hour}小时`;
    }
    if (time >= 3600) {
      // 超过小时不显示秒
      const hour = parseInt(time / 3600);
      const min = Math.floor((time - hour * 3600) / 60);
      return min == 0 ? `${hour}小时` : `${hour}小时${min}分`;
    }
    if (time >= 60 && time < 3600) {
      // 没超过1小时显示分钟和秒
      const min = parseInt(time / 60);
      const sec = Math.floor(time - min * 60);
      return sec == 0 ? `${min}分` : `${min}分${sec}秒`;
    }
    if (time < 60 && time > 0) {
      // 没超过1分钟显示秒
      return `${Math.floor(time)}秒`;
    }
  },
  durationFormat2(time) {
    time = Number(time);
    if (time == 0) {
      return '00:00';
    }
    if (time >= 3600) {
      // 超过小时不显示秒
      let hour = parseInt(time / 3600);
      let min = Math.floor((time - hour * 3600) / 60);
      if (hour < 10) {
        hour = `0${hour}`;
      }

      if (min < 10) {
        min = `0${min}`;
      }

      return min == 0 ? `${hour}:00:00` : `${hour}:${min}:00`;
    }
    if (time >= 60 && time < 3600) {
      // 没超过1小时显示分钟和秒
      let min = parseInt(time / 60);
      let sec = Math.floor(time - min * 60);

      if (min < 10) {
        min = `0${min}`;
      }

      if (sec < 10) {
        sec = `0${sec}`;
      }

      return sec == 0 ? `${min}:00` : `${min}:${sec}`;
    }
    if (time < 60 && time > 0) {
      // 没超过1分钟显示秒
      time = Math.floor(time);
      if (time < 10) {
        time = `0${time}`;
      }

      return `00:${time}`;
    }
  },
  compareDate(startDateStr, endDateStr) {
    const startTime = new Date(startDateStr).getTime();
    const endTime = new Date(endDateStr).getTime();
    return startTime > endTime;
  },

  //  getWeekNumber(new Date('2023-12-31')); // 输出 2023年12月31日的周数
  getWeekNumber(date) {
    const currentDate = new Date(date);
    const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const startDay = startOfYear.getDay();
    const daysPassed = Math.floor(
      (currentDate - startOfYear) / (24 * 60 * 60 * 1000),
    );
    const weekNumber = Math.ceil((daysPassed + startDay + 1) / 7);
    return weekNumber;
  },
};

window.HT = HT;
export default HT;

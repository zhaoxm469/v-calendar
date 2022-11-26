import {
  pad,
  pick,
  isNumber,
  isString,
  isDate,
  isArray,
  arrayHasItems,
  isFunction,
} from '../helpers';
import toFnsDate from 'date-fns-tz/toDate';
import getWeeksInMonth from 'date-fns/getWeeksInMonth';
import getWeek from 'date-fns/getWeek';
import getISOWeek from 'date-fns/getISOWeek';
import addDays from 'date-fns/addDays';
import addWeeks from 'date-fns/addWeeks';
import addMonths from 'date-fns/addMonths';
import addYears from 'date-fns/addYears';
import Locale, { LocaleConfig } from '../locale';

export { addDays, addWeeks, addMonths, addYears };
export { DateRepeat } from './repeat';
export { DateRange } from './range';

type DayNameLength = 'narrow' | 'short' | 'long';
type MonthNameLength = 'short' | 'long';

export type DayInMonth =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16
  | 17
  | 18
  | 18
  | 20
  | 21
  | 22
  | 23
  | 24
  | 25
  | 26
  | 27
  | 28
  | 29
  | 30
  | 31;
export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type WeekInMonth = -6 | -5 | -4 | -3 | -2 | -1 | 1 | 2 | 3 | 4 | 5 | 6;
export type MonthInYear = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type StartOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type DateSource = Date | string | number;
export type TimeNames = Partial<Record<Intl.RelativeTimeFormatUnit, string>>;

interface NumberRuleConfig {
  min?: number;
  max?: number;
  interval?: number;
}

type DatePartsRuleFunction = (part: number, parts: TimeParts) => boolean;

type DatePartsRule =
  | number
  | Array<number>
  | NumberRuleConfig
  | DatePartsRuleFunction;

export interface DatePartsRules {
  hours?: DatePartsRule;
  minutes?: DatePartsRule;
  seconds?: DatePartsRule;
  milliseconds?: DatePartsRule;
}

interface DatePartOption {
  value: number;
  label: string;
  disabled?: boolean;
}

interface DatePartsObject<T> {
  milliseconds: T;
  seconds: T;
  minutes: T;
  hours: T;
}

type DatePartsRange = [number, number, number];
type DatePartsOptions = DatePartsObject<{ value: number; label: string }[]>;

export interface FormatParseOptions {
  locale?: Locale | LocaleConfig | string;
  timezone?: string;
}

export interface DateOptions {
  type: string;
  fillDate: DateSource;
  mask: string;
  patch: DatePatch;
  rules: DatePartsRules;
  timezone: string;
  locale: Locale | LocaleConfig | string;
}

export interface PageAddress {
  day?: number;
  week?: number;
  month: number;
  year: number;
}

export interface TimeParts {
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export interface SimpleDateParts {
  year: number;
  month: number;
  day: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export interface DayParts {
  dayIndex: number;
  day: number;
  dayFromEnd: number;
  weekday: number;
  weekdayOrdinal: number;
  weekdayOrdinalFromEnd: number;
  week: number;
  weekFromEnd: number;
  weeknumber: number;
  month: number;
  year: number;
  date: Date;
}

export interface DateParts extends DayParts {
  milliseconds: number;
  seconds: number;
  minutes: number;
  hours: number;
  time: number;
  day: number;
  dayFromEnd: number;
  weekday: number;
  weekdayOrdinal: number;
  weekdayOrdinalFromEnd: number;
  week: number;
  weekFromEnd: number;
  weeknumber: number;
  month: number;
  year: number;
  date: Date;
  dateTime: number;
  isValid: boolean;
  timezoneOffset: number;
  isPm?: boolean;
}

export interface MonthParts {
  firstDayOfWeek: DayOfWeek;
  firstDayOfMonth: Date;
  inLeapYear: boolean;
  firstWeekday: number;
  numDays: number;
  numWeeks: number;
  month: number;
  year: number;
  weeknumbers: number[];
  isoWeeknumbers: number[];
}

export enum DatePatch {
  DateTime,
  Date,
  Time,
}

const DatePatchKeys: Record<DatePatch, (keyof SimpleDateParts)[]> = {
  [DatePatch.DateTime]: [
    'year',
    'month',
    'day',
    'hours',
    'minutes',
    'seconds',
    'milliseconds',
  ],
  [DatePatch.Date]: ['year', 'month', 'day'],
  [DatePatch.Time]: ['hours', 'minutes', 'seconds', 'milliseconds'],
};

export const daysInWeek = 7;
export const weeksInMonth = 6;
export const MS_PER_SECOND = 1000;
export const MS_PER_MINUTE = MS_PER_SECOND * 60;
export const MS_PER_HOUR = MS_PER_MINUTE * 60;
export const MS_PER_DAY = MS_PER_HOUR * 24;

const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const maskMacros = ['L', 'iso'];
const DATE_PART_RANGES: DatePartsObject<DatePartsRange> = {
  milliseconds: [0, 999, 3],
  seconds: [0, 59, 2],
  minutes: [0, 59, 2],
  hours: [0, 23, 2],
};

// #region Format constants

const token =
  /d{1,2}|W{1,4}|M{1,4}|YY(?:YY)?|S{1,3}|Do|Z{1,4}|([HhMsDm])\1?|[aA]|"[^"]*"|'[^']*'/g;
const literal = /\[([^]*?)\]/gm;
const formatFlags: any = {
  D(d: DateParts) {
    return d.day;
  },
  DD(d: DateParts) {
    return pad(d.day, 2);
  },
  // Do(d: DateParts, l: Locale) {
  //   return l.DoFn(d.day);
  // },
  d(d: DateParts) {
    return d.weekday - 1;
  },
  dd(d: DateParts) {
    return pad(d.weekday - 1, 2);
  },
  W(d: DateParts, l: Locale) {
    return l.dayNamesNarrow[d.weekday - 1];
  },
  WW(d: DateParts, l: Locale) {
    return l.dayNamesShorter[d.weekday - 1];
  },
  WWW(d: DateParts, l: Locale) {
    return l.dayNamesShort[d.weekday - 1];
  },
  WWWW(d: DateParts, l: Locale) {
    return l.dayNames[d.weekday - 1];
  },
  M(d: DateParts) {
    return d.month;
  },
  MM(d: DateParts) {
    return pad(d.month, 2);
  },
  MMM(d: DateParts, l: Locale) {
    return l.monthNamesShort[d.month - 1];
  },
  MMMM(d: DateParts, l: Locale) {
    return l.monthNames[d.month - 1];
  },
  YY(d: DateParts) {
    return String(d.year).substr(2);
  },
  YYYY(d: DateParts) {
    return pad(d.year, 4);
  },
  h(d: DateParts) {
    return d.hours % 12 || 12;
  },
  hh(d: DateParts) {
    return pad(d.hours % 12 || 12, 2);
  },
  H(d: DateParts) {
    return d.hours;
  },
  HH(d: DateParts) {
    return pad(d.hours, 2);
  },
  m(d: DateParts) {
    return d.minutes;
  },
  mm(d: DateParts) {
    return pad(d.minutes, 2);
  },
  s(d: DateParts) {
    return d.seconds;
  },
  ss(d: DateParts) {
    return pad(d.seconds, 2);
  },
  S(d: DateParts) {
    return Math.round(d.milliseconds / 100);
  },
  SS(d: DateParts) {
    return pad(Math.round(d.milliseconds / 10), 2);
  },
  SSS(d: DateParts) {
    return pad(d.milliseconds, 3);
  },
  a(d: DateParts, l: Locale) {
    return d.hours < 12 ? l.amPm[0] : l.amPm[1];
  },
  A(d: DateParts, l: Locale) {
    return d.hours < 12 ? l.amPm[0].toUpperCase() : l.amPm[1].toUpperCase();
  },
  Z() {
    return 'Z';
  },
  ZZ(d: DateParts) {
    const o = d.timezoneOffset;
    return `${o > 0 ? '-' : '+'}${pad(Math.floor(Math.abs(o) / 60), 2)}`;
  },
  ZZZ(d: DateParts) {
    const o = d.timezoneOffset;
    return `${o > 0 ? '-' : '+'}${pad(
      Math.floor(Math.abs(o) / 60) * 100 + (Math.abs(o) % 60),
      4,
    )}`;
  },
  ZZZZ(d: DateParts) {
    const o = d.timezoneOffset;
    return `${o > 0 ? '-' : '+'}${pad(Math.floor(Math.abs(o) / 60), 2)}:${pad(
      Math.abs(o) % 60,
      2,
    )}`;
  },
};

// #endregion Format constants

// #region Parse constants

const twoDigits = /\d\d?/;
const threeDigits = /\d{3}/;
const fourDigits = /\d{4}/;
const word =
  /[0-9]*['a-z\u00A0-\u05FF\u0700-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+|[\u0600-\u06FF/]+(\s*?[\u0600-\u06FF]+){1,2}/i;
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
const monthUpdate = (arrName: string) => (d: DateParts, v: string, l: any) => {
  const index = l[arrName].indexOf(
    v.charAt(0).toUpperCase() + v.substr(1).toLowerCase(),
  );
  if (~index) {
    d.month = index;
  }
};
const parseFlags: any = {
  D: [
    twoDigits,
    (d: DateParts, v: number) => {
      d.day = v;
    },
  ],
  Do: [
    new RegExp(twoDigits.source + word.source),
    (d: DateParts, v: string) => {
      d.day = parseInt(v, 10);
    },
  ],
  d: [twoDigits, noop],
  W: [word, noop],
  M: [
    twoDigits,
    (d: DateParts, v: number) => {
      d.month = v - 1;
    },
  ],
  MMM: [word, monthUpdate('monthNamesShort')],
  MMMM: [word, monthUpdate('monthNames')],
  YY: [
    twoDigits,
    (d: DateParts, v: number) => {
      const da = new Date();
      const cent = +da.getFullYear().toString().substr(0, 2);
      d.year = +`${v > 68 ? cent - 1 : cent}${v}`;
    },
  ],
  YYYY: [
    fourDigits,
    (d: DateParts, v: number) => {
      d.year = v;
    },
  ],
  S: [
    /\d/,
    (d: DateParts, v: number) => {
      d.milliseconds = v * 100;
    },
  ],
  SS: [
    /\d{2}/,
    (d: DateParts, v: number) => {
      d.milliseconds = v * 10;
    },
  ],
  SSS: [
    threeDigits,
    (d: DateParts, v: number) => {
      d.milliseconds = v;
    },
  ],
  h: [
    twoDigits,
    (d: DateParts, v: number) => {
      d.hours = v;
    },
  ],
  m: [
    twoDigits,
    (d: DateParts, v: number) => {
      d.minutes = v;
    },
  ],
  s: [
    twoDigits,
    (d: DateParts, v: number) => {
      d.seconds = v;
    },
  ],
  a: [
    word,
    (d: DateParts, v: string, l: Locale) => {
      const val = v.toLowerCase();
      if (val === l.amPm[0]) {
        d.isPm = false;
      } else if (val === l.amPm[1]) {
        d.isPm = true;
      }
    },
  ],
  Z: [
    /[^\s]*?[+-]\d\d:?\d\d|[^\s]*?Z?/,
    (d: DateParts, v: string) => {
      if (v === 'Z') v = '+00:00';
      const parts = `${v}`.match(/([+-]|\d\d)/gi);
      if (parts) {
        const minutes = +parts[1] * 60 + parseInt(parts[2], 10);
        d.timezoneOffset = parts[0] === '+' ? minutes : -minutes;
      }
    },
  ],
};
parseFlags.DD = parseFlags.D;
parseFlags.dd = parseFlags.d;
parseFlags.WWWW = parseFlags.WWW = parseFlags.WW = parseFlags.W;
parseFlags.MM = parseFlags.M;
parseFlags.mm = parseFlags.m;
parseFlags.hh = parseFlags.H = parseFlags.HH = parseFlags.h;
parseFlags.ss = parseFlags.s;
parseFlags.A = parseFlags.a;
parseFlags.ZZZZ = parseFlags.ZZZ = parseFlags.ZZ = parseFlags.Z;

// #endregion Parse constants

function normalizeMasks(masks: string | string[], locale: Locale): string[] {
  return (
    ((arrayHasItems(masks) && masks) || [
      (isString(masks) && masks) || 'YYYY-MM-DD',
    ]) as string[]
  ).map(m =>
    maskMacros.reduce(
      (prev, curr) => prev.replace(curr, locale.masks[curr] || ''),
      m,
    ),
  );
}

export function isDateParts(date: any) {
  if (!date) return false;
  return date.year && date.month && date.day;
}

export function isDateSource(date: any) {
  if (date == null) return false;
  return isString(date) || isNumber(date) || isDate(date);
}

export function roundDate(dateMs: number, snapMs = 0) {
  if (snapMs > 0) return new Date(Math.round(dateMs / snapMs) * snapMs);
  return new Date(dateMs);
}

export function startOfWeek(date: Date, firstDayOfWeek: DayOfWeek = 1) {
  const day = date.getDay() + 1;
  const daysToAdd =
    day >= firstDayOfWeek
      ? firstDayOfWeek - day
      : -(7 - (firstDayOfWeek - day));
  return addDays(date, daysToAdd);
}

export function datesAreEqual(a: any, b: any): boolean {
  const aIsDate = isDate(a);
  const bIsDate = isDate(b);
  if (!aIsDate && !bIsDate) return true;
  if (aIsDate !== bIsDate) return false;
  return a.getTime() === b.getTime();
}

export function getStartOfWeek(date: Date, firstDayOfWeek: DayOfWeek = 1) {
  const day = date.getDay() + 1;
  const daysToAdd =
    day >= firstDayOfWeek
      ? firstDayOfWeek - day
      : -(7 - (firstDayOfWeek - day));
  return addDays(date, daysToAdd);
}

export function getDayIndex(year: number, month: number, day: number) {
  const utcDate = Date.UTC(year, month - 1, day);
  return diffInDays(new Date(0), new Date(utcDate));
}

export function diffInDays(d1: Date, d2: Date) {
  return Math.round((d2.getTime() - d1.getTime()) / MS_PER_DAY);
}

export function diffInWeeks(d1: Date, d2: Date) {
  return Math.ceil(diffInDays(startOfWeek(d1), startOfWeek(d2)) / 7);
}

export function diffInYears(d1: Date, d2: Date) {
  return d2.getUTCFullYear() - d1.getUTCFullYear();
}

export function diffInMonths(d1: Date, d2: Date) {
  return diffInYears(d1, d2) * 12 + (d2.getMonth() - d1.getMonth());
}

export function getDateFromParts(
  parts: Partial<SimpleDateParts>,
  timezone = '',
) {
  const d = new Date();
  const {
    year = d.getFullYear(),
    month = d.getMonth() + 1,
    day = d.getDate(),
    hours: hrs = 0,
    minutes: min = 0,
    seconds: sec = 0,
    milliseconds: ms = 0,
  } = parts;

  if (timezone) {
    const dateString = `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}T${pad(
      hrs,
      2,
    )}:${pad(min, 2)}:${pad(sec, 2)}.${pad(ms, 3)}`;
    return toFnsDate(dateString, { timeZone: timezone });
  }
  return new Date(year, month - 1, day, hrs, min, sec, ms);
}

export function getTimezoneOffset(
  parts: Partial<SimpleDateParts>,
  timezone = '',
) {
  const {
    year: y = 0,
    month: m = 0,
    day: d = 0,
    hours: hrs = 0,
    minutes: min = 0,
    seconds: sec = 0,
    milliseconds: ms = 0,
  } = parts;
  let date;
  const utcDate = new Date(Date.UTC(y, m - 1, d, hrs, min, sec, ms));
  if (timezone) {
    const dateString = `${pad(y, 4)}-${pad(m, 2)}-${pad(d, 2)}T${pad(
      hrs,
      2,
    )}:${pad(min, 2)}:${pad(sec, 2)}.${pad(ms, 3)}`;
    date = toFnsDate(dateString, { timeZone: timezone });
  } else {
    date = new Date(y, m - 1, d, hrs, min, sec, ms);
  }
  return (date.getTime() - utcDate.getTime()) / 60000;
}

const _monthParts: Record<string, MonthParts> = {};

export function doGetMonthParts(
  month: number,
  year: number,
  firstDayOfWeek: DayOfWeek,
): MonthParts {
  const inLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const firstWeekday = firstDayOfMonth.getDay() + 1;
  const numDays = month === 2 && inLeapYear ? 29 : daysInMonths[month - 1];
  const weekStartsOn: WeekStartsOn = (firstDayOfWeek - 1) as WeekStartsOn;
  const numWeeks = getWeeksInMonth(firstDayOfMonth, {
    weekStartsOn,
  });
  const weeknumbers = [];
  const isoWeeknumbers = [];
  for (let i = 0; i < numWeeks; i++) {
    const date = addDays(firstDayOfMonth, i * 7);
    weeknumbers.push(getWeek(date, { weekStartsOn }));
    isoWeeknumbers.push(getISOWeek(date));
  }
  return {
    firstDayOfWeek,
    firstDayOfMonth,
    inLeapYear,
    firstWeekday,
    numDays,
    numWeeks,
    month,
    year,
    weeknumbers,
    isoWeeknumbers,
  };
}

export function getMonthParts(
  month: number,
  year: number,
  firstDayOfWeek: DayOfWeek,
): MonthParts {
  const key = `${year}-${month}`;
  _monthParts[key] =
    _monthParts[key] || doGetMonthParts(month, year, firstDayOfWeek);
  return _monthParts[key];
}

export function getDateParts(
  date: Date,
  firstDayOfWeek: DayOfWeek,
  timezone = '',
): DateParts {
  let tzDate = new Date(date.getTime());
  if (timezone) {
    tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    tzDate.setMilliseconds(date.getMilliseconds());
  }
  const milliseconds = tzDate.getMilliseconds();
  const seconds = tzDate.getSeconds();
  const minutes = tzDate.getMinutes();
  const hours = tzDate.getHours();
  const time =
    milliseconds +
    seconds * MS_PER_SECOND +
    minutes * MS_PER_MINUTE +
    hours * MS_PER_HOUR;
  const month = <MonthInYear>(tzDate.getMonth() + 1);
  const year = tzDate.getFullYear();
  const monthParts = getMonthParts(month, year, firstDayOfWeek);
  const day = <DayInMonth>tzDate.getDate();
  const dayFromEnd = monthParts.numDays - day + 1;
  const weekday = tzDate.getDay() + 1;
  const weekdayOrdinal = Math.floor((day - 1) / 7 + 1);
  const weekdayOrdinalFromEnd = Math.floor((monthParts.numDays - day) / 7 + 1);
  const week = Math.ceil(
    (day + Math.abs(monthParts.firstWeekday - monthParts.firstDayOfWeek)) / 7,
  );
  const weekFromEnd = monthParts.numWeeks - week + 1;
  const weeknumber = monthParts.weeknumbers[week];
  const dayIndex = getDayIndex(year, month, day);
  const parts: DateParts = {
    milliseconds,
    seconds,
    minutes,
    hours,
    time,
    day,
    dayFromEnd,
    weekday,
    weekdayOrdinal,
    weekdayOrdinalFromEnd,
    week,
    weekFromEnd,
    weeknumber,
    month,
    year,
    date: tzDate,
    dateTime: tzDate.getTime(),
    dayIndex,
    timezoneOffset: 0,
    isValid: true,
  };
  return parts;
}

export function getThisMonthParts(firstDayOfWeek: DayOfWeek) {
  const date = new Date();
  return getMonthParts(
    <MonthInYear>(date.getMonth() + 1),
    date.getFullYear(),
    firstDayOfWeek,
  );
}

export function getPrevMonthParts(
  month: number,
  year: number,
  firstDayOfWeek: DayOfWeek,
) {
  if (month === 1) return getMonthParts(12, year - 1, firstDayOfWeek);
  return getMonthParts(month - 1, year, firstDayOfWeek);
}

export function getNextMonthParts(
  month: number,
  year: number,
  firstDayOfWeek: DayOfWeek,
) {
  if (month === 12) return getMonthParts(1, year + 1, firstDayOfWeek);
  return getMonthParts(month + 1, year, firstDayOfWeek);
}

export function getWeekdayDates() {
  const dates = [];
  const year = 2020;
  const month = 1;
  const day = 5;
  for (let i = 0; i < daysInWeek; i++) {
    dates.push(
      getDateFromParts({
        year,
        month,
        day: day + i,
        hours: 12,
      }),
    );
  }
  return dates;
}

export function getDayNames(
  length: DayNameLength,
  localeId: string | undefined = undefined,
) {
  const dtf = new Intl.DateTimeFormat(localeId, {
    weekday: length,
  });
  return getWeekdayDates().map(d => dtf.format(d));
}

export function getHourDates() {
  const dates = [];
  for (let i = 0; i <= 24; i++) {
    dates.push(new Date(2000, 0, 1, i));
  }
  return dates;
}

export function getRelativeTimeNames(localeId = undefined): TimeNames {
  const units: Intl.RelativeTimeFormatUnit[] = [
    'second',
    'minute',
    'hour',
    'day',
    'week',
    'month',
    'quarter',
    'year',
  ];
  const rtf = new Intl.RelativeTimeFormat(localeId);
  return units.reduce<TimeNames>((names, unit) => {
    const parts = rtf.formatToParts(100, unit);
    // @ts-ignore
    names[unit] = parts[1].unit;
    return names;
  }, {});
}

export function getMonthDates() {
  const dates = [];
  for (let i = 0; i < 12; i++) {
    dates.push(new Date(2000, i, 15));
  }
  return dates;
}

export function getMonthNames(length: MonthNameLength, localeId = undefined) {
  const dtf = new Intl.DateTimeFormat(localeId, {
    month: length,
    timeZone: 'UTC',
  });
  return getMonthDates().map(d => dtf.format(d));
}

export function datePartIsValid(
  part: number,
  rule: DatePartsRule,
  parts: TimeParts,
): boolean {
  if (isNumber(rule)) return rule === part;
  if (isArray(rule)) return (rule as number[]).includes(part);
  if (isFunction(rule)) return rule(part, parts);
  if (rule.min) return rule.min <= part;
  if (rule.max) return rule.max >= part;
  if (rule.interval) return part % rule.interval === 0;
  return false;
}

export function getDatePartOptions(
  parts: TimeParts,
  range: DatePartsRange,
  rule: DatePartsRule | undefined,
) {
  const options: DatePartOption[] = [];
  const [min, max, padding] = range;
  for (let i = min; i <= max; i++) {
    if (rule == null || datePartIsValid(i, rule, parts)) {
      options.push({
        value: i,
        label: pad(i, padding),
      });
    }
  }
  return options;
}

export function getDatePartsOptions(
  parts: TimeParts,
  rules: DatePartsRules,
): DatePartsOptions {
  return {
    milliseconds: getDatePartOptions(
      parts,
      DATE_PART_RANGES.milliseconds,
      rules.milliseconds,
    ),
    seconds: getDatePartOptions(parts, DATE_PART_RANGES.seconds, rules.seconds),
    minutes: getDatePartOptions(parts, DATE_PART_RANGES.minutes, rules.minutes),
    hours: getDatePartOptions(parts, DATE_PART_RANGES.hours, rules.hours),
  };
}

export function getNearestDatePart(
  parts: TimeParts,
  range: DatePartsRange,
  value: number,
  rule: DatePartsRule,
) {
  const options = getDatePartOptions(parts, range, rule);
  const result = options.reduce((prev, opt) => {
    if (opt.disabled) return prev;
    if (isNaN(prev)) return opt.value;
    const diffPrev = Math.abs(prev - value);
    const diffCurr = Math.abs(opt.value - value);
    return diffCurr < diffPrev ? opt.value : prev;
  }, NaN);
  return isNaN(result) ? value : result;
}

export function applyRulesForDateParts(
  dateParts: TimeParts,
  rules: DatePartsRules,
) {
  (
    ['hours', 'minutes', 'seconds', 'milliseconds'] as (keyof TimeParts)[]
  ).forEach(key => {
    if (!Object.prototype.hasOwnProperty.call(rules, key)) return;
    dateParts[key] = getNearestDatePart(
      dateParts,
      DATE_PART_RANGES[key],
      dateParts[key],
      rules[key]!,
    );
  });
}

export function parseDate(
  dateString: string,
  mask: string | string[],
  options: FormatParseOptions = {},
) {
  const { timezone } = options;
  const locale =
    options.locale instanceof Locale
      ? options.locale
      : new Locale(options.locale, timezone);
  const masks = normalizeMasks(mask, locale);
  return (
    masks
      .map(m => {
        if (typeof m !== 'string') {
          throw new Error('Invalid mask');
        }
        // Reset string value
        let str = dateString;
        // Avoid regular expression denial of service, fail early for really long strings
        // https://www.owasp.org/index.php/Regular_expression_Denial_of_Service_-_ReDoS
        if (str.length > 1000) {
          return false;
        }

        let isValid = true;
        const dp: Partial<DateParts> = {};
        m.replace(token, $0 => {
          if (parseFlags[$0]) {
            const info = parseFlags[$0];
            const index = str.search(info[0]);
            if (!~index) {
              isValid = false;
            } else {
              str.replace(info[0], result => {
                info[1](dp, result, locale);
                str = str.substr(index + result.length);
                return result;
              });
            }
          }

          return parseFlags[$0] ? '' : $0.slice(1, $0.length - 1);
        });

        if (!isValid) {
          return false;
        }

        const today = new Date();
        if (dp.hours != null) {
          if (dp.isPm === true && +dp.hours !== 12) {
            dp.hours = +dp.hours + 12;
          } else if (dp.isPm === false && +dp.hours === 12) {
            dp.hours = 0;
          }
        }

        let date;
        if (dp.timezoneOffset != null) {
          dp.minutes = +(dp.minutes || 0) - +dp.timezoneOffset;
          date = new Date(
            Date.UTC(
              dp.year || today.getFullYear(),
              dp.month || 0,
              dp.day || 1,
              dp.hours || 0,
              dp.minutes || 0,
              dp.seconds || 0,
              dp.milliseconds || 0,
            ),
          );
        } else {
          date = getDateFromParts(
            {
              year: dp.year || today.getFullYear(),
              month: (dp.month || 0) + 1,
              day: dp.day || 1,
              hours: dp.hours || 0,
              minutes: dp.minutes || 0,
              seconds: dp.seconds || 0,
              milliseconds: dp.milliseconds || 0,
            },
            timezone,
          );
        }
        return date;
      })
      .find(d => d) || new Date(dateString)
  );
}

export function toDate(
  d: DateSource | Partial<SimpleDateParts>,
  config: Partial<DateOptions> = {},
): Date {
  const nullDate = new Date(NaN);
  let result = nullDate;
  const { fillDate, locale, timezone, mask, patch, rules } = config;
  if (isNumber(d)) {
    config.type = 'number';
    result = new Date(+d);
  } else if (isString(d)) {
    config.type = 'string';
    result = d ? parseDate(d, mask || 'iso', { locale, timezone }) : nullDate;
  } else if (isDate(d)) {
    config.type = 'date';
    result = new Date((d as Date).getTime());
  } else if (isDateParts(d)) {
    config.type = 'object';
    result = getDateFromParts(d as Partial<SimpleDateParts>, timezone);
  }
  // Patch parts or apply rules if needed
  if (result && (patch || rules)) {
    let parts = getDateParts(result, 1, timezone);
    // Patch date parts
    if (patch) {
      const fillParts = getDateParts(
        toDate(fillDate || new Date()),
        1,
        timezone,
      );
      parts = { ...fillParts, ...pick(parts, DatePatchKeys[patch]) };
    }
    // Apply date part rules
    if (rules) {
      applyRulesForDateParts(parts, rules);
    }
    result = getDateFromParts(parts, timezone);
  }
  return result || nullDate;
}

export function formatDate(
  date: DateSource,
  masks: string | string[],
  options: FormatParseOptions = {},
) {
  const { timezone } = options;
  const locale =
    options.locale instanceof Locale
      ? options.locale
      : new Locale(options.locale, timezone);
  date = toDate(date, { locale, timezone })!;
  if (date == null) return '';
  let mask = normalizeMasks(masks, locale)[0];
  const literals: string[] = [];
  // Make literals inactive by replacing them with ??
  mask = mask.replace(literal, ($0, $1: string) => {
    literals.push($1);
    return '??';
  });
  const dateParts = getDateParts(
    date,
    locale.firstDayOfWeek,
    /Z$/.test(mask) ? 'utc' : timezone,
  );
  // Apply formatting rules
  mask = mask.replace(token, $0 =>
    $0 in formatFlags
      ? formatFlags[$0](dateParts, locale)
      : $0.slice(1, $0.length - 1),
  );
  // Inline literal values back into the formatted value
  return mask.replace(/\?\?/g, () => literals.shift()!);
}

export function denormalizeDate(
  date: Date,
  { type, mask, locale, timezone }: Partial<DateOptions> = {},
) {
  switch (type) {
    case 'number':
      return date ? date.getTime() : NaN;
    case 'string':
      return date ? formatDate(date, mask || 'iso', { locale, timezone }) : '';
    case 'object':
      return date ? getDateParts(date, 1, timezone) : null;
    default:
      return date ? new Date(date) : null;
  }
}

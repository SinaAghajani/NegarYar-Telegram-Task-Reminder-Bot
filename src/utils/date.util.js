const { DateTime } = require("luxon");
const jalaali = require("jalaali-js");

const DEFAULT_TIMEZONE = "Asia/Tehran";

function now(timezone = DEFAULT_TIMEZONE) {
  return DateTime.now().setZone(timezone);
}

function parseDateTime(date, time, timezone = DEFAULT_TIMEZONE) {
  const normalizedDate = String(date).trim().replace(/-/g, "/");
  const normalizedTime = String(time).trim();

  const dateMatch = normalizedDate.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);

  const timeMatch = normalizedTime.match(/^(\d{1,2}):(\d{2})$/);

  if (!dateMatch || !timeMatch) {
    throw new Error("INVALID_DATE_TIME");
  }

  const jalaliYear = Number(dateMatch[1]);
  const jalaliMonth = Number(dateMatch[2]);
  const jalaliDay = Number(dateMatch[3]);

  const hour = Number(timeMatch[1]);
  const minute = Number(timeMatch[2]);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error("INVALID_DATE_TIME");
  }

  if (!jalaali.isValidJalaaliDate(jalaliYear, jalaliMonth, jalaliDay)) {
    throw new Error("INVALID_DATE_TIME");
  }

  const {
    gy: gregorianYear,
    gm: gregorianMonth,
    gd: gregorianDay,
  } = jalaali.toGregorian(jalaliYear, jalaliMonth, jalaliDay);

  const result = DateTime.fromObject(
    {
      year: gregorianYear,
      month: gregorianMonth,
      day: gregorianDay,
      hour,
      minute,
      second: 0,
      millisecond: 0,
    },
    {
      zone: timezone,
    },
  );

  if (!result.isValid) {
    throw new Error("INVALID_DATE_TIME");
  }

  return result;
}

function fromMySQL(value, timezone = DEFAULT_TIMEZONE) {
  if (!value) {
    throw new Error("INVALID_MYSQL_DATE");
  }

  if (value.isValid !== undefined && typeof value.toUTC === "function") {
    if (!value.isValid) {
      throw new Error("INVALID_MYSQL_DATE");
    }

    return value.setZone(timezone);
  }

  if (value instanceof Date) {
    const result = DateTime.fromJSDate(value, {
      zone: "utc",
    }).setZone(timezone);

    if (!result.isValid) {
      throw new Error("INVALID_MYSQL_DATE");
    }

    return result;
  }

  const stringValue = String(value).trim();

  const result = DateTime.fromSQL(stringValue, {
    zone: "utc",
  }).setZone(timezone);

  if (!result.isValid) {
    throw new Error("INVALID_MYSQL_DATE");
  }

  return result;
}

function toMySQL(dateTime) {
  if (!dateTime || !dateTime.isValid) {
    throw new Error("INVALID_DATE_TIME");
  }

  return dateTime.toUTC().toFormat("yyyy-MM-dd HH:mm:ss");
}

function isPast(dateTime) {
  return dateTime.toMillis() <= Date.now();
}

function addMinutes(dateTime, minutes) {
  return dateTime.plus({
    minutes,
  });
}

function subtractMinutes(dateTime, minutes) {
  return dateTime.minus({
    minutes,
  });
}

function formatForUser(value, timezone = DEFAULT_TIMEZONE) {
  const dateTime = fromMySQL(value, timezone);

  const { jy, jm, jd } = jalaali.toJalaali(
    dateTime.year,
    dateTime.month,
    dateTime.day,
  );

  return [
    `${String(jy).padStart(4, "0")}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`,
    dateTime.toFormat("HH:mm"),
  ].join(" ");
}

module.exports = {
  now,
  parseDateTime,
  fromMySQL,
  toMySQL,
  isPast,
  addMinutes,
  subtractMinutes,
  formatForUser,
};

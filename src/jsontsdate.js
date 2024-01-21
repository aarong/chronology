import check from "check-types";

/**
 * JSON-TimeSeries date creation and parsing. A singleton.
 * @type {Object}
 */
const jsonTsDate = {};
export default jsonTsDate;

/**
 * Parse a JSON-TimeSeries date string into a Date object.
 * @memberof jsonTsDate
 * @instance
 * @param {string} str
 * @returns {Date}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 * @throws {Error} "SUB_MS_PRECISION: ..."
 */
jsonTsDate.parse = function parse(str) {
  let year;
  let month;
  let day;
  let hour;
  let minute;
  let second;
  let millisecond;
  let zone;
  let separator;

  // Check input type
  if (!check.string(str)) {
    throw new Error("INVALID_ARGUMENT: String required.");
  }

  let remaining = str.toUpperCase();

  // Parse the year
  if (remaining.length < 4) {
    throw new Error("INVALID_ARGUMENT: Invalid year.");
  }
  [year, remaining] = this._splitString(remaining, 4);
  year = parseInt(year, 10);
  if (Number.isNaN(year)) {
    throw new Error("INVALID_ARGUMENT: Invalid year.");
  }

  // Done?
  if (remaining.length === 0) {
    return this._assemble(year, 1, 1, 0, 0, 0, 0);
  }
  zone = this._tryTimeZone(remaining);
  if (zone) {
    return this._assemble(year, 1, 1, 0, 0, 0, 0, zone);
  }

  // Parse the month
  if (remaining.length < 3) {
    throw new Error("INVALID_ARGUMENT: Invalid month.");
  }
  [month, remaining] = this._splitString(remaining, 3);
  [separator, month] = this._splitString(month, 1);
  month = parseInt(month, 10);
  if (separator !== "-" || Number.isNaN(month) || month < 1 || month > 12) {
    throw new Error("INVALID_ARGUMENT: Invalid month.");
  }

  // Done?
  if (remaining.length === 0) {
    return this._assemble(year, month, 1, 0, 0, 0, 0);
  }
  zone = this._tryTimeZone(remaining);
  if (zone) {
    return this._assemble(year, month, 1, 0, 0, 0, 0, zone);
  }

  // Parse the day
  if (remaining.length < 3) {
    throw new Error("INVALID_ARGUMENT: Invalid day.");
  }
  [day, remaining] = this._splitString(remaining, 3);
  [separator, day] = this._splitString(day, 1);
  day = parseInt(day, 10);
  if (separator !== "-" || Number.isNaN(day) || day < 1) {
    throw new Error("INVALID_ARGUMENT: Invalid day.");
  }
  if ([1, 3, 5, 7, 8, 10, 12].includes(month) && day > 31) {
    throw new Error("INVALID_ARGUMENT: Invalid day.");
  }
  if ([4, 6, 9, 11].includes(month) && day > 30) {
    throw new Error("INVALID_ARGUMENT: Invalid day.");
  }
  if (month === 2) {
    if (year % 400 === 0) {
      if (day > 29) {
        throw new Error("INVALID_ARGUMENT: Invalid day.");
      }
    } else if (year % 100 === 0) {
      if (day > 28) {
        throw new Error("INVALID_ARGUMENT: Invalid day.");
      }
    } else if (year % 4 === 0) {
      if (day > 29) {
        throw new Error("INVALID_ARGUMENT: Invalid day.");
      }
    } else if (day > 28) {
      throw new Error("INVALID_ARGUMENT: Invalid day.");
    }
  }

  // Done?
  if (remaining.length === 0) {
    return this._assemble(year, month, day, 0, 0, 0, 0);
  }
  zone = this._tryTimeZone(remaining);
  if (zone) {
    return this._assemble(year, month, day, 0, 0, 0, 0, zone);
  }

  // Parse the hour
  if (remaining.length < 3) {
    throw new Error("INVALID_ARGUMENT: Invalid hour.");
  }
  [hour, remaining] = this._splitString(remaining, 3);
  [separator, hour] = this._splitString(hour, 1);
  hour = parseInt(hour, 10);
  if (
    separator.toUpperCase() !== "T" ||
    Number.isNaN(hour) ||
    hour < 0 ||
    hour > 23
  ) {
    throw new Error("INVALID_ARGUMENT: Invalid hour.");
  }

  // Done?
  if (remaining.length === 0) {
    return this._assemble(year, month, day, hour, 0, 0, 0);
  }
  zone = this._tryTimeZone(remaining);
  if (zone) {
    return this._assemble(year, month, day, hour, 0, 0, 0, zone);
  }

  // Parse the minute
  if (remaining.length < 3) {
    throw new Error("INVALID_ARGUMENT: Invalid minute.");
  }
  [minute, remaining] = this._splitString(remaining, 3);
  [separator, minute] = this._splitString(minute, 1);
  minute = parseInt(minute, 10);
  if (separator !== ":" || Number.isNaN(minute) || minute < 0 || minute > 59) {
    throw new Error("INVALID_ARGUMENT: Invalid minute.");
  }

  // Done?
  if (remaining.length === 0) {
    return this._assemble(year, month, day, hour, minute, 0, 0);
  }
  zone = this._tryTimeZone(remaining);
  if (zone) {
    return this._assemble(year, month, day, hour, minute, 0, 0, zone);
  }

  // Parse the second
  if (remaining.length < 3) {
    throw new Error("INVALID_ARGUMENT: Invalid second.");
  }
  [second, remaining] = this._splitString(remaining, 3);
  [separator, second] = this._splitString(second, 1);
  second = parseInt(second, 10);
  if (separator !== ":" || Number.isNaN(second) || second < 0 || second > 59) {
    throw new Error("INVALID_ARGUMENT: Invalid second.");
  }

  // Done?
  if (remaining.length === 0) {
    return this._assemble(year, month, day, hour, minute, second, 0);
  }
  zone = this._tryTimeZone(remaining);
  if (zone) {
    return this._assemble(year, month, day, hour, minute, second, 0, zone);
  }

  // Parse the millisecond
  if (remaining.length < 4) {
    throw new Error("INVALID_ARGUMENT: Invalid millisecond.");
  }
  [millisecond, remaining] = this._splitString(remaining, 4);
  [separator, millisecond] = this._splitString(millisecond, 1);
  millisecond = parseInt(millisecond, 10);
  if (separator !== "." || Number.isNaN(millisecond) || millisecond < 0) {
    throw new Error("INVALID_ARGUMENT: Invalid millisecond.");
  }

  // Done?
  if (remaining.length === 0) {
    return this._assemble(year, month, day, hour, minute, second, millisecond);
  }

  // Check for sub-ms precision (valid JSON-TimeSeries if multiple of three)
  let subms = "";
  let cur;
  while (
    remaining.length > 0 &&
    !Number.isNaN(parseInt(remaining.substr(0, 1), 10))
  ) {
    [cur, remaining] = this._splitString(remaining, 1);
    subms += cur;
  }
  if (subms.length > 0 && subms.length % 3 === 0) {
    throw new Error(
      "NOT_SUPPORTED: Sub-millisecond precision is not supported.",
    );
  } else if (subms.length > 0) {
    throw new Error("INVALID_ARGUMENT: Invalid sub-millisecond.");
  }

  // Parse the time zone
  zone = this._tryTimeZone(remaining);
  if (zone) {
    return this._assemble(
      year,
      month,
      day,
      hour,
      minute,
      second,
      millisecond,
      zone,
    );
  }
  throw new Error("INVALID_ARGUMENT: Invalid time zone.");
};

/**
 * Create a JSON-TimeSeries date string from a Date object. Excludes more-granular date
 * elements that are one (for month and day elements) or zero (for time elements).
 * Output is always expressed in UTC.
 * @memberof jsonTsDate
 * @instance
 * @param {Date} date
 * @returns {string}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 */
jsonTsDate.create = function create(date) {
  // Validate date
  if (!check.date(date)) {
    throw new Error("INVALID_ARGUMENT: Invalid date.");
  }

  // Get date elements
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1; // 0-indexed
  const d = date.getUTCDate();
  const h = date.getUTCHours();
  const n = date.getUTCMinutes();
  const s = date.getUTCSeconds();
  const ms = date.getUTCMilliseconds();

  // What will be the final element in the representation?
  let finalElement = "ms";
  if (ms === 0) {
    finalElement = "s";
    if (s === 0) {
      finalElement = "n";
      if (n === 0) {
        finalElement = "h";
        if (h === 0) {
          finalElement = "d";
          if (d === 1) {
            finalElement = "m";
            if (m === 1) {
              finalElement = "y";
            }
          }
        }
      }
    }
  }

  // Create the JSON-TimeSeries date
  let str = `${y}`; // Concat year
  if (finalElement !== "y") {
    str += `-${this._zeroPad(m, 2)}`; // Concat month
    if (finalElement !== "m") {
      str += `-${this._zeroPad(d, 2)}`; // Concat day
      if (finalElement !== "d") {
        str += `T${this._zeroPad(h, 2)}`; // Concat hour
        if (finalElement !== "h") {
          str += `:${this._zeroPad(n, 2)}`; // Concat min
          if (finalElement !== "n") {
            str += `:${this._zeroPad(s, 2)}`; // Concat sec
            if (finalElement !== "s") {
              str += `.${this._zeroPad(ms, 3)}`; // Concat ms
            }
          }
        }
      }
    }
  }

  return `${str}Z`;
};

/**
 * Pad an integer with zeros to a specified length.
 * @memberof jsonTsDate
 * @instance
 * @private
 * @param {number} num
 * @param {number} len
 * @returns {string}
 */
jsonTsDate._zeroPad = function _zeroPad(num, len) {
  let ret = `${num}`;
  while (ret.length < len) {
    ret = `0${ret}`;
  }
  return ret;
};

/**
 * Determine whether the specified string is a time zone: Z or +HH:MM or -HH:MM
 *
 * - If no, return false
 * - If yes, return [plusMinus (string), hour (number), minute (number)]
 *
 * @memberof jsonTsDate
 * @instance
 * @private
 * @param {string} str
 * @returns {boolean|Array}
 */
jsonTsDate._tryTimeZone = function _tryTimeZone(str) {
  // UTC special case
  if (str.toUpperCase() === "Z") {
    return ["+", 0, 0];
  }

  // General case
  if (str.length === 6) {
    const plusMinus = str.substr(0, 1);
    const hour = parseInt(str.substr(1, 2), 10); // NaN if bad
    const colon = str.substr(3, 1);
    const minute = parseInt(str.substr(4, 2), 10); // NaN if bad

    if (plusMinus !== "+" && plusMinus !== "-") {
      return false;
    }

    if (Number.isNaN(hour) || hour < 0 || hour > 23) {
      return false;
    }

    if (colon !== ":") {
      return false;
    }

    if (Number.isNaN(minute) || minute < 0 || minute > 59) {
      return false;
    }

    return [plusMinus, hour, minute];
  }

  return false;
};

/**
 * Split a string at the specified point and retun pieces as an array
 * Internal - args are assumed good
 * @memberof jsonTsDate
 * @instance
 * @private
 * @param {string} str
 * @param {number} at Length of the first string
 * @returns {Array}
 */
jsonTsDate._splitString = function _splitString(str, at) {
  return [str.substr(0, at), str.substr(at)];
};

/**
 * Assemble ISO-type date pieces into a Date object.
 * @memberof jsonTsDate
 * @instance
 * @private
 * @param {number} y
 * @param {number} m
 * @param {number} d
 * @param {number} h
 * @param {number} n
 * @param {number} s
 * @param {number} ms
 * @param {Array} z
 * @returns {Date}
 */
jsonTsDate._assemble = function _assemble(y, m, d, h, n, s, ms, z) {
  // Create ISO date without zone
  let iso8601 = `${this._zeroPad(y, 4)}-${this._zeroPad(m, 2)}-${this._zeroPad(
    d,
    2,
  )}T${this._zeroPad(h, 2)}:${this._zeroPad(n, 2)}:${this._zeroPad(
    s,
    2,
  )}.${this._zeroPad(ms, 3)}`;

  // Add the zone only if specified (otherwise leave ambiguous)
  if (z) {
    iso8601 += `${z[0] + this._zeroPad(z[1], 2)}:${this._zeroPad(z[2], 2)}`;
  }

  return new Date(iso8601);
};

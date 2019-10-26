import jsonTsDate from "../jsontsdate";

describe("The jsonTsDate.create() function", () => {
  it("should throw on invalid date", () => {
    expect(() => {
      jsonTsDate.create("junk", "m");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid date."));
  });

  it("should return correctly", () => {
    expect(jsonTsDate.create(new Date("1970-01-01T00:00:00.000Z"))).toBe(
      "1970Z"
    );
    expect(jsonTsDate.create(new Date("1970-02-01T00:00:00.000Z"))).toBe(
      "1970-02Z"
    );
    expect(jsonTsDate.create(new Date("1970-01-02T00:00:00.000Z"))).toBe(
      "1970-01-02Z"
    );
    expect(jsonTsDate.create(new Date("1970-01-01T01:00:00.000Z"))).toBe(
      "1970-01-01T01Z"
    );
    expect(jsonTsDate.create(new Date("1970-01-01T00:01:00.000Z"))).toBe(
      "1970-01-01T00:01Z"
    );
    expect(jsonTsDate.create(new Date("1970-01-01T00:00:01.000Z"))).toBe(
      "1970-01-01T00:00:01Z"
    );
    expect(jsonTsDate.create(new Date("1970-01-01T00:00:00.001Z"))).toBe(
      "1970-01-01T00:00:00.001Z"
    );
    expect(jsonTsDate.create(new Date("1970-02-03T04:05:06.007Z"))).toBe(
      "1970-02-03T04:05:06.007Z"
    );
  });
});

describe("The jsonTsDate.parse() function", () => {
  it("should throw as expected", () => {
    // Bad year
    expect(() => {
      jsonTsDate.parse("");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid year."));
    expect(() => {
      jsonTsDate.parse("ABCD");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid year."));

    // Bad month
    expect(() => {
      jsonTsDate.parse("2000E");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid month."));
    expect(() => {
      jsonTsDate.parse("2000EEE");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid month."));
    expect(() => {
      jsonTsDate.parse("2000*01");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid month."));
    expect(() => {
      jsonTsDate.parse("2000-AA");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid month."));
    expect(() => {
      jsonTsDate.parse("2000-00");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid month."));
    expect(() => {
      jsonTsDate.parse("2000-13");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid month."));

    // Bad day
    expect(() => {
      jsonTsDate.parse("2000-01E");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid day."));
    expect(() => {
      jsonTsDate.parse("2000-01EEE");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid day."));
    expect(() => {
      jsonTsDate.parse("2000-01*01");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid day."));
    expect(() => {
      jsonTsDate.parse("2000-01-AA");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid day."));
    expect(() => {
      jsonTsDate.parse("2000-01-00");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid day."));

    // Bad day - number of days in month
    expect(() => {
      jsonTsDate.parse("2000-01-32");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid day."));
    expect(() => {
      jsonTsDate.parse("2001-02-29");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid day."));
    expect(() => {
      jsonTsDate.parse("2000-03-32");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid day."));
    expect(() => {
      jsonTsDate.parse("2000-04-31");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid day."));
    expect(() => {
      jsonTsDate.parse("2000-05-32");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid day."));
    expect(() => {
      jsonTsDate.parse("2000-06-31");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid day."));
    expect(() => {
      jsonTsDate.parse("2000-07-32");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid day."));
    expect(() => {
      jsonTsDate.parse("2000-08-32");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid day."));
    expect(() => {
      jsonTsDate.parse("2000-09-31");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid day."));
    expect(() => {
      jsonTsDate.parse("2000-10-32");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid day."));
    expect(() => {
      jsonTsDate.parse("2000-11-31");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid day."));
    expect(() => {
      jsonTsDate.parse("2000-12-32");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid day."));

    // Bad day - leap years
    expect(() => {
      jsonTsDate.parse("2001-02-29");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid day."));
    expect(() => {
      jsonTsDate.parse("2004-02-30");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid day."));
    expect(() => {
      jsonTsDate.parse("2100-02-29");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid day."));
    expect(() => {
      jsonTsDate.parse("2000-02-30");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid day."));

    // Bad hour
    expect(() => {
      jsonTsDate.parse("2000-01-01E");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid hour."));
    expect(() => {
      jsonTsDate.parse("2000-01-01EEE");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid hour."));
    expect(() => {
      jsonTsDate.parse("2000-01-01*01");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid hour."));
    expect(() => {
      jsonTsDate.parse("2000-01-01TAA");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid hour."));
    expect(() => {
      jsonTsDate.parse("2000-01-01T-1");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid hour."));
    expect(() => {
      jsonTsDate.parse("2000-01-01T24");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid hour."));

    // Bad minute
    expect(() => {
      jsonTsDate.parse("2000-01-01T00E");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid minute."));
    expect(() => {
      jsonTsDate.parse("2000-01-01T00EEE");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid minute."));
    expect(() => {
      jsonTsDate.parse("2000-01-01T00*01");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid minute."));
    expect(() => {
      jsonTsDate.parse("2000-01-01T00:AA");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid minute."));
    expect(() => {
      jsonTsDate.parse("2000-01-01T00:-1");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid minute."));
    expect(() => {
      jsonTsDate.parse("2000-01-01T00:60");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid minute."));

    // Bad second
    expect(() => {
      jsonTsDate.parse("2000-01-01T00:00E");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid second."));
    expect(() => {
      jsonTsDate.parse("2000-01-01T00:00EEE");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid second."));
    expect(() => {
      jsonTsDate.parse("2000-01-01T00:00*01");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid second."));
    expect(() => {
      jsonTsDate.parse("2000-01-01T00:00:AA");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid second."));
    expect(() => {
      jsonTsDate.parse("2000-01-01T00:00:-1");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid second."));
    expect(() => {
      jsonTsDate.parse("2000-01-01T00:00:60");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid second."));

    // Bad millisecond
    expect(() => {
      jsonTsDate.parse("2000-01-01T00:00:00E");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid millisecond."));
    expect(() => {
      jsonTsDate.parse("2000-01-01T00:00:00EEEE");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid millisecond."));
    expect(() => {
      jsonTsDate.parse("2000-01-01T00:00:00*001");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid millisecond."));
    expect(() => {
      jsonTsDate.parse("2000-01-01T00:00:00.AAA");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid millisecond."));
    expect(() => {
      jsonTsDate.parse("2000-01-01T00:00:00.-11");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid millisecond."));

    // Bad sub-millisecond
    expect(() => {
      jsonTsDate.parse("2000-01-01T00:00:00.0000");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid sub-millisecond."));
    expect(() => {
      jsonTsDate.parse("2000-01-01T00:00:00.00000");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid sub-millisecond."));
    expect(() => {
      jsonTsDate.parse("2000-01-01T00:00:00.0000000");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid sub-millisecond."));
    expect(() => {
      jsonTsDate.parse("2000-01-01T00:00:00.00000000");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid sub-millisecond."));

    // Excess precision
    expect(() => {
      jsonTsDate.parse("2000-01-01T00:00:00.000000");
    }).toThrow(
      new Error("NOT_SUPPORTED: Sub-millisecond precision is not supported.")
    );
    expect(() => {
      jsonTsDate.parse("2000-01-01T00:00:00.000000000");
    }).toThrow(
      new Error("NOT_SUPPORTED: Sub-millisecond precision is not supported.")
    );

    // Invalid time zone
    expect(() => {
      jsonTsDate.parse("2000-01-01T00:00:00.000A");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid time zone."));
  });

  it("should succeed as expected", () => {
    // Specified to year
    expect(jsonTsDate.parse("1999")).toEqual(new Date("1999-01-01T00:00:00.0"));
    expect(jsonTsDate.parse("1999Z")).toEqual(
      new Date("1999-01-01T00:00:00.0Z")
    );
    expect(jsonTsDate.parse("1999+12:00")).toEqual(
      new Date("1999-01-01T00:00:00.0+12:00")
    );
    expect(jsonTsDate.parse("1999-12:00")).toEqual(
      new Date("1999-01-01T00:00:00.0-12:00")
    );

    // Specified to month
    expect(jsonTsDate.parse("1999-01")).toEqual(
      new Date("1999-01-01T00:00:00.0")
    );
    expect(jsonTsDate.parse("1999-01Z")).toEqual(
      new Date("1999-01-01T00:00:00.0Z")
    );
    expect(jsonTsDate.parse("1999-01+12:00")).toEqual(
      new Date("1999-01-01T00:00:00.0+12:00")
    );
    expect(jsonTsDate.parse("1999-01-12:00")).toEqual(
      new Date("1999-01-01T00:00:00.0-12:00")
    );

    // Specified to day
    expect(jsonTsDate.parse("1999-01-01")).toEqual(
      new Date("1999-01-01T00:00:00.0")
    );
    expect(jsonTsDate.parse("1999-01-01Z")).toEqual(
      new Date("1999-01-01T00:00:00.0Z")
    );
    expect(jsonTsDate.parse("1999-01-01+12:00")).toEqual(
      new Date("1999-01-01T00:00:00.0+12:00")
    );
    expect(jsonTsDate.parse("1999-01-01-12:00")).toEqual(
      new Date("1999-01-01T00:00:00.0-12:00")
    );

    // Specified to day - number of days in month
    expect(jsonTsDate.parse("1999-01-31")).toEqual(
      new Date("1999-01-31T00:00:00.0")
    );
    expect(jsonTsDate.parse("1999-02-28")).toEqual(
      new Date("1999-02-28T00:00:00.0")
    );
    expect(jsonTsDate.parse("1999-03-31")).toEqual(
      new Date("1999-03-31T00:00:00.0")
    );
    expect(jsonTsDate.parse("1999-04-30")).toEqual(
      new Date("1999-04-30T00:00:00.0")
    );
    expect(jsonTsDate.parse("1999-05-31")).toEqual(
      new Date("1999-05-31T00:00:00.0")
    );
    expect(jsonTsDate.parse("1999-06-30")).toEqual(
      new Date("1999-06-30T00:00:00.0")
    );
    expect(jsonTsDate.parse("1999-07-31")).toEqual(
      new Date("1999-07-31T00:00:00.0")
    );
    expect(jsonTsDate.parse("1999-08-31")).toEqual(
      new Date("1999-08-31T00:00:00.0")
    );
    expect(jsonTsDate.parse("1999-09-30")).toEqual(
      new Date("1999-09-30T00:00:00.0")
    );
    expect(jsonTsDate.parse("1999-10-31")).toEqual(
      new Date("1999-10-31T00:00:00.0")
    );
    expect(jsonTsDate.parse("1999-11-30")).toEqual(
      new Date("1999-11-30T00:00:00.0")
    );
    expect(jsonTsDate.parse("1999-12-31")).toEqual(
      new Date("1999-12-31T00:00:00.0")
    );

    // Specified to the day - leap years
    expect(jsonTsDate.parse("1999-02-28")).toEqual(
      new Date("1999-02-28T00:00:00.0")
    );
    expect(jsonTsDate.parse("2004-02-29")).toEqual(
      new Date("2004-02-29T00:00:00.0")
    );
    expect(jsonTsDate.parse("2100-02-28")).toEqual(
      new Date("2100-02-28T00:00:00.0")
    );
    expect(jsonTsDate.parse("2000-02-29")).toEqual(
      new Date("2000-02-29T00:00:00.0")
    );

    // Specified to hour
    expect(jsonTsDate.parse("1999-01-01T00")).toEqual(
      new Date("1999-01-01T00:00:00.0")
    );
    expect(jsonTsDate.parse("1999-01-01T00Z")).toEqual(
      new Date("1999-01-01T00:00:00.0Z")
    );
    expect(jsonTsDate.parse("1999-01-01T00+12:00")).toEqual(
      new Date("1999-01-01T00:00:00.0+12:00")
    );
    expect(jsonTsDate.parse("1999-01-01T00-12:00")).toEqual(
      new Date("1999-01-01T00:00:00.0-12:00")
    );

    // Specified to minute
    expect(jsonTsDate.parse("1999-01-01T00:00")).toEqual(
      new Date("1999-01-01T00:00:00.0")
    );
    expect(jsonTsDate.parse("1999-01-01T00:00Z")).toEqual(
      new Date("1999-01-01T00:00:00.0Z")
    );
    expect(jsonTsDate.parse("1999-01-01T00:00+12:00")).toEqual(
      new Date("1999-01-01T00:00:00.0+12:00")
    );
    expect(jsonTsDate.parse("1999-01-01T00:00-12:00")).toEqual(
      new Date("1999-01-01T00:00:00.0-12:00")
    );

    // Specified to second
    expect(jsonTsDate.parse("1999-01-01T00:00:00")).toEqual(
      new Date("1999-01-01T00:00:00.0")
    );
    expect(jsonTsDate.parse("1999-01-01T00:00:00Z")).toEqual(
      new Date("1999-01-01T00:00:00.0Z")
    );
    expect(jsonTsDate.parse("1999-01-01T00:00:00+12:00")).toEqual(
      new Date("1999-01-01T00:00:00.0+12:00")
    );
    expect(jsonTsDate.parse("1999-01-01T00:00:00-12:00")).toEqual(
      new Date("1999-01-01T00:00:00.0-12:00")
    );

    // Specified to millisecond
    expect(jsonTsDate.parse("1999-01-01T00:00:00.000")).toEqual(
      new Date("1999-01-01T00:00:00.0")
    );
    expect(jsonTsDate.parse("1999-01-01T00:00:00.000Z")).toEqual(
      new Date("1999-01-01T00:00:00.0Z")
    );
    expect(jsonTsDate.parse("1999-01-01T00:00:00.000+12:00")).toEqual(
      new Date("1999-01-01T00:00:00.0+12:00")
    );
    expect(jsonTsDate.parse("1999-01-01T00:00:00.000-12:00")).toEqual(
      new Date("1999-01-01T00:00:00.0-12:00")
    );

    // Random date parts
    expect(jsonTsDate.parse("1234-12-23T12:34:56.789")).toEqual(
      new Date("1234-12-23T12:34:56.789")
    );
    expect(jsonTsDate.parse("1234-12-23T12:34:56.789Z")).toEqual(
      new Date("1234-12-23T12:34:56.789Z")
    );
    expect(jsonTsDate.parse("1234-12-23T12:34:56.789+12:34")).toEqual(
      new Date("1234-12-23T12:34:56.789+12:34")
    );
    expect(jsonTsDate.parse("1234-12-23T12:34:56.789-23:45")).toEqual(
      new Date("1234-12-23T12:34:56.789-23:45")
    );
  });
});

describe("The jsonTsDate._tryTimeZone() function", () => {
  it("should return correctly", () => {
    // Not a zone
    expect(jsonTsDate._tryTimeZone("")).toBe(false);
    expect(jsonTsDate._tryTimeZone("A")).toBe(false);
    expect(jsonTsDate._tryTimeZone("AAAAAA")).toBe(false);
    expect(jsonTsDate._tryTimeZone("AAAAAAA")).toBe(false);
    expect(jsonTsDate._tryTimeZone("%00:00")).toBe(false);
    expect(jsonTsDate._tryTimeZone("+AA:00")).toBe(false);
    expect(jsonTsDate._tryTimeZone("+-1:00")).toBe(false);
    expect(jsonTsDate._tryTimeZone("+24:00")).toBe(false);
    expect(jsonTsDate._tryTimeZone("+00-00")).toBe(false);
    expect(jsonTsDate._tryTimeZone("+00:-1")).toBe(false);
    expect(jsonTsDate._tryTimeZone("+00:60")).toBe(false);

    // Zone
    expect(jsonTsDate._tryTimeZone("Z")).toEqual(["+", 0, 0]);
    expect(jsonTsDate._tryTimeZone("+00:00")).toEqual(["+", 0, 0]);
    expect(jsonTsDate._tryTimeZone("+23:59")).toEqual(["+", 23, 59]);
    expect(jsonTsDate._tryTimeZone("-00:00")).toEqual(["-", 0, 0]);
    expect(jsonTsDate._tryTimeZone("-23:59")).toEqual(["-", 23, 59]);
  });
});

describe("The jsonTsDate._splitString() function", () => {
  it("should return correctly", () => {
    expect(jsonTsDate._splitString("", 1)).toEqual(["", ""]);
    expect(jsonTsDate._splitString("a", 1)).toEqual(["a", ""]);
    expect(jsonTsDate._splitString("aa", 1)).toEqual(["a", "a"]);
    expect(jsonTsDate._splitString("aaa", 1)).toEqual(["a", "aa"]);
    expect(jsonTsDate._splitString("aaa", 2)).toEqual(["aa", "a"]);
    expect(jsonTsDate._splitString("aaa", 3)).toEqual(["aaa", ""]);
    expect(jsonTsDate._splitString("aaa", 4)).toEqual(["aaa", ""]);
  });
});

describe("The jsonTsDate._zeroPad() function", () => {
  it("should return correctly", () => {
    expect(jsonTsDate._zeroPad(1, 1)).toBe("1");
    expect(jsonTsDate._zeroPad(1, 2)).toBe("01");
    expect(jsonTsDate._zeroPad(1, 3)).toBe("001");
    expect(jsonTsDate._zeroPad(11, 1)).toBe("11");
    expect(jsonTsDate._zeroPad(11, 2)).toBe("11");
    expect(jsonTsDate._zeroPad(11, 3)).toBe("011");
    expect(jsonTsDate._zeroPad("1", 1)).toBe("1");
    expect(jsonTsDate._zeroPad("1", 2)).toBe("01");
    expect(jsonTsDate._zeroPad("1", 3)).toBe("001");
    expect(jsonTsDate._zeroPad("11", 1)).toBe("11");
    expect(jsonTsDate._zeroPad("11", 2)).toBe("11");
    expect(jsonTsDate._zeroPad("11", 3)).toBe("011");
  });
});

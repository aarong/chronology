import tsjs from "../main";

// IrregularSeries objects

describe("The irregular factory function", () => {
  it("should always return an object", () => {
    expect(tsjs.irregular()).toEqual({
      _obs: []
    });
  });
});

// Private functions

describe("The irregular._find() function", () => {
  it("should return correctly if there are no observations", () => {
    const its = tsjs.irregular();
    expect(its._find(new Date(0))).toEqual({
      before: null,
      at: null,
      after: null
    });
  });

  it("should return correctly if there is one observation", () => {
    const its = tsjs.irregular();
    its.add(new Date(1), "val", new Date(100));
    expect(its._find(new Date(0))).toEqual({
      before: null,
      at: null,
      after: 0
    });
    expect(its._find(new Date(1))).toEqual({
      before: null,
      at: 0,
      after: null
    });
    expect(its._find(new Date(99))).toEqual({
      before: null,
      at: 0,
      after: null
    });
    expect(its._find(new Date(100))).toEqual({
      before: 0,
      at: null,
      after: null
    });
  });

  it("should return correctly if there are two contiguous observations", () => {
    const its = tsjs.irregular();
    its.add(new Date(1), "val", new Date(100));
    its.add(new Date(100), "val", new Date(200));
    expect(its._find(new Date(0))).toEqual({
      before: null,
      at: null,
      after: 0
    });
    expect(its._find(new Date(1))).toEqual({ before: null, at: 0, after: 1 });
    expect(its._find(new Date(99))).toEqual({ before: null, at: 0, after: 1 });
    expect(its._find(new Date(100))).toEqual({ before: 0, at: 1, after: null });
    expect(its._find(new Date(199))).toEqual({ before: 0, at: 1, after: null });
    expect(its._find(new Date(200))).toEqual({
      before: 1,
      at: null,
      after: null
    });
  });

  it("should return correctly if there are two non-contiguous observations", () => {
    const its = tsjs.irregular();
    its.add(new Date(1), "val", new Date(100));
    its.add(new Date(201), "val", new Date(300));
    expect(its._find(new Date(0))).toEqual({
      before: null,
      at: null,
      after: 0
    });
    expect(its._find(new Date(1))).toEqual({ before: null, at: 0, after: 1 });
    expect(its._find(new Date(99))).toEqual({ before: null, at: 0, after: 1 });
    expect(its._find(new Date(100))).toEqual({ before: 0, at: null, after: 1 });
    expect(its._find(new Date(200))).toEqual({ before: 0, at: null, after: 1 });
    expect(its._find(new Date(201))).toEqual({ before: 0, at: 1, after: null });
    expect(its._find(new Date(299))).toEqual({ before: 0, at: 1, after: null });
    expect(its._find(new Date(300))).toEqual({
      before: 1,
      at: null,
      after: null
    });
  });

  it("should return correctly if there are three contiguous observations", () => {
    const its = tsjs.irregular();
    its.add(new Date(1), "val", new Date(100));
    its.add(new Date(100), "val", new Date(200));
    its.add(new Date(200), "val", new Date(300));
    expect(its._find(new Date(0))).toEqual({
      before: null,
      at: null,
      after: 0
    });
    expect(its._find(new Date(1))).toEqual({ before: null, at: 0, after: 1 });
    expect(its._find(new Date(99))).toEqual({ before: null, at: 0, after: 1 });
    expect(its._find(new Date(100))).toEqual({ before: 0, at: 1, after: 2 });
    expect(its._find(new Date(199))).toEqual({ before: 0, at: 1, after: 2 });
    expect(its._find(new Date(200))).toEqual({ before: 1, at: 2, after: null });
    expect(its._find(new Date(299))).toEqual({ before: 1, at: 2, after: null });
    expect(its._find(new Date(300))).toEqual({
      before: 2,
      at: null,
      after: null
    });
  });

  it("should return correctly if there are three non-contiguous observations", () => {
    const its = tsjs.irregular();
    its.add(new Date(1), "val", new Date(100));
    its.add(new Date(201), "val", new Date(300));
    its.add(new Date(401), "val", new Date(500));
    expect(its._find(new Date(0))).toEqual({
      before: null,
      at: null,
      after: 0
    });
    expect(its._find(new Date(1))).toEqual({ before: null, at: 0, after: 1 });
    expect(its._find(new Date(99))).toEqual({ before: null, at: 0, after: 1 });
    expect(its._find(new Date(100))).toEqual({ before: 0, at: null, after: 1 });
    expect(its._find(new Date(200))).toEqual({ before: 0, at: null, after: 1 });
    expect(its._find(new Date(201))).toEqual({ before: 0, at: 1, after: 2 });
    expect(its._find(new Date(299))).toEqual({ before: 0, at: 1, after: 2 });
    expect(its._find(new Date(300))).toEqual({ before: 1, at: null, after: 2 });
    expect(its._find(new Date(400))).toEqual({ before: 1, at: null, after: 2 });
    expect(its._find(new Date(401))).toEqual({ before: 1, at: 2, after: null });
    expect(its._find(new Date(499))).toEqual({ before: 1, at: 2, after: null });
    expect(its._find(new Date(500))).toEqual({
      before: 2,
      at: null,
      after: null
    });
  });

  it("should return correctly for a large number of observations", () => {
    const its = tsjs.irregular();
    const len = 100;
    for (let i = 0; i < 100 * len; i += 100) {
      its.add(new Date(i), "val", new Date(i + len));
    }
    expect(its._find(new Date(5000))).toEqual({
      before: 49,
      at: 50,
      after: 51
    });
  });
});

// Public functions

describe("The irregular.period() function", () => {
  it("should throw on invalid date", () => {
    const its = tsjs.irregular();
    expect(() => {
      its.period("junk");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid date."));
  });

  it("should return a valid object on success", () => {
    const its = tsjs.irregular();
    const ip = its.period(new Date(0));
    expect(ip).toBeInstanceOf(Object);
    expect(ip._series).toBe(its);
    expect(ip._date).toEqual(new Date(0));
    expect(ip.obs).toBeInstanceOf(Object);
  });
});

describe("The irregular.add() function", () => {
  let its;
  beforeEach(() => {
    its = tsjs.irregular();
  });

  it("should throw if start date is invalid", () => {
    expect(() => {
      its.add("junk", 1, new Date());
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid start date."));
  });

  it("should throw if end date is invalid", () => {
    expect(() => {
      its.add(new Date(), 1, 123);
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid end date."));
  });

  it("should throw if end date is before start date", () => {
    expect(() => {
      its.add(new Date(1), 1, new Date(0));
    }).toThrow(
      new Error(
        "INVALID_ARGUMENT: End date must by strictly later than the start date."
      )
    );
  });

  it("should throw if end date equals the start date", () => {
    expect(() => {
      its.add(new Date(0), 1, new Date(0));
    }).toThrow(
      new Error(
        "INVALID_ARGUMENT: End date must by strictly later than the start date."
      )
    );
  });

  it("should throw if there is an overlap (left)", () => {
    its.add(new Date(100), "val", new Date(200));
    expect(() => {
      its.add(new Date(0), "val", new Date(101));
    }).toThrow(
      new Error(
        "COLLISION: New observation would overlap an existing observation."
      )
    );
  });

  it("should throw if there is an overlap (right)", () => {
    its.add(new Date(100), "val", new Date(200));
    expect(() => {
      its.add(new Date(199), "val", new Date(300));
    }).toThrow(
      new Error(
        "COLLISION: New observation would overlap an existing observation."
      )
    );
  });

  it("should throw if there is an overlap (outer)", () => {
    its.add(new Date(100), "val", new Date(200));
    expect(() => {
      its.add(new Date(0), "val", new Date(300));
    }).toThrow(
      new Error(
        "COLLISION: New observation would overlap an existing observation."
      )
    );
  });

  it("should throw if there is an overlap (inner)", () => {
    its.add(new Date(100), "val", new Date(200));
    expect(() => {
      its.add(new Date(125), "val", new Date(175));
    }).toThrow(
      new Error(
        "COLLISION: New observation would overlap an existing observation."
      )
    );
  });

  it("should return the series object if the call was valid", () => {
    expect(its.add(new Date(100), "val", new Date(200))).toBe(its);
  });

  it("should update its._obs appropriately if the call was valid", () => {
    its.add(new Date(100), "val", new Date(200));
    const expected = [
      { start: new Date(100), value: "val", end: new Date(200) }
    ];
    expect(its._obs).toEqual(expected);

    its.add(new Date(0), "val", new Date(100));
    expected.unshift({ start: new Date(0), value: "val", end: new Date(100) });
    expect(its._obs).toEqual(expected);

    its.add(new Date(300), "val", new Date(400));
    expected.push({ start: new Date(300), value: "val", end: new Date(400) });
    expect(its._obs).toEqual(expected);

    its.add(new Date(200), "val", new Date(300));
    expected[3] = expected[2]; // eslint-disable-line prefer-destructuring
    expected[2] = { start: new Date(200), value: "val", end: new Date(300) };
    expect(its._obs).toEqual(expected);
  });

  it("should be able to add undefined values", () => {
    its.add(new Date(100), undefined, new Date(200));
    const ip = its.period(new Date(150));
    expect(ip.obs.value()).toEqual(undefined);
  });
});

describe("The irregular.set() function", () => {
  it("should succeed as expected", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "A", new Date(10));
    its.add(new Date(20), "B", new Date(30));
    its.add(new Date(40), "C", new Date(50));
    its.set(new Date(5), "D", new Date(45));
    expect(its._obs).toEqual([
      {
        start: new Date(0),
        value: "A",
        end: new Date(5)
      },
      {
        start: new Date(5),
        value: "D",
        end: new Date(45)
      },
      {
        start: new Date(45),
        value: "C",
        end: new Date(50)
      }
    ]);
  });
});

describe("The irregular.clear() function", () => {
  it("should throw on invalid start date", () => {
    const its = tsjs.irregular();
    expect(() => {
      its.clear("junk", new Date(0));
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid date."));
  });

  it("should throw on invalid end date", () => {
    const its = tsjs.irregular();
    expect(() => {
      its.clear(new Date(0), "junk");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid date."));
  });

  it("should throw on equal start == end date", () => {
    const its = tsjs.irregular();
    expect(() => {
      its.clear(new Date(0), new Date(0));
    }).toThrow(
      new Error(
        "INVALID_ARGUMENT: Start date must be strictly before end date."
      )
    );
  });

  it("should throw on equal start > end date", () => {
    const its = tsjs.irregular();
    expect(() => {
      its.clear(new Date(1), new Date(0));
    }).toThrow(
      new Error(
        "INVALID_ARGUMENT: Start date must be strictly before end date."
      )
    );
  });

  it("should handle empty series appropriately", () => {
    const its = tsjs.irregular();
    its.clear(new Date(0), new Date(10));
    expect(its._obs).toEqual([]);
  });

  it("should handle non-deletion appropriately", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "123", new Date(10));
    its.clear(new Date(50), new Date(100));
    expect(its._obs).toEqual([
      {
        start: new Date(0),
        value: "123",
        end: new Date(10)
      }
    ]);
  });

  it("should handle full single observation deletions appropriately - exact boundaries", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "123", new Date(10));
    its.clear(new Date(0), new Date(10));
    expect(its._obs).toEqual([]);
  });

  it("should handle full single observation deletion appropriately - generous boundaries", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "123", new Date(10));
    its.clear(new Date(-5), new Date(15));
    expect(its._obs).toEqual([]);
  });

  it("should handle left-truncate deletion appropriately - exact boundary", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "123", new Date(10));
    its.clear(new Date(0), new Date(5));
    expect(its._obs).toEqual([
      {
        start: new Date(5),
        value: "123",
        end: new Date(10)
      }
    ]);
  });

  it("should handle left-truncate deletion appropriately - generous boundary", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "123", new Date(10));
    its.clear(new Date(-5), new Date(5));
    expect(its._obs).toEqual([
      {
        start: new Date(5),
        value: "123",
        end: new Date(10)
      }
    ]);
  });

  it("should handle right-truncate deletion appropriately - exact boundary", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "123", new Date(10));
    its.clear(new Date(5), new Date(10));
    expect(its._obs).toEqual([
      {
        start: new Date(0),
        value: "123",
        end: new Date(5)
      }
    ]);
  });

  it("should handle right-truncate deletion appropriately - generous boundary", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "123", new Date(10));
    its.clear(new Date(5), new Date(15));
    expect(its._obs).toEqual([
      {
        start: new Date(0),
        value: "123",
        end: new Date(5)
      }
    ]);
  });

  it("should handle inner-truncate deletion appropriately", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "123", new Date(10));
    its.clear(new Date(2), new Date(8));
    expect(its._obs).toEqual([
      {
        start: new Date(0),
        value: "123",
        end: new Date(2)
      },
      {
        start: new Date(8),
        value: "123",
        end: new Date(10)
      }
    ]);
  });

  it("should handle multi-observation deletion with truncation appropriately", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "1", new Date(10));
    its.add(new Date(20), "2", new Date(30));
    its.add(new Date(40), "3", new Date(50));
    its.clear(new Date(5), new Date(45));
    expect(its._obs).toEqual([
      {
        start: new Date(0),
        value: "1",
        end: new Date(5)
      },
      {
        start: new Date(45),
        value: "3",
        end: new Date(50)
      }
    ]);
  });
});

describe("The irregular.split() function", () => {
  it("should throw on invalid date", () => {
    const its = tsjs.irregular();
    expect(() => {
      its.split("junk");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid date."));
  });

  it("should throw if there is no observation at the date", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(10));
    expect(() => {
      its.split(new Date(10));
    }).toThrow(
      new Error("MISSING: There is no observation at the specified date.")
    );
  });

  it("should change nothing if date referenced start of observation", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(10));
    its.split(new Date(0));
    expect(its._obs).toEqual([
      {
        start: new Date(0),
        value: 123,
        end: new Date(10)
      }
    ]);
  });

  it("should split as appropriate if date was mid-observation", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(10));
    its.split(new Date(5));
    expect(its._obs).toEqual([
      {
        start: new Date(0),
        value: 123,
        end: new Date(5)
      },
      {
        start: new Date(5),
        value: 123,
        end: new Date(10)
      }
    ]);
  });
});

describe("The irregular.count() function", () => {
  let its;
  beforeEach(() => {
    its = tsjs.irregular();
  });

  it("should return the correct count", () => {
    expect(its.count()).toBe(0);
    its.add(new Date(0), "val", new Date(1));
    expect(its.count()).toBe(1);
    its.add(new Date(1), "val", new Date(2));
    expect(its.count()).toBe(2);
  });
});

describe("The irregular.first() function", () => {
  let its;
  beforeEach(() => {
    its = tsjs.irregular();
  });

  it("should throw if the series is empty", () => {
    expect(() => {
      its.first();
    }).toThrow(new Error("MISSING: The series has no observations."));
  });

  it("should return the first observation if series is not empty", () => {
    its.add(new Date(1), "val2", new Date(2));
    its.add(new Date(0), "val1", new Date(1));
    const ip = its.first();
    expect(ip).toBeInstanceOf(Object);
    expect(ip._series).toBe(its);
    expect(ip._date).toEqual(new Date(0));
  });
});

describe("The irregular.last() function", () => {
  let its;
  beforeEach(() => {
    its = tsjs.irregular();
  });

  it("should throw if the series is empty", () => {
    expect(() => {
      its.last();
    }).toThrow(new Error("MISSING: The series has no observations."));
  });

  it("should return the final observation if series is not empty", () => {
    its.add(new Date(1), "val2", new Date(2));
    its.add(new Date(0), "val1", new Date(1));
    const ip = its.last();
    expect(ip).toBeInstanceOf(Object);
    expect(ip._series).toBe(its);
    expect(ip._date).toEqual(new Date(1));
  });
});

describe("The irregular.each() function", () => {
  it("should throw if the argument is not a function", () => {
    const its = tsjs.irregular();
    expect(() => {
      its.each("junk");
    }).toThrow(new Error("INVALID_ARGUMENT: Must supply a function."));
  });

  it("should cascade application errors", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val1", new Date(99));
    expect(() => {
      its.each(() => {
        throw new Error("SOME_ERROR");
      });
    }).toThrow(new Error("SOME_ERROR"));
  });

  it("should not call the outside function when there are no obs", () => {
    const its = tsjs.irregular();
    const spy = jest.fn();
    its.each(spy);
    expect(spy.mock.calls.length).toBe(0);
  });

  it("should call the outside function when there are obs", () => {
    const its = tsjs.irregular();
    its.add(new Date(100), "val2", new Date(199));
    its.add(new Date(0), "val1", new Date(99));
    const spy = jest.fn();
    its.each(spy);
    expect(spy.mock.calls.length).toBe(2);

    expect(spy.mock.calls[0].length).toBe(1);
    expect(spy.mock.calls[0][0]).toBeInstanceOf(Object);
    expect(spy.mock.calls[0][0]._series).toBe(its);
    expect(spy.mock.calls[0][0]._date).toEqual(new Date(0));

    expect(spy.mock.calls[1].length).toBe(1);
    expect(spy.mock.calls[1][0]).toBeInstanceOf(Object);
    expect(spy.mock.calls[1][0]._series).toBe(its);
    expect(spy.mock.calls[1][0]._date).toEqual(new Date(100));
  });

  it("should iterate over later observations added during iteration", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(100));
    let callCount = 0;
    its.each(() => {
      if (callCount === 0) {
        its.add(new Date(200), 456, new Date(300));
      }
      callCount += 1;
    });
    expect(callCount).toBe(2);
  });

  it("should not iterate over earlier observations added during iteration", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(100));
    let callCount = 0;
    its.each(() => {
      if (callCount === 0) {
        its.add(new Date(-200), 456, new Date(-100));
      }
      callCount += 1;
    });
    expect(callCount).toBe(1);
  });

  it("should return a reference to the time series", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val1", new Date(99));
    expect(its.each(() => {})).toBe(its);
  });
});

describe("The irregular.eachPeriod() function", () => {
  it("should throw if the argument is not a function", () => {
    const its = tsjs.irregular();
    expect(() => {
      its.eachPeriod("junk");
    }).toThrow(new Error("INVALID_ARGUMENT: Must supply a function."));
  });

  it("should cascade application errors", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val1", new Date(99));
    expect(() => {
      its.eachPeriod(() => {
        throw new Error("SOME_ERROR");
      });
    }).toThrow(new Error("SOME_ERROR"));
  });

  it("should not call the outside function when there are no obs", () => {
    const its = tsjs.irregular();
    const spy = jest.fn();
    its.eachPeriod(spy);
    expect(spy.mock.calls.length).toBe(0);
  });

  it("should call the outside function N times if there are N contiguous obs", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val1", new Date(100));
    its.add(new Date(100), "val2", new Date(200));
    its.add(new Date(200), "val3", new Date(300));
    const spy = jest.fn();
    its.eachPeriod(spy);
    expect(spy.mock.calls.length).toBe(3);

    expect(spy.mock.calls[0].length).toBe(1);
    expect(spy.mock.calls[0][0]).toBeInstanceOf(Object);
    expect(spy.mock.calls[0][0]._series).toBe(its);
    expect(spy.mock.calls[0][0]._date).toEqual(new Date(0));

    expect(spy.mock.calls[1].length).toBe(1);
    expect(spy.mock.calls[1][0]).toBeInstanceOf(Object);
    expect(spy.mock.calls[1][0]._series).toBe(its);
    expect(spy.mock.calls[1][0]._date).toEqual(new Date(100));

    expect(spy.mock.calls[2].length).toBe(1);
    expect(spy.mock.calls[2][0]).toBeInstanceOf(Object);
    expect(spy.mock.calls[2][0]._series).toBe(its);
    expect(spy.mock.calls[2][0]._date).toEqual(new Date(200));
  });

  it("should call the outside function 2N-1 times if there are N non-contiguous obs", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val1", new Date(100));
    its.add(new Date(150), "val2", new Date(200));
    its.add(new Date(250), "val3", new Date(300));
    const spy = jest.fn();
    its.eachPeriod(spy);
    expect(spy.mock.calls.length).toBe(5);

    expect(spy.mock.calls[0].length).toBe(1);
    expect(spy.mock.calls[0][0]).toBeInstanceOf(Object);
    expect(spy.mock.calls[0][0]._series).toBe(its);
    expect(spy.mock.calls[0][0]._date).toEqual(new Date(0));

    expect(spy.mock.calls[1].length).toBe(1);
    expect(spy.mock.calls[1][0]).toBeInstanceOf(Object);
    expect(spy.mock.calls[1][0]._series).toBe(its);
    expect(spy.mock.calls[1][0]._date).toEqual(new Date(100));

    expect(spy.mock.calls[2].length).toBe(1);
    expect(spy.mock.calls[2][0]).toBeInstanceOf(Object);
    expect(spy.mock.calls[2][0]._series).toBe(its);
    expect(spy.mock.calls[2][0]._date).toEqual(new Date(150));

    expect(spy.mock.calls[3].length).toBe(1);
    expect(spy.mock.calls[3][0]).toBeInstanceOf(Object);
    expect(spy.mock.calls[3][0]._series).toBe(its);
    expect(spy.mock.calls[3][0]._date).toEqual(new Date(200));

    expect(spy.mock.calls[4].length).toBe(1);
    expect(spy.mock.calls[4][0]).toBeInstanceOf(Object);
    expect(spy.mock.calls[4][0]._series).toBe(its);
    expect(spy.mock.calls[4][0]._date).toEqual(new Date(250));
  });

  it("should iterate over later observations added during iteration", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(100));
    let callCount = 0;
    its.eachPeriod(() => {
      if (callCount === 0) {
        its.add(new Date(200), 456, new Date(300));
      }
      callCount += 1;
    });
    expect(callCount).toBe(3); // Including gap
  });

  it("should not iterate over earlier observations added during iteration", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(100));
    let callCount = 0;
    its.eachPeriod(() => {
      if (callCount === 0) {
        its.add(new Date(-200), 456, new Date(-100));
      }
      callCount += 1;
    });
    expect(callCount).toBe(1);
  });

  it("should return a reference to the time series", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val1", new Date(99));
    expect(its.eachPeriod(() => {})).toBe(its);
  });
});

describe("The irregular.map() function", () => {
  it("should throw on invalid function argument", () => {
    const its = tsjs.irregular();
    expect(() => {
      its.map("junk");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid function."));
  });

  it("should cascade errors thrown by the argument function", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(1));
    expect(() => {
      its.map(() => {
        throw new Error("APP_ERROR");
      });
    }).toThrow(new Error("APP_ERROR"));
  });

  it("should return an empty series there are no observations", () => {
    const its = tsjs.irregular();
    const newSeries = its.map(val => val);
    expect(newSeries._obs.length).toBe(0);
  });

  it("should return a transformed series if there are observations", () => {
    const its = tsjs.irregular();
    for (let i = 0; i < 10; i += 1) {
      its.add(new Date(i), i, new Date(i + 1));
    }

    const newSeries = its.map(val => val * 2);

    let newPeriod = newSeries.first();
    for (let i = 0; i < 10; i += 1) {
      expect(newPeriod.start()).toEqual(new Date(i));
      expect(newPeriod.obs.value()).toBe(2 * i);
      expect(newPeriod.end()).toEqual(new Date(i + 1));
      if (i < 9) {
        newPeriod = newPeriod.obs.forward();
      }
    }
  });
});

describe("The irregular.reduce() function", () => {
  it("should throw on invalid function argument", () => {
    const its = tsjs.irregular();
    expect(() => {
      its.reduce("junk", 1);
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid function."));
  });

  it("should throw on missing initial value argument", () => {
    const its = tsjs.irregular();
    expect(() => {
      its.reduce((p, a) => a);
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid initialAccumulator."));
  });

  it("should cascade errors thrown by the argument function", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(1));
    expect(() => {
      its.reduce(() => {
        throw new Error("APP_ERROR");
      }, 1);
    }).toThrow(new Error("APP_ERROR"));
  });

  it("should return the initial value if there are no observations", () => {
    const its = tsjs.irregular();
    const result = its.reduce(() => 0, "abc");
    expect(result).toBe("abc");
  });

  it("should return a result if there are observations", () => {
    const its = tsjs.irregular();
    for (let i = 0; i < 10; i += 1) {
      its.add(new Date(i), i, new Date(i + 1));
    }

    // Sum
    const result = its.reduce((accum, period) => accum + period.obs.value(), 0);

    expect(result).toBe(45);
  });
});

describe("The irregular.filter() function", () => {
  it("should throw on invalid function argument", () => {
    const its = tsjs.irregular();
    expect(() => {
      its.filter("junk");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid function."));
  });

  it("should cascade errors thrown by the argument function", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(1));
    expect(() => {
      its.filter(() => {
        throw new Error("APP_ERROR");
      });
    }).toThrow(new Error("APP_ERROR"));
  });

  it("should return an empty series there are no observations", () => {
    const its = tsjs.irregular();
    const newSeries = its.filter(() => true);
    expect(newSeries._obs.length).toBe(0);
  });

  it("should return a filtered series if there are observations", () => {
    const its = tsjs.irregular();
    for (let i = 0; i < 10; i += 1) {
      its.add(new Date(i), i, new Date(i + 1));
    }

    const newSeries = its.filter(period => period.obs.value() < 5);

    let period = newSeries.first();
    for (let i = 0; i < 5; i += 1) {
      expect(period.start()).toEqual(new Date(i));
      expect(period.obs.value()).toBe(i);
      expect(period.end()).toEqual(new Date(i + 1));
      if (i < 4) {
        period = period.forward();
      }
    }
    expect(period.obs.hasForward()).toBe(false);
  });
});

describe("The irregular.subSeries() function", () => {
  it("should throw on invalid start type", () => {
    const its = tsjs.irregular();
    expect(() => {
      its.subSeries(null, new Date(0));
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid start or end date."));
  });

  it("should throw on invalid end type", () => {
    const its = tsjs.irregular();
    expect(() => {
      its.subSeries(new Date(0), "junk");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid start or end date."));
  });

  it("should throw if start is equal to end", () => {
    const its = tsjs.irregular();
    expect(() => {
      its.subSeries(new Date(0), new Date(0));
    }).toThrow(
      new Error("INVALID_ARGUMENT: End date must be strictly after start date.")
    );
  });

  it("should throw if start is after end", () => {
    const its = tsjs.irregular();
    expect(() => {
      its.subSeries(new Date(1), new Date(0));
    }).toThrow(
      new Error("INVALID_ARGUMENT: End date must be strictly after start date.")
    );
  });

  it("should return a correct sub series with no observationss - none overall", () => {
    const its = tsjs.irregular();
    const subSeries = its.subSeries(new Date(0), new Date(10));
    expect(subSeries.count()).toBe(0);
  });

  it("should return a correct sub series with no observation - left of all", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(10));
    const subSeries = its.subSeries(new Date(-10), new Date(-5));
    expect(subSeries.count()).toBe(0);
  });

  it("should return a correct sub series with no observation - right of all", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(10));
    const subSeries = its.subSeries(new Date(15), new Date(20));
    expect(subSeries.count()).toBe(0);
  });

  it("should return a correct sub series with one observation - left span", () => {
    const its = tsjs.irregular();
    its.add(new Date(-100), 0, new Date(-90));
    its.add(new Date(0), 123, new Date(10));
    its.add(new Date(90), 0, new Date(100));
    const subSeries = its.subSeries(new Date(-5), new Date(5));
    expect(subSeries.count()).toBe(1);
    const ip = subSeries.period(new Date(2));
    expect(ip.start()).toEqual(new Date(0));
    expect(ip.end()).toEqual(new Date(5));
    expect(ip.obs.value()).toBe(123);
  });

  it("should return a correct sub series with one observation - right span", () => {
    const its = tsjs.irregular();
    its.add(new Date(-100), 0, new Date(-90));
    its.add(new Date(0), 123, new Date(10));
    its.add(new Date(90), 0, new Date(100));
    const subSeries = its.subSeries(new Date(5), new Date(15));
    expect(subSeries.count()).toBe(1);
    const ip = subSeries.period(new Date(7));
    expect(ip.start()).toEqual(new Date(5));
    expect(ip.end()).toEqual(new Date(10));
    expect(ip.obs.value()).toBe(123);
  });

  it("should return a correct sub series with one observation - outer span", () => {
    const its = tsjs.irregular();
    its.add(new Date(-100), 0, new Date(-90));
    its.add(new Date(0), 123, new Date(10));
    its.add(new Date(90), 0, new Date(100));
    const subSeries = its.subSeries(new Date(-5), new Date(15));
    expect(subSeries.count()).toBe(1);
    const ip = subSeries.period(new Date(5));
    expect(ip.start()).toEqual(new Date(0));
    expect(ip.end()).toEqual(new Date(10));
    expect(ip.obs.value()).toBe(123);
  });

  it("should return a correct sub series with one observation - inner span", () => {
    const its = tsjs.irregular();
    its.add(new Date(-100), 0, new Date(-90));
    its.add(new Date(0), 123, new Date(10));
    its.add(new Date(90), 0, new Date(100));
    const subSeries = its.subSeries(new Date(2), new Date(8));
    expect(subSeries.count()).toBe(1);
    const ip = subSeries.period(new Date(5));
    expect(ip.start()).toEqual(new Date(2));
    expect(ip.end()).toEqual(new Date(8));
    expect(ip.obs.value()).toBe(123);
  });

  it("should return a correct sub series with two observations - inner span", () => {
    const its = tsjs.irregular();
    its.add(new Date(-100), 0, new Date(-90));
    its.add(new Date(0), 123, new Date(10));
    its.add(new Date(20), 456, new Date(30));
    its.add(new Date(90), 0, new Date(100));
    const subSeries = its.subSeries(new Date(5), new Date(25));
    expect(subSeries.count()).toBe(2);
    let ip = subSeries.period(new Date(5));
    expect(ip.start()).toEqual(new Date(5));
    expect(ip.end()).toEqual(new Date(10));
    expect(ip.obs.value()).toBe(123);
    ip = subSeries.period(new Date(20));
    expect(ip.start()).toEqual(new Date(20));
    expect(ip.end()).toEqual(new Date(25));
    expect(ip.obs.value()).toBe(456);
  });

  it("should return a correct sub series with two observations - outer span", () => {
    const its = tsjs.irregular();
    its.add(new Date(-100), 0, new Date(-90));
    its.add(new Date(0), 123, new Date(10));
    its.add(new Date(20), 456, new Date(30));
    its.add(new Date(90), 0, new Date(100));
    const subSeries = its.subSeries(new Date(-5), new Date(35));
    expect(subSeries.count()).toBe(2);
    let ip = subSeries.period(new Date(5));
    expect(ip.start()).toEqual(new Date(0));
    expect(ip.end()).toEqual(new Date(10));
    expect(ip.obs.value()).toBe(123);
    ip = subSeries.period(new Date(20));
    expect(ip.start()).toEqual(new Date(20));
    expect(ip.end()).toEqual(new Date(30));
    expect(ip.obs.value()).toBe(456);
  });

  it("should return a correct sub series with three observations - inner span", () => {
    const its = tsjs.irregular();
    its.add(new Date(-100), 0, new Date(-90));
    its.add(new Date(0), 123, new Date(10));
    its.add(new Date(20), 456, new Date(30));
    its.add(new Date(30), 789, new Date(40));
    its.add(new Date(90), 0, new Date(100));
    const subSeries = its.subSeries(new Date(5), new Date(35));
    expect(subSeries.count()).toBe(3);
    let ip = subSeries.period(new Date(5));
    expect(ip.start()).toEqual(new Date(5));
    expect(ip.end()).toEqual(new Date(10));
    expect(ip.obs.value()).toBe(123);
    ip = subSeries.period(new Date(20));
    expect(ip.start()).toEqual(new Date(20));
    expect(ip.end()).toEqual(new Date(30));
    expect(ip.obs.value()).toBe(456);
    ip = subSeries.period(new Date(30));
    expect(ip.start()).toEqual(new Date(30));
    expect(ip.end()).toEqual(new Date(35));
    expect(ip.obs.value()).toBe(789);
  });

  it("should return a correct sub series with three observations - outer span", () => {
    const its = tsjs.irregular();
    its.add(new Date(-100), 0, new Date(-90));
    its.add(new Date(0), 123, new Date(10));
    its.add(new Date(20), 456, new Date(30));
    its.add(new Date(30), 789, new Date(40));
    its.add(new Date(90), 0, new Date(100));
    const subSeries = its.subSeries(new Date(-5), new Date(45));
    expect(subSeries.count()).toBe(3);
    let ip = subSeries.period(new Date(0));
    expect(ip.start()).toEqual(new Date(0));
    expect(ip.end()).toEqual(new Date(10));
    expect(ip.obs.value()).toBe(123);
    ip = subSeries.period(new Date(20));
    expect(ip.start()).toEqual(new Date(20));
    expect(ip.end()).toEqual(new Date(30));
    expect(ip.obs.value()).toBe(456);
    ip = subSeries.period(new Date(30));
    expect(ip.start()).toEqual(new Date(30));
    expect(ip.end()).toEqual(new Date(40));
    expect(ip.obs.value()).toBe(789);
  });
});

describe("The irregular.overlay() function", () => {
  it("should throw if argument is not an object", () => {
    const its = tsjs.irregular();
    expect(() => {
      its.overlay(null);
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid series."));
  });

  it("should throw if object is not not an IrregularSeries", () => {
    const its = tsjs.irregular();
    expect(() => {
      its.overlay({});
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid series."));
  });

  it("should overlay onto a blank series appropriately", () => {
    const its1 = tsjs.irregular();
    const its2 = tsjs.irregular();
    its2.add(new Date(0), 123, new Date(10));
    const its3 = its1.overlay(its2);
    expect(its3._obs).toEqual([
      {
        start: new Date(0),
        value: 123,
        end: new Date(10)
      }
    ]);
  });

  it("should overlay a blank series appropriately", () => {
    const its1 = tsjs.irregular();
    its1.add(new Date(0), 123, new Date(10));
    const its2 = tsjs.irregular();
    const its3 = its1.overlay(its2);
    expect(its3._obs).toEqual([
      {
        start: new Date(0),
        value: 123,
        end: new Date(10)
      }
    ]);
  });

  it("should perform a more complex overlay appropriately", () => {
    const its1 = tsjs.irregular();
    its1.add(new Date(0), 1, new Date(10));
    its1.add(new Date(20), 2, new Date(30));
    its1.add(new Date(40), 3, new Date(50));
    const its2 = tsjs.irregular();
    its2.add(new Date(10), "A", new Date(20));
    its2.add(new Date(25), "B", new Date(55));
    its2.add(new Date(60), "C", new Date(70));
    const its3 = its1.overlay(its2);
    expect(its3._obs).toEqual([
      {
        start: new Date(0),
        value: 1,
        end: new Date(10)
      },
      {
        start: new Date(10),
        value: "A",
        end: new Date(20)
      },
      {
        start: new Date(20),
        value: 2,
        end: new Date(25)
      },
      {
        start: new Date(25),
        value: "B",
        end: new Date(55)
      },
      {
        start: new Date(60),
        value: "C",
        end: new Date(70)
      }
    ]);
  });
});

describe("The irregular.clone() function", () => {
  it("should work with no observations", () => {
    const its = tsjs.irregular();
    const clone = its.clone();
    expect(clone._obs).toEqual([]);
  });

  it("should work with observations", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(10));
    its.add(new Date(20), 456, new Date(30));
    const clone = its.clone();
    expect(clone._obs).toEqual([
      {
        start: new Date(0),
        value: 123,
        end: new Date(10)
      },
      {
        start: new Date(20),
        value: 456,
        end: new Date(30)
      }
    ]);
  });
});

describe("The irregular.serialize() function", () => {
  it("should throw on undefined value", () => {
    const its = tsjs.irregular();

    const a = {};
    a.b = a;

    its.add(new Date(0), undefined, new Date(10));

    expect(() => {
      its.serialize();
    }).toThrow(
      new Error(
        "NOT_SERIALIZABLE: Time series contains one or more undefined values, which are not expressible using JSON."
      )
    );
  });

  it("should throw on circular reference", () => {
    const its = tsjs.irregular();

    const a = {};
    a.b = a;

    its.add(new Date(0), a, new Date(10));

    expect(() => {
      its.serialize();
    }).toThrow(
      new Error(
        "NOT_SERIALIZABLE: JSON.stringify() failed to serialize one or more observation values, likely due to a circular reference."
      )
    );
  });

  it("should succeed with no observations", () => {
    const its = tsjs.irregular();
    expect(JSON.parse(its.serialize())).toEqual({
      JsonTs: "irregular",
      Observations: []
    });
  });

  it("should serialize compactly", () => {
    const its = tsjs.irregular();

    its.add(new Date(0), 123, new Date(10));
    its.add(new Date(10), 456, new Date(20));
    its.add(new Date(30), 789, new Date(40));
    its.add(new Date(40), { an: "object" }, new Date(50));
    its.add(new Date(50), "a string", new Date(60));
    its.add(new Date(60), ["an array"], new Date(70));
    its.add(new Date(80), false, new Date(90));
    its.add(new Date(90), null, new Date(100));

    expect(JSON.parse(its.serialize())).toEqual({
      JsonTs: "irregular",
      Observations: [
        ["1970Z", 123],
        ["1970-01-01T00:00:00.010Z", 456, "1970-01-01T00:00:00.020Z"],
        ["1970-01-01T00:00:00.030Z", 789],
        ["1970-01-01T00:00:00.040Z", { an: "object" }],
        ["1970-01-01T00:00:00.050Z", "a string"],
        ["1970-01-01T00:00:00.060Z", ["an array"], "1970-01-01T00:00:00.070Z"],
        ["1970-01-01T00:00:00.080Z", false],
        ["1970-01-01T00:00:00.090Z", null, "1970-01-01T00:00:00.100Z"]
      ]
    });
  });
});

describe("The irregular.reset() function", () => {
  it("should clear all observations and return its", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(1));
    expect(its.reset()).toBe(its);
    expect(its._obs).toEqual([]);
  });
});

describe("The irregular.type() function", () => {
  it("should return correctly", () => {
    const its = tsjs.irregular();
    expect(its.type()).toBe("irregular");
  });
});

// IrregularPeriod objects

describe("The irregularPeriod.series() function", () => {
  it("should return the series", () => {
    const its = tsjs.irregular();
    const ip = its.period(new Date(0));
    expect(ip.series()).toBe(its);
  });
});

describe("The irregularPeriod.date() function", () => {
  it("should return the reference date", () => {
    const its = tsjs.irregular();
    const ip = its.period(new Date(0));
    expect(ip.date()).toEqual(new Date(0));
  });
});

describe("The irregularPeriod.start() function", () => {
  it("should return null if no observations", () => {
    const its = tsjs.irregular();
    const ip = its.period(new Date(0));
    expect(ip.start()).toBe(null);
  });

  it("should return start of obs if reference date points to obs", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip1 = its.period(new Date(0));
    expect(ip1.start()).toEqual(new Date(0));
    const ip2 = its.period(new Date(9));
    expect(ip2.start()).toEqual(new Date(0));
  });

  it("should return end of previous obs if reference date points to gap", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip1 = its.period(new Date(10));
    expect(ip1.start()).toEqual(new Date(10));
    const ip2 = its.period(new Date(100));
    expect(ip2.start()).toEqual(new Date(10));
  });

  it("should return null if before first obs", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip1 = its.period(new Date(-1));
    expect(ip1.start()).toBe(null);
  });
});

describe("The irregularPeriod.end() function", () => {
  it("should return null if no observations", () => {
    const its = tsjs.irregular();
    const ip = its.period(new Date(0));
    expect(ip.end()).toBe(null);
  });

  it("should return end of obs if reference date points to obs", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip1 = its.period(new Date(0));
    expect(ip1.end()).toEqual(new Date(10));
    const ip2 = its.period(new Date(9));
    expect(ip2.end()).toEqual(new Date(10));
  });

  it("should return start of next obs if reference date points to gap", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip1 = its.period(new Date(-1));
    expect(ip1.end()).toEqual(new Date(0));
    const ip2 = its.period(new Date(-100));
    expect(ip2.end()).toEqual(new Date(0));
  });

  it("should return null if after last obs", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip1 = its.period(new Date(10));
    expect(ip1.end()).toBe(null);
  });
});

describe("The irregularPeriod.hasForward() function", () => {
  it("should return false if no observations", () => {
    const its = tsjs.irregular();
    const ip = its.period(new Date(0));
    expect(ip.hasForward()).toBe(false);
  });

  it("should return false if after final observation", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(10));
    expect(ip.hasForward()).toBe(false);
  });

  it("should return false if within final observation", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(0));
    expect(ip.hasForward()).toBe(false);
  });

  it("should return true if before final observation", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(-1));
    expect(ip.hasForward()).toBe(true);
  });

  it("should return true if in a gap", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    its.add(new Date(20), "val", new Date(30));
    const ip = its.period(new Date(15));
    expect(ip.hasForward()).toBe(true);
  });
});

describe("The irregularPeriod.forward() function", () => {
  it("should throw if no observations", () => {
    const its = tsjs.irregular();
    const ip = its.period(new Date(0));
    expect(() => {
      ip.forward();
    }).toThrow(new Error("MISSING: There are no later periods."));
  });

  it("should throw if after final observation", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(10));
    expect(() => {
      ip.forward();
    }).toThrow(new Error("MISSING: There are no later periods."));
  });

  it("should throw if within final observation", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(0));
    expect(() => {
      ip.forward();
    }).toThrow(new Error("MISSING: There are no later periods."));
  });

  it("should return appropriately if before first observation", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(-1));
    const ip2 = ip.forward();
    expect(ip2).toBeInstanceOf(Object);
    expect(ip2._series).toBe(its);
    expect(ip2._date).toEqual(new Date(0));
  });

  it("should return appropriately if on observation before final", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    its.add(new Date(10), "val", new Date(20));
    const ip = its.period(new Date(0));
    const ip2 = ip.forward();
    expect(ip2).toBeInstanceOf(Object);
    expect(ip2._series).toBe(its);
    expect(ip2._date).toEqual(new Date(10));
  });

  it("should return appropriately if in a gap", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    its.add(new Date(20), "val", new Date(30));
    const ip = its.period(new Date(15));
    const ip2 = ip.forward();
    expect(ip2).toBeInstanceOf(Object);
    expect(ip2._series).toBe(its);
    expect(ip2._date).toEqual(new Date(20));
  });

  it("should cycle through a series as expected", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val1", new Date(10));
    its.add(new Date(20), "val2", new Date(30));
    its.add(new Date(30), "val3", new Date(40));
    let ip = its.first();
    expect(ip.start()).toEqual(new Date(0));
    expect(ip.obs.value()).toBe("val1");
    expect(ip.end()).toEqual(new Date(10));
    ip = ip.forward();
    expect(ip.start()).toEqual(new Date(10));
    expect(ip.obs.exists()).toBe(false);
    expect(ip.end()).toEqual(new Date(20));
    ip = ip.forward();
    expect(ip.start()).toEqual(new Date(20));
    expect(ip.obs.value()).toBe("val2");
    expect(ip.end()).toEqual(new Date(30));
    ip = ip.forward();
    expect(ip.start()).toEqual(new Date(30));
    expect(ip.obs.value()).toBe("val3");
    expect(ip.end()).toEqual(new Date(40));
  });
});

describe("The irregularPeriod.hasBack() function", () => {
  it("should return false if no observations", () => {
    const its = tsjs.irregular();
    const ip = its.period(new Date(0));
    expect(ip.hasBack()).toBe(false);
  });

  it("should return false if before first observation", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(-1));
    expect(ip.hasBack()).toBe(false);
  });

  it("should return false if within first observation", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(0));
    expect(ip.hasBack()).toBe(false);
  });

  it("should return true if after first observation", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(100));
    expect(ip.hasBack()).toBe(true);
  });

  it("should return true if in a gap", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    its.add(new Date(20), "val", new Date(30));
    const ip = its.period(new Date(15));
    expect(ip.hasBack()).toBe(true);
  });
});

describe("The irregularPeriod.back() function", () => {
  it("should throw if no observations", () => {
    const its = tsjs.irregular();
    const ip = its.period(new Date(0));
    expect(() => {
      ip.back();
    }).toThrow(new Error("MISSING: There are no earlier periods."));
  });

  it("should throw if before first observation", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(-1));
    expect(() => {
      ip.back();
    }).toThrow(new Error("MISSING: There are no earlier periods."));
  });

  it("should throw if within first observation", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(0));
    expect(() => {
      ip.back();
    }).toThrow(new Error("MISSING: There are no earlier periods."));
  });

  it("should return appropriately if past last observation", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(10));
    const ip2 = ip.back();
    expect(ip2).toBeInstanceOf(Object);
    expect(ip2._series).toBe(its);
    expect(ip2._date).toEqual(new Date(0));
  });

  it("should return appropriately if on a non-first observation with gap before", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    its.add(new Date(20), "val", new Date(30));
    const ip = its.period(new Date(20));
    const ip2 = ip.back();
    expect(ip2).toBeInstanceOf(Object);
    expect(ip2._series).toBe(its);
    expect(ip2._date).toEqual(new Date(10));
  });

  it("should return appropriately if on a non-first observation with obs before", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    its.add(new Date(10), "val", new Date(20));
    const ip = its.period(new Date(10));
    const ip2 = ip.back();
    expect(ip2).toBeInstanceOf(Object);
    expect(ip2._series).toBe(its);
    expect(ip2._date).toEqual(new Date(0));
  });

  it("should return appropriately if in a gap", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    its.add(new Date(20), "val", new Date(30));
    const ip = its.period(new Date(15));
    const ip2 = ip.back();
    expect(ip2).toBeInstanceOf(Object);
    expect(ip2._series).toBe(its);
    expect(ip2._date).toEqual(new Date(0));
  });

  it("should cycle through a series as expected", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val1", new Date(10));
    its.add(new Date(20), "val2", new Date(30));
    its.add(new Date(30), "val3", new Date(40));
    let ip = its.last();
    expect(ip.start()).toEqual(new Date(30));
    expect(ip.obs.value()).toBe("val3");
    expect(ip.end()).toEqual(new Date(40));
    ip = ip.back();
    expect(ip.start()).toEqual(new Date(20));
    expect(ip.obs.value()).toBe("val2");
    expect(ip.end()).toEqual(new Date(30));
    ip = ip.back();
    expect(ip.start()).toEqual(new Date(10));
    expect(ip.obs.exists()).toBe(false);
    expect(ip.end()).toEqual(new Date(20));
    ip = ip.back();
    expect(ip.start()).toEqual(new Date(0));
    expect(ip.obs.value()).toBe("val1");
    expect(ip.end()).toEqual(new Date(10));
  });
});

// IrregularObs objects

describe("The irregularPeriod.obs.exists() function", () => {
  it("should return false if empty series", () => {
    const its = tsjs.irregular();
    const ip = its.period(new Date(-1));
    expect(ip.obs.exists()).toBe(false);
  });

  it("should return false if before first observation", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(-1));
    expect(ip.obs.exists()).toBe(false);
  });

  it("should return false if after last observation", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(11));
    expect(ip.obs.exists()).toBe(false);
  });

  it("should return false if it doesn't exist", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    its.add(new Date(20), "val", new Date(30));
    const ip = its.period(new Date(15));
    expect(ip.obs.exists()).toBe(false);
  });

  it("should return true if it does exist", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(5));
    expect(ip.obs.exists()).toBe(true);
  });
});

describe("The irregularPeriod.obs.set() function", () => {
  it("should throw on missing argument", () => {
    const its = tsjs.irregular();
    const ip = its.period(new Date(0));
    expect(() => {
      ip.obs.set();
    }).toThrow(new Error("INVALID_ARGUMENT: No value specified."));
  });

  it("should throw if empty series", () => {
    const its = tsjs.irregular();
    const ip = its.period(new Date(-1));
    expect(() => {
      ip.obs.set("newval");
    }).toThrow(
      new Error(
        "INVALID_PERIOD: Cannot assign a value to the period before the first observation, the period after the last observation, or to an empty series."
      )
    );
  });

  it("should throw if before first observation", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(-1));
    expect(() => {
      ip.obs.set("newval");
    }).toThrow(
      new Error(
        "INVALID_PERIOD: Cannot assign a value to the period before the first observation, the period after the last observation, or to an empty series."
      )
    );
  });

  it("should throw if after last observation", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(11));
    expect(() => {
      ip.obs.set("newval");
    }).toThrow(
      new Error(
        "INVALID_PERIOD: Cannot assign a value to the period before the first observation, the period after the last observation, or to an empty series."
      )
    );
  });

  it("should overwrite existing observation values successfully", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(5));
    ip.obs.set("newval");
    expect(its._obs).toEqual([
      {
        start: new Date(0),
        value: "newval",
        end: new Date(10)
      }
    ]);
  });

  it("should add new observation values successfully", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val1", new Date(10));
    its.add(new Date(20), "val3", new Date(30));
    const ip = its.period(new Date(15));
    ip.obs.set("val2");
    expect(its._obs).toEqual([
      { start: new Date(0), value: "val1", end: new Date(10) },
      { start: new Date(10), value: "val2", end: new Date(20) },
      { start: new Date(20), value: "val3", end: new Date(30) }
    ]);
  });

  it("should handle undefined values", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(5));
    ip.obs.set(undefined);
    expect(its._obs).toEqual([
      {
        start: new Date(0),
        value: undefined,
        end: new Date(10)
      }
    ]);
  });

  it("should return a reference to the period", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(5));
    expect(ip.obs.set(123)).toBe(ip);
  });
});

describe("The irregularPeriod.obs.clear() function", () => {
  it("should throw if empty series", () => {
    const its = tsjs.irregular();
    const ip = its.period(new Date(-1));
    expect(() => {
      ip.obs.clear();
    }).toThrow(
      new Error(
        "INVALID_PERIOD: Can never assign a value to the period before the first observation and after the last observation."
      )
    );
  });

  it("should throw if before first observation", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(-1));
    expect(() => {
      ip.obs.clear();
    }).toThrow(
      new Error(
        "INVALID_PERIOD: Can never assign a value to the period before the first observation and after the last observation."
      )
    );
  });

  it("should throw if after last observation", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(11));
    expect(() => {
      ip.obs.clear();
    }).toThrow(
      new Error(
        "INVALID_PERIOD: Can never assign a value to the period before the first observation and after the last observation."
      )
    );
  });

  it("should clear existing observation values successfully", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(5));
    ip.obs.clear();
    expect(its._obs).toEqual([]);
  });

  it("should return success if there is no observation value", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val1", new Date(10));
    its.add(new Date(20), "val3", new Date(30));
    const ip = its.period(new Date(15));
    ip.obs.clear();
    expect(its._obs).toEqual([
      { start: new Date(0), value: "val1", end: new Date(10) },
      { start: new Date(20), value: "val3", end: new Date(30) }
    ]);
  });

  it("should return a reference to the period", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(5));
    expect(ip.obs.clear()).toBe(ip);
  });
});

describe("The irregularPeriod.obs.value() function", () => {
  it("should throw if empty series", () => {
    const its = tsjs.irregular();
    const ip = its.period(new Date(-1));
    expect(() => {
      ip.obs.value();
    }).toThrow(
      new Error(
        "INVALID_PERIOD: Can never assign a value to the period before the first observation and after the last observation."
      )
    );
  });

  it("should throw if before first observation", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(-1));
    expect(() => {
      ip.obs.value();
    }).toThrow(
      new Error(
        "INVALID_PERIOD: Can never assign a value to the period before the first observation and after the last observation."
      )
    );
  });

  it("should throw if after last observation", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(11));
    expect(() => {
      ip.obs.value();
    }).toThrow(
      new Error(
        "INVALID_PERIOD: Can never assign a value to the period before the first observation and after the last observation."
      )
    );
  });

  it("should throw if there is no observation", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val1", new Date(10));
    its.add(new Date(20), "val3", new Date(30));
    const ip = its.period(new Date(15));
    expect(() => {
      ip.obs.value();
    }).toThrow(
      new Error("MISSING: There is no observation spanning the reference date.")
    );
  });

  it("should retrieve existing observation values successfully", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), "val", new Date(10));
    const ip = its.period(new Date(5));
    expect(ip.obs.value()).toBe("val");
  });

  it("should handle undefined values", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), undefined, new Date(10));
    const ip = its.period(new Date(5));
    expect(ip.obs.value()).toBe(undefined);
  });
});

describe("The irregularPeriod.obs.hasForward() function", () => {
  it("should return false if empty series", () => {
    const its = tsjs.irregular();
    const ip = its.period(new Date(0));
    expect(ip.obs.hasForward()).toBe(false);
  });

  it("should return false if on last obs", () => {
    const its = tsjs.irregular();
    its.add(new Date(-100), 123, new Date(-50));
    its.add(new Date(0), 123, new Date(100));
    const ip = its.period(new Date(50));
    expect(ip.obs.hasForward()).toBe(false);
  });

  it("should return false if past last obs", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(100));
    const ip = its.period(new Date(150));
    expect(ip.obs.hasForward()).toBe(false);
  });

  it("should return true if on an obs and there is a later obs", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(100));
    its.add(new Date(200), 123, new Date(300));
    const ip = its.period(new Date(50));
    expect(ip.obs.hasForward()).toBe(true);
  });

  it("should return true if on a gap and there is a later obs", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(100));
    its.add(new Date(200), 123, new Date(300));
    const ip = its.period(new Date(150));
    expect(ip.obs.hasForward()).toBe(true);
  });
});

describe("The irregularPeriod.obs.forward() function", () => {
  it("should throw if empty series", () => {
    const its = tsjs.irregular();
    const ip = its.period(new Date(0));
    expect(() => {
      ip.obs.forward();
    }).toThrow(new Error("MISSING: There are no later observations."));
  });

  it("should throw if on last obs", () => {
    const its = tsjs.irregular();
    its.add(new Date(-100), 123, new Date(-50));
    its.add(new Date(0), 123, new Date(100));
    const ip = its.period(new Date(50));
    expect(() => {
      ip.obs.forward();
    }).toThrow(new Error("MISSING: There are no later observations."));
  });

  it("should throw if past last obs", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(100));
    const ip = its.period(new Date(150));
    expect(() => {
      ip.obs.forward();
    }).toThrow(new Error("MISSING: There are no later observations."));
  });

  it("should return appropriately if on an obs and there is a later obs", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(100));
    its.add(new Date(200), 123, new Date(300));
    const ip = its.period(new Date(50)).obs.forward();
    expect(ip).toBeInstanceOf(Object);
    expect(ip._series).toBe(its);
    expect(ip._date).toEqual(new Date(200));
  });

  it("should return appropriately if on a gap and there is a later obs", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(100));
    its.add(new Date(200), 123, new Date(300));
    const ip = its.period(new Date(150)).obs.forward();
    expect(ip).toBeInstanceOf(Object);
    expect(ip._series).toBe(its);
    expect(ip._date).toEqual(new Date(200));
  });
});

describe("The irregularPeriod.obs.hasBack() function", () => {
  it("should return false if empty series", () => {
    const its = tsjs.irregular();
    const ip = its.period(new Date(0));
    expect(ip.obs.hasBack()).toBe(false);
  });

  it("should return false if on first obs", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(100));
    its.add(new Date(200), 123, new Date(300));
    const ip = its.period(new Date(50));
    expect(ip.obs.hasBack()).toBe(false);
  });

  it("should return false if before first obs", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(100));
    const ip = its.period(new Date(-50));
    expect(ip.obs.hasBack()).toBe(false);
  });

  it("should return true if on an obs and there is an earlier obs", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(100));
    its.add(new Date(200), 123, new Date(300));
    const ip = its.period(new Date(250));
    expect(ip.obs.hasBack()).toBe(true);
  });

  it("should return true if on a gap and there is an earlier obs", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(100));
    its.add(new Date(200), 123, new Date(300));
    const ip = its.period(new Date(150));
    expect(ip.obs.hasBack()).toBe(true);
  });
});

describe("The irregularPeriod.obs.back() function", () => {
  it("should throw if empty series", () => {
    const its = tsjs.irregular();
    const ip = its.period(new Date(0));
    expect(() => {
      ip.obs.back();
    }).toThrow(new Error("MISSING: There are no earlier observations."));
  });

  it("should throw if on first obs", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(100));
    its.add(new Date(200), 123, new Date(300));
    const ip = its.period(new Date(50));
    expect(() => {
      ip.obs.back();
    }).toThrow(new Error("MISSING: There are no earlier observations."));
  });

  it("should throw if before first obs", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(100));
    const ip = its.period(new Date(-50));
    expect(() => {
      ip.obs.back();
    }).toThrow(new Error("MISSING: There are no earlier observations."));
  });

  it("should return appropriately if on an obs and there is an earlier obs", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(100));
    its.add(new Date(200), 123, new Date(300));
    const ip = its.period(new Date(250)).obs.back();
    expect(ip).toBeInstanceOf(Object);
    expect(ip._series).toBe(its);
    expect(ip._date).toEqual(new Date(0));
  });

  it("should return appropriately if on a gap and there is an earlier obs", () => {
    const its = tsjs.irregular();
    its.add(new Date(0), 123, new Date(100));
    its.add(new Date(200), 123, new Date(300));
    const ip = its.period(new Date(150)).obs.back();
    expect(ip).toBeInstanceOf(Object);
    expect(ip._series).toBe(its);
    expect(ip._date).toEqual(new Date(0));
  });
});

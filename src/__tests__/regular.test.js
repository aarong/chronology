import check from "check-types";
import moment from "moment";
import chronology from "../main";

// RegularSeries objects

describe("The chronology.regular() factory function", () => {
  it("should throw on missing options", () => {
    expect(() => {
      chronology.regular();
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid options."));
  });

  it("should throw on invalid options type", () => {
    expect(() => {
      chronology.regular("abc");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid options."));
  });

  it("should throw on missing options.basePeriod", () => {
    expect(() => {
      chronology.regular({});
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.basePeriod."));
  });

  it("should throw on invalid options.basePeriod type", () => {
    expect(() => {
      chronology.regular({ basePeriod: "abc" });
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.basePeriod."));
  });

  it("should throw on invalid options.basePeriod length", () => {
    expect(() => {
      chronology.regular({ basePeriod: [1, "y", "junk"] });
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.basePeriod."));
  });

  it("should throw on invalid options.basePeriod[0] - base period number", () => {
    expect(() => {
      chronology.regular({ basePeriod: ["abc", "y"] });
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.basePeriod."));
  });

  it("should throw on invalid options.basePeriod[0] - base period number", () => {
    expect(() => {
      chronology.regular({ basePeriod: [0, "y"] });
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.basePeriod."));
  });

  it("should throw on invalid options.basePeriod[0] - base period number", () => {
    expect(() => {
      chronology.regular({ basePeriod: [1.1, "y"] });
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.basePeriod."));
  });

  it("should throw on invalid options.basePeriod[1] - base period type", () => {
    expect(() => {
      chronology.regular({ basePeriod: [1, 123] });
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.basePeriod."));
  });

  it("should throw on invalid options.basePeriod[1] - base period type", () => {
    expect(() => {
      chronology.regular({ basePeriod: [1, "zzzz"] });
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.basePeriod."));
  });

  it("should throw on invalid options.anchor type", () => {
    expect(() => {
      chronology.regular({ basePeriod: [1, "y"], anchor: "abc" });
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.anchor."));
  });

  it("should throw on invalid options.subPeriods type", () => {
    expect(() => {
      chronology.regular({ basePeriod: [1, "y"], subPeriods: "abc" });
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.subPeriods."));
  });

  it("should throw on invalid options.subPeriods value", () => {
    expect(() => {
      chronology.regular({ basePeriod: [1, "y"], subPeriods: 0 });
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.subPeriods."));
  });

  it("should throw on invalid options.subPeriods value", () => {
    expect(() => {
      chronology.regular({ basePeriod: [1, "y"], subPeriods: 1.1 });
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid options.subPeriods."));
  });

  describe("options.subPeriodBoundaries validation", () => {
    it("should throw on non-function options.subPeriodBoundaries value", () => {
      expect(() => {
        chronology.regular({
          basePeriod: [1, "y"],
          subPeriodBoundaries: "abc",
        });
      }).toThrow(
        new Error("INVALID_ARGUMENT: Invalid options.subPeriodBoundaries."),
      );
    });

    it("should throw on non-object return value", () => {
      expect(() => {
        chronology.regular({
          basePeriod: [1, "y"],
          subPeriodBoundaries: (bpStart, bpEnd, spNum) => "abc", // eslint-disable-line no-unused-vars
        });
      }).toThrow(
        new Error(
          "INVALID_ARGUMENT: Invalid value returned by options.subPeriodBoundaries.",
        ),
      );
    });

    it("should throw on null,date return value", () => {
      expect(() => {
        chronology.regular({
          basePeriod: [1, "y"],
          // eslint-disable-next-line no-unused-vars
          subPeriodBoundaries(bpStart, bpEnd, spNum) {
            return { start: null, end: bpEnd };
          },
        });
      }).toThrow(
        new Error(
          "INVALID_ARGUMENT: Invalid value returned by options.subPeriodBoundaries.",
        ),
      );
    });

    it("should throw on date,null return value", () => {
      expect(() => {
        chronology.regular({
          basePeriod: [1, "y"],
          // eslint-disable-next-line no-unused-vars
          subPeriodBoundaries(bpStart, bpEnd, spNum) {
            return { start: bpStart, end: null };
          },
        });
      }).toThrow(
        new Error(
          "INVALID_ARGUMENT: Invalid value returned by options.subPeriodBoundaries.",
        ),
      );
    });

    it("should throw if subPeriodStart < basePeriodStart", () => {
      expect(() => {
        chronology.regular({
          basePeriod: [1, "y"],
          // eslint-disable-next-line no-unused-vars
          subPeriodBoundaries(bpStart, bpEnd, spNum) {
            return { start: new Date(bpStart.getTime() - 1), end: bpEnd };
          },
        });
      }).toThrow(
        new Error(
          "INVALID_ARGUMENT: Invalid start date returned by options.subPeriodBoundaries.",
        ),
      );
    });

    it("should throw if subPeriodStart <= previous subPeriodStart", () => {
      expect(() => {
        chronology.regular({
          basePeriod: [1, "y"],
          subPeriods: 2,
          subPeriodBoundaries(bpStart, bpEnd, spNum) {
            if (spNum === 1) {
              return { start: new Date(bpStart.getTime() + 1), end: bpEnd };
            }
            return { start: bpStart, end: bpEnd };
          },
        });
      }).toThrow(
        new Error(
          "INVALID_ARGUMENT: Invalid start date returned by options.subPeriodBoundaries.",
        ),
      );
    });

    it("should throw if subPeriodStart >= basePeriodEnd", () => {
      expect(() => {
        chronology.regular({
          basePeriod: [1, "y"],
          // eslint-disable-next-line no-unused-vars
          subPeriodBoundaries(bpStart, bpEnd, spNum) {
            return { start: bpEnd, end: new Date(bpEnd.getTime() + 1) };
          },
        });
      }).toThrow(
        new Error(
          "INVALID_ARGUMENT: Invalid start date returned by options.subPeriodBoundaries.",
        ),
      );
    });

    it("should throw if subPeriodEnd <= subPeriodStart", () => {
      expect(() => {
        chronology.regular({
          basePeriod: [1, "y"],
          // eslint-disable-next-line no-unused-vars
          subPeriodBoundaries(bpStart, bpEnd, spNum) {
            return { start: bpStart, end: bpStart };
          },
        });
      }).toThrow(
        new Error(
          "INVALID_ARGUMENT: Invalid end date returned by options.subPeriodBoundaries.",
        ),
      );
    });

    it("should throw if subPeriodEnd > basePeriodEnd", () => {
      expect(() => {
        chronology.regular({
          basePeriod: [1, "y"],
          // eslint-disable-next-line no-unused-vars
          subPeriodBoundaries(bpStart, bpEnd, spNum) {
            return { start: bpStart, end: new Date(bpEnd.getTime() + 1) };
          },
        });
      }).toThrow(
        new Error(
          "INVALID_ARGUMENT: Invalid end date returned by options.subPeriodBoundaries.",
        ),
      );
    });
  });

  it("should return an object for all valid options", () => {
    const basePeriods = ["y", "q", "m", "w", "d", "h", "n", "s", "ms", "e-3"];
    for (let i = 0; i < basePeriods.length; i += 1) {
      expect(
        chronology.regular({
          basePeriod: [1, basePeriods[i]],
          anchor: new Date(0),
          subPeriods: 10,
        }),
      ).toBeInstanceOf(Object);
      expect(
        chronology.regular({
          basePeriod: [1, basePeriods[i].toUpperCase()],
          anchor: new Date(0),
          subPeriods: 10,
        }),
      ).toBeInstanceOf(Object);
    }
  });

  // Check state
});

// Private functions

describe("The regular._testSubPeriodBoundaries() function", () => {
  // Tested alongside the chronology.regular() factory function
});

describe("The regular._basePeriodIndex() function", () => {
  // Tested alongside regular.basePeriodBoundaries()
});

describe("The regular._basePeriodBoundaries() function", () => {
  describe("For basePeriodNumber = 1", () => {
    describe("for years series", () => {
      it("should return correctly before the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [1, "y"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(-1);
        expect(bounds.start).toEqual(new Date("1969-01-01 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 00:00:00.000Z"));
      });

      it("should return correctly after the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [1, "y"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(0);
        expect(bounds.start).toEqual(new Date("1970-01-01 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1971-01-01 00:00:00.000Z"));
      });
    });

    describe("for quarters series", () => {
      it("should return correctly before the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [1, "q"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(-1);
        expect(bounds.start).toEqual(new Date("1969-10-01 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 00:00:00.000Z"));
      });

      it("should return correctly after the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [1, "q"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(0);
        expect(bounds.start).toEqual(new Date("1970-01-01 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-04-01 00:00:00.000Z"));
      });
    });

    describe("for months series", () => {
      it("should return correctly before the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [1, "m"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(-1);
        expect(bounds.start).toEqual(new Date("1969-12-01 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 00:00:00.000Z"));
      });

      it("should return correctly after the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [1, "m"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(0);
        expect(bounds.start).toEqual(new Date("1970-01-01 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-02-01 00:00:00.000Z"));
      });
    });

    describe("for weeks series", () => {
      it("should return correctly before the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [1, "w"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(-1);
        expect(bounds.start).toEqual(new Date("1969-12-25 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 00:00:00.000Z"));
      });

      it("should return correctly after the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [1, "w"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(0);
        expect(bounds.start).toEqual(new Date("1970-01-01 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-08 00:00:00.000Z"));
      });
    });

    describe("for days series", () => {
      it("should return correctly before the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [1, "d"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(-1);
        expect(bounds.start).toEqual(new Date("1969-12-31 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 00:00:00.000Z"));
      });

      it("should return correctly after the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [1, "d"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(0);
        expect(bounds.start).toEqual(new Date("1970-01-01 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-02 00:00:00.000Z"));
      });
    });

    describe("for hours series", () => {
      it("should return correctly before the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [1, "h"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(-1);
        expect(bounds.start).toEqual(new Date("1969-12-31 23:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 00:00:00.000Z"));
      });

      it("should return correctly after the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [1, "h"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(0);
        expect(bounds.start).toEqual(new Date("1970-01-01 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 01:00:00.000Z"));
      });
    });

    describe("for minutes series", () => {
      it("should return correctly before the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [1, "n"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(-1);
        expect(bounds.start).toEqual(new Date("1969-12-31 23:59:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 00:00:00.000Z"));
      });

      it("should return correctly after the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [1, "n"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(0);
        expect(bounds.start).toEqual(new Date("1970-01-01 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 00:01:00:000Z"));
      });
    });

    describe("for seconds series", () => {
      it("should return correctly before the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [1, "s"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(-1);
        expect(bounds.start).toEqual(new Date("1969-12-31 23:59:59.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 00:00:00.000Z"));
      });

      it("should return correctly after the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [1, "s"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(0);
        expect(bounds.start).toEqual(new Date("1970-01-01 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 00:00:01:000Z"));
      });
    });

    describe("for milliseconds series", () => {
      it("should return correctly before the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [1, "ms"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(-1);
        expect(bounds.start).toEqual(new Date("1969-12-31 23:59:59.999Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 00:00:00.000Z"));
      });

      it("should return correctly after the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [1, "ms"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(0);
        expect(bounds.start).toEqual(new Date("1970-01-01 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 00:00:00:001Z"));
      });
    });
  });

  describe("For basePeriodNumber = 2", () => {
    describe("for years series", () => {
      it("should return correctly before the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [2, "y"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(-1);
        expect(bounds.start).toEqual(new Date("1968-01-01 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 00:00:00.000Z"));
      });

      it("should return correctly after the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [2, "y"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(0);
        expect(bounds.start).toEqual(new Date("1970-01-01 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1972-01-01 00:00:00.000Z"));
      });
    });

    describe("for quarters series", () => {
      it("should return correctly before the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [2, "q"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(-1);
        expect(bounds.start).toEqual(new Date("1969-07-01 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 00:00:00.000Z"));
      });

      it("should return correctly after the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [2, "q"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(0);
        expect(bounds.start).toEqual(new Date("1970-01-01 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-07-01 00:00:00.000Z"));
      });
    });

    describe("for months series", () => {
      it("should return correctly before the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [2, "m"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(-1);
        expect(bounds.start).toEqual(new Date("1969-11-01 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 00:00:00.000Z"));
      });

      it("should return correctly after the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [2, "m"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(0);
        expect(bounds.start).toEqual(new Date("1970-01-01 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-03-01 00:00:00.000Z"));
      });
    });

    describe("for weeks series", () => {
      it("should return correctly before the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [2, "w"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(-1);
        expect(bounds.start).toEqual(new Date("1969-12-18 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 00:00:00.000Z"));
      });

      it("should return correctly after the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [2, "w"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(0);
        expect(bounds.start).toEqual(new Date("1970-01-01 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-15 00:00:00.000Z"));
      });
    });

    describe("for days series", () => {
      it("should return correctly before the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [2, "d"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(-1);
        expect(bounds.start).toEqual(new Date("1969-12-30 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 00:00:00.000Z"));
      });

      it("should return correctly after the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [2, "d"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(0);
        expect(bounds.start).toEqual(new Date("1970-01-01 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-03 00:00:00.000Z"));
      });
    });

    describe("for hours series", () => {
      it("should return correctly before the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [2, "h"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(-1);
        expect(bounds.start).toEqual(new Date("1969-12-31 22:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 00:00:00.000Z"));
      });

      it("should return correctly after the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [2, "h"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(0);
        expect(bounds.start).toEqual(new Date("1970-01-01 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 02:00:00.000Z"));
      });
    });

    describe("for minutes series", () => {
      it("should return correctly before the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [2, "n"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(-1);
        expect(bounds.start).toEqual(new Date("1969-12-31 23:58:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 00:00:00.000Z"));
      });

      it("should return correctly after the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [2, "n"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(0);
        expect(bounds.start).toEqual(new Date("1970-01-01 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 00:02:00.000Z"));
      });
    });

    describe("for seconds series", () => {
      it("should return correctly before the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [2, "s"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(-1);
        expect(bounds.start).toEqual(new Date("1969-12-31 23:59:58.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 00:00:00.000Z"));
      });

      it("should return correctly after the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [2, "s"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(0);
        expect(bounds.start).toEqual(new Date("1970-01-01 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 00:00:02:000Z"));
      });
    });

    describe("for milliseconds series", () => {
      it("should return correctly before the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [2, "ms"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(-1);
        expect(bounds.start).toEqual(new Date("1969-12-31 23:59:59.998Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 00:00:00.000Z"));
      });

      it("should return correctly after the anchor", () => {
        const rts = chronology.regular({
          basePeriod: [2, "ms"],
          anchor: new Date(0),
        });
        const bounds = rts._basePeriodBoundaries(0);
        expect(bounds.start).toEqual(new Date("1970-01-01 00:00:00.000Z"));
        expect(bounds.end).toEqual(new Date("1970-01-01 00:00:00:002Z"));
      });
    });
  });
});

describe("The regular._subPeriodBoundaries() function and uniform default function", () => {
  describe("date return values (not too-frequent)", () => {
    it("should work correctly for years", () => {
      const rts = chronology.regular({
        basePeriod: [2, "y"],
        anchor: new Date(0),
        subPeriods: 2,
      });
      const subBounds1 = rts._subPeriodBoundaries(0, 1);
      expect(subBounds1.start).toEqual(new Date("1970-01-01T00:00:00.000Z"));
      expect(subBounds1.end).toEqual(new Date("1971-01-01T00:00:00.000Z"));
      const subBounds2 = rts._subPeriodBoundaries(0, 2);
      expect(subBounds2.start).toEqual(new Date("1971-01-01T00:00:00.000Z"));
      expect(subBounds2.end).toEqual(new Date("1972-01-01T00:00:00.000Z"));
    });

    it("should work correctly for quarters", () => {
      const rts = chronology.regular({
        basePeriod: [2, "q"],
        anchor: new Date(0),
        subPeriods: 2,
      });
      const subBounds1 = rts._subPeriodBoundaries(0, 1);
      expect(subBounds1.start).toEqual(new Date("1970-01-01T00:00:00.000Z"));
      expect(subBounds1.end).toEqual(
        new Date(0 + (181 * 24 * 60 * 60 * 1000) / 2),
      );
      const subBounds2 = rts._subPeriodBoundaries(0, 2);
      expect(subBounds2.start).toEqual(
        new Date(0 + (181 * 24 * 60 * 60 * 1000) / 2),
      );
      expect(subBounds2.end).toEqual(new Date("1970-07-01T00:00:00.000Z"));
    });

    it("should work correctly for months", () => {
      const rts = chronology.regular({
        basePeriod: [2, "m"],
        anchor: new Date(0),
        subPeriods: 2,
      });
      const subBounds1 = rts._subPeriodBoundaries(0, 1);
      expect(subBounds1.start).toEqual(new Date("1970-01-01T00:00:00.000Z"));
      expect(subBounds1.end).toEqual(
        new Date(0 + (59 * 24 * 60 * 60 * 1000) / 2),
      );
      const subBounds2 = rts._subPeriodBoundaries(0, 2);
      expect(subBounds2.start).toEqual(
        new Date(0 + (59 * 24 * 60 * 60 * 1000) / 2),
      );
      expect(subBounds2.end).toEqual(new Date("1970-03-01T00:00:00.000Z"));
    });

    it("should work correctly for weeks", () => {
      const rts = chronology.regular({
        basePeriod: [2, "w"],
        anchor: new Date(0),
        subPeriods: 2,
      });
      const subBounds1 = rts._subPeriodBoundaries(0, 1);
      expect(subBounds1.start).toEqual(new Date("1970-01-01T00:00:00.000Z"));
      expect(subBounds1.end).toEqual(new Date("1970-01-08T00:00:00.000Z"));
      const subBounds2 = rts._subPeriodBoundaries(0, 2);
      expect(subBounds2.start).toEqual(new Date("1970-01-08T00:00:00.000Z"));
      expect(subBounds2.end).toEqual(new Date("1970-01-15T00:00:00.000Z"));
    });

    it("should work correctly for days", () => {
      const rts = chronology.regular({
        basePeriod: [2, "d"],
        anchor: new Date(0),
        subPeriods: 2,
      });
      const subBounds1 = rts._subPeriodBoundaries(0, 1);
      expect(subBounds1.start).toEqual(new Date("1970-01-01T00:00:00.000Z"));
      expect(subBounds1.end).toEqual(new Date("1970-01-02T00:00:00.000Z"));
      const subBounds2 = rts._subPeriodBoundaries(0, 2);
      expect(subBounds2.start).toEqual(new Date("1970-01-02T00:00:00.000Z"));
      expect(subBounds2.end).toEqual(new Date("1970-01-03T00:00:00.000Z"));
    });

    it("should work correctly for hours", () => {
      const rts = chronology.regular({
        basePeriod: [2, "h"],
        anchor: new Date(0),
        subPeriods: 2,
      });
      const subBounds1 = rts._subPeriodBoundaries(0, 1);
      expect(subBounds1.start).toEqual(new Date("1970-01-01T00:00:00.000Z"));
      expect(subBounds1.end).toEqual(new Date("1970-01-01T01:00:00.000Z"));
      const subBounds2 = rts._subPeriodBoundaries(0, 2);
      expect(subBounds2.start).toEqual(new Date("1970-01-01T01:00:00.000Z"));
      expect(subBounds2.end).toEqual(new Date("1970-01-01T02:00:00.000Z"));
    });

    it("should work correctly for minutes", () => {
      const rts = chronology.regular({
        basePeriod: [2, "n"],
        anchor: new Date(0),
        subPeriods: 2,
      });
      const subBounds1 = rts._subPeriodBoundaries(0, 1);
      expect(subBounds1.start).toEqual(new Date("1970-01-01T00:00:00.000Z"));
      expect(subBounds1.end).toEqual(new Date("1970-01-01T00:01:00.000Z"));
      const subBounds2 = rts._subPeriodBoundaries(0, 2);
      expect(subBounds2.start).toEqual(new Date("1970-01-01T00:01:00.000Z"));
      expect(subBounds2.end).toEqual(new Date("1970-01-01T00:02:00.000Z"));
    });

    it("should work correctly for seconds", () => {
      const rts = chronology.regular({
        basePeriod: [2, "s"],
        anchor: new Date(0),
        subPeriods: 2,
      });
      const subBounds1 = rts._subPeriodBoundaries(0, 1);
      expect(subBounds1.start).toEqual(new Date("1970-01-01T00:00:00.000Z"));
      expect(subBounds1.end).toEqual(new Date("1970-01-01T00:00:01.000Z"));
      const subBounds2 = rts._subPeriodBoundaries(0, 2);
      expect(subBounds2.start).toEqual(new Date("1970-01-01T00:00:01.000Z"));
      expect(subBounds2.end).toEqual(new Date("1970-01-01T00:00:02.000Z"));
    });

    it("should work correctly for milliseconds", () => {
      const rts = chronology.regular({
        basePeriod: [2, "ms"],
        anchor: new Date(0),
        subPeriods: 2,
      });
      const subBounds1 = rts._subPeriodBoundaries(0, 1);
      expect(subBounds1.start).toEqual(new Date("1970-01-01T00:00:00.000Z"));
      expect(subBounds1.end).toEqual(new Date("1970-01-01T00:00:00.001Z"));
      const subBounds2 = rts._subPeriodBoundaries(0, 2);
      expect(subBounds2.start).toEqual(new Date("1970-01-01T00:00:00.001Z"));
      expect(subBounds2.end).toEqual(new Date("1970-01-01T00:00:00.002Z"));
    });
  });

  describe("null return values (too-frequent)", () => {
    it("should work correctly for years on date side of boundary", () => {
      const rts = chronology.regular({
        basePeriod: [1, "y"],
        subPeriods: 365 * 24 * 60 * 60 * 1000,
      });
      const subBounds = rts._subPeriodBoundaries(0, 1);
      expect(check.date(subBounds.start)).toBe(true);
      expect(check.date(subBounds.end)).toBe(true);
    });

    it("should work correctly for years on null side of boundary", () => {
      const rts = chronology.regular({
        basePeriod: [1, "y"],
        subPeriods: 365 * 24 * 60 * 60 * 1000 + 1,
      });
      const subBounds = rts._subPeriodBoundaries(0, 1);
      expect(check.null(subBounds.start)).toBe(true);
      expect(check.null(subBounds.end)).toBe(true);
    });

    it("should work correctly for quarters on date side of boundary", () => {
      const rts = chronology.regular({
        basePeriod: [1, "q"],
        subPeriods: 90 * 24 * 60 * 60 * 1000,
      });
      const subBounds = rts._subPeriodBoundaries(0, 1);
      expect(check.date(subBounds.start)).toBe(true);
      expect(check.date(subBounds.end)).toBe(true);
    });

    it("should work correctly for quarters on null side of boundary", () => {
      const rts = chronology.regular({
        basePeriod: [1, "q"],
        subPeriods: 90 * 24 * 60 * 60 * 1000 + 1,
      });
      const subBounds = rts._subPeriodBoundaries(0, 1);
      expect(check.null(subBounds.start)).toBe(true);
      expect(check.null(subBounds.end)).toBe(true);
    });

    it("should work correctly for months on date side of boundary", () => {
      const rts = chronology.regular({
        basePeriod: [1, "m"],
        subPeriods: 28 * 24 * 60 * 60 * 1000,
      });
      const subBounds = rts._subPeriodBoundaries(0, 1);
      expect(check.date(subBounds.start)).toBe(true);
      expect(check.date(subBounds.end)).toBe(true);
    });

    it("should work correctly for months on null side of boundary", () => {
      const rts = chronology.regular({
        basePeriod: [1, "m"],
        subPeriods: 28 * 24 * 60 * 60 * 1000 + 1,
      });
      const subBounds = rts._subPeriodBoundaries(0, 1);
      expect(check.null(subBounds.start)).toBe(true);
      expect(check.null(subBounds.end)).toBe(true);
    });

    it("should work correctly for weeks on date side of boundary", () => {
      const rts = chronology.regular({
        basePeriod: [1, "w"],
        subPeriods: 7 * 24 * 60 * 60 * 1000,
      });
      const subBounds = rts._subPeriodBoundaries(0, 1);
      expect(check.date(subBounds.start)).toBe(true);
      expect(check.date(subBounds.end)).toBe(true);
    });

    it("should work correctly for weeks on null side of boundary", () => {
      const rts = chronology.regular({
        basePeriod: [1, "w"],
        subPeriods: 7 * 24 * 60 * 60 * 1000 + 1,
      });
      const subBounds = rts._subPeriodBoundaries(0, 1);
      expect(check.null(subBounds.start)).toBe(true);
      expect(check.null(subBounds.end)).toBe(true);
    });

    it("should work correctly for days on date side of boundary", () => {
      const rts = chronology.regular({
        basePeriod: [1, "d"],
        subPeriods: 24 * 60 * 60 * 1000,
      });
      const subBounds = rts._subPeriodBoundaries(0, 1);
      expect(check.date(subBounds.start)).toBe(true);
      expect(check.date(subBounds.end)).toBe(true);
    });

    it("should work correctly for days on null side of boundary", () => {
      const rts = chronology.regular({
        basePeriod: [1, "d"],
        subPeriods: 24 * 60 * 60 * 1000 + 1,
      });
      const subBounds = rts._subPeriodBoundaries(0, 1);
      expect(check.null(subBounds.start)).toBe(true);
      expect(check.null(subBounds.end)).toBe(true);
    });

    it("should work correctly for hours on date side of boundary", () => {
      const rts = chronology.regular({
        basePeriod: [1, "h"],
        subPeriods: 60 * 60 * 1000,
      });
      const subBounds = rts._subPeriodBoundaries(0, 1);
      expect(check.date(subBounds.start)).toBe(true);
      expect(check.date(subBounds.end)).toBe(true);
    });

    it("should work correctly for hours on null side of boundary", () => {
      const rts = chronology.regular({
        basePeriod: [1, "h"],
        subPeriods: 60 * 60 * 1000 + 1,
      });
      const subBounds = rts._subPeriodBoundaries(0, 1);
      expect(check.null(subBounds.start)).toBe(true);
      expect(check.null(subBounds.end)).toBe(true);
    });

    it("should work correctly for minutes on date side of boundary", () => {
      const rts = chronology.regular({
        basePeriod: [1, "n"],
        subPeriods: 60 * 1000,
      });
      const subBounds = rts._subPeriodBoundaries(0, 1);
      expect(check.date(subBounds.start)).toBe(true);
      expect(check.date(subBounds.end)).toBe(true);
    });

    it("should work correctly for minutes on null side of boundary", () => {
      const rts = chronology.regular({
        basePeriod: [1, "n"],
        subPeriods: 60 * 1000 + 1,
      });
      const subBounds = rts._subPeriodBoundaries(0, 1);
      expect(check.null(subBounds.start)).toBe(true);
      expect(check.null(subBounds.end)).toBe(true);
    });

    it("should work correctly for seconds on date side of boundary", () => {
      const rts = chronology.regular({
        basePeriod: [1, "s"],
        subPeriods: 1000,
      });
      const subBounds = rts._subPeriodBoundaries(0, 1);
      expect(check.date(subBounds.start)).toBe(true);
      expect(check.date(subBounds.end)).toBe(true);
    });

    it("should work correctly for seconds on null side of boundary", () => {
      const rts = chronology.regular({
        basePeriod: [1, "s"],
        subPeriods: 1000 + 1,
      });
      const subBounds = rts._subPeriodBoundaries(0, 1);
      expect(check.null(subBounds.start)).toBe(true);
      expect(check.null(subBounds.end)).toBe(true);
    });

    it("should work correctly for milliseconds on date side of boundary", () => {
      const rts = chronology.regular({
        basePeriod: [1, "ms"],
        subPeriods: 1,
      });
      const subBounds = rts._subPeriodBoundaries(0, 1);
      expect(check.date(subBounds.start)).toBe(true);
      expect(check.date(subBounds.end)).toBe(true);
    });

    it("should work correctly for milliseconds on null side of boundary", () => {
      const rts = chronology.regular({
        basePeriod: [1, "ms"],
        subPeriods: 2,
      });
      const subBounds = rts._subPeriodBoundaries(0, 1);
      expect(check.null(subBounds.start)).toBe(true);
      expect(check.null(subBounds.end)).toBe(true);
    });
  });
});

describe("The regular._subPeriod() function", () => {
  describe("for a single contiguous sub period", () => {
    it("should return correctly for years (bpn = 1)", () => {
      const rts = chronology.regular({ basePeriod: [1, "y"] });
      // These are all the same base period
      expect(rts._subPeriod(new Date("2000-01-01T00:00:00.000Z"))).toBe(1);
      expect(rts._subPeriod(new Date("2000-07-01T00:00:00.000Z"))).toBe(1);
      expect(rts._subPeriod(new Date("2000-12-31T23:59:59.999Z"))).toBe(1);
    });

    it("should return correctly for milliseconds (npm > 1)", () => {
      const rts = chronology.regular({ basePeriod: [2, "ms"] });
      // These are all different base periods
      expect(rts._subPeriod(new Date("2000-01-01T00:00:00.000Z"))).toBe(1);
      expect(rts._subPeriod(new Date("2000-07-01T00:00:00.000Z"))).toBe(1);
      expect(rts._subPeriod(new Date("2000-12-31T23:59:59.999Z"))).toBe(1);
    });
  });

  describe("for a single non-contiguous sub period", () => {
    it("should return correctly for years (bpn = 1)", () => {
      const rts = chronology.regular({
        basePeriod: [1, "y"],
        // eslint-disable-next-line no-unused-vars
        subPeriodBoundaries(bpStart, bpEnd, spNum) {
          // Omit the first and last day of the year
          return {
            start: new Date(bpStart.getTime() + 24 * 60 * 60 * 1000),
            end: new Date(bpEnd.getTime() - 24 * 60 * 60 * 1000),
          };
        },
      });

      // Start of year
      expect(() => {
        rts._subPeriod(new Date("2000-01-01T00:00:00.000Z"));
      }).toThrow(
        new Error(
          "UNALLOCATED_DATE: There is no sub period associated with the specified date.",
        ),
      );

      // One boundary
      expect(() => {
        rts._subPeriod(new Date("2000-01-01T23:59:59.999Z"));
      }).toThrow(
        new Error(
          "UNALLOCATED_DATE: There is no sub period associated with the specified date.",
        ),
      );
      expect(rts._subPeriod(new Date("2000-01-02T00:00:00.000Z"))).toBe(1);

      // Middle of year
      expect(rts._subPeriod(new Date("2000-07-01T00:00:00.000Z"))).toBe(1);

      // Another boundary
      expect(rts._subPeriod(new Date("2000-12-30T23:59:59.999Z"))).toBe(1);
      expect(() => {
        rts._subPeriod(new Date("2000-12-31T00:00:00.000Z"));
      }).toThrow(
        new Error(
          "UNALLOCATED_DATE: There is no sub period associated with the specified date.",
        ),
      );

      // End of year
      expect(() => {
        rts._subPeriod(new Date("2000-12-31T23:59:59.999Z"));
      }).toThrow(
        new Error(
          "UNALLOCATED_DATE: There is no sub period associated with the specified date.",
        ),
      );
    });

    it("should return correctly for seconds (bpn > 1)", () => {
      const rts = chronology.regular({
        basePeriod: [2, "s"],
        // eslint-disable-next-line no-unused-vars
        subPeriodBoundaries(bpStart, bpEnd, spNum) {
          // Omit the first and last 100 ms
          return {
            start: new Date(bpStart.getTime() + 100),
            end: new Date(bpEnd.getTime() - 100),
          };
        },
      });

      // Start of second
      expect(() => {
        rts._subPeriod(new Date("2000-01-01T00:00:00.000Z"));
      }).toThrow(
        new Error(
          "UNALLOCATED_DATE: There is no sub period associated with the specified date.",
        ),
      );

      // One boundary
      expect(() => {
        rts._subPeriod(new Date("2000-01-01T00:00:00.099Z"));
      }).toThrow(
        new Error(
          "UNALLOCATED_DATE: There is no sub period associated with the specified date.",
        ),
      );
      expect(rts._subPeriod(new Date("2000-01-01T00:00:00.100Z"))).toBe(1);

      // Middle of second
      expect(rts._subPeriod(new Date("2000-01-01T00:00:00.500Z"))).toBe(1);

      // Another boundary
      expect(rts._subPeriod(new Date("2000-01-01T00:00:01.899Z"))).toBe(1);
      expect(() => {
        rts._subPeriod(new Date("2000-01-01T00:00:01.900Z"));
      }).toThrow(
        new Error(
          "UNALLOCATED_DATE: There is no sub period associated with the specified date.",
        ),
      );

      // End of second
      expect(() => {
        rts._subPeriod(new Date("2000-01-01T00:00:01.999Z"));
      }).toThrow(
        new Error(
          "UNALLOCATED_DATE: There is no sub period associated with the specified date.",
        ),
      );
    });
  });

  describe("for two contiguous sub periods", () => {
    it("should return correctly for years (bpn = 1)", () => {
      const rts = chronology.regular({
        basePeriod: [1, "y"],
        subPeriods: 2,
        subPeriodBoundaries(bpStart, bpEnd, spNum) {
          // Break the year in half at July 1
          if (spNum === 1) {
            return {
              start: bpStart,
              end: moment.utc(bpStart).add(6, "M").toDate(),
            };
          }
          return {
            start: moment.utc(bpStart).add(6, "M").toDate(),
            end: bpEnd,
          };
        },
      });

      // Start of base period
      expect(rts._subPeriod(new Date("2000-01-01T00:00:00.000Z"))).toBe(1);

      // Boundary of first/second sub periods
      expect(rts._subPeriod(new Date("2000-06-30T23:59:59.999Z"))).toBe(1);
      expect(rts._subPeriod(new Date("2000-07-01T00:00:00.000Z"))).toBe(2);

      // End of base period
      expect(rts._subPeriod(new Date("2000-12-31T23:59:59.999Z"))).toBe(2);
    });

    it("should return correctly for seconds (bpn > 1)", () => {
      const rts = chronology.regular({
        basePeriod: [2, "s"],
        subPeriods: 2,
        subPeriodBoundaries(bpStart, bpEnd, spNum) {
          // Break the two-second base period in half
          if (spNum === 1) {
            return {
              start: bpStart,
              end: moment.utc(bpStart).add(1, "s").toDate(),
            };
          }
          return {
            start: moment.utc(bpStart).add(1, "s").toDate(),
            end: bpEnd,
          };
        },
      });

      // Start of base period
      expect(rts._subPeriod(new Date("2000-01-01T00:00:00.000Z"))).toBe(1);

      // Boundary of first/second sub periods
      expect(rts._subPeriod(new Date("2000-01-01T00:00:00.999Z"))).toBe(1);
      expect(rts._subPeriod(new Date("2000-01-01T00:00:01.000Z"))).toBe(2);

      // End of base period
      expect(rts._subPeriod(new Date("2000-01-01T00:00:01.999Z"))).toBe(2);
    });
  });

  describe("for two non-contiguous sub periods", () => {
    it("should return correctly for years (bpn = 1)", () => {
      const rts = chronology.regular({
        basePeriod: [1, "y"],
        subPeriods: 2,
        subPeriodBoundaries(bpStart, bpEnd, spNum) {
          // Sub period 1 runs Feb-May
          // Sub period 2 runs Aug-Nov
          if (spNum === 1) {
            return {
              start: moment.utc(bpStart).add(1, "M").toDate(),
              end: moment.utc(bpStart).add(5, "M").toDate(),
            };
          }
          return {
            start: moment.utc(bpStart).add(7, "M").toDate(),
            end: moment.utc(bpStart).add(11, "M").toDate(),
          };
        },
      });

      // Start of base period
      expect(() => {
        rts._subPeriod(new Date("2000-01-01T00:00:00.000Z"));
      }).toThrow(
        new Error(
          "UNALLOCATED_DATE: There is no sub period associated with the specified date.",
        ),
      );

      // Start of first sub period
      expect(() => {
        rts._subPeriod(new Date("2000-01-31T23:59:59.999Z"));
      }).toThrow(
        new Error(
          "UNALLOCATED_DATE: There is no sub period associated with the specified date.",
        ),
      );
      expect(rts._subPeriod(new Date("2000-02-01T00:00:00.000Z"))).toBe(1);

      // End of first sub period
      expect(rts._subPeriod(new Date("2000-05-31T23:59:59.999Z"))).toBe(1);
      expect(() => {
        rts._subPeriod(new Date("2000-06-01T00:00:00.000Z"));
      }).toThrow(
        new Error(
          "UNALLOCATED_DATE: There is no sub period associated with the specified date.",
        ),
      );

      // Start of second sub period
      expect(() => {
        rts._subPeriod(new Date("2000-07-31T23:59:59.999Z"));
      }).toThrow(
        new Error(
          "UNALLOCATED_DATE: There is no sub period associated with the specified date.",
        ),
      );
      expect(rts._subPeriod(new Date("2000-08-01T00:00:00.000Z"))).toBe(2);

      // End of second sub period
      expect(rts._subPeriod(new Date("2000-11-30T23:59:59.999Z"))).toBe(2);
      expect(() => {
        rts._subPeriod(new Date("2000-12-01T00:00:00.000Z"));
      }).toThrow(
        new Error(
          "UNALLOCATED_DATE: There is no sub period associated with the specified date.",
        ),
      );

      // End of base period
      expect(() => {
        rts._subPeriod(new Date("2000-12-31T23:59:59.999Z"));
      }).toThrow(
        new Error(
          "UNALLOCATED_DATE: There is no sub period associated with the specified date.",
        ),
      );
    });

    it("should return correctly for seconds (bpn > 1)", () => {
      const rts = chronology.regular({
        basePeriod: [2, "s"],
        subPeriods: 2,
        subPeriodBoundaries(bpStart, bpEnd, spNum) {
          // Sub period 1 runs 100 to 900
          // Sub period 2 runs 1100 to 1900
          if (spNum === 1) {
            return {
              start: moment.utc(bpStart).add(100, "ms").toDate(),
              end: moment.utc(bpStart).add(900, "ms").toDate(),
            };
          }
          return {
            start: moment.utc(bpStart).add(1100, "ms").toDate(),
            end: moment.utc(bpStart).add(1900, "ms").toDate(),
          };
        },
      });

      // Start of base period
      expect(() => {
        rts._subPeriod(new Date("2000-01-01T00:00:00.000Z"));
      }).toThrow(
        new Error(
          "UNALLOCATED_DATE: There is no sub period associated with the specified date.",
        ),
      );

      // Start of first sub period
      expect(() => {
        rts._subPeriod(new Date("2000-01-01T00:00:00.099Z"));
      }).toThrow(
        new Error(
          "UNALLOCATED_DATE: There is no sub period associated with the specified date.",
        ),
      );
      expect(rts._subPeriod(new Date("2000-01-01T00:00:00.100Z"))).toBe(1);

      // End of first sub period
      expect(rts._subPeriod(new Date("2000-01-01T00:00:00.899Z"))).toBe(1);
      expect(() => {
        rts._subPeriod(new Date("2000-01-01T00:00:00.900Z"));
      }).toThrow(
        new Error(
          "UNALLOCATED_DATE: There is no sub period associated with the specified date.",
        ),
      );

      // Start of second sub period
      expect(() => {
        rts._subPeriod(new Date("2000-01-01T00:00:01.099Z"));
      }).toThrow(
        new Error(
          "UNALLOCATED_DATE: There is no sub period associated with the specified date.",
        ),
      );
      expect(rts._subPeriod(new Date("2000-01-01T00:00:01.100Z"))).toBe(2);

      // End of second sub period
      expect(rts._subPeriod(new Date("2000-01-01T00:00:01.899Z"))).toBe(2);
      expect(() => {
        rts._subPeriod(new Date("2000-01-01T00:00:01.900Z"));
      }).toThrow(
        new Error(
          "UNALLOCATED_DATE: There is no sub period associated with the specified date.",
        ),
      );

      // End of base period
      expect(() => {
        rts._subPeriod(new Date("2000-01-01T00:00:01.999Z"));
      }).toThrow(
        new Error(
          "UNALLOCATED_DATE: There is no sub period associated with the specified date.",
        ),
      );
    });
  });

  describe("for a large but operable number of sub periods", () => {
    it("should return correctly for years (bpn = 1)", () => {
      const rts = chronology.regular({
        basePeriod: [1, "y"],
        subPeriods: 365 * 24 * 60 * 60 * 1000,
        // Uniform sub period boundaries
      });

      // For a non-leap year, every ms advance should increment sub period by 1
      const d = moment(new Date("2001-01-01T00:00:00.000Z"));
      for (let i = 1; i <= 50; i += 1) {
        expect(rts._subPeriod(d.toDate())).toBe(i);
        d.add(1, "ms");
      }
    });

    it("should return correctly for seconds (bpn > 1)", () => {
      const rts = chronology.regular({
        basePeriod: [2, "s"],
        subPeriods: 2000,
        // Uniform sub period boundaries
      });

      // Every ms advance should increment sub period by 1, returning to 1 after 2000
      const d = moment(new Date("2001-01-01T00:00:01.950Z"));
      for (let i = 1951; i <= 2100; i += 1) {
        expect(rts._subPeriod(d.toDate())).toBe(((i - 1) % 2000) + 1);
        d.add(1, "ms");
      }
    });
  });

  describe("for a too-frequent number of sub periods", () => {
    it("should throw if options.subPeriodBoundaries() returns null/null", () => {
      const rts = chronology.regular({
        basePeriod: [1, "y"],
        // eslint-disable-next-line no-unused-vars
        subPeriodBoundaries(bpStart, bpEnd, spNum) {
          return { start: null, end: null };
        },
      });
      expect(() => {
        rts._subPeriod(new Date(0), 1);
      }).toThrow(
        new Error(
          "INSUFFICIENT_PRECISION: Cannot calculate sub period date boundaries at sub-millisecond precision.",
        ),
      );
    });

    it("should throw if internally-calcualted effective frequency is too high", () => {
      const rts = chronology.regular({
        basePeriod: [1, "y"],
        subPeriods: 365 * 24 * 60 * 60 * 1000 + 1,
      });
      expect(() => {
        rts._subPeriod(new Date(0), 1);
      }).toThrow(
        new Error(
          "INSUFFICIENT_PRECISION: Cannot calculate sub period date boundaries at sub-millisecond precision.",
        ),
      );
    });
  });
});

describe("The regular._indexInsertLocation() function", () => {
  // Tested thoroughly on period.obs.set()
});

describe("The regular._indexLocation() function", () => {
  // Tested thoroughly on period.obs.clear()
});

describe("The regular._comparePeriods() function", () => {
  // Near-trivial and tested thoroughly via other functions
});

// Public functions

describe("The regular.type() function", () => {
  it("should return 'regular'", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    expect(rts.type()).toBe("regular");
  });
});

describe("The regular.basePeriod() function", () => {
  it("should return the base period", () => {
    const rts = chronology.regular({ basePeriod: [2, "w"] });
    expect(rts.basePeriod()).toEqual([2, "w"]);
  });
});

describe("The regular.anchor() function", () => {
  it("should return the anchor", () => {
    const rts = chronology.regular({
      basePeriod: [1, "y"],
      anchor: new Date("1990-01-01T00:00:00.000Z"),
    });
    expect(rts.anchor()).toEqual(new Date("1990-01-01T00:00:00.000Z"));
  });
});

describe("The regular.subPeriods() function", () => {
  it("should return sub periods", () => {
    const rts = chronology.regular({
      basePeriod: [1, "y"],
      subPeriods: 999,
    });
    expect(rts.subPeriods()).toBe(999);
  });
});

describe("The regular.period() function", () => {
  describe("errors", () => {
    it("should throw on invalid usage", () => {
      const rts = chronology.regular({ basePeriod: [1, "y"] });
      expect(() => {
        rts.period();
      }).toThrow(new Error("INVALID_ARGUMENT: Invalid number of arguments."));
    });

    describe("for period(date) usage", () => {
      it("should throw on invalid date", () => {
        const rts = chronology.regular({ basePeriod: [1, "y"] });
        expect(() => {
          rts.period("junk");
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid date."));
      });

      it("should throw on unallocated date", () => {
        const rts = chronology.regular({
          basePeriod: [1, "y"],
          // eslint-disable-next-line no-unused-vars
          subPeriodBoundaries(bpStart, bpEnd, spNum) {
            return {
              start: bpStart,
              end: new Date(bpStart.getTime() + 1),
            };
          },
        });
        expect(() => {
          rts.period(new Date("2000-01-01T00:00:00.001Z"));
        }).toThrow(
          new Error(
            "UNALLOCATED_DATE: There is no sub period associated with the specified date.",
          ),
        );
      });

      it("should throw on too-frequent (internal)", () => {
        const rts = chronology.regular({
          basePeriod: [1, "ms"],
          subPeriods: 2,
        });
        expect(() => {
          rts.period(new Date(0));
        }).toThrow(
          new Error(
            "INSUFFICIENT_PRECISION: Cannot calculate sub period date boundaries at sub-millisecond precision.",
          ),
        );
      });

      it("should throw on too-frequent (options.subPeriodBoundaries)", () => {
        const rts = chronology.regular({
          basePeriod: [1, "y"],
          // eslint-disable-next-line no-unused-vars
          subPeriodBoundaries(bpStart, bpEnd, spNum) {
            return {
              start: null,
              end: null,
            };
          },
        });
        expect(() => {
          rts.period(new Date(0));
        }).toThrow(
          new Error(
            "INSUFFICIENT_PRECISION: Cannot calculate sub period date boundaries at sub-millisecond precision.",
          ),
        );
      });
    });

    describe("for period(basePeriodDate, subPeriod) usage", () => {
      it("should throw on invalid basePeriodDate", () => {
        const rts = chronology.regular({ basePeriod: [1, "y"] });
        expect(() => {
          rts.period("junk", 1);
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid basePeriodDate."));
      });

      it("should throw on invalid subPeriod - type", () => {
        const rts = chronology.regular({ basePeriod: [1, "y"] });
        expect(() => {
          rts.period(new Date(), 1.1);
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid subPeriod."));
      });

      it("should throw on invalid subPeriod - too low", () => {
        const rts = chronology.regular({ basePeriod: [1, "y"] });
        expect(() => {
          rts.period(new Date(), 0);
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid subPeriod."));
      });

      it("should throw on invalid subPeriod - too high", () => {
        const rts = chronology.regular({ basePeriod: [1, "y"] });
        expect(() => {
          rts.period(new Date(), 2);
        }).toThrow(new Error("INVALID_ARGUMENT: Invalid subPeriod."));
      });
    });
  });

  describe("success", () => {
    it("should return an object for period(date) usage", () => {
      const rts = chronology.regular({
        basePeriod: [1, "y"],
        anchor: new Date(0),
      });
      const period = rts.period(new Date(0));
      expect(period).toBeInstanceOf(Object);

      // State
      expect(period._series).toBe(rts);
      expect(period._basePeriodIndex).toBe(0);
      expect(period._subPeriod).toBe(1);
      expect(period._basePeriodBoundaries).toBeNull();
      expect(period._subPeriodBoundaries).toBeNull();
    });

    it("should return an object for period(basePeriodDate, subPeriod) usage", () => {
      const rts = chronology.regular({
        basePeriod: [1, "y"],
        anchor: new Date(0),
      });
      const period = rts.period(new Date(0), 1);
      expect(period).toBeInstanceOf(Object);

      // State
      expect(period._series).toBe(rts);
      expect(period._basePeriodIndex).toBe(0);
      expect(period._subPeriod).toBe(1);
      expect(period._basePeriodBoundaries).toBeNull();
      expect(period._subPeriodBoundaries).toBeNull();
    });
  });
});

describe("The regular.count() function", () => {
  it("should return correctly", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    expect(rts.count()).toBe(0);
    let p = rts.period(new Date("2000-01-01Z"));
    p.obs.set("123");
    expect(rts.count()).toBe(1);
    p = p.forward();
    p.obs.set("123");
    expect(rts.count()).toBe(2);
    p.obs.clear();
    expect(rts.count()).toBe(1);
  });
});

describe("The regular.first() function", () => {
  it("should throw if no observations", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    expect(() => {
      rts.first();
    }).toThrow(new Error("MISSING: There are no observations."));
  });

  it("should return the earliest observation", () => {
    // Set up the test so that the base index of the first observation
    // is greater in lex terms than others (9 vs 10), and so the sub period number
    // of the first observation is greater in lex terms than others in the base
    // period (again 9 vs 10)
    const rts = chronology.regular({
      basePeriod: [1, "y"],
      subPeriods: 10, // Uniform
    });
    rts
      .period(new Date("2009-11-01T00:00:00.000Z"))
      .obs.set("val1") // bpi = 9   spn=9
      .forward(1)
      .obs.set("val2") // bpi = 9   spn=10
      .forward(1)
      .obs.set("val3"); // bpi = 10  spn=1
    expect(rts.first().obs.value()).toEqual("val1");
  });

  it("should return the correct data structure", () => {
    const rts = chronology.regular({
      basePeriod: [1, "y"],
      subPeriods: 2,
      anchor: new Date("2000-01-01T00:00:00.000Z"),
      subPeriodBoundaries(bpStart, bpEnd, spNum) {
        // Break the year in half at July 1
        if (spNum === 1) {
          return {
            start: bpStart,
            end: moment.utc(bpStart).add(6, "M").toDate(),
          };
        }
        return {
          start: moment.utc(bpStart).add(6, "M").toDate(),
          end: bpEnd,
        };
      },
    });
    rts.period(new Date("2003-01-01T00:00:00.000Z")).obs.set("val1");
    rts.period(new Date("2002-01-01T00:00:00.000Z")).obs.set("val2");
    rts.period(new Date("2001-01-01T00:00:00.000Z")).obs.set("val3");
    rts.period(new Date("2000-09-01T00:00:00.000Z")).obs.set("val4");
    const first = rts.first();

    expect(first).toBeInstanceOf(Object);
    expect(first._series).toBe(rts);
    expect(first._basePeriodIndex).toBe(0);
    expect(first._subPeriod).toBe(2);
    expect(first._basePeriodBoundaries).toBeNull();
    expect(first._subPeriodBoundaries).toBeNull();
  });
});

describe("The regular.last() function", () => {
  it("should throw if no observations", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    expect(() => {
      rts.last();
    }).toThrow(new Error("MISSING: There are no observations."));
  });

  it("should return the latest observation", () => {
    // Set up the test so that the base index of the last observation
    // is lower in lex terms than others (10 vs 9), and so the sub period number
    // of the last observation is greater in lex terms than others in the base
    // period (again 10 vs 9)
    const rts = chronology.regular({
      basePeriod: [1, "y"],
      subPeriods: 10, // Uniform
    });
    rts.period(new Date("2009-01-01T00:00:00.000Z")).obs.set("val1"); // bpi = 9   spn=1
    rts.period(new Date("2010-11-01T00:00:00.000Z")).obs.set("val2"); // bpi = 10  spn=9
    rts.period(new Date("2010-12-01T00:00:00.000Z")).obs.set("val3"); // bpi = 10  spn=10
    // Difficult to validate start/end dates with this setup
    // Just check the value here and check overall structure in the next test
    expect(rts.last().obs.value()).toEqual("val3");
  });

  it("should return the correct data structure", () => {
    const rts = chronology.regular({
      basePeriod: [1, "y"],
      subPeriods: 2,
      anchor: new Date("2000-01-01T00:00:00.000Z"),
      subPeriodBoundaries(bpStart, bpEnd, spNum) {
        // Break the year in half at July 1
        if (spNum === 1) {
          return {
            start: bpStart,
            end: moment.utc(bpStart).add(6, "M").toDate(),
          };
        }
        return {
          start: moment.utc(bpStart).add(6, "M").toDate(),
          end: bpEnd,
        };
      },
    });
    rts.period(new Date("2003-01-01T00:00:00.000Z")).obs.set("val1");
    rts.period(new Date("2002-01-01T00:00:00.000Z")).obs.set("val2");
    rts.period(new Date("2001-01-01T00:00:00.000Z")).obs.set("val3");
    rts.period(new Date("2000-09-01T00:00:00.000Z")).obs.set("val4");
    const last = rts.last();

    expect(last).toBeInstanceOf(Object);
    expect(last._series).toBe(rts);
    expect(last._basePeriodIndex).toBe(3);
    expect(last._subPeriod).toBe(1);
    expect(last._basePeriodBoundaries).toBeNull();
    expect(last._subPeriodBoundaries).toBeNull();
  });
});

describe("The regular.each() function", () => {
  it("should throw on invalid function argument", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    expect(() => {
      rts.each("junk");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid function."));
  });

  it("should not call the argument function if there are no observations", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    const spy = jest.fn();
    rts.each(spy);
    expect(spy.mock.calls.length).toBe(0);
  });

  it("should call the argument function once if there is one observation", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    const period = rts.period(new Date()).obs.set({ a: 1 }); // Object
    const spy = jest.fn();
    rts.each(spy);

    expect(spy.mock.calls.length).toBe(1);
    expect(spy.mock.calls[0].length).toBe(1);
    const calledPeriod = spy.mock.calls[0][0];
    expect(calledPeriod._basePeriodIndex).toEqual(period._basePeriodIndex);
    expect(calledPeriod._subPeriod).toEqual(period._subPeriod);
    expect(calledPeriod.obs.value()).toBe(period.obs.value());
  });

  it("should call the argument function N times if there are N observations", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    let period = rts.period(new Date());
    for (let i = 0; i < 10; i += 1) {
      period.obs.set(i);
      period = period.forward(10);
    }

    const spy = jest.fn();
    rts.each(spy);

    expect(spy.mock.calls.length).toBe(10);
    for (let i = 0; i < spy.mock.calls.length; i += 1) {
      expect(spy.mock.calls[0].length).toBe(1);
      expect(spy.mock.calls[i][0].obs.value()).toBe(i);
    }
  });

  it("should cascade errors thrown by the argument function", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    rts.period(new Date()).obs.set("123");
    expect(() => {
      rts.each(() => {
        throw new Error("APP_ERROR");
      });
    }).toThrow(new Error("APP_ERROR"));
  });

  it("should iterate over later observations added during iteration", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    rts.period(new Date()).obs.set("123");

    let callCount = 0;
    rts.each((period) => {
      if (callCount === 0) {
        period.forward().obs.set("456");
      }
      callCount += 1;
    });
    expect(callCount).toBe(2);
  });

  it("should not iterate over earlier observations added during iteration", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    rts.period(new Date()).obs.set("123");

    let callCount = 0;
    rts.each((period) => {
      if (callCount === 0) {
        period.back().obs.set("456");
      }
      callCount += 1;
    });
    expect(callCount).toBe(1);
  });

  it("should return a reference to the series", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    expect(rts.each(() => {})).toBe(rts);
  });
});

describe("The regular.eachPeriod() function", () => {
  it("should throw on invalid function argument", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    expect(() => {
      rts.eachPeriod("junk");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid function."));
  });

  it("should not call the argument function if there are no observations", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    const spy = jest.fn();
    rts.eachPeriod(spy);
    expect(spy.mock.calls.length).toBe(0);
  });

  it("should call the argument function once if there is one observation", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    const period = rts.period(new Date()).obs.set({ a: 1 }); // Object
    const spy = jest.fn();
    rts.eachPeriod(spy);

    expect(spy.mock.calls.length).toBe(1);
    expect(spy.mock.calls[0].length).toBe(1);
    const calledPeriod = spy.mock.calls[0][0];
    expect(calledPeriod._basePeriodIndex).toEqual(period._basePeriodIndex);
    expect(calledPeriod._subPeriod).toEqual(period._subPeriod);
    expect(calledPeriod.obs.value()).toBe(period.obs.value());
  });

  it("should call the argument function N times if there are N-2 periods between 2 observations", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    let period = rts.period(new Date());
    period.obs.set("123");
    period = period.forward(9);
    period.obs.set("456");

    const spy = jest.fn();
    rts.eachPeriod(spy);

    expect(spy.mock.calls.length).toBe(10);
    for (let i = 0; i < spy.mock.calls.length; i += 1) {
      expect(spy.mock.calls[i].length).toBe(1);
    }
  });

  it("should cascade errors thrown by the argument function", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    rts.period(new Date()).obs.set("123");
    expect(() => {
      rts.eachPeriod(() => {
        throw new Error("APP_ERROR");
      });
    }).toThrow(new Error("APP_ERROR"));
  });

  it("should iterate over later periods added during iteration", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    rts.period(new Date()).obs.set("123");

    let callCount = 0;
    rts.eachPeriod((period) => {
      if (callCount === 0) {
        period.forward(5).obs.set("456");
      }
      callCount += 1;
    });
    expect(callCount).toBe(6);
  });

  it("should not iterate over earlier periods added during iteration", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    rts.period(new Date()).obs.set("123");

    let callCount = 0;
    rts.eachPeriod((period) => {
      if (callCount === 0) {
        period.back(5).obs.set("456");
      }
      callCount += 1;
    });
    expect(callCount).toBe(1);
  });

  it("should return a reference to the series", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    expect(rts.eachPeriod(() => {})).toBe(rts);
  });
});

describe("The regular.map() function", () => {
  it("should throw on invalid function argument", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    expect(() => {
      rts.map("junk");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid function."));
  });

  it("should cascade errors thrown by the argument function", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    rts.period(new Date()).obs.set("123");
    expect(() => {
      rts.map(() => {
        throw new Error("APP_ERROR");
      });
    }).toThrow(new Error("APP_ERROR"));
  });

  it("should return an empty series there are no observations", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    const newSeries = rts.map((val) => val);
    expect(newSeries._index.length).toBe(0);
  });

  it("should return a transformed series if there are observations", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    let period = rts.period(new Date());
    for (let i = 0; i < 10; i += 1) {
      period.obs.set(i);
      period = period.forward();
    }

    const newSeries = rts.map((val) => val * 2);

    let newPeriod = newSeries.first();
    for (let i = 0; i < 10; i += 1) {
      expect(newPeriod.obs.value()).toBe(2 * i);
      newPeriod = newPeriod.forward();
    }
  });
});

describe("The regular.transform() function", () => {
  it("should throw on invalid function argument", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    expect(() => {
      rts.transform("junk");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid function."));
  });

  it("should cascade errors thrown by the argument function", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    rts.period(new Date()).obs.set("123");
    expect(() => {
      rts.transform(() => {
        throw new Error("APP_ERROR");
      });
    }).toThrow(new Error("APP_ERROR"));
  });

  it("should return an empty series there are no observations", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    const newSeries = rts.transform((val) => val);
    expect(newSeries._index.length).toBe(0);
  });

  it("should return a transformed series if there are observations", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    let period = rts.period(new Date(0));
    for (let i = 0; i < 10; i += 1) {
      period.obs.set(i);
      period = period.forward();
    }

    const newSeries = rts.transform((pOld, pNew) => {
      pNew.obs.set(pOld.obs.value() * 2);
    });

    let newPeriod = newSeries.period(new Date(0));
    for (let i = 0; i < 10; i += 1) {
      expect(newPeriod.obs.value()).toBe(2 * i);
      newPeriod = newPeriod.forward();
    }
  });
});

describe("The regular.reduce() function", () => {
  it("should throw on invalid function argument", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    expect(() => {
      rts.reduce("junk", 1);
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid function."));
  });

  it("should throw on missing initial value argument", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    expect(() => {
      rts.reduce(() => 0);
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid initialAccumulator."));
  });

  it("should cascade errors thrown by the argument function", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    rts.period(new Date()).obs.set("123");
    expect(() => {
      rts.reduce(() => {
        throw new Error("APP_ERROR");
      }, 1);
    }).toThrow(new Error("APP_ERROR"));
  });

  it("should return the initial value if there are no observations", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    const result = rts.reduce(() => 0, "abc");
    expect(result).toBe("abc");
  });

  it("should return a result if there are observations", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    let period = rts.period(new Date(0));
    for (let i = 0; i < 10; i += 1) {
      period.obs.set(i);
      period = period.forward();
    }

    // Sum
    const result = rts.reduce((a, p) => a + p.obs.value(), 0);

    expect(result).toBe(45);
  });
});

describe("The regular.filter() function", () => {
  it("should throw on invalid function argument", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    expect(() => {
      rts.filter("junk");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid function."));
  });

  it("should cascade errors thrown by the argument function", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    rts.period(new Date()).obs.set("123");
    expect(() => {
      rts.filter(() => {
        throw new Error("APP_ERROR");
      });
    }).toThrow(new Error("APP_ERROR"));
  });

  it("should return an empty series there are no observations", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    const newSeries = rts.filter(() => true);
    expect(newSeries._index.length).toBe(0);
  });

  it("should return a filtered series if there are observations", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    let period = rts.period(new Date(0));
    for (let i = 0; i < 10; i += 1) {
      period.obs.set(i);
      period = period.forward();
    }

    const newSeries = rts.filter((p) => p.obs.value() < 5);

    let newPeriod = newSeries.period(new Date(0));
    for (let i = 0; i < 5; i += 1) {
      expect(newPeriod.obs.value()).toBe(i);
      newPeriod = newPeriod.forward();
    }
    for (let i = 5; i < 10; i += 1) {
      expect(newPeriod.obs.exists()).toBe(false);
      newPeriod = newPeriod.forward();
    }
  });
});

describe("The regular.subSeries() function", () => {
  it("should throw on invalid start type", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    expect(() => {
      rts.subSeries("junk", rts.period(new Date("2000-01-01")));
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid start or end period."));
  });

  it("should throw on invalid end type", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    expect(() => {
      rts.subSeries(rts.period(new Date("2000-01-01")), "junk");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid start or end period."));
  });

  it("should throw on non-associated start period", () => {
    const rts1 = chronology.regular({ basePeriod: [1, "y"] });
    const rts2 = chronology.regular({ basePeriod: [1, "y"] });
    expect(() => {
      rts1.subSeries(
        rts2.period(new Date("2000-01-01")),
        rts1.period(new Date("2000-01-01")),
      );
    }).toThrow(
      new Error(
        "INVALID_ARGUMENT: Start or end period is associated with a different time series.",
      ),
    );
  });

  it("should throw on non-associated end period", () => {
    const rts1 = chronology.regular({ basePeriod: [1, "y"] });
    const rts2 = chronology.regular({ basePeriod: [1, "y"] });
    expect(() => {
      rts1.subSeries(
        rts1.period(new Date("2000-01-01")),
        rts2.period(new Date("2000-01-01")),
      );
    }).toThrow(
      new Error(
        "INVALID_ARGUMENT: Start or end period is associated with a different time series.",
      ),
    );
  });

  it("should throw if start is after end", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    expect(() => {
      rts.subSeries(
        rts.period(new Date("2000-01-01")),
        rts.period(new Date("1999-01-01")),
      );
    }).toThrow(
      new Error(
        "INVALID_ARGUMENT: Start period must not be later than end period.",
      ),
    );
  });

  it("should return a correct sub series with multiple observations", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    let period = rts.period(new Date("2000-01-01"));
    for (let i = 0; i < 10; i += 1) {
      period.obs.set(i);
      period = period.forward();
    }
    const subSeries = rts.subSeries(
      rts.period(new Date("2003-01-01")),
      rts.period(new Date("2006-01-01")),
    );
    expect(subSeries.first().start()).toEqual(new Date("2003-01-01"));
    expect(subSeries.last().start()).toEqual(new Date("2006-01-01"));
    expect(subSeries.period(new Date("2003-01-01")).obs.value()).toBe(3);
    expect(subSeries.period(new Date("2004-01-01")).obs.value()).toBe(4);
    expect(subSeries.period(new Date("2005-01-01")).obs.value()).toBe(5);
    expect(subSeries.period(new Date("2006-01-01")).obs.value()).toBe(6);
  });

  it("should return a correct sub series with one observation", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    let period = rts.period(new Date("2000-01-01"));
    for (let i = 0; i < 10; i += 1) {
      period.obs.set(i);
      period = period.forward();
    }
    const subSeries = rts.subSeries(
      rts.period(new Date("2003-01-01")),
      rts.period(new Date("2003-01-01")),
    );
    expect(subSeries.first().start()).toEqual(new Date("2003-01-01"));
    expect(subSeries.last().start()).toEqual(new Date("2003-01-01"));
    expect(subSeries.period(new Date("2003-01-01")).obs.value()).toBe(3);
  });
});

describe("The regular.overlay() function", () => {
  it("should throw on invalid argument type", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    expect(() => {
      rts.overlay("junk");
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid time series."));
  });

  it("should return as expected", () => {
    const rts1 = chronology.regular({ basePeriod: [1, "y"] });
    rts1.period(new Date("2000-01-01")).obs.set(1);
    rts1.period(new Date("2001-01-01")).obs.set(1);
    rts1.period(new Date("2002-01-01")).obs.set(1);
    let rts2 = chronology.regular({ basePeriod: [1, "y"] });
    rts2.period(new Date("2001-01-01")).obs.set(2);
    rts2 = rts1.overlay(rts2);
    expect(rts2.first().start()).toEqual(new Date("2000-01-01"));
    expect(rts2.last().start()).toEqual(new Date("2002-01-01"));
    expect(rts2.period(new Date("2000-01-01")).obs.value()).toBe(1);
    expect(rts2.period(new Date("2001-01-01")).obs.value()).toBe(2);
    expect(rts2.period(new Date("2002-01-01")).obs.value()).toBe(1);
  });
});

describe("The regular.clone() function", () => {
  it("should return as expected", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    rts.period(new Date("2000-01-01")).obs.set(1);
    rts.period(new Date("2001-01-01")).obs.set(2);
    rts.period(new Date("2002-01-01")).obs.set(3);
    const rts2 = rts.clone();
    expect(rts2.first().start()).toEqual(new Date("2000-01-01"));
    expect(rts2.last().start()).toEqual(new Date("2002-01-01"));
    expect(rts2.period(new Date("2000-01-01")).obs.value()).toBe(1);
    expect(rts2.period(new Date("2001-01-01")).obs.value()).toBe(2);
    expect(rts2.period(new Date("2002-01-01")).obs.value()).toBe(3);
  });
});

describe("The regular.reset() function", () => {
  it("should clear all observations", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    rts.period(new Date()).obs.set("123");

    // Count
    expect(rts.reduce((a, p) => a + 1, 0)).toBe(1); // eslint-disable-line no-unused-vars

    // Reset
    expect(rts.reset()).toBeInstanceOf(Object);

    // Count and check data directly
    expect(rts.reduce((a, p) => a + 1, 0)).toBe(0); // eslint-disable-line no-unused-vars
    expect(rts._obs).toEqual({});
    expect(rts._index).toEqual([]);

    // Make sure you can add observations again (didn't break anything)
    rts.period(new Date()).obs.set("123");

    // Count
    expect(rts.reduce((a, p) => a + 1, 0)).toBe(1); // eslint-disable-line no-unused-vars
  });
});

describe("The regular.serialize() function", () => {
  it("should throw on undefined", () => {
    const rts = chronology.regular({
      basePeriod: [1, "MS"],
      anchor: new Date(123), // Local date still yields UTC serialization below
      subPeriods: 2,
    });

    const period = rts.period(new Date(0), 1);
    period.obs.set(undefined);

    expect(() => {
      rts.serialize();
    }).toThrow(
      new Error(
        "NOT_SERIALIZABLE: One or more observation values is not JSON-expressible.",
      ),
    );
  });

  it("should throw on circular reference", () => {
    const rts = chronology.regular({
      basePeriod: [1, "MS"],
      anchor: new Date(123), // Local date still yields UTC serialization below
      subPeriods: 2,
    });

    const a = {};
    a.b = a;

    const period = rts.period(new Date(0), 1);
    period.obs.set(a);

    expect(() => {
      rts.serialize();
    }).toThrow(
      new Error(
        "NOT_SERIALIZABLE: One or more observation values is not JSON-expressible.",
      ),
    );
  });

  it("should serialize successfully with no observations", () => {
    const rts = chronology.regular({
      basePeriod: [1, "y"],
      anchor: new Date("1970-01-01T00:00:00.000Z"),
      subPeriods: 1,
    });

    expect(JSON.parse(rts.serialize())).toEqual({
      JsonTs: "regular",
      BasePeriod: [1, "y"],
      Anchor: "1970Z",
      SubPeriods: 1,
      Observations: [],
    });
  });

  it("should serialize compactly with subPeriods = 1", () => {
    const rts = chronology.regular({
      basePeriod: [1, "y"],
      anchor: new Date("1970-01-01T00:00:00.000Z"),
      subPeriods: 1,
    });

    let period = rts.period(new Date(0), 1);
    period.obs.set(123);
    period = period.forward();
    period.obs.set(456);
    period = period.forward(2);
    period.obs.set(789);
    period = period.forward();
    period.obs.set({ an: "object" });
    period = period.forward(2);
    period.obs.set("a string");
    period = period.forward();
    period.obs.set(["an array"]);

    const ser = rts.serialize();

    expect(JSON.parse(ser)).toEqual({
      JsonTs: "regular",
      BasePeriod: [1, "y"],
      Anchor: "1970Z",
      SubPeriods: 1,
      Observations: [
        ["1970Z", 123],
        [456],
        ["1973Z", 789],
        [{ an: "object" }],
        ["1976Z", "a string"],
        [["an array"]],
      ],
    });
  });

  it("should serialize compactly with subPeriods > 1", () => {
    const rts = chronology.regular({
      basePeriod: [1, "MS"],
      anchor: new Date(123), // Local date still yields UTC serialization below
      subPeriods: 2,
    });

    let period = rts.period(new Date(0), 1);
    period.obs.set(123);
    period = period.forward();
    period.obs.set(456);
    period = period.forward(2);
    period.obs.set(789);
    period = period.forward();
    period.obs.set({ an: "object" });
    period = period.forward(2);
    period.obs.set("a string");
    period = period.forward();
    period.obs.set(["an array"]);

    const ser = rts.serialize();

    expect(JSON.parse(ser)).toEqual({
      JsonTs: "regular",
      BasePeriod: [1, "ms"],
      Anchor: "1970-01-01T00:00:00.123Z",
      SubPeriods: 2,
      Observations: [
        ["1970Z", 1, 123],
        [456],
        ["1970-01-01T00:00:00.001Z", 2, 789],
        [{ an: "object" }],
        ["1970-01-01T00:00:00.003Z", 1, "a string"],
        [["an array"]],
      ],
    });
  });
});

// RegularPeriod objects

describe("The regularPeriod._getBoundaries() function", () => {
  it("the period should have no boundaries on initialization", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    const period = rts.period(new Date(0));
    expect(period._basePeriodBoundaries).toBeNull();
  });

  it("the period should have boundaries after function call", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    const period = rts.period(new Date(0));
    period._getBoundaries();
    expect(period._basePeriodBoundaries).toEqual({
      start: new Date("1970-01-01T00:00:00.000Z"),
      end: new Date("1971-01-01T00:00:00.000Z"),
    });
    expect(period._subPeriodBoundaries).toEqual({
      start: new Date("1970-01-01T00:00:00.000Z"),
      end: new Date("1971-01-01T00:00:00.000Z"),
    });
  });
});

describe("The regularPeriod.series() function", () => {
  it("should return the series", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    const period = rts.period(new Date(0));
    expect(period.series()).toBe(rts);
  });
});

describe("The regularPeriod.start() function", () => {
  it("should return null if too-frequent (internal)", () => {
    const rts = chronology.regular({
      basePeriod: [1, "ms"],
      subPeriods: 2,
    });
    const period = rts.period(new Date(0), 2);
    expect(period.start()).toBeNull();
  });

  it("should return null if too-frequent (options.subPeriodBoundaries)", () => {
    const rts = chronology.regular({
      basePeriod: [1, "ms"],
      // eslint-disable-next-line no-unused-vars
      subPeriodBoundaries(bpStart, bpEnd, spNum) {
        return { start: null, end: null };
      },
    });
    const period = rts.period(new Date(0), 1);
    expect(period.start()).toBeNull();
  });

  it("should return the start of the sub period if possible", () => {
    const rts = chronology.regular({
      basePeriod: [1, "d"],
      subPeriods: 2, // Uniform
    });
    const period1 = rts.period(new Date(0), 1);
    expect(period1.start()).toEqual(new Date("1970-01-01T00:00:00.000Z"));
    const period2 = rts.period(new Date(0), 2);
    expect(period2.start()).toEqual(new Date("1970-01-01T12:00:00.000Z"));
  });
});

describe("The regularPeriod.end() function", () => {
  it("should return null if too-frequent (internal)", () => {
    const rts = chronology.regular({
      basePeriod: [1, "ms"],
      subPeriods: 2,
    });
    const period = rts.period(new Date(0), 2);
    expect(period.end()).toBeNull();
  });

  it("should return null if too-frequent (options.subPeriodBoundaries)", () => {
    const rts = chronology.regular({
      basePeriod: [1, "ms"],
      // eslint-disable-next-line no-unused-vars
      subPeriodBoundaries(bpStart, bpEnd, spNum) {
        return { start: null, end: null };
      },
    });
    const period = rts.period(new Date(0), 1);
    expect(period.end()).toBeNull();
  });

  it("should return the start of the sub period if possible", () => {
    const rts = chronology.regular({
      basePeriod: [1, "d"],
      subPeriods: 2, // Uniform
    });
    const period1 = rts.period(new Date(0), 1);
    expect(period1.end()).toEqual(new Date("1970-01-01T12:00:00.000Z"));
    const period2 = rts.period(new Date(0), 2);
    expect(period2.end()).toEqual(new Date("1970-01-02T00:00:00.000Z"));
  });
});

describe("The regularPeriod.basePeriodStart() function", () => {
  it("should return the start of the base period", () => {
    const rts = chronology.regular({
      basePeriod: [1, "d"],
      subPeriods: 2, // Uniform
    });
    const period1 = rts.period(new Date(0), 2);
    expect(period1.basePeriodStart()).toEqual(
      new Date("1970-01-01T00:00:00.000Z"),
    );
  });
});

describe("The regularPeriod.basePeriodEnd() function", () => {
  it("should return the end of the base period", () => {
    const rts = chronology.regular({
      basePeriod: [1, "d"],
      subPeriods: 2, // Uniform
    });
    const period1 = rts.period(new Date(0), 1);
    expect(period1.basePeriodEnd()).toEqual(
      new Date("1970-01-02T00:00:00.000Z"),
    );
  });
});

describe("The regularPeriod.subPeriod() function", () => {
  it("should return the subPeriod", () => {
    const rts = chronology.regular({
      basePeriod: [1, "d"],
      subPeriods: 2, // Uniform
    });
    const period1 = rts.period(new Date(0), 1);
    expect(period1.subPeriod()).toBe(1);
    const period2 = rts.period(new Date(0), 2);
    expect(period2.subPeriod()).toBe(2);
  });
});

describe("The regularPeriod.index() function", () => {
  it("should return correctly", () => {
    const rts = chronology.regular({
      basePeriod: [1, "d"],
      subPeriods: 2,
      anchor: new Date("1970-01-01Z"),
    });
    expect(rts.period(new Date("1969-12-30Z"), 2).index()).toBe(-3);
    expect(rts.period(new Date("1969-12-31Z"), 1).index()).toBe(-2);
    expect(rts.period(new Date("1969-12-31Z"), 2).index()).toBe(-1);
    expect(rts.period(new Date("1970-01-01Z"), 1).index()).toBe(0);
    expect(rts.period(new Date("1970-01-01Z"), 2).index()).toBe(1);
    expect(rts.period(new Date("1970-01-02Z"), 1).index()).toBe(2);
    expect(rts.period(new Date("1970-01-02Z"), 2).index()).toBe(3);
  });
});

describe("The regularPeriod.forward() function", () => {
  it("should throw on invalid num", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    const period = rts.period(new Date());
    expect(() => {
      period.forward(1.1);
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid number of periods."));
  });

  it("should work with subPeriods = 1", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    let period = rts.period(new Date("1970-01-01Z"));

    period = period.forward(0);
    expect(period.start()).toEqual(new Date("1970-01-01Z"));

    period = period.forward(); // Default to 1
    expect(period.start()).toEqual(new Date("1971-01-01Z"));

    period = period.forward(2);
    expect(period.start()).toEqual(new Date("1973-01-01Z"));

    period = period.forward(3);
    expect(period.start()).toEqual(new Date("1976-01-01Z"));

    period = period.forward(-6);
    expect(period.start()).toEqual(new Date("1970-01-01Z"));

    period = period.forward(-10);
    expect(period.start()).toEqual(new Date("1960-01-01Z"));
  });

  it("should work with subPeriods > 1", () => {
    const rts = chronology.regular({
      basePeriod: [1, "d"],
      subPeriods: 2, // Uniform
    });
    let period = rts.period(new Date("1970-01-01T00:00:00.000Z"));

    period = period.forward(0);
    expect(period.start()).toEqual(new Date("1970-01-01T00:00:00.000Z"));

    period = period.forward(); // Default to 1
    expect(period.start()).toEqual(new Date("1970-01-01T12:00:00.000Z"));

    period = period.forward(2);
    expect(period.start()).toEqual(new Date("1970-01-02T12:00:00.000Z"));

    period = period.forward(3);
    expect(period.start()).toEqual(new Date("1970-01-04T00:00:00.000Z"));

    period = period.forward(-6);
    expect(period.start()).toEqual(new Date("1970-01-01T00:00:00.000Z"));

    period = period.forward(-1);
    expect(period.start()).toEqual(new Date("1969-12-31T12:00:00.000Z"));

    period = period.forward(-2);
    expect(period.start()).toEqual(new Date("1969-12-30T12:00:00.000Z"));

    period = period.forward(-20);
    expect(period.start()).toEqual(new Date("1969-12-20T12:00:00.000Z"));
  });
});

describe("The regularPeriod.back() function", () => {
  it("should throw on invalid num", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    const period = rts.period(new Date());
    expect(() => {
      period.back(1.1);
    }).toThrow(new Error("INVALID_ARGUMENT: Invalid number of periods."));
  });

  it("should work with subPeriods = 1", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    let period = rts.period(new Date("1970-01-01Z"));

    period = period.back(0);
    expect(period.start()).toEqual(new Date("1970-01-01Z"));

    period = period.back(); // Default to 1
    expect(period.start()).toEqual(new Date("1969-01-01Z"));

    period = period.back(2);
    expect(period.start()).toEqual(new Date("1967-01-01Z"));

    period = period.back(3);
    expect(period.start()).toEqual(new Date("1964-01-01Z"));

    period = period.back(-6);
    expect(period.start()).toEqual(new Date("1970-01-01Z"));

    period = period.back(-10);
    expect(period.start()).toEqual(new Date("1980-01-01Z"));
  });

  it("should work with subPeriods > 1", () => {
    const rts = chronology.regular({
      basePeriod: [1, "d"],
      subPeriods: 2, // Uniform
    });
    let period = rts.period(new Date("1970-01-01T00:00:00.000Z"));

    period = period.back(0);
    expect(period.start()).toEqual(new Date("1970-01-01T00:00:00.000Z"));

    period = period.back(); // Default to 1
    expect(period.start()).toEqual(new Date("1969-12-31T12:00:00.000Z"));

    period = period.back(2);
    expect(period.start()).toEqual(new Date("1969-12-30T12:00:00.000Z"));

    period = period.back(3);
    expect(period.start()).toEqual(new Date("1969-12-29T00:00:00.000Z"));

    period = period.back(-6);
    expect(period.start()).toEqual(new Date("1970-01-01T00:00:00.000Z"));

    period = period.back(-1);
    expect(period.start()).toEqual(new Date("1970-01-01T12:00:00.000Z"));

    period = period.back(-2);
    expect(period.start()).toEqual(new Date("1970-01-02T12:00:00.000Z"));

    period = period.back(-20);
    expect(period.start()).toEqual(new Date("1970-01-12T12:00:00.000Z"));
  });
});

// RegularObs objects

describe("The regularPeriod.obs.set() function", () => {
  it("should throw if no value is specified", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    const period = rts.period(new Date());
    expect(() => {
      period.obs.set();
    }).toThrow(new Error("INVALID_ARGUMENT: No value specified."));
  });

  it("should return success if the value is explicitly undefined", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    const period = rts.period(new Date());
    expect(period.obs.set(undefined)).toBe(period);
  });

  it("should write new observations and overwrite existing observations", () => {
    const rts = chronology.regular({
      basePeriod: [1, "m"],
      anchor: new Date("1970-01-01Z"),
      subPeriods: 2,
    });
    const period0 = rts.period(new Date("1969-12-10Z"));
    period0.obs.set("SOME_VAL_0");
    const period1 = rts.period(new Date("1970-01-10Z"));
    period1.obs.set("SOME_VAL");
    const period2 = rts.period(new Date("1970-01-20Z"));
    period2.obs.set("SOME_VAL_2");
    const period3 = rts.period(new Date("1970-02-20Z"));
    period3.obs.set("SOME_VAL_3");
    period3.obs.set("SOME_VAL_4"); // Overwrite
    expect(rts._obs).toEqual({
      "-1": {
        1: "SOME_VAL_0",
      },
      0: {
        1: "SOME_VAL",
        2: "SOME_VAL_2",
      },
      1: {
        2: "SOME_VAL_4",
      },
    });
  });

  it("should update the index as appropriate", () => {
    let rts = chronology.regular({
      basePeriod: [1, "d"],
      anchor: new Date("1970-01-01T00:00:00.000Z"),
      subPeriods: 2,
    });

    let period = rts.period(new Date("1970-01-01T00:00:00.000Z"));

    expect(rts._index).toEqual([]);

    // First observation
    period.obs.set("123");
    expect(rts._index).toEqual([[0, 1]]);

    // Add to end of index
    period = period.forward(2);
    period.obs.set("123");
    expect(rts._index).toEqual([
      [0, 1],
      [1, 1],
    ]);

    // Add to middle of index
    period = period.back(1);
    period.obs.set("123");
    expect(rts._index).toEqual([
      [0, 1],
      [0, 2],
      [1, 1],
    ]);

    // Add to beginning of index
    period = period.back(2);
    period.obs.set("123");
    expect(rts._index).toEqual([
      [-1, 2],
      [0, 1],
      [0, 2],
      [1, 1],
    ]);

    // Test bisection by adding lots of observations
    rts = chronology.regular({
      basePeriod: [1, "d"],
      anchor: new Date("1970-01-01T00:00:00.000Z"),
      subPeriods: 2,
    });

    // Add to first 100 sub period 1s
    period = rts.period(new Date("1970-01-01T00:00:00.000Z"), 1);
    let expectedIndex = [];
    for (let i = 0; i < 100; i += 1) {
      period.obs.set("123");
      period = period.forward(2);
      expectedIndex.push([i, 1]);
    }
    expect(rts._index).toEqual(expectedIndex);

    // Add to first 100 sub period 2s
    period = rts.period(new Date("1970-01-01T00:00:00.000Z"), 2);
    expectedIndex = [];
    for (let i = 0; i < 100; i += 1) {
      period.obs.set("123");
      period = period.forward(2);
      expectedIndex.push([i, 1]);
      expectedIndex.push([i, 2]);
    }
    expect(rts._index).toEqual(expectedIndex);

    // Re-write all observations and make sure the index does not change
    period = rts.period(new Date("1970-01-01T00:00:00.000Z"), 1);
    while (period.obs.exists()) {
      period.obs.set("456");
      period = period.forward();
    }
    expect(rts._index).toEqual(expectedIndex);
  });

  it("should return the period object", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    const period = rts.period(new Date());
    expect(period.obs.set("abc")).toBe(period);
  });
});

describe("The regularPeriod.obs.clear() function", () => {
  it("should succeed if there is no existing value", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    const period = rts.period(new Date());
    expect(period.obs.clear()).toBe(period);
  });

  it("should be able to remove a sub period with other base period observations", () => {
    const rts = chronology.regular({
      basePeriod: [1, "y"],
      anchor: new Date("1970-01-01Z"),
      subPeriods: 2,
    });
    rts.period(new Date("1970-03-01Z")).obs.set("obs1");
    rts.period(new Date("1970-09-01Z")).obs.set("obs2").obs.clear();
    expect(rts._obs).toEqual({
      0: { 1: "obs1" },
    });
  });

  it("should be able to remove a sub period and base period", () => {
    const rts = chronology.regular({
      basePeriod: [1, "y"],
      anchor: new Date("1970-01-01Z"),
      subPeriods: 2,
    });
    rts.period(new Date("1970-09-01Z")).obs.set("obs1").obs.clear();
    expect(rts._obs).toEqual({});
  });

  it("should update the index as appropriate", () => {
    const rts = chronology.regular({
      basePeriod: [1, "d"],
      anchor: new Date("1970-01-01T00:00:00.000Z"),
      subPeriods: 2,
    });

    let period = rts.period(new Date("1970-01-01T00:00:00.000Z"));

    period.obs.set("123");
    period = period.forward();
    period.obs.set("123");
    period = period.forward();
    period.obs.set("123");
    period = period.forward();
    period.obs.set("123");

    expect(rts._index).toEqual([
      [0, 1],
      [0, 2],
      [1, 1],
      [1, 2],
    ]);

    // Remove from end
    period.obs.clear();
    expect(rts._index).toEqual([
      [0, 1],
      [0, 2],
      [1, 1],
    ]);

    // Remove from middle
    period = period.back(2);
    period.obs.clear();
    expect(rts._index).toEqual([
      [0, 1],
      [1, 1],
    ]);

    // Remove from start
    period = period.back(1);
    period.obs.clear();
    expect(rts._index).toEqual([[1, 1]]);

    // Remove last
    period = period.forward(2);
    period.obs.clear();
    expect(rts._index).toEqual([]);
  });

  it("should return a reference to the period", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    const period = rts.period(new Date());
    expect(period.obs.clear()).toBe(period);
  });
});

describe("The regularPeriod.obs.exists() function", () => {
  it("should return appropriately", () => {
    const rts = chronology.regular({
      basePeriod: [1, "y"],
      anchor: new Date("1970-01-01Z"),
      subPeriods: 2,
    });

    const period1 = rts.period(new Date("1970-01-01Z"), 1);
    const period2 = rts.period(new Date("1970-01-01Z"), 2);

    expect(period1.obs.exists()).toBe(false);
    expect(period2.obs.exists()).toBe(false);

    period2.obs.set(123);

    expect(period1.obs.exists()).toBe(false);
    expect(period2.obs.exists()).toBe(true);

    period1.obs.set(undefined); // Important to true
    period2.obs.clear();

    expect(period1.obs.exists()).toBe(true);
    expect(period2.obs.exists()).toBe(false);

    period1.obs.clear();

    expect(period1.obs.exists()).toBe(false);
    expect(period2.obs.exists()).toBe(false);
  });
});

describe("The regularPeriod.obs.value() function", () => {
  it("should throw if the observation is missing", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    expect(() => {
      rts.period(new Date()).obs.value();
    }).toThrow(new Error("MISSING: There is no observation."));
  });

  it("should return correctly otherwise", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    const period = rts.period(new Date());
    period.obs.set(undefined); // Important value to try
    expect(period.obs.value()).toBe(undefined);
  });
});

describe("The regularPeriod.obs.hasForward() function", () => {
  it("should return false if no observations", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    const period = rts.period(new Date());
    expect(period.obs.hasForward()).toBe(false);
  });

  describe("for subPeriods = 1", () => {
    it("should return false if nothing after current observation", () => {
      const rts = chronology.regular({ basePeriod: [1, "y"] });
      let period = rts.period(new Date());
      period.obs.set("123");
      period = period.forward(1);
      period.obs.set("456");
      expect(period.obs.hasForward()).toBe(false);
    });

    it("should return true if there is a next observation", () => {
      const rts = chronology.regular({ basePeriod: [1, "y"] });
      let period = rts.period(new Date());
      period.obs.set("123");
      period = period.back(10);
      expect(period.obs.hasForward()).toBe(true);
    });
  });

  describe("for subPeriods > 1", () => {
    it("should return false if nothing after current observation", () => {
      const rts = chronology.regular({
        basePeriod: [1, "y"],
        subPeriods: 2,
      });
      let period = rts.period(new Date());
      period.obs.set("123");
      period = period.forward(1);
      period.obs.set("456");
      expect(period.obs.hasForward()).toBe(false);
    });

    it("should return true if there is a next observation in the current base period", () => {
      const rts = chronology.regular({
        basePeriod: [1, "d"],
        subPeriods: 2,
      });
      let period = rts.period(new Date(), 2);
      period.obs.set("123");
      expect(period.obs.hasForward()).toBe(false);
      period = period.back(1);
      expect(period.obs.hasForward()).toBe(true);
    });

    it("should return true if there is a next observation in a later base period", () => {
      const rts = chronology.regular({
        basePeriod: [1, "d"],
        subPeriods: 2,
      });
      let period = rts.period(new Date(), 2);
      period.obs.set("123");
      expect(period.obs.hasForward()).toBe(false);
      period = period.back(10);
      expect(period.obs.hasForward()).toBe(true);
    });
  });
});

describe("The regularPeriod.obs.hasBack() function", () => {
  it("should return false if no observations", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    const period = rts.period(new Date());
    expect(period.obs.hasBack()).toBe(false);
  });

  describe("for subPeriods = 1", () => {
    it("should return false if nothing before current observation", () => {
      const rts = chronology.regular({ basePeriod: [1, "y"] });
      let period = rts.period(new Date());
      period.obs.set("123");
      period = period.back(1);
      period.obs.set("456");
      expect(period.obs.hasBack()).toBe(false);
    });

    it("should return true if there is a previous observation", () => {
      const rts = chronology.regular({ basePeriod: [1, "y"] });
      let period = rts.period(new Date());
      period.obs.set("123");
      period = period.forward(10);
      expect(period.obs.hasBack()).toBe(true);
    });
  });

  describe("for subPeriods > 1", () => {
    it("should return false if nothing before current observation", () => {
      const rts = chronology.regular({
        basePeriod: [1, "y"],
        subPeriods: 2,
      });
      let period = rts.period(new Date());
      period.obs.set("123");
      period = period.back(1);
      period.obs.set("456");
      expect(period.obs.hasBack()).toBe(false);
    });

    it("should return true if there is a previous observation in the current base period", () => {
      const rts = chronology.regular({
        basePeriod: [1, "d"],
        subPeriods: 2,
      });
      let period = rts.period(new Date(), 2);
      period.obs.set("123");
      expect(period.obs.hasBack()).toBe(false);
      period = period.forward(1);
      expect(period.obs.hasBack()).toBe(true);
    });

    it("should return true if there is a previous observation in an earlier base period", () => {
      const rts = chronology.regular({
        basePeriod: [1, "d"],
        subPeriods: 2,
      });
      let period = rts.period(new Date(), 2);
      period.obs.set("123");
      expect(period.obs.hasBack()).toBe(false);
      period = period.forward(10);
      expect(period.obs.hasBack()).toBe(true);
    });
  });
});

describe("The regularPeriod.obs.forward() function", () => {
  it("should throw if empty series", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    expect(() => {
      rts.period(new Date()).obs.forward();
    }).toThrow(new Error("MISSING: No later observations."));
  });

  describe("for subPeriods = 1", () => {
    it("should throw if no later observation", () => {
      const rts = chronology.regular({ basePeriod: [1, "y"] });
      const period = rts.period(new Date());
      period.obs.set("123");
      expect(() => {
        period.obs.forward();
      }).toThrow(new Error("MISSING: No later observations."));
    });

    it("should return the next observation", () => {
      const rts = chronology.regular({
        basePeriod: [1, "y"],
        anchor: new Date("2000-01-01T00:00:00.000Z"),
      });
      let period = rts.period(new Date("2000-01-01T00:00:00.000Z"));
      period.obs.set("123");
      period = period.back(1);
      const next = period.obs.forward();

      expect(next).toBeInstanceOf(Object);
      expect(next._series).toBe(rts);
      expect(next._basePeriodIndex).toBe(0);
      expect(next._subPeriod).toBe(1);
      expect(next._basePeriodBoundaries).toBeNull();
      expect(next._subPeriodBoundaries).toBeNull();
    });
  });

  describe("for subPeriods > 1", () => {
    it("should throw if no later observation", () => {
      const rts = chronology.regular({
        basePeriod: [1, "d"],
        anchor: new Date("2000-01-01T00:00:00.000Z"),
        subPeriods: 3,
      });
      const period = rts.period(new Date());
      period.obs.set("123");
      expect(() => {
        period.obs.forward();
      }).toThrow(new Error("MISSING: No later observations."));
    });

    it("should return the next observation in the same base period", () => {
      const rts = chronology.regular({
        basePeriod: [1, "d"],
        anchor: new Date("2000-01-01T00:00:00.000Z"),
        subPeriods: 3,
      });
      let period = rts.period(new Date("2000-01-01T00:00:00.000Z"), 3);
      period.obs.set("123");
      period = period.back(2);

      const next = period.obs.forward();

      expect(next).toBeInstanceOf(Object);
      expect(next._series).toBe(rts);
      expect(next._basePeriodIndex).toBe(0);
      expect(next._subPeriod).toBe(3);
      expect(next._basePeriodBoundaries).toBeNull();
      expect(next._subPeriodBoundaries).toBeNull();
    });

    it("should return the next observation in a later base period", () => {
      const rts = chronology.regular({
        basePeriod: [1, "d"],
        anchor: new Date("2000-01-01T00:00:00.000Z"),
        subPeriods: 3,
      });
      let period = rts.period(new Date("2000-01-01T00:00:00.000Z"), 3);
      period.obs.set("123");
      period = period.back(3); // Previous base period

      const next = period.obs.forward();

      expect(next).toBeInstanceOf(Object);
      expect(next._series).toBe(rts);
      expect(next._basePeriodIndex).toBe(0);
      expect(next._subPeriod).toBe(3);
      expect(next._basePeriodBoundaries).toBeNull();
      expect(next._subPeriodBoundaries).toBeNull();
    });
  });
});

describe("The regularPeriod.obs.back() function", () => {
  it("should throw if empty series", () => {
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    expect(() => {
      rts.period(new Date()).obs.back();
    }).toThrow(new Error("MISSING: No earlier observations."));
  });

  describe("for subPeriods = 1", () => {
    it("should throw if no later observation", () => {
      const rts = chronology.regular({ basePeriod: [1, "y"] });
      const period = rts.period(new Date());
      period.obs.set("123");
      expect(() => {
        period.obs.back();
      }).toThrow(new Error("MISSING: No earlier observations."));
    });

    it("should return the previous observation", () => {
      const rts = chronology.regular({
        basePeriod: [1, "y"],
        anchor: new Date("2000-01-01T00:00:00.000Z"),
      });
      let period = rts.period(new Date("2000-01-01T00:00:00.000Z"));
      period.obs.set("123");
      period = period.forward(1);
      const prev = period.obs.back();

      expect(prev).toBeInstanceOf(Object);
      expect(prev._series).toBe(rts);
      expect(prev._basePeriodIndex).toBe(0);
      expect(prev._subPeriod).toBe(1);
      expect(prev._basePeriodBoundaries).toBeNull();
      expect(prev._subPeriodBoundaries).toBeNull();
    });
  });

  describe("for subPeriods > 1", () => {
    it("should throw if no later observation", () => {
      const rts = chronology.regular({
        basePeriod: [1, "d"],
        anchor: new Date("2000-01-01T00:00:00.000Z"),
        subPeriods: 3,
      });
      const period = rts.period(new Date());
      period.obs.set("123");
      expect(() => {
        period.obs.back();
      }).toThrow(new Error("MISSING: No earlier observations."));
    });

    it("should return the previous observation in the same base period", () => {
      const rts = chronology.regular({
        basePeriod: [1, "d"],
        anchor: new Date("2000-01-01T00:00:00.000Z"),
        subPeriods: 3,
      });
      let period = rts.period(new Date("2000-01-01T00:00:00.000Z"), 1);
      period.obs.set("123");
      period = period.forward(2);

      const prev = period.obs.back();

      expect(prev).toBeInstanceOf(Object);
      expect(prev._series).toBe(rts);
      expect(prev._basePeriodIndex).toBe(0);
      expect(prev._subPeriod).toBe(1);
      expect(prev._basePeriodBoundaries).toBeNull();
      expect(prev._subPeriodBoundaries).toBeNull();
    });

    it("should return the previous observation in a later base period", () => {
      const rts = chronology.regular({
        basePeriod: [1, "d"],
        anchor: new Date("2000-01-01T00:00:00.000Z"),
        subPeriods: 3,
      });
      let period = rts.period(new Date("2000-01-01T00:00:00.000Z"), 1);
      period.obs.set("123");
      period = period.forward(3); // Previous base period

      const prev = period.obs.back();

      expect(prev).toBeInstanceOf(Object);
      expect(prev._series).toBe(rts);
      expect(prev._basePeriodIndex).toBe(0);
      expect(prev._subPeriod).toBe(1);
      expect(prev._basePeriodBoundaries).toBeNull();
      expect(prev._subPeriodBoundaries).toBeNull();
    });
  });
});

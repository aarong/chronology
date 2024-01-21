import chronology from "../main";

describe("The chronology.regular() function", () => {
  it("should map to the regular() factory function", () => {
    expect(chronology.regular({ basePeriod: [1, "y"] })).toBeInstanceOf(Object);
  });
});

describe("The chronology.irregular() function", () => {
  it("should map to the irregular() factory function", () => {
    expect(chronology.irregular({})).toBeInstanceOf(Object);
  });
});

describe("The chronology.unserialize() function", () => {
  describe("core validation", () => {
    it("should throw on non-string argument", () => {
      expect(() => {
        chronology.unserialize(false);
      }).toThrow(new Error("INVALID_ARGUMENT: String required."));
    });

    it("should throw on non-function subPeriodBoundaries", () => {
      expect(() => {
        chronology.unserialize("{}", "junk");
      }).toThrow(
        new Error("INVALID_ARGUMENT: Invalid subPeriodBoundaries function."),
      );
    });

    it("should throw on invalid JSON", () => {
      expect(() => {
        chronology.unserialize("junk");
      }).toThrow(new Error("INVALID_JSONTS: Invalid JSON."));
    });

    it("should throw on non-object", () => {
      expect(() => {
        chronology.unserialize("123");
      }).toThrow(new Error("INVALID_JSONTS: Must be an object."));
    });

    it("should throw on missing JsonTs", () => {
      expect(() => {
        chronology.unserialize("{}");
      }).toThrow(
        new Error("INVALID_JSONTS: JsonTs parameter must be a string."),
      );
    });

    it("should throw on invalid JsonTs type", () => {
      expect(() => {
        chronology.unserialize(
          JSON.stringify({
            JsonTs: 123,
          }),
        );
      }).toThrow(
        new Error("INVALID_JSONTS: JsonTs parameter must be a string."),
      );
    });

    it("should throw on invalid JsonTs value", () => {
      expect(() => {
        chronology.unserialize(
          JSON.stringify({
            JsonTs: "junk",
          }),
        );
      }).toThrow(
        new Error(
          "INVALID_JSONTS: JsonTs parameter must be 'regular' or 'irregular'.",
        ),
      );
    });

    it("should throw on missing Observations", () => {
      expect(() => {
        chronology.unserialize(
          JSON.stringify({
            JsonTs: "regular",
          }),
        );
      }).toThrow(
        new Error("INVALID_JSONTS: Observations parameter must be an array."),
      );
    });

    it("should throw on invalid Observations type", () => {
      expect(() => {
        chronology.unserialize(
          JSON.stringify({
            JsonTs: "regular",
            Observations: {},
          }),
        );
      }).toThrow(
        new Error("INVALID_JSONTS: Observations parameter must be an array."),
      );
    });
  });

  describe("for regular series", () => {
    it("should throw on missing BasePeriod", () => {
      expect(() => {
        chronology.unserialize(
          JSON.stringify({
            JsonTs: "regular",
            Observations: [],
          }),
        );
      }).toThrow(
        new Error(
          "INVALID_JSONTS: BasePeriod parameter must be array of length 2.",
        ),
      );
    });

    it("should throw on invalid BasePeriod type", () => {
      expect(() => {
        chronology.unserialize(
          JSON.stringify({
            JsonTs: "regular",
            BasePeriod: 123,
            Observations: [],
          }),
        );
      }).toThrow(
        new Error(
          "INVALID_JSONTS: BasePeriod parameter must be array of length 2.",
        ),
      );
    });

    it("should throw on invalid BasePeriod length", () => {
      expect(() => {
        chronology.unserialize(
          JSON.stringify({
            JsonTs: "regular",
            BasePeriod: [1],
            Observations: [],
          }),
        );
      }).toThrow(
        new Error(
          "INVALID_JSONTS: BasePeriod parameter must be array of length 2.",
        ),
      );
    });

    it("should throw on invalid BasePeriodNumber - bad type", () => {
      expect(() => {
        chronology.unserialize(
          JSON.stringify({
            JsonTs: "regular",
            BasePeriod: [false, "y"],
            Observations: [],
          }),
        );
      }).toThrow(
        new Error(
          "INVALID_JSONTS: BasePeriodNumber parameter must be a strictly positive integer.",
        ),
      );
    });

    it("should throw on invalid BasePeriodNumber - not strictly positive", () => {
      expect(() => {
        chronology.unserialize(
          JSON.stringify({
            JsonTs: "regular",
            BasePeriod: [0, "y"],
            Observations: [],
          }),
        );
      }).toThrow(
        new Error(
          "INVALID_JSONTS: BasePeriodNumber parameter must be a strictly positive integer.",
        ),
      );
    });

    it("should throw on invalid BasePeriodNumber - not integer", () => {
      expect(() => {
        chronology.unserialize(
          JSON.stringify({
            JsonTs: "regular",
            BasePeriod: [1.1, "y"],
            Observations: [],
          }),
        );
      }).toThrow(
        new Error(
          "INVALID_JSONTS: BasePeriodNumber parameter must be a strictly positive integer.",
        ),
      );
    });

    it("should throw on invalid BasePeriodType - bad type", () => {
      expect(() => {
        chronology.unserialize(
          JSON.stringify({
            JsonTs: "regular",
            BasePeriod: [1, false],
            Observations: [],
          }),
        );
      }).toThrow(new Error("INVALID_JSONTS: Invalid BasePeriodType."));
    });

    it("should throw on invalid BasePeriodType - invalid choice", () => {
      expect(() => {
        chronology.unserialize(
          JSON.stringify({
            JsonTs: "regular",
            BasePeriod: [1, "junk"],
            Observations: [],
          }),
        );
      }).toThrow(new Error("INVALID_JSONTS: Invalid BasePeriodType."));
    });

    it("should throw on invalid BasePeriodType - not supported", () => {
      expect(() => {
        chronology.unserialize(
          JSON.stringify({
            JsonTs: "regular",
            BasePeriod: [1, "e-6"],
            Observations: [],
          }),
        );
      }).toThrow(
        new Error(
          "NOT_SUPPORTED: Sub-millisecond BasePeriodType is not supported.",
        ),
      );
    });

    it("should throw on invalid Anchor type if specified", () => {
      expect(() => {
        chronology.unserialize(
          JSON.stringify({
            JsonTs: "regular",
            BasePeriod: [1, "ms"],
            Anchor: 123,
            Observations: [],
          }),
        );
      }).toThrow(new Error("INVALID_JSONTS: Invalid Anchor parameter."));
    });

    it("should throw on invalid Anchor type if specified", () => {
      expect(() => {
        chronology.unserialize(
          JSON.stringify({
            JsonTs: "regular",
            BasePeriod: [1, "ms"],
            Anchor: 123,
            Observations: [],
          }),
        );
      }).toThrow(new Error("INVALID_JSONTS: Invalid Anchor parameter."));
    });

    it("should throw on invalid Anchor string if specified", () => {
      expect(() => {
        chronology.unserialize(
          JSON.stringify({
            JsonTs: "regular",
            BasePeriod: [1, "ms"],
            Anchor: "not a date",
            Observations: [],
          }),
        );
      }).toThrow(new Error("INVALID_JSONTS: Invalid Anchor parameter."));
    });

    it("should throw on unsupported anchor precision if specified", () => {
      expect(() => {
        chronology.unserialize(
          JSON.stringify({
            JsonTs: "regular",
            BasePeriod: [1, "ms"],
            Anchor: "2000-01-01T00:00:00.000000Z",
            Observations: [],
          }),
        );
      }).toThrow(
        new Error(
          "NOT_SUPPORTED: Anchor specified beyond millisecond precision.",
        ),
      );
    });

    it("should throw on invalid SubPeriods if specified - bad type", () => {
      expect(() => {
        chronology.unserialize(
          JSON.stringify({
            JsonTs: "regular",
            BasePeriod: [1, "ms"],
            SubPeriods: [],
            Observations: [],
          }),
        );
      }).toThrow(
        new Error(
          "INVALID_JSONTS: SubPeriods parameter must be a positive integer if specified.",
        ),
      );
    });

    it("should throw on invalid SubPeriods if specified - not integer", () => {
      expect(() => {
        chronology.unserialize(
          JSON.stringify({
            JsonTs: "regular",
            BasePeriod: [1, "ms"],
            SubPeriods: 1.1,
            Observations: [],
          }),
        );
      }).toThrow(
        new Error(
          "INVALID_JSONTS: SubPeriods parameter must be a positive integer if specified.",
        ),
      );
    });

    it("should throw on invalid SubPeriods if specified - not strictly positive", () => {
      expect(() => {
        chronology.unserialize(
          JSON.stringify({
            JsonTs: "regular",
            BasePeriod: [1, "ms"],
            SubPeriods: 0,
            Observations: [],
          }),
        );
      }).toThrow(
        new Error(
          "INVALID_JSONTS: SubPeriods parameter must be a positive integer if specified.",
        ),
      );
    });

    describe("for each observation", () => {
      it("should throw if bad observation - type", () => {
        expect(() => {
          chronology.unserialize(
            JSON.stringify({
              JsonTs: "regular",
              BasePeriod: [1, "ms"],
              Observations: [false],
            }),
          );
        }).toThrow(new Error("INVALID_JSONTS: Invalid observation."));
      });

      it("should throw if bad observation - array length too short", () => {
        expect(() => {
          chronology.unserialize(
            JSON.stringify({
              JsonTs: "regular",
              BasePeriod: [1, "ms"],
              Observations: [[]],
            }),
          );
        }).toThrow(new Error("INVALID_JSONTS: Invalid observation."));
      });

      it("should throw if bad observation - array length too long", () => {
        expect(() => {
          chronology.unserialize(
            JSON.stringify({
              JsonTs: "regular",
              BasePeriod: [1, "ms"],
              Observations: [[1, 2, 3, 4]],
            }),
          );
        }).toThrow(new Error("INVALID_JSONTS: Invalid observation."));
      });

      describe("for observations of type 1: [bpd, spn, val]", () => {
        it("should throw on bad base period date type", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "regular",
                BasePeriod: [1, "ms"],
                Observations: [[1, 1, 123]],
              }),
            );
          }).toThrow(new Error("INVALID_JSONTS: Invalid base period date."));
        });

        it("should throw on bad base period date string", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "regular",
                BasePeriod: [1, "ms"],
                Observations: [["junk", 1, 123]],
              }),
            );
          }).toThrow(new Error("INVALID_JSONTS: Invalid base period date."));
        });

        it("should throw on unsupported base period date precision", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "regular",
                BasePeriod: [1, "ms"],
                Observations: [["2000-01-01T00:00:00.000000Z", 1, 123]],
              }),
            );
          }).toThrow(
            new Error(
              "NOT_SUPPORTED: Base period date specified beyond millisecond precision.",
            ),
          );
        });

        it("should throw on bad sub period number - type", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "regular",
                BasePeriod: [1, "ms"],
                Observations: [["2010Z", "junk", 123]],
              }),
            );
          }).toThrow(new Error("INVALID_JSONTS: Invalid sub period number."));
        });

        it("should throw on bad sub period number - fractional", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "regular",
                BasePeriod: [1, "ms"],
                SubPeriods: 2,
                Observations: [["2010Z", 1.1, 123]],
              }),
            );
          }).toThrow(new Error("INVALID_JSONTS: Invalid sub period number."));
        });

        it("should throw on bad sub period number - too high", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "regular",
                BasePeriod: [1, "ms"],
                SubPeriods: 2,
                Observations: [["2010Z", 3, 123]],
              }),
            );
          }).toThrow(new Error("INVALID_JSONTS: Invalid sub period number."));
        });

        it("should throw on bad sub period number - too low", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "regular",
                BasePeriod: [1, "ms"],
                SubPeriods: 2,
                Observations: [["2010Z", 0, 123]],
              }),
            );
          }).toThrow(new Error("INVALID_JSONTS: Invalid sub period number."));
        });

        it("should throw if duplicate", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "regular",
                BasePeriod: [1, "ms"],
                SubPeriods: 2,
                Observations: [
                  ["2010Z", 1, 123],
                  ["2010Z", 1, 123],
                ],
              }),
            );
          }).toThrow(
            new Error(
              "INVALID_JSONTS: Observation collision or observations not in chronological order.",
            ),
          );
        });

        it("should throw if not chronologically sequenced - prev was type 1", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "regular",
                BasePeriod: [1, "ms"],
                SubPeriods: 2,
                Observations: [
                  ["2010Z", 1, 123],
                  ["2009Z", 1, 123],
                ],
              }),
            );
          }).toThrow(
            new Error(
              "INVALID_JSONTS: Observation collision or observations not in chronological order.",
            ),
          );
        });

        it("should throw if not chronologically sequenced - prev was type 2", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "regular",
                BasePeriod: [1, "ms"],
                SubPeriods: 1,
                Observations: [
                  ["2010Z", 123],
                  ["2009Z", 1, 123],
                ],
              }),
            );
          }).toThrow(
            new Error(
              "INVALID_JSONTS: Observation collision or observations not in chronological order.",
            ),
          );
        });

        it("should throw if not chronologically sequenced - prev was type 3", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "regular",
                BasePeriod: [1, "ms"],
                SubPeriods: 2,
                Observations: [["2010Z", 1, 123], ["abc"], ["2010Z", 2, 123]],
              }),
            );
          }).toThrow(
            new Error(
              "INVALID_JSONTS: Observation collision or observations not in chronological order.",
            ),
          );
        });
      });

      describe("for observations of type 2: [bpd, val]", () => {
        it("should throw if sub periods > 1", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "regular",
                BasePeriod: [1, "ms"],
                SubPeriods: 2,
                Observations: [["2010Z", 123]],
              }),
            );
          }).toThrow(
            new Error("INVALID_JSONTS: Observation must specify sub period."),
          );
        });

        it("should throw on bad base period date type", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "regular",
                BasePeriod: [1, "ms"],
                Observations: [[1, 123]],
              }),
            );
          }).toThrow(new Error("INVALID_JSONTS: Invalid base period date."));
        });

        it("should throw on bad base period date string", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "regular",
                BasePeriod: [1, "ms"],
                Observations: [["junk", 123]],
              }),
            );
          }).toThrow(new Error("INVALID_JSONTS: Invalid base period date."));
        });

        it("should throw on unsupported base period date precision", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "regular",
                BasePeriod: [1, "ms"],
                Observations: [["2000-01-01T00:00:00.000000Z", 123]],
              }),
            );
          }).toThrow(
            new Error(
              "NOT_SUPPORTED: Base period date specified beyond millisecond precision.",
            ),
          );
        });

        it("should throw if not chronologically sequenced - prev was type 1", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "regular",
                BasePeriod: [1, "ms"],
                SubPeriods: 1,
                Observations: [
                  ["2010Z", 1, 123],
                  ["2010Z", 123],
                ],
              }),
            );
          }).toThrow(
            new Error(
              "INVALID_JSONTS: Observation collision or observations not in chronological order.",
            ),
          );
        });

        it("should throw if not chronologically sequenced - prev was type 2", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "regular",
                BasePeriod: [1, "ms"],
                SubPeriods: 1,
                Observations: [
                  ["2010Z", 123],
                  ["2009Z", 123],
                ],
              }),
            );
          }).toThrow(
            new Error(
              "INVALID_JSONTS: Observation collision or observations not in chronological order.",
            ),
          );
        });

        it("should throw if not chronologically sequenced - prev was type 3", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "regular",
                BasePeriod: [1, "ms"],
                SubPeriods: 1,
                Observations: [["2010Z", 123], ["abc"], ["2010Z", 123]],
              }),
            );
          }).toThrow(
            new Error(
              "INVALID_JSONTS: Observation collision or observations not in chronological order.",
            ),
          );
        });
      });

      describe("for observations of type 3: [val]", () => {
        it("should throw if first", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "regular",
                BasePeriod: [1, "ms"],
                SubPeriods: 1,
                Observations: [["abc"]],
              }),
            );
          }).toThrow(
            new Error(
              "INVALID_JSONTS: First observation must specify an explicit period.",
            ),
          );
        });
      });

      describe("success", () => {
        it("should succeed with all optional parameters", () => {
          const rts = chronology.unserialize(
            JSON.stringify({
              JsonTs: "REGULAR",
              BasePeriod: [1, "ms"],
              Anchor: "2010Z",
              SubPeriods: 12,
              Observations: [],
            }),
          );
          expect(rts.type()).toBe("regular");
          expect(rts.basePeriod()).toEqual([1, "ms"]);
          expect(rts.anchor()).toEqual(new Date("2010-01-01T00:00:00.0Z"));
          expect(rts.subPeriods()).toBe(12);
        });

        it("should succeed with no optional parameters - not weekly", () => {
          const rts = chronology.unserialize(
            JSON.stringify({
              JsonTs: "regular",
              BasePeriod: [1, "ms"],
              Observations: [],
            }),
          );
          expect(rts.type()).toBe("regular");
          expect(rts.basePeriod()).toEqual([1, "ms"]);
          expect(rts.anchor()).toEqual(new Date("2000-01-01T00:00:00.0Z"));
          expect(rts.subPeriods()).toBe(1);
        });

        it("should succeed with no optional parameters - weekly", () => {
          const rts = chronology.unserialize(
            JSON.stringify({
              JsonTs: "regular",
              BasePeriod: [1, "w"],
              Observations: [],
            }),
          );
          expect(rts.type()).toBe("regular");
          expect(rts.basePeriod()).toEqual([1, "w"]);
          expect(rts.anchor()).toEqual(new Date("2000-01-03T00:00:00.0Z"));
          expect(rts.subPeriods()).toBe(1);
        });

        it("should represent all observation types correctly", () => {
          const rts = chronology.unserialize(
            JSON.stringify({
              JsonTs: "regular",
              BasePeriod: [1, "y"],
              SubPeriods: 1,
              Observations: [["2000Z", 1, 123], [456], ["2005Z", 789], [10]],
            }),
          );
          expect(
            rts.period(new Date("2000-01-01T00:00:00.0Z")).obs.value(),
          ).toBe(123);
          expect(
            rts.period(new Date("2001-01-01T00:00:00.0Z")).obs.value(),
          ).toBe(456);
          expect(
            rts.period(new Date("2005-01-01T00:00:00.0Z")).obs.value(),
          ).toBe(789);
          expect(
            rts.period(new Date("2006-01-01T00:00:00.0Z")).obs.value(),
          ).toBe(10);
        });

        it("should use the subPeriodBoundaries provided", () => {
          const rts = chronology.unserialize(
            JSON.stringify({
              JsonTs: "regular",
              BasePeriod: [1, "y"],
              SubPeriods: 2,
              Observations: [],
            }),
            (bpStart, bpEnd, spNum) => {
              if (spNum === 1) {
                // First day
                return {
                  start: bpStart,
                  end: new Date(bpStart.getTime() + 24 * 60 * 60 * 1000),
                };
              }
              // Rest of the year
              return {
                start: new Date(bpStart.getTime() + 24 * 60 * 60 * 1000),
                end: bpEnd,
              };
            },
          );

          const p1 = rts.period(new Date("2000-01-01T00:00:00.0Z"));
          expect(p1.start()).toEqual(new Date("2000-01-01T00:00:00.000Z"));
          expect(p1.end()).toEqual(new Date("2000-01-02T00:00:00.000Z"));

          const p2 = rts.period(new Date("2000-01-02T00:00:00.0Z"));
          expect(p2.start()).toEqual(new Date("2000-01-02T00:00:00.000Z"));
          expect(p2.end()).toEqual(new Date("2001-01-01T00:00:00.000Z"));
        });
      });
    });
  });

  describe("for irregular series", () => {
    describe("for each observation", () => {
      it("should throw if bad observation - type", () => {
        expect(() => {
          chronology.unserialize(
            JSON.stringify({
              JsonTs: "irregular",
              Observations: [false],
            }),
          );
        }).toThrow(new Error("INVALID_JSONTS: Invalid observation."));
      });

      it("should throw if bad observation - array length too short", () => {
        expect(() => {
          chronology.unserialize(
            JSON.stringify({
              JsonTs: "irregular",
              Observations: [["1970Z"]],
            }),
          );
        }).toThrow(new Error("INVALID_JSONTS: Invalid observation."));
      });

      it("should throw if bad observation - array length too long", () => {
        expect(() => {
          chronology.unserialize(
            JSON.stringify({
              JsonTs: "irregular",
              Observations: [["1970Z", "val", "1971Z", false]],
            }),
          );
        }).toThrow(new Error("INVALID_JSONTS: Invalid observation."));
      });

      describe("for observations of type 1: [sd, val]", () => {
        it("should throw if the date is invalid - type", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "irregular",
                Observations: [
                  [false, "val"],
                  ["1970Z", "val", "1971Z"],
                ],
              }),
            );
          }).toThrow(new Error("INVALID_JSONTS: Invalid start date."));
        });

        it("should throw if the date is invalid - syntax", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "irregular",
                Observations: [
                  ["junk", "val"],
                  ["1970Z", "val", "1971Z"],
                ],
              }),
            );
          }).toThrow(new Error("INVALID_JSONTS: Invalid start date."));
        });

        it("should throw if the date has unsupported precision", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "irregular",
                Observations: [
                  ["2000-01-01T00:00:00.000000Z", "val"],
                  ["1970Z", "val", "1971Z"],
                ],
              }),
            );
          }).toThrow(
            new Error(
              "NOT_SUPPORTED: Start date specified beyond millisecond precision.",
            ),
          );
        });

        it("should throw if this is the final observation", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "irregular",
                Observations: [["1970Z", "val"]],
              }),
            );
          }).toThrow(
            new Error(
              "INVALID_JSONTS: End date required for final observation.",
            ),
          );
        });

        it("should throw if not chronologically sequenced - next is type 1", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "irregular",
                Observations: [
                  ["1970Z", "val"],
                  ["1970Z", "val"],
                  ["1971Z", "val", "1972Z"],
                ],
              }),
            );
          }).toThrow(
            new Error(
              "INVALID_JSONTS: Observation collision or observations not in chronological order.",
            ),
          );
        });

        it("should throw if not chronologically sequenced - next is type 2", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "irregular",
                Observations: [
                  ["1970Z", "val"],
                  ["1970Z", "val", "1972Z"],
                ],
              }),
            );
          }).toThrow(
            new Error(
              "INVALID_JSONTS: Observation collision or observations not in chronological order.",
            ),
          );
        });
      });

      describe("for observations of type 2: [sd, val, ed]", () => {
        it("should throw if the start date is invalid - type", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "irregular",
                Observations: [[false, "val", "1971Z"]],
              }),
            );
          }).toThrow(new Error("INVALID_JSONTS: Invalid start date."));
        });

        it("should throw if the start date is invalid - syntax", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "irregular",
                Observations: [["junk", "val", "1971Z"]],
              }),
            );
          }).toThrow(new Error("INVALID_JSONTS: Invalid start date."));
        });

        it("should throw if the start date has unsupported precision", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "irregular",
                Observations: [["2000-01-01T00:00:00.000000Z", "val", "1971Z"]],
              }),
            );
          }).toThrow(
            new Error(
              "NOT_SUPPORTED: Start date specified beyond millisecond precision.",
            ),
          );
        });

        it("should throw if the end date is invalid - type", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "irregular",
                Observations: [["1971Z", "val", false]],
              }),
            );
          }).toThrow(new Error("INVALID_JSONTS: Invalid end date."));
        });

        it("should throw if the end date is invalid - syntax", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "irregular",
                Observations: [["1971Z", "val", "junk"]],
              }),
            );
          }).toThrow(new Error("INVALID_JSONTS: Invalid end date."));
        });

        it("should throw if the end date has unsupported precision", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "irregular",
                Observations: [["2000Z", "val", "2000-01-01T00:00:00.000000Z"]],
              }),
            );
          }).toThrow(
            new Error(
              "NOT_SUPPORTED: End date specified beyond millisecond precision.",
            ),
          );
        });

        it("should throw if the end date is not strictly after the start date", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "irregular",
                Observations: [["1971Z", "val", "1971Z"]],
              }),
            );
          }).toThrow(
            new Error(
              "INVALID_JSONTS: Observation end date must be strictly later than start date.",
            ),
          );
        });

        it("should throw if not chronologically sequenced - next is type 1", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "irregular",
                Observations: [
                  ["1969Z", "val", "1970-01-01T00:00:00.001Z"],
                  ["1970Z", "val"],
                  ["1971Z", "val", "1972Z"],
                ],
              }),
            );
          }).toThrow(
            new Error(
              "INVALID_JSONTS: Observation collision or observations not in chronological order.",
            ),
          );
        });

        it("should throw if not chronologically sequenced - next is type 2", () => {
          expect(() => {
            chronology.unserialize(
              JSON.stringify({
                JsonTs: "irregular",
                Observations: [
                  ["1969Z", "val", "1970-01-01T00:00:00.001Z"],
                  ["1970Z", "val", "1972Z"],
                ],
              }),
            );
          }).toThrow(
            new Error(
              "INVALID_JSONTS: Observation collision or observations not in chronological order.",
            ),
          );
        });
      });

      it("on success, should represent the time series correctly", () => {
        const its = chronology.unserialize(
          JSON.stringify({
            JsonTs: "irregular",
            Observations: [
              ["1999Z", 1],
              ["2000Z", 2],
              ["2001Z", 3, "2002Z"],
              ["2003Z", 4],
              ["2004Z", 5, "2005Z"],
            ],
          }),
        );

        let ip = its.period(new Date("1998-06-01Z"));
        expect(ip.start()).toBe(null);
        expect(ip.obs.exists()).toBe(false);
        expect(ip.end()).toEqual(new Date("1999-01-01T00:00:00.0Z"));

        ip = its.period(new Date("1999-06-01Z"));
        expect(ip.start()).toEqual(new Date("1999-01-01T00:00:00.0Z"));
        expect(ip.obs.value()).toEqual(1);
        expect(ip.end()).toEqual(new Date("2000-01-01T00:00:00.0Z"));

        ip = its.period(new Date("2000-06-01Z"));
        expect(ip.start()).toEqual(new Date("2000-01-01T00:00:00.0Z"));
        expect(ip.obs.value()).toEqual(2);
        expect(ip.end()).toEqual(new Date("2001-01-01T00:00:00.0Z"));

        ip = its.period(new Date("2001-06-01Z"));
        expect(ip.start()).toEqual(new Date("2001-01-01T00:00:00.0Z"));
        expect(ip.obs.value()).toEqual(3);
        expect(ip.end()).toEqual(new Date("2002-01-01T00:00:00.0Z"));

        ip = its.period(new Date("2002-06-01Z"));
        expect(ip.start()).toEqual(new Date("2002-01-01T00:00:00.0Z"));
        expect(ip.obs.exists()).toEqual(false);
        expect(ip.end()).toEqual(new Date("2003-01-01T00:00:00.0Z"));

        ip = its.period(new Date("2003-06-01Z"));
        expect(ip.start()).toEqual(new Date("2003-01-01T00:00:00.0Z"));
        expect(ip.obs.value()).toEqual(4);
        expect(ip.end()).toEqual(new Date("2004-01-01T00:00:00.0Z"));

        ip = its.period(new Date("2004-06-01Z"));
        expect(ip.start()).toEqual(new Date("2004-01-01T00:00:00.0Z"));
        expect(ip.obs.value()).toEqual(5);
        expect(ip.end()).toEqual(new Date("2005-01-01T00:00:00.0Z"));

        ip = its.period(new Date("2005-06-01Z"));
        expect(ip.start()).toEqual(new Date("2005-01-01T00:00:00.0Z"));
        expect(ip.obs.exists()).toBe(false);
        expect(ip.end()).toBe(null);
      });
    });
  });
});

describe("The chronology.regular.proto reference", () => {
  it("should allow extension", () => {
    chronology.regular.proto.sum = function sum() {
      return this.reduce((a, p) => a + p.obs.value(), 0);
    };

    const rts = chronology.regular({ basePeriod: [1, "y"] });

    let p = rts.period(new Date(0), 1);
    p.obs.set(1);
    p = p.forward();
    p.obs.set(2);

    expect(rts.sum()).toBe(3);
  });
});

describe("The chronology.irregular.proto reference", () => {
  it("should allow extension", () => {
    chronology.irregular.proto.sum = function sum() {
      return this.reduce((a, p) => a + p.obs.value(), 0);
    };

    const its = chronology.irregular();

    its.add(new Date(0), 1, new Date(10));
    its.add(new Date(10), 2, new Date(11));

    expect(its.sum()).toBe(3);
  });
});

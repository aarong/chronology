import check from "check-types";
import jsonExpressible from "json-expressible";
import moment from "moment";
import jsonTsDate from "./jsontsdate";

let regularPeriodFactory;
let regularObsFactory;

/**
 * Regular time series object.
 * @typedef {Object} RegularSeries
 */

/**
 * Factory function for creating RegularSeries objects.
 * @param {Array} options.basePeriod
 * @param {?Date} options.anchor
 * @param {?number} options.subPeriods
 * @param {?Function} options.subPeriodBoundaries
 * @returns {RegularSeries}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 */
export default function regularSeriesFactory(options) {
  // Validate options type
  if (!check.object(options)) {
    throw new Error("INVALID_ARGUMENT: Invalid options.");
  }

  // Validate options.basePeriod
  if (!check.array(options.basePeriod) || options.basePeriod.length !== 2) {
    throw new Error("INVALID_ARGUMENT: Invalid options.basePeriod.");
  }

  // Validate options.basePeriod[0] - base period number
  if (
    !check.integer(options.basePeriod[0]) ||
    !check.positive(options.basePeriod[0])
  ) {
    throw new Error("INVALID_ARGUMENT: Invalid options.basePeriod.");
  }

  // Validate options.basePeriod[1] - base period type
  if (
    !check.string(options.basePeriod[1]) ||
    !regularSeriesFactory._supportedBasePeriods.includes(
      options.basePeriod[1].toLowerCase(),
    )
  ) {
    throw new Error("INVALID_ARGUMENT: Invalid options.basePeriod.");
  }

  // Validate options.anchor
  if ("anchor" in options && !check.date(options.anchor)) {
    throw new Error("INVALID_ARGUMENT: Invalid options.anchor.");
  }

  // Validate options.subPeriods
  if (
    "subPeriods" in options &&
    !(check.integer(options.subPeriods) && check.positive(options.subPeriods))
  ) {
    throw new Error("INVALID_ARGUMENT: Invalid options.subPeriods.");
  }

  // Validate options.subPeriodBoundaries type
  if (
    "subPeriodBoundaries" in options &&
    !check.function(options.subPeriodBoundaries)
  ) {
    throw new Error("INVALID_ARGUMENT: Invalid options.subPeriodBoundaries.");
  }

  // Create the time series object so that you can test options.subPeriodBoundaries
  // The factory could still fail

  const regularSeries = Object.create(regularSeriesFactory.proto);

  /**
   * Application-supplied configuration options overlaid on defaults.
   * @memberof RegularSeries
   * @instance
   * @private
   * @type {Object}
   */
  const defaultAnchor =
    options.basePeriod[1].toLowerCase() === "w"
      ? new Date("2000-01-03T00:00:00Z") // Monday midnight
      : new Date("2000-01-01T00:00:00Z"); // January 1st midnight
  regularSeries._options = {
    basePeriod: [options.basePeriod[0], options.basePeriod[1].toLowerCase()],
    anchor: options.anchor || defaultAnchor,
    subPeriods: options.subPeriods || 1,
    subPeriodBoundaries: options.subPeriodBoundaries
      ? options.subPeriodBoundaries
      : regularSeriesFactory._uniformSubPeriodBoundaries,
  };

  /**
   * Observation values. Held in nested objects for efficient storage of
   * sparse data. Base periods with no sub period observations are removed from
   * the structure.
   *
   * _obs[basePeriodIndex][subPeriod] = observation value
   *
   * @memberof RegularSeries
   * @instance
   * @private
   * @type {Object}
   */
  regularSeries._obs = {};

  /**
   * Sequence index. A chronological ordering of observations (unlike _obs).
   *
   * Without an index, finding the first/last/next/previous observation in
   * _obs means getting object keys, sorting them, and scanning.
   *
   * Index insertion and removal is O(logN) using bisection.
   *
   * _index[num] = [basePeriodIndex, subPeriodIndex]
   *
   * @memberof RegularSeries
   * @instance
   * @private
   * @type {Object}
   */
  regularSeries._index = [];

  // Test options.subPeriodBoundaries and cascade errors
  regularSeries._testSubPeriodBoundaries();

  // Success
  return regularSeries;
}

regularSeriesFactory.proto = {};

// Private static members

/**
 * Valid JSON-TimeSeries base period types, whether supported or not.
 * @memberof RegularSeries
 * @static
 * @private
 */
regularSeriesFactory._basePeriods = [
  "y",
  "q",
  "m",
  "w",
  "d",
  "h",
  "n",
  "s",
  "ms",
  "e-3",
  "e-6",
  "e-9",
  "e-12",
  "e-15",
  "e-18",
];

/**
 * JSON-TimeSeries base period types supported by the library.
 * @memberof RegularSeries
 * @static
 * @private
 */
regularSeriesFactory._supportedBasePeriods = [
  "y",
  "q",
  "m",
  "w",
  "d",
  "h",
  "n",
  "s",
  "ms",
  "e-3",
];

/**
 * Mapping of JSON-TimeSeries base period types to Moment period types.
 * @memberof RegularSeries
 * @static
 * @private
 */
regularSeriesFactory._momentPeriods = {
  y: "y",
  q: "Q",
  m: "M",
  w: "w",
  d: "d",
  h: "h",
  n: "m",
  s: "s",
  ms: "ms",
  "e-3": "ms",
};

/**
 * Mapping of JSON-TimeSeries base period types to minimum observation duration in MS.
 * @memberof RegularSeries
 * @static
 * @private
 */
regularSeriesFactory._basePeriodMs = {
  y: 365 * 24 * 60 * 60 * 1000,
  q: 90 * 24 * 60 * 60 * 1000,
  m: 28 * 24 * 60 * 60 * 1000,
  w: 7 * 24 * 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
  h: 60 * 60 * 1000,
  n: 60 * 1000,
  s: 1000,
  ms: 1,
  "e-3": 1,
};

/**
 * Default function for options.subPeriodBoundaries. Breaks each base period
 * into equal-duration sub periods. Too-high effective frequency is checked
 * by the caller. Called in the context of the relevant time series object.
 *
 * Returns an object of the form: {start: Date, end: Date}
 *
 * @memberof RegularSeries
 * @static
 * @private
 * @param {Date} basePeriodStart
 * @param {Date} basePeriodEnd
 * @param {number} subPeriod
 * @returns {Object}
 */
regularSeriesFactory._uniformSubPeriodBoundaries =
  function _uniformSubPeriodBoundaries(
    basePeriodStart,
    basePeriodEnd,
    subPeriod,
  ) {
    const basePeriodMs = basePeriodEnd - basePeriodStart;
    const subPeriodMs = basePeriodMs / this._options.subPeriods; // fractional
    const start = new Date(
      basePeriodStart.getTime() + Math.round((subPeriod - 1) * subPeriodMs),
    );
    const end = new Date(
      basePeriodStart.getTime() + Math.round(subPeriod * subPeriodMs),
    );

    return { start, end };
  };

// Private instance functions

/**
 * Runs a suite of sanity tests against options.subPeriodBoundaries() to
 * verify that its behavior is not obviously invalid.
 * @memberof RegularSeries
 * @instance
 * @private
 * @throws {Error} "INVALID_ARGUMENT: ..."
 */
regularSeriesFactory.proto._testSubPeriodBoundaries =
  function _testSubPeriodBoundaries() {
    // Decide which sub periods to test for each base period
    // Only test the first and last X sub periods for series with a large
    // number of sub periods, otherwise the factory function will hang
    const maxSubPeriods = 20; // Even - 10 on each side
    const testSubPeriods = [];
    if (this._options.subPeriods <= maxSubPeriods) {
      for (let i = 1; i <= this._options.subPeriods; i += 1) {
        testSubPeriods.push(i);
      }
    } else {
      for (let i = 1; i <= maxSubPeriods / 2; i += 1) {
        testSubPeriods.push(i);
      }
      for (
        let i = this._options.subPeriods - maxSubPeriods + 1;
        i <= this._options.subPeriods;
        i += 1
      ) {
        testSubPeriods.push(i);
      }
    }

    // Test a few base periods centered on the anchor (i = base period index)
    for (let i = -3; i < 3; i += 1) {
      const baseBoundaries = this._basePeriodBoundaries(i);
      let earliestStart = baseBoundaries.start; // Incremented each sub period

      // For each sub period in this base period
      for (let j = 0; j < testSubPeriods.length; j += 1) {
        const subPeriod = testSubPeriods[j];
        const result = this._subPeriodBoundaries(i, subPeriod);

        // Function must return object
        if (!check.object(result)) {
          throw new Error(
            "INVALID_ARGUMENT: Invalid value returned by options.subPeriodBoundaries.",
          );
        }

        // Function must return either (date, date) or (null, null)
        if (
          !(
            (check.date(result.start) && check.date(result.end)) ||
            (check.null(result.start) && check.null(result.end))
          )
        ) {
          throw new Error(
            "INVALID_ARGUMENT: Invalid value returned by options.subPeriodBoundaries.",
          );
        }

        // Function must return start in valid range (if not null)
        if (
          result.start &&
          !(result.start >= earliestStart && result.start < baseBoundaries.end)
        ) {
          throw new Error(
            "INVALID_ARGUMENT: Invalid start date returned by options.subPeriodBoundaries.",
          );
        }

        // Function must return end in valid range (if not null)
        if (
          result.end &&
          !(result.end > result.start && result.end <= baseBoundaries.end)
        ) {
          throw new Error(
            "INVALID_ARGUMENT: Invalid end date returned by options.subPeriodBoundaries.",
          );
        }

        earliestStart = result.end;
      }
    }
  };

/**
 * Returns the index for a given base period. The 0-indexed base period is the one
 * that begins on the anchor date.
 * @memberof RegularSeries
 * @instance
 * @private
 * @param {Date} date
 * @returns {number}
 */
regularSeriesFactory.proto._basePeriodIndex = function _basePeriodIndex(date) {
  // The moment() factory converts to local time and, per the moment.add() docs,
  // local time hours are preserved when adding years/months/days when across DST
  // boundaries, which throws off UTC time by an hour. Use moment.utc() factory,
  // does not do any hour adjustment when crossing DST.
  const mDate = moment.utc(date);

  // How many base periods are we from the anchor?
  // Note whether there was a remainder
  let idx = mDate.diff(
    this._options.anchor,
    regularSeriesFactory._momentPeriods[this._options.basePeriod[1]],
    true, // Get decimal piece
  );
  const decimal = idx % 1;
  idx = Math.trunc(idx);

  // The period immediately after the anchor is considered period 0
  // and the period immediately before is considered -1. Careful not to
  // deduct 1 if there was no decimal remainder, since Moment will do it.
  if (mDate.isBefore(this._options.anchor) && decimal !== 0) {
    idx -= 1; // Moment returns 0 for period immediately prior to anchor
  }
  idx = Math.floor(idx / this._options.basePeriod[0]);

  return idx;
};

/**
 * Returns the boundary dates for a base period by index.
 *
 * Returns an object of the form: {start: Date, end: Date}
 *
 * @memberof RegularSeries
 * @instance
 * @private
 * @param {number} basePeriodIndex
 * @returns {Object}
 */
regularSeriesFactory.proto._basePeriodBoundaries =
  function _basePeriodBoundaries(basePeriodIndex) {
    // Calculate the start of the base period
    const mStart = moment
      .utc(this._options.anchor)
      .add(
        this._options.basePeriod[0] * basePeriodIndex,
        regularSeriesFactory._momentPeriods[this._options.basePeriod[1]],
      );

    // Calculate the end of the base period
    const mEnd = moment
      .utc(this._options.anchor)
      .add(
        this._options.basePeriod[0] * (basePeriodIndex + 1),
        regularSeriesFactory._momentPeriods[this._options.basePeriod[1]],
      );

    // Return
    return { start: mStart.toDate(), end: mEnd.toDate() };
  };

/**
 * Checks effective frequency and then calls options.subPeriodBoundaries().
 *
 * If the effective frequency of the series is shorter than MS then it returns nulls
 * without calling options.subPeriodBoundaries(). Even if effective frequency is
 * greater than MS, options.subPeriodBoundaries() might return nulls depending on
 * its specific needs.
 *
 * If not too-frequent, returns an object of the form:
 *
 *  {start: Date, end: Date}
 *
 * If too-frequent, returns an object of the form:
 *
 *  {start: null, end: null}
 *
 * @memberof RegularSeries
 * @instance
 * @private
 * @param {number} basePeriodIndex
 * @param {number} subPeriod
 * @returns {Object}
 */
regularSeriesFactory.proto._subPeriodBoundaries = function _subPeriodBoundaries(
  basePeriodIndex,
  subPeriod,
) {
  // Check effective frequency
  const effectiveMs =
    (regularSeriesFactory._basePeriodMs[this._options.basePeriod[1]] *
      this._options.basePeriod[0]) /
    this._options.subPeriods;
  if (effectiveMs < 1) {
    return { start: null, end: null };
  }

  // Call options.subPeriodBoundaries() and return
  // May return nulls depending on its internal needs
  const baseBoundaries = this._basePeriodBoundaries(basePeriodIndex);
  return this._options.subPeriodBoundaries.call(
    this,
    baseBoundaries.start,
    baseBoundaries.end,
    subPeriod,
  );
};

/**
 * Returns the sub period number associated with a given date using a
 * bisection search.
 * @memberof RegularSeries
 * @instance
 * @private
 * @returns {number}
 * @throws {Error} "UNALLOCATED_DATE: ..."
 * @throws {Error} "INSUFFICIENT_PRECISION: ..."
 */
regularSeriesFactory.proto._subPeriod = function _subPeriod(date) {
  // Establish sub period search range
  let rangeStart = 1;
  let rangeEnd = this._options.subPeriods;

  // Make sure that we aren't operating at too-high frequency
  // It's safe to assume that if one sub period can be retreived, then all can
  const basePeriodIndex = this._basePeriodIndex(date);
  const firstBounds = this._subPeriodBoundaries(basePeriodIndex, 1);
  if (check.null(firstBounds.start) || check.null(firstBounds.end)) {
    throw new Error(
      "INSUFFICIENT_PRECISION: Cannot calculate sub period date boundaries at sub-millisecond precision.",
    );
  }

  // Use bisection to narrow the search to a few sub periods
  const iterateWhen = 5;
  while (rangeEnd - rangeStart + 1 > iterateWhen) {
    // Get the boundaries of the mid-range sub period
    const rangeMid = Math.round((rangeStart + rangeEnd) / 2);
    const subPeriodBoundaries = this._subPeriodBoundaries(
      basePeriodIndex,
      rangeMid,
    );

    // The date may fall before, after, or within the mid-range sub period
    if (date < subPeriodBoundaries.start) {
      rangeEnd = rangeMid - 1;
    } else if (date >= subPeriodBoundaries.end) {
      rangeStart = rangeMid + 1;
    } else {
      // Found it - return below
      rangeStart = rangeMid;
      rangeEnd = rangeMid;
    }
  }

  // Iterative search on remaining sub period range
  for (let i = rangeStart; i <= rangeEnd; i += 1) {
    const subPeriodBoundaries = this._subPeriodBoundaries(basePeriodIndex, i);
    if (subPeriodBoundaries.start <= date && date < subPeriodBoundaries.end) {
      return i;
    }
  }

  // None
  throw new Error(
    "UNALLOCATED_DATE: There is no sub period associated with the specified date.",
  );
};

/**
 * Finds the location at which an observation should be inserted into the index.
 *
 * Returns the array index of the first index element referencing a period that
 * is later than the one specified in the arguments, or the length of the array
 * of all periods referenced by the index are earlier.
 *
 * Uses bisection to efficiently narrow the search range, but ultimately ends with
 * iteration in order to find the first larger element (not the same as testing for
 * a direct match).
 *
 * Assumes the base/sub period is not already in the index.
 *
 * @memberof RegularSeries
 * @instance
 * @private
 * @param {number} basePeriodIndex
 * @param {number} subPeriod
 * @returns {number}
 * @throws {Error} "ALREADY_IN_INDEX: ..."
 */
regularSeriesFactory.proto._indexInsertLocation = function _indexInsertLocation(
  basePeriodIndex,
  subPeriod,
) {
  // Narrow search range using bisection
  let curStart = 0;
  let curEnd = this._index.length - 1;
  while (curEnd - curStart + 1 > 5) {
    const curMid = Math.round((curStart + curEnd) / 2);

    const result = this._comparePeriods(
      this._index[curMid][0],
      this._index[curMid][1],
      basePeriodIndex,
      subPeriod,
    );

    if (result < 0) {
      curStart = curMid;
    } else if (result === 0) {
      // Should not happen
      throw new Error(
        "ALREADY_IN_INDEX: Specified period is already referenced from the index.",
      );
    } else {
      curEnd = curMid;
    }
  }

  // The range resulting from bisection might not contain the
  // first index element later than argument, since the algorithm
  // is hunting for the argument itself
  // But don't iterate past the end of the array
  curEnd = Math.min(curEnd + 1, this._index.length - 1);

  // Iterate through remaining index entries
  for (let i = curStart; i <= curEnd; i += 1) {
    const result = this._comparePeriods(
      this._index[i][0],
      this._index[i][1],
      basePeriodIndex,
      subPeriod,
    );
    if (result < 0) {
      // Keep looking
    } else if (result === 0) {
      // Should not happen
      throw new Error(
        "ALREADY_IN_INDEX: Specified period is already referenced from the index.",
      );
    } else {
      return i;
    }
  }

  // Add to end of the index
  return this._index.length;
};

/**
 * Find the location of a base/sub period in the index.
 *
 * Assumes the base/sub period is in the index.
 *
 * @memberof RegularSeries
 * @instance
 * @private
 * @param {number} basePeriodIndex
 * @param {number} subPeriod
 * @returns {number}
 * @throws {Error} "NOT_IN_INDEX: ..."
 */
regularSeriesFactory.proto._indexLocation = function _indexLocation(
  basePeriodIndex,
  subPeriod,
) {
  // Narrow search range using bisection
  let curStart = 0;
  let curEnd = this._index.length - 1;
  while (curEnd - curStart + 1 > 5) {
    const curMid = Math.round((curStart + curEnd) / 2);

    const result = this._comparePeriods(
      this._index[curMid][0],
      this._index[curMid][1],
      basePeriodIndex,
      subPeriod,
    );

    if (result < 0) {
      curStart = curMid;
    } else if (result === 0) {
      return curMid; // Done
    } else {
      curEnd = curMid;
    }
  }

  // Iterate through remaining index entries
  for (let i = curStart; i <= curEnd; i += 1) {
    const result = this._comparePeriods(
      this._index[i][0],
      this._index[i][1],
      basePeriodIndex,
      subPeriod,
    );
    if (result === 0) {
      return i;
    }
  }

  // Not found -- shouldn't happen
  throw new Error("NOT_IN_INDEX: Specified period is not in the index.");
};

/**
 * Determines whether one base/sub period is before or after another.
 *
 * Return -1 if period 1 is before period 2
 * Return 0 if same
 * Return 1 if period 1 is after period 2
 *
 * @memberof RegularSeries
 * @instance
 * @private
 * @param {number} bpi1
 * @param {number} sp1
 * @param {number} bpi2
 * @param {number} sp2
 * @returns {number}
 */
regularSeriesFactory.proto._comparePeriods = function _comparePeriods(
  bpi1,
  sp1,
  bpi2,
  sp2,
) {
  if (bpi1 < bpi2 || (bpi1 === bpi2 && sp1 < sp2)) {
    return -1;
  }
  if (bpi1 === bpi2 && sp1 === sp2) {
    return 0;
  }
  return 1;
};

// Public instance functions

/**
 * Returns time series type "regular".
 * @memberof RegularSeries
 * @instance
 * @returns {string}
 */
regularSeriesFactory.proto.type = function type() {
  return "regular";
};

/**
 * Returns the time series base period.
 *
 * Takes the form: [basePeriodNumber, basePeriodType]
 *
 * @memberof RegularSeries
 * @instance
 * @returns {Array}
 */
regularSeriesFactory.proto.basePeriod = function basePeriod() {
  return [this._options.basePeriod[0], this._options.basePeriod[1]];
};

/**
 * Returns the time series anchor date.
 * @memberof RegularSeries
 * @instance
 * @returns {Date}
 */
regularSeriesFactory.proto.anchor = function anchor() {
  return this._options.anchor;
};

/**
 * Returns the number of sub periods.
 * @memberof RegularSeries
 * @instance
 * @returns {number}
 */
regularSeriesFactory.proto.subPeriods = function subPeriods() {
  return this._options.subPeriods;
};

/**
 * Returns a RegularPeriod object for the specified period.
 *
 * Usage 1: rts.period(date)
 * Usage 2: rts.period(basePeriodDate, subPeriod)
 *
 * @memberof RegularSeries
 * @instance
 * @returns {RegularPeriod}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 * @throws {Error} "UNALLOCATED_DATE: ..."
 * @throws {Error} "INSUFFICIENT_PRECISION: ..."
 */
regularSeriesFactory.proto.period = function period(...args) {
  // Process arguments for each usage
  let basePeriodIndex;
  let subPeriod;
  if (args.length === 1) {
    // Check type
    if (!check.date(args[0])) {
      throw new Error("INVALID_ARGUMENT: Invalid date.");
    }

    // Process location
    basePeriodIndex = this._basePeriodIndex(args[0]);
    subPeriod = this._subPeriod(args[0]); // Cascades UNALLOCATED_DATE, INSUFFICIENT_PRECISION
  } else if (args.length === 2) {
    // Check basePeriodDate
    if (!check.date(args[0])) {
      throw new Error("INVALID_ARGUMENT: Invalid basePeriodDate.");
    }

    // Check subPeriod
    if (
      !check.integer(args[1]) ||
      args[1] < 1 ||
      args[1] > this._options.subPeriods
    ) {
      throw new Error("INVALID_ARGUMENT: Invalid subPeriod.");
    }

    // Process location
    basePeriodIndex = this._basePeriodIndex(args[0]);
    [, subPeriod] = args;
  } else {
    throw new Error("INVALID_ARGUMENT: Invalid number of arguments.");
  }

  // Return a RegularPeriod
  return regularPeriodFactory(this, basePeriodIndex, subPeriod);
};

/**
 * Returns the number of observations in the time series.
 * @memberof RegularSeries
 * @instance
 * @returns {number}
 */
regularSeriesFactory.proto.count = function count() {
  return this.reduce((a) => a + 1, 0);
};

/**
 * Returns the earliest observation in the time series.
 * @memberof RegularSeries
 * @instance
 * @returns {RegularPeriod}
 * @throws {Error} "MISSING: ..."
 */
regularSeriesFactory.proto.first = function first() {
  if (this._index.length === 0) {
    throw new Error("MISSING: There are no observations.");
  }

  return regularPeriodFactory(this, this._index[0][0], this._index[0][1]);
};

/**
 * Returns the latest observation in the time series.
 * @memberof RegularSeries
 * @instance
 * @returns {RegularPeriod}
 * @throws {Error} "MISSING: ..."
 */
regularSeriesFactory.proto.last = function last() {
  if (this._index.length === 0) {
    throw new Error("MISSING: There are no observations.");
  }

  return regularPeriodFactory(
    this,
    this._index[this._index.length - 1][0],
    this._index[this._index.length - 1][1],
  );
};

/**
 * Runs a supplied function against all observations. Cascades outside errors.
 * @memberof RegularSeries
 * @instance
 * @param {Function} fn
 * @returns {RegularSeries}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 */
regularSeriesFactory.proto.each = function each(fn) {
  // Check fn
  if (!check.function(fn)) {
    throw new Error("INVALID_ARGUMENT: Invalid function.");
  }

  // Exit if no observations
  if (this._index.length === 0) {
    return this;
  }

  // Iterate
  let period;
  do {
    period = period ? period.obs.forward() : this.first();
    fn(period); // Cascade errors
  } while (period.obs.hasForward());

  return this;
};

/**
 * Runs a supplied function against all periods between the first and last
 * observations, inclusive. Cascades outside errors.
 * @memberof RegularSeries
 * @instance
 * @param {Function} fn
 * @returns {RegularSeries}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 */
regularSeriesFactory.proto.eachPeriod = function eachPeriod(fn) {
  // Check fn
  if (!check.function(fn)) {
    throw new Error("INVALID_ARGUMENT: Invalid function.");
  }

  // Exit if no observations
  if (this._index.length === 0) {
    return this;
  }

  // Iterate
  let period = this.first();
  do {
    fn(period); // Cascade errors
    period = period.forward();
  } while ( // Loop if not beyond last
    this._comparePeriods(
      period._basePeriodIndex,
      period._subPeriod,
      this.last()._basePeriodIndex,
      this.last()._subPeriod,
    ) <= 0
  );

  return this;
};

/**
 * Runs a supplied function against all observations, creating a new series
 * with the return values. Cascades outside errors.
 * @memberof RegularSeries
 * @instance
 * @param {Function} fn
 * @returns {RegularSeries}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 */
regularSeriesFactory.proto.map = function map(fn) {
  // Check fn
  if (!check.function(fn)) {
    throw new Error("INVALID_ARGUMENT: Invalid function.");
  }

  const newSeries = regularSeriesFactory(this._options);

  // Iterate on observations
  this.each((oldPeriod) => {
    const newPeriod = newSeries.period(
      oldPeriod.basePeriodStart(),
      oldPeriod.subPeriod(),
    );
    newPeriod.obs.set(fn(oldPeriod.obs.value()));
  });

  return newSeries;
};

/**
 * Runs a supplied function against all periods with observations, also passing
 * the period of a new series for outside modification. Cascades outside errors.
 * @memberof RegularSeries
 * @instance
 * @param {Function} fn
 * @returns {RegularSeries}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 */
regularSeriesFactory.proto.transform = function transform(fn) {
  // Check fn
  if (!check.function(fn)) {
    throw new Error("INVALID_ARGUMENT: Invalid function.");
  }

  const newSeries = regularSeriesFactory(this._options);

  // Iterate on observations
  this.each((oldPeriod) => {
    const newPeriod = newSeries.period(
      oldPeriod.basePeriodStart(),
      oldPeriod.subPeriod(),
    );
    fn(oldPeriod, newPeriod);
  });

  return newSeries;
};

/**
 * Runs a standard reduce operation. Cascades outside errors.
 * @memberof RegularSeries
 * @instance
 * @param {Function} fn
 * @param {*} initialAccumulator
 * @returns {*}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 */
regularSeriesFactory.proto.reduce = function reduce(fn, initialAccumulator) {
  // Check fn
  if (!check.function(fn)) {
    throw new Error("INVALID_ARGUMENT: Invalid function.");
  }

  // Check initialAccumulator - any type is value, so check arg length
  if (arguments.length < 2) {
    throw new Error("INVALID_ARGUMENT: Invalid initialAccumulator.");
  }

  // Iterate on observations
  let accumulator = initialAccumulator;
  this.each((period) => {
    accumulator = fn(accumulator, period);
  });

  return accumulator;
};

/**
 * Runs a standard filter operation and returns a new series. Cascades outside errors.
 * @memberof RegularSeries
 * @instance
 * @param {Function} fn
 * @returns {RegularSeries}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 */
regularSeriesFactory.proto.filter = function filter(fn) {
  // Check fn
  if (!check.function(fn)) {
    throw new Error("INVALID_ARGUMENT: Invalid function.");
  }

  const newSeries = regularSeriesFactory(this._options);

  // Iterate on observations
  this.each((oldPeriod) => {
    if (fn(oldPeriod)) {
      // truthy?
      const newPeriod = newSeries.period(
        oldPeriod.basePeriodStart(),
        oldPeriod.subPeriod(),
      );
      newPeriod.obs.set(oldPeriod.obs.value());
    }
  });

  return newSeries;
};

/**
 * Returns a new time series containing a sub series of this series.
 * @memberof RegularSeries
 * @instance
 * @param {RegularPeriod} rpStart
 * @param {RegularPeriod} rpEnd
 * @returns {RegularSeries}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 */
regularSeriesFactory.proto.subSeries = function subSeries(rpStart, rpEnd) {
  // Check that arguments are valid RegularPeriod objects
  if (
    !check.number(rpStart._basePeriodIndex) ||
    !check.number(rpStart._subPeriod) ||
    !check.number(rpEnd._basePeriodIndex) ||
    !check.number(rpEnd._subPeriod)
  ) {
    throw new Error("INVALID_ARGUMENT: Invalid start or end period.");
  }

  // Check that period objects are associated with this time series
  if (rpStart._series !== this || rpEnd._series !== this) {
    throw new Error(
      "INVALID_ARGUMENT: Start or end period is associated with a different time series.",
    );
  }

  // Check that start is not after end (same is fine)
  if (rpStart.index() > rpEnd.index()) {
    throw new Error(
      "INVALID_ARGUMENT: Start period must not be later than end period.",
    );
  }

  // Return a new series
  return this.filter(
    (rp) => rp.index() >= rpStart.index() && rp.index() <= rpEnd.index(),
  );
};

/**
 * Returns a new series with the argument series overlaid on this series.
 * @memberof RegularSeries
 * @instance
 * @param {RegularSeries} rts
 * @returns {RegularSeries}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 */
regularSeriesFactory.proto.overlay = function overlay(rts) {
  // Check argument
  if (!check.object(rts) || !check.object(rts._obs)) {
    throw new Error("INVALID_ARGUMENT: Invalid time series.");
  }

  // Return a new series
  const newSeries = this.clone();
  rts.each((rp) => {
    newSeries
      .period(rp.basePeriodStart(), rp.subPeriod())
      .obs.set(rp.obs.value());
  });
  return newSeries;
};

/**
 * Returns an identical copy of the series.
 * @memberof RegularSeries
 * @instance
 * @returns {RegularSeries}
 */
regularSeriesFactory.proto.clone = function clone() {
  // Return a new series
  const newSeries = regularSeriesFactory(this._options);
  this.each((rp) => {
    newSeries
      .period(rp.basePeriodStart(), rp.subPeriod())
      .obs.set(rp.obs.value());
  });
  return newSeries;
};

/**
 * Clearsall observations.
 * @memberof RegularSeries
 * @instance
 * @returns {RegularSeries}
 */
regularSeriesFactory.proto.reset = function reset() {
  this._obs = {};
  this._index = [];
  return this;
};

/**
 * Returns a JSON-TimeSeries string serialization of the tiem series.
 * @memberof RegularSeries
 * @instance
 * @returns {string}
 * @throws {Error} "NOT_SERIALIZABLE: ..."
 */
regularSeriesFactory.proto.serialize = function serialize() {
  // Create core object
  const jsonTs = {
    JsonTs: "regular",
    BasePeriod: this._options.basePeriod,
    Anchor: jsonTsDate.create(
      this._options.anchor,
      this._options.basePeriod[1],
    ),
    SubPeriods: this._options.subPeriods,
    Observations: [],
  };

  // Add observations
  const series = this;
  this.each((rp) => {
    // Throw if observation value is not JSON-expressible
    if (!jsonExpressible(rp.obs.value())) {
      throw new Error(
        "NOT_SERIALIZABLE: One or more observation values is not JSON-expressible.",
      );
    }

    // Is this observation adjacent to a previous one?
    let adjacent = false;
    if (rp.obs.hasBack()) {
      const prev = rp.obs.back();
      if (rp.index() - prev.index() === 1) {
        adjacent = true;
      }
    }

    // Add to Observations array
    if (adjacent) {
      jsonTs.Observations.push([rp.obs.value()]);
    } else {
      const tsDate = jsonTsDate.create(
        rp.basePeriodStart(),
        series._options.basePeriod[1],
      );
      if (series._options.subPeriods === 1) {
        jsonTs.Observations.push(
          [tsDate, rp.obs.value()], // omit sub period
        );
      } else {
        jsonTs.Observations.push([tsDate, rp.subPeriod(), rp.obs.value()]);
      }
    }
  });

  // Success
  return JSON.stringify(jsonTs);
};

// RegularPeriod objects

/**
 * Represents a time period in a regular time series.
 * @typedef {Object} RegularPeriod
 */
const rpProto = {};

/**
 * Factory function for creating RegularPeriod objects.
 * @private
 * @param {RegularSeries} series
 * @param {number} basePeriodIndex
 * @param {number} subPeriod
 * @returns {RegularPeriod}
 */
regularPeriodFactory = function regularPeriodFactoryFn(
  series,
  basePeriodIndex,
  subPeriod,
) {
  const rp = Object.create(rpProto);

  /**
   * Reference to the time series object associated with this period.
   * @memberof RegularPeriod
   * @private
   * @instance
   * @type {RegularSeries}
   */
  rp._series = series;

  /**
   * The base period index.
   * @memberof RegularPeriod
   * @private
   * @instance
   * @type {number}
   */
  rp._basePeriodIndex = basePeriodIndex;

  /**
   * The sub period number.
   * @memberof RegularPeriod
   * @private
   * @instance
   * @type {number}
   */
  rp._subPeriod = subPeriod;

  /**
   * The base period boundaries. Lazy calculated when needed.
   *
   * Once calculated, holds an object of the form: {start: Date, end: Date}
   *
   * @memberof RegularPeriod
   * @private
   * @instance
   * @type {Object}
   */
  rp._basePeriodBoundaries = null;

  /**
   * The sub period boundaries. Lazy calculated when needed.
   *
   * Once calculated, holds an object of the form: {start: Date|null, end: Date|null}
   *
   * @memberof RegularPeriod
   * @private
   * @instance
   * @type {Object}
   */
  rp._subPeriodBoundaries = null;

  /**
   * Object containing observation methods.
   * @memberof RegularPeriod
   * @instance
   * @type {RegularObs}
   */
  rp.obs = regularObsFactory(rp);

  // Done
  return rp;
};

/**
 * Calculates base and sub period boundaries.
 * @memberof RegularPeriod
 * @instance
 */
rpProto._getBoundaries = function _getBoundaries() {
  // Base period boundaries
  if (!this._basePeriodBoundaries) {
    this._basePeriodBoundaries = this._series._basePeriodBoundaries(
      this._basePeriodIndex,
    );
  }

  // Sub period boundaries
  if (!this._subPeriodBoundaries) {
    this._subPeriodBoundaries = this._series._subPeriodBoundaries(
      this._basePeriodIndex,
      this._subPeriod,
    );
  }
};

/**
 * Returns the series associated with the period object.
 * @memberof RegularPeriod
 * @instance
 * @returns {RegularSeries}
 */
rpProto.series = function series() {
  return this._series;
};

/**
 * Returns the start of the base/sub period.
 * @memberof RegularPeriod
 * @instance
 * @returns {Date|null}
 */
rpProto.start = function start() {
  this._getBoundaries();
  return this._subPeriodBoundaries.start; // May be null
};

/**
 * Returns the end of the base/sub period.
 * @memberof RegularPeriod
 * @instance
 * @returns {Date|null}
 */
rpProto.end = function end() {
  this._getBoundaries();
  return this._subPeriodBoundaries.end; // May be null
};

/**
 * Returns the start of the base period.
 * @memberof RegularPeriod
 * @instance
 * @returns {Date}
 */
rpProto.basePeriodStart = function basePeriodStart() {
  this._getBoundaries();
  return this._basePeriodBoundaries.start;
};

/**
 * Returns the end of the base period.
 * @memberof RegularPeriod
 * @instance
 * @returns {Date}
 */
rpProto.basePeriodEnd = function basePeriodEnd() {
  this._getBoundaries();
  return this._basePeriodBoundaries.end;
};

/**
 * Returns the sub period number.
 * @memberof RegularPeriod
 * @instance
 * @returns {number}
 */
rpProto.subPeriod = function subPeriod() {
  return this._subPeriod;
};

/**
 * Returns the number of sub periods away from the anchor. The period directly
 * after the anchor is indexed to 0.
 * @memberof RegularPeriod
 * @instance
 * @returns {number}
 */
rpProto.index = function index() {
  return (
    this._basePeriodIndex * this._series._options.subPeriods +
    this._subPeriod -
    1
  );
};

/**
 * Returns a future period. If no argument is provided, returns the next period.
 * @memberof RegularPeriod
 * @instance
 * @param {number} num
 * @returns {RegularPeriod}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 */
rpProto.forward = function forward(num = 1) {
  // Check num
  if (!check.integer(num)) {
    throw new Error("INVALID_ARGUMENT: Invalid number of periods.");
  }

  // Calculate the base period index and sub period
  // Works with positive and negative indexes
  const index = this.index() + num;
  const basePeriodIndex = Math.floor(index / this._series._options.subPeriods);
  const subPeriod = Math.abs(index % this._series._options.subPeriods) + 1;

  // Success
  return regularPeriodFactory(this._series, basePeriodIndex, subPeriod);
};

/**
 * Returns a past period. If no argument is provided, returns the previous period.
 * @memberof RegularPeriod
 * @instance
 * @param {number} num
 * @returns {RegularPeriod}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 */
rpProto.back = function back(num = 1) {
  return this.forward(-num);
};

// RegularObs objects

/**
 * Observation functionality held in RegularPeriod. All RegularPeriod objects
 * hold a RegularObs, irrespective of whether an observation exists.
 *
 * Maintain a reference to the containing RegularPeriod.
 * @typedef {Object} RegularObs
 */

const roProto = {};

/**
 * Factory function for creating RegularObs objects.
 * @private
 * @param {RegularPeriod} period
 * @returns {RegularObs}
 */
regularObsFactory = function regularObsFactoryFn(period) {
  const ro = Object.create(roProto);

  /**
   * Reference to the containing RegularPeriod.
   * @memberof RegularObs
   * @private
   * @instance
   * @type {RegularPeriod}
   */
  ro._period = period;

  // Done
  return ro;
};

/**
 * Sets the observation value.
 * @memberof RegularPeriod
 * @instance
 * @param {*} value
 * @returns {RegularPeriod}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 */
roProto.set = function set(...args) {
  // Using ...args because it needs to accept explicit but not implicit undefined

  const period = this._period;
  const series = this._period._series;

  const bpStr = `${period._basePeriodIndex}`;
  const spStr = `${period._subPeriod}`;

  // Ensure that a value was provided (explicit undefined is fine)
  // Accept extraneous arguments, as elsewhere
  if (args.length < 1) {
    throw new Error("INVALID_ARGUMENT: No value specified.");
  }

  // Note whether an observation exists and if not, add to index
  const hadObservation = period.obs.exists();

  // Add to series._obs
  if (!series._obs[bpStr]) {
    series._obs[bpStr] = {};
  }
  [series._obs[bpStr][spStr]] = args;

  // Add to series._index if new observation
  if (!hadObservation) {
    const loc = series._indexInsertLocation(
      period._basePeriodIndex,
      period._subPeriod,
    );
    series._index.splice(
      loc, // edit at
      0, // delete none
      [period._basePeriodIndex, period._subPeriod], // insert this
    );
  }

  // Done
  return period;
};

/**
 * Clears the observation value.
 * @memberof RegularObs
 * @instance
 * @returns {RegularPeriod}
 */
roProto.clear = function clear() {
  const period = this._period;
  const series = this._period._series;

  const bpStr = `${period._basePeriodIndex}`;
  const spStr = `${period._subPeriod}`;

  // Note whether an observation exists - if so, remove from index
  // Should really just stop if not
  const hadObservation = period.obs.exists();

  // Remove from series._obs
  if (series._obs[bpStr]) {
    // Delete the sub period value
    delete series._obs[bpStr][spStr]; // Succeeds if missing

    // Delete the base period object if it's empty
    if (Object.keys(series._obs[bpStr]).length === 0) {
      delete series._obs[bpStr];
    }
  }

  // Remove from series._index
  if (hadObservation) {
    const loc = series._indexLocation(
      period._basePeriodIndex,
      period._subPeriod,
    );
    series._index.splice(
      loc, // edit at
      1, // delete one
      // insert nothing
    );
  }

  return period;
};

/**
 * Returns true if an observation exists and false otherwise.
 * @memberof RegularObs
 * @instance
 * @returns {boolean}
 */
roProto.exists = function exists() {
  const period = this._period;
  const series = this._period._series;

  const bpStr = `${period._basePeriodIndex}`;
  const spStr = `${period._subPeriod}`;

  // The observation value may be falsy, so explicitly check whether
  // the property exists
  return bpStr in series._obs && spStr in series._obs[bpStr];
};

/**
 * Returns the observation value.
 * @memberof RegularObs
 * @instance
 * @returns {*}
 * @throws {Error} "MISSING: ..."
 */
roProto.value = function value() {
  const period = this._period;
  const series = this._period._series;

  const bpStr = `${period._basePeriodIndex}`;
  const spStr = `${period._subPeriod}`;

  // Throw if the observation doesn't exist
  if (!this.exists()) {
    throw new Error("MISSING: There is no observation.");
  }

  // Success
  return series._obs[bpStr][spStr];
};

/**
 * Returns true if there is an observation after the current period and
 * false otherwise.
 * @memberof RegularObs
 * @instance
 * @returns {boolean}
 */
roProto.hasForward = function hasForward() {
  const period = this._period;
  const series = this._period._series;

  // Return false if no observations
  if (series._index.length === 0) {
    return false;
  }

  // Return true only if last observation is later than this one
  const lastObs = series._index[series._index.length - 1];
  const result = series._comparePeriods(
    period._basePeriodIndex,
    period._subPeriod,
    lastObs[0],
    lastObs[1],
  );
  return result < 0;
};

/**
 * Returns true if there is an observation before the current period and false
 * otherwise.
 * @memberof RegularObs
 * @instance
 * @returns {boolean}
 */
roProto.hasBack = function hasBack() {
  const period = this._period;
  const series = this._period._series;

  // Return false if no observations
  if (series._index.length === 0) {
    return false;
  }

  // Return true only if first observation is later than this one
  const firstObs = series._index[0];
  const result = series._comparePeriods(
    firstObs[0],
    firstObs[1],
    period._basePeriodIndex,
    period._subPeriod,
  );
  return result < 0;
};

/**
 * Returns the earliest observation after the current period.
 * @memberof RegularObs
 * @instance
 * @returns {RegularPeriod}
 * @throws {Error} "MISSING: ..."
 */
roProto.forward = function forward() {
  const period = this._period;
  const series = this._period._series;

  // series._indexLocation only works if there is an observation this period
  // series._indexInsertLocation only works if there is no observation this period

  if (period.obs.exists()) {
    const loc = series._indexLocation(
      period._basePeriodIndex,
      period._subPeriod,
    );

    // loc is _index.length - 1 if this is the final observation

    if (loc === series._index.length - 1) {
      throw new Error("MISSING: No later observations.");
    } else {
      const next = series._index[loc + 1];
      return regularPeriodFactory(series, next[0], next[1]);
    }
  } else {
    const loc = series._indexInsertLocation(
      period._basePeriodIndex,
      period._subPeriod,
    );

    // loc is _index.length if insertion would be the final observation

    if (loc === series._index.length) {
      throw new Error("MISSING: No later observations.");
    } else {
      const next = series._index[loc];
      return regularPeriodFactory(series, next[0], next[1]);
    }
  }
};

/**
 * Returns the latest observation before the current period.
 * @memberof RegularObs
 * @instance
 * @returns {RegularPeriod}
 * @throws {Error} "MISSING: ..."
 */
roProto.back = function back() {
  const period = this._period;
  const series = this._period._series;

  // series._indexLocation only works if there is an observation this period
  // series._indexInsertLocation only works if there is no observation this period

  if (period.obs.exists()) {
    const loc = series._indexLocation(
      period._basePeriodIndex,
      period._subPeriod,
    );

    // loc is 0 if this is the first observation

    if (loc === 0) {
      throw new Error("MISSING: No earlier observations.");
    } else {
      const prev = series._index[loc - 1];
      return regularPeriodFactory(series, prev[0], prev[1]);
    }
  } else {
    const loc = series._indexInsertLocation(
      period._basePeriodIndex,
      period._subPeriod,
    );

    // loc is 0 if insertion would be the first observation

    if (loc === 0) {
      throw new Error("MISSING: No earlier observations.");
    } else {
      const prev = series._index[loc - 1];
      return regularPeriodFactory(series, prev[0], prev[1]);
    }
  }
};

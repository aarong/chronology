import check from "check-types";
import jsonExpressible from "json-expressible";
import jsonTsDate from "./jsontsdate";

let irregularPeriodFactory;
let irregularObsFactory;

/**
 * Irregular time series object.
 * @typedef {Object} IrregularSeries
 */

/**
 * Factory function for creating IrregularSeries objects.
 * @returns {IrregularSeries}
 */
export default function irregularSeriesFactory() {
  const irregular = Object.create(irregularSeriesFactory.proto);

  /**
   * Time series observations. Ordered array with elements of the form:
   *
   * {
   *   start: Date,
   *   value: any type,
   *   end:   Date
   * }
   *
   * @memberof IrregularSeries
   * @instance
   * @private
   * @type {Array}
   */
  irregular._obs = [];

  return irregular;
}

irregularSeriesFactory.proto = {};

// Private instance functions

/**
 * Uses a bisection approach to return the location of a date in this._obs.
 * The date could be before all observations, within an observation, between
 * two observations, or after all observations.
 *
 * Takes into account that observations own their start date but not their end date.
 *
 * Returns three array indexes, all of which may be null:
 *
 * {
 *    before: Index for the observation before the specified date, null if none
 *    at:     Index for the observation containing the specified date, null if none
 *    after:  Index for the observation after the specified date, null if none
 * }
 *
 * @memberof IrregularSeries
 * @instance
 * @params {Date} date
 * @returns {Object}
 */
irregularSeriesFactory.proto._find = function _find(date) {
  // Special case: no observations
  if (this._obs.length === 0) {
    return { before: null, at: null, after: null };
  }

  // Special case: one observation
  if (this._obs.length === 1) {
    if (date < this._obs[0].start) {
      return { before: null, at: null, after: 0 };
    }
    if (date >= this._obs[0].end) {
      return { before: 0, at: null, after: null };
    }
    return { before: null, at: 0, after: null };
  }

  /*
  
  General case: two or more observations
  
  First use bisection to narrow down to two observations so that the date
  lies either before/after both, within one, or in the gap between. Then
  check each of these five cases and return as appropriate.
  
  */
  let searchStart = 0;
  let searchEnd = this._obs.length - 1;
  let searchMiddle;
  while (searchEnd > searchStart + 1) {
    // While there are 3+ observations left
    searchMiddle = Math.round((searchStart + searchEnd) / 2); // Could equal start/end
    const middleObs = this._obs[searchMiddle];

    // The date could be before, within, or after the middle observation
    if (date < middleObs.start) {
      searchEnd = searchMiddle;
    } else if (date >= middleObs.end) {
      searchStart = searchMiddle;
    } else {
      searchStart = searchMiddle;
      searchEnd = searchMiddle + 1; // Will exist (3+ above)
    }
  }

  // Down to two adjacent observations and five cases
  // Note that searchEnd === searchStart + 1
  if (date < this._obs[searchStart].start) {
    return {
      before: null,
      at: null,
      after: searchStart // 0
    };
  }
  if (
    date >= this._obs[searchStart].start &&
    date < this._obs[searchStart].end
  ) {
    return {
      before: searchStart - 1 >= 0 ? searchStart - 1 : null,
      at: searchStart,
      after: searchEnd
    };
  }
  if (date >= this._obs[searchStart].end && date < this._obs[searchEnd].start) {
    return {
      before: searchStart,
      at: null,
      after: searchEnd
    };
  }
  if (date >= this._obs[searchEnd].start && date < this._obs[searchEnd].end) {
    return {
      before: searchStart,
      at: searchEnd,
      after: searchEnd + 1 <= this._obs.length - 1 ? searchEnd + 1 : null
    };
  }
  return {
    before: searchEnd, // length - 1
    at: null,
    after: null
  };
};

// Public instance functions

/**
 * Returns an IrregularPeriod object referencing the specified date.
 * @memberof IrregularSeries
 * @instance
 * @param {Date} date
 * @returns {IrregularPeriod}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 */
irregularSeriesFactory.proto.period = function period(date) {
  // Check date
  if (!check.date(date)) {
    throw new Error("INVALID_ARGUMENT: Invalid date.");
  }

  return irregularPeriodFactory(this, date);
};

/**
 * Adds an observation to the time series.
 * @memberof IrregularSeries
 * @instance
 * @param {Date} start
 * @param {*} value
 * @param {Date} end
 * @returns {IrregularSeries}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 * @throws {Error} "COLLISION: ..."
 */
irregularSeriesFactory.proto.add = function add(start, value, end) {
  // Check argument types
  if (!check.date(start)) {
    throw new Error("INVALID_ARGUMENT: Invalid start date.");
  }
  if (!check.date(end)) {
    throw new Error("INVALID_ARGUMENT: Invalid end date.");
  }

  // End date must be strictly after the start date
  if (end <= start) {
    throw new Error(
      "INVALID_ARGUMENT: End date must by strictly later than the start date."
    );
  }

  const findStart = this._find(start);

  // Ensure no overlap with existing observations
  if (
    findStart.at !== null ||
    (findStart.after !== null && this._obs[findStart.after].start < end)
  ) {
    throw new Error(
      "COLLISION: New observation would overlap an existing observation."
    );
  }

  // Insert observation at appropriate location
  const obs = {
    start,
    value,
    end
  };
  if (findStart.after !== null) {
    // Insert before another element
    this._obs.splice(findStart.after, 0, obs);
  } else {
    // Add to the end of the array - including first observation
    this._obs.push(obs);
  }

  return this;
};

/**
 * Adds an observation to the time series, deleting and/or truncating any existing
 * observations that would overlap.
 * @memberof IrregularSeries
 * @instance
 * @param {Date} start
 * @param {*} value
 * @param {Date} end
 * @returns {IrregularSeries}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 */
irregularSeriesFactory.proto.set = function set(start, value, end) {
  // Cascade errors
  this.clear(start, end);
  this.add(start, value, end);
};

/**
 * Clears a span of time and truncates the edge observations as required.
 * @memberof IrregularSeries
 * @instance
 * @param {Date} start
 * @param {Date} end
 * @returns {IrregularSeries}
 */
irregularSeriesFactory.proto.clear = function clear(start, end) {
  // Check dates
  if (!check.date(start) || !check.date(end)) {
    throw new Error("INVALID_ARGUMENT: Invalid date.");
  }

  // Start date must be strictly before end date
  if (start >= end) {
    throw new Error(
      "INVALID_ARGUMENT: Start date must be strictly before end date."
    );
  }

  // If there is an observation spanning start, split it
  if (this.period(start).obs.exists()) {
    this.split(start);
  }

  // If there is an observation spanning end, split it
  // This could be the same observation that originally spanned start
  if (this.period(end).obs.exists()) {
    this.split(end);
  }

  // Remove all observations between start and end
  let ip = this.period(start);
  for (;;) {
    // Clear the observation if it exists
    // First may or may not exist, but the rest will
    if (ip.obs.exists()) {
      ip.obs.clear();
    }

    // Move to the next observation and break if we're done
    if (ip.obs.hasForward()) {
      ip = ip.obs.forward();
      if (ip.start() >= end) {
        break;
      }
    } else {
      break;
    }
  }

  return this;
};

/**
 * Splits an observation in two at the specified date.
 * @memberof IrregularSeries
 * @instance
 * @param {Date} date
 * @returns {IrregularSeries}
 */
irregularSeriesFactory.proto.split = function split(date) {
  // Check date
  if (!check.date(date)) {
    throw new Error("INVALID_ARGUMENT: Invalid date.");
  }

  // Is there an observation at the specified date?
  const ip = this.period(date);
  if (!ip.obs.exists()) {
    throw new Error("MISSING: There is no observation at the specified date.");
  }

  // Save the observation value and boundaries
  const start = ip.start();
  const value = ip.obs.value();
  const end = ip.end();

  // Remove the original observation and create two new ones
  // If split date is the observation start, do nothing
  if (start.getTime() !== date.getTime()) {
    ip.obs.clear();
    this.add(start, value, date);
    this.add(date, value, end);
  }

  return this;
};

/**
 * Returns the number of observations in the time series.
 * @memberof IrregularSeries
 * @instance
 * @returns {number}
 */
irregularSeriesFactory.proto.count = function count() {
  return this._obs.length;
};

/**
 * Returns an IrregularPeriod referencing the earliest observation in the time series.
 * @memberof IrregularSeries
 * @instance
 * @returns {IrregularPeriod}
 * @throws {Error} "MISSING: ..."
 */
irregularSeriesFactory.proto.first = function first() {
  if (this._obs.length === 0) {
    throw new Error("MISSING: The series has no observations.");
  } else {
    return irregularPeriodFactory(this, this._obs[0].start);
  }
};

/**
 * Return an IrregularPeriod referencing the latest observation in the time series.
 * @memberof IrregularSeries
 * @instance
 * @returns {IrregularPeriod}
 * @throws {Error} "MISSING: ..."
 */
irregularSeriesFactory.proto.last = function last() {
  if (this._obs.length === 0) {
    throw new Error("MISSING: The series has no observations.");
  } else {
    return irregularPeriodFactory(this, this._obs[this._obs.length - 1].start);
  }
};

/**
 * Calls the supplied function with each period containing an observation
 * in chronological order. Cascades outside errors.
 * @memberof IrregularSeries
 * @instance
 * @param {Function} fn
 * @returns {IrregularSeries}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 */
irregularSeriesFactory.proto.each = function each(fn) {
  // Check arg
  if (!check.function(fn)) {
    throw new Error("INVALID_ARGUMENT: Must supply a function.");
  }

  // Exit if no observations
  if (this._obs.length === 0) {
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
 * Calls the supplied function with each period in sequence, beginning with
 * the first observation and ending with the last (no edge periods).
 * Cascades outside errors.
 * @memberof IrregularSeries
 * @instance
 * @param {Function} fn
 * @returns {IrregularSeries}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 */
irregularSeriesFactory.proto.eachPeriod = function eachPeriod(fn) {
  // Check arg
  if (!check.function(fn)) {
    throw new Error("INVALID_ARGUMENT: Must supply a function.");
  }

  // Exit if no observations
  if (this._obs.length === 0) {
    return this;
  }

  // Iterate
  let period;
  do {
    period = period ? period.forward() : this.first();
    fn(period); // Cascade errors
  } while (period.hasForward());

  return this;
};

/**
 * Performs a standard map operation. Cascades outside errors.
 * @memberof IrregularSeries
 * @instance
 * @param {Function} fn
 * @returns {IrregularSeries}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 */
irregularSeriesFactory.proto.map = function map(fn) {
  // Check fn
  if (!check.function(fn)) {
    throw new Error("INVALID_ARGUMENT: Invalid function.");
  }

  const newSeries = irregularSeriesFactory();

  // Iterate on observations
  this.each(period => {
    newSeries.add(period.start(), fn(period.obs.value()), period.end());
  });

  return newSeries;
};

/**
 * Performs a standard reduce operation. Cascades outside errors.
 * @memberof IrregularSeries
 * @instance
 * @param {Function} fn
 * @param {*} initialAccumulator
 * @returns {*}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 */
irregularSeriesFactory.proto.reduce = function reduce(fn, initialAccumulator) {
  // Check fn
  if (!check.function(fn)) {
    throw new Error("INVALID_ARGUMENT: Invalid function.");
  }

  // Check initialAccumulator - any type, so check arg length
  if (arguments.length < 2) {
    throw new Error("INVALID_ARGUMENT: Invalid initialAccumulator.");
  }

  // Iterate on observations
  let accumulator = initialAccumulator;
  this.each(period => {
    accumulator = fn(accumulator, period);
  });

  return accumulator;
};

/**
 * Performs a standard filter operation returning a new series. Cascades
 * outside errors.
 * @memberof IrregularSeries
 * @instance
 * @param {Function} fn
 * @returns {IrregularSeries}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 */
irregularSeriesFactory.proto.filter = function filter(fn) {
  // Check fn
  if (!check.function(fn)) {
    throw new Error("INVALID_ARGUMENT: Invalid function.");
  }

  const newSeries = irregularSeriesFactory();

  // Iterate on observations
  this.each(period => {
    if (fn(period)) {
      // truthy?
      newSeries.add(period.start(), period.obs.value(), period.end());
    }
  });

  return newSeries;
};

/**
 * Returns a sub series.
 * @memberof IrregularSeries
 * @instance
 * @param {Date} start
 * @param {Date} end
 * @returns {IrregularSeries}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 */
irregularSeriesFactory.proto.subSeries = function subSeries(start, end) {
  // Check arguments
  if (!check.date(start) || !check.date(end)) {
    throw new Error("INVALID_ARGUMENT: Invalid start or end date.");
  }

  // Check sequence
  if (start >= end) {
    throw new Error(
      "INVALID_ARGUMENT: End date must be strictly after start date."
    );
  }

  // Create the subSeries
  const its = irregularSeriesFactory();
  let ip = this.period(start); // Could be edge, obs, gap
  for (;;) {
    if (ip.obs.exists()) {
      // Leading period may not have an obs; all subsequent will
      const obsStart = ip.start() < start ? start : ip.start();
      const obsEnd = ip.end() > end ? end : ip.end();
      its.add(obsStart, ip.obs.value(), obsEnd);
    }
    if (ip.obs.hasForward()) {
      ip = ip.obs.forward();
      if (ip.start() >= end) {
        break;
      }
    } else {
      break;
    }
  }

  return its;
};

/**
 * Creates a clone of the series and overlays the argument series.
 * @memberof IrregularSeries
 * @instance
 * @param {IrregularSeries} series
 * @returns {IrregularSeries}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 */
irregularSeriesFactory.proto.overlay = function overlay(series) {
  // Check overlay series
  if (!check.object(series) || !check.array(series._obs)) {
    throw new Error("INVALID_ARGUMENT: Invalid series.");
  }

  // Clone and overlay
  const ret = this.clone();
  series.each(ip => {
    ret.set(ip.start(), ip.obs.value(), ip.end());
  });

  return ret;
};

/**
 * Clones a series.
 * @memberof IrregularSeries
 * @instance
 * @returns {IrregularSeries}
 */
irregularSeriesFactory.proto.clone = function clone() {
  const series = irregularSeriesFactory();
  this.each(ip => {
    series.add(ip.start(), ip.obs.value(), ip.end());
  });
  return series;
};

/**
 * Returns a JSON-TimeSeries string serialization.
 * @memberof IrregularSeries
 * @instance
 * @returns {String}
 */
irregularSeriesFactory.proto.serialize = function serialize() {
  // Create core object
  const jsonTs = {
    JsonTs: "irregular",
    Observations: []
  };

  // Add observations
  this.each(ip => {
    // Throw if observation value is not JSON-expressible
    if (!jsonExpressible(ip.obs.value())) {
      throw new Error(
        "NOT_SERIALIZABLE: One or more observation values is not JSON-expressible."
      );
    }

    const obs = [jsonTsDate.create(ip.start(), "ms"), ip.obs.value()];

    // Is this observation contiguous with the next?
    if (
      !ip.obs.hasForward() ||
      ip.obs
        .forward()
        .start()
        .getTime() !== ip.end().getTime()
    ) {
      obs.push(jsonTsDate.create(ip.end(), "ms"));
    }

    jsonTs.Observations.push(obs);
  });

  // Success
  return JSON.stringify(jsonTs);
};

/**
 * Deleted all observations.
 * @memberof IrregularSeries
 * @instance
 * @returns {IrregularSeries}
 */
irregularSeriesFactory.proto.reset = function reset() {
  this._obs = [];
  return this;
};

/**
 * Returns "irregular".
 * @memberof IrregularSeries
 * @instance
 * @returns {string}
 */
irregularSeriesFactory.proto.type = function type() {
  return "irregular";
};

// IrregularPeriod objects

/**
 * Represents a time period in an irregular time series.
 * @typedef {Object} IrregularPeriod
 */
const ipProto = {};

/**
 * Factory function for creating IrregularPeriod objects.
 * @private
 * @param {IrregularSeries} series
 * @param {Date} date
 * @returns {IrregularPeriod}
 */
irregularPeriodFactory = function irregularPeriodFactoryFn(series, date) {
  const ip = Object.create(ipProto);

  /**
   * Reference to the IrregularSeries associated with this period.
   * @memberof IrregularPeriod
   * @private
   * @instance
   * @type {IrregularSeries}
   */
  ip._series = series;

  /**
   * The reference date for this IrregularPeriod.
   * @memberof IrregularPeriod
   * @private
   * @instance
   * @type {Date}
   */
  ip._date = date;

  /**
   * Object containing observation methods.
   * @memberof IrregularPeriod
   * @instance
   * @type {IrregularObs}
   */
  ip.obs = irregularObsFactory(ip);

  // Done
  return Object.freeze(ip);
};

/**
 * Returns the time series associated with this object.
 * @memberof IrregularPeriod
 * @instance
 * @returns {IrregularSeries}
 */
ipProto.series = function series() {
  return this._series;
};

/**
 * Returns the reference date.
 * @memberof IrregularPeriod
 * @instance
 * @returns {Date}
 */
ipProto.date = function date() {
  return this._date;
};

/**
 * Returns the start of the period.
 * @memberof IrregularPeriod
 * @instance
 * @returns {Date|null}
 */
ipProto.start = function start() {
  const findObs = this._series._find(this._date);

  if (findObs.at !== null) {
    return this._series._obs[findObs.at].start;
  }
  if (findObs.before !== null) {
    return this._series._obs[findObs.before].end;
  }
  return null;
};

/**
 * Returns the end of the period.
 * @memberof IrregularPeriod
 * @instance
 * @returns {Date|null}
 */
ipProto.end = function end() {
  const findObs = this._series._find(this._date);

  if (findObs.at !== null) {
    return this._series._obs[findObs.at].end;
  }
  if (findObs.after !== null) {
    return this._series._obs[findObs.after].start;
  }
  return null;
};

/**
 * Returns true only if there is an observation starting after the reference date.
 * @memberof IrregularPeriod
 * @instance
 * @returns {bool}
 */
ipProto.hasForward = function hasForward() {
  const findObs = this._series._find(this._date);
  return findObs.after !== null;
};

/**
 * Returns the next period (observation or gap only, no edges).
 * @memberof IrregularPeriod
 * @instance
 * @returns {IrregularPeriod}
 * @throws {Error} "MISSING: ..."
 */
ipProto.forward = function forward() {
  const findObs = this._series._find(this._date);

  // Are we already past the last observation? Or do we have an empty series?
  if (findObs.after === null) {
    throw new Error("MISSING: There are no later periods.");
  }

  // Return period with new reference date
  let refDate;
  if (findObs.at === null) {
    refDate = this._series._obs[findObs.after].start;
  } else {
    // On an obs - prev period could be gap or another obs
    // but either way starts on end of current obs
    refDate = this._series._obs[findObs.at].end;
  }

  // Done
  return irregularPeriodFactory(this._series, refDate);
};

/**
 * Returns true only if there is an observation ending before the reference date.
 * @memberof IrregularPeriod
 * @instance
 * @returns {bool}
 */
ipProto.hasBack = function hasBack() {
  const findObs = this._series._find(this._date);
  return findObs.before !== null;
};

/**
 * Returns the previous period (observation or gap only, no edges).
 * @memberof IrregularPeriod
 * @instance
 * @returns {IrregularPeriod}
 * @throws {Error} "MISSING: ..."
 */
ipProto.back = function back() {
  const findObs = this._series._find(this._date);

  // Are we already before the first observation? Or do we have an empty series?
  if (findObs.before === null) {
    throw new Error("MISSING: There are no earlier periods.");
  }

  // Determine the reference date for the return period
  let refDate;
  if (findObs.at === null) {
    // On a gap
    refDate = this._series._obs[findObs.before].start;
  } else {
    // On an obs - prev period could be gap or another obs
    // eslint-disable-next-line no-lonely-if
    if (
      this._series._obs[findObs.before].end.getTime() ===
      this._series._obs[findObs.at].start.getTime()
    ) {
      refDate = this._series._obs[findObs.before].start; // Obs start
    } else {
      refDate = this._series._obs[findObs.before].end; // Gap start
    }
  }

  // Done
  return irregularPeriodFactory(this._series, refDate);
};

// IrregularObs objects

/**
 * Observation functionality held in IrregularPeriod. All IrregularPeriod objects
 * hold an IrregularObs, irrespective of whether an observation exists at the
 * reference date.
 *
 * IrregularObs objects maintain a reference to the containing period.
 * @typedef {Object} IrregularObs
 */
const ioProto = {};

/**
 * Factory function for creating IrregularObs objects.
 * @private
 * @param {IrregularPeriod} period
 * @returns {IrregularObs}
 */
irregularObsFactory = function irregularObsFactoryFn(period) {
  const io = Object.create(ioProto);

  /**
   * Reference to the associated IrregularPeriod.
   * @memberof IrregularObs
   * @private
   * @instance
   * @type {IrregularPeriod}
   */
  io._period = period;

  // Done
  return io;
};

/**
 * Returns whether an observation exists at the date referenced by the period.
 * Returns false if no observations, before-start, or after-end.
 * @memberof IrregularObs
 * @instance
 * @returns {bool}
 */
ioProto.exists = function exists() {
  const period = this._period;
  const series = this._period._series;

  const findObs = series._find(period._date);

  return findObs.at !== null;
};

/**
 * Sets the observation value for the period referenced by this._date.
 * @memberof IrregularObs
 * @instance
 * @param {*} value
 * @returns {IrregularPeriod}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 * @throws {Error} "INVALID_PERIOD: ..."
 */
ioProto.set = function set(...args) {
  // Using ...args because need to accept explicit but not implicit undefined

  // Ensure that a value was provided (explicit undefined is fine)
  // Accept extraneous, as elsewhere
  if (args.length < 1) {
    throw new Error("INVALID_ARGUMENT: No value specified.");
  }

  const period = this._period;
  const series = period._series;

  const findObs = series._find(period._date);

  // Error if the series is empty or period is before-first-obs or after-last-obs
  if (
    findObs.at === null &&
    (findObs.before === null || findObs.after === null)
  ) {
    throw new Error(
      "INVALID_PERIOD: Cannot assign a value to the period before the first observation, the period after the last observation, or to an empty series."
    );
  }

  // Write the observation value (update or add)
  if (findObs.at !== null) {
    [series._obs[findObs.at].value] = args;
  } else {
    series.add(
      series._obs[findObs.before].end,
      args[0],
      series._obs[findObs.after].start
    );
  }

  return period;
};

/**
 * Clears the observation value for the period.
 * @memberof IrregularObs
 * @instance
 * @returns {IrregularPeriod}
 * @throws {Error} "INVALID_PERIOD: ..."
 */
ioProto.clear = function clear() {
  const period = this._period;
  const series = period._series;

  const findObs = series._find(period._date);

  // Error if the period is before-first-obs or after-last-obs
  if (
    findObs.at === null &&
    (findObs.before === null || findObs.after === null)
  ) {
    throw new Error(
      "INVALID_PERIOD: Can never assign a value to the period before the first observation and after the last observation."
    );
  }

  // Clear the observation value if it exists
  if (findObs.at !== null) {
    series._obs.splice(findObs.at, 1);
  }

  return period;
};

/**
 * Returns the observation value.
 * @memberof IrregularObs
 * @instance
 * @returns {*}
 * @throws {Error} "MISSING: ..."
 * @throws {Error} "INVALID_PERIOD: ..."
 */
ioProto.value = function value() {
  const period = this._period;
  const series = this._period._series;

  const findObs = series._find(period._date);

  // Error if the period is before-first-obs, after-last-obs, or there are no obs
  if (
    findObs.at === null &&
    (findObs.before === null || findObs.after === null)
  ) {
    throw new Error(
      "INVALID_PERIOD: Can never assign a value to the period before the first observation and after the last observation."
    );
  }

  // Error if no observation
  if (findObs.at === null) {
    throw new Error(
      "MISSING: There is no observation spanning the reference date."
    );
  }

  return series._obs[findObs.at].value;
};

/**
 * Identical logic to ipProto.hasForward()
 * @memberof IrregularObs
 * @instance
 * @returns {bool}
 */
ioProto.hasForward = function hasForward() {
  const findObs = this._period._series._find(this._period._date);
  return findObs.after !== null;
};

/**
 * Returns an IrregularPeriod referencing the next observation.
 * @memberof IrregularObs
 * @instance
 * @returns {IrregularPeriod}
 * @throws {Error} "MISSING: ..."
 */
ioProto.forward = function forward() {
  const period = this._period;
  const series = period._series;

  const findObs = series._find(this._period._date);

  if (findObs.after === null) {
    throw new Error("MISSING: There are no later observations.");
  }

  return irregularPeriodFactory(series, series._obs[findObs.after].start);
};

/**
 * Identical logic to ipProto.hasBack()
 * @memberof IrregularObs
 * @instance
 * @returns {bool}
 */
ioProto.hasBack = function hasBack() {
  const findObs = this._period._series._find(this._period._date);
  return findObs.before !== null;
};

/**
 * Returns an IrregularPeriod referencing the previous observation.
 * @memberof IrregularObs
 * @instance
 * @returns {IrregularPeriod}
 * @throws {Error} "MISSING: ..."
 */
ioProto.back = function back() {
  const period = this._period;
  const series = period._series;

  const findObs = series._find(this._period._date);

  if (findObs.before === null) {
    throw new Error("MISSING: There are no earlier observations.");
  }

  return irregularPeriodFactory(series, series._obs[findObs.before].start);
};

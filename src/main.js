import check from "check-types";
import regular from "./regular";
import irregular from "./irregular";
import jsonTsDate from "./jsontsdate";

/**
 * Core app-facing module. A singleton.
 * @type {Object}
 */
const chronology = {};
export default chronology;

/**
 * Factory function for regular time series.
 * @memberof chronology
 * @instance
 * @type {Function}
 * @param {Object} options
 * @returns {RegularSeries}
 * @throws {Error} "INVALID_ARGUMENT: ..."
 */
chronology.regular = regular;

/**
 * Factory function for irregular time series.
 * @memberof chronology
 * @instance
 * @type {Function}
 * @returns {IrregularSeries}
 */
chronology.irregular = irregular;

/**
 * Unserializes a JSON-TimeSeries time series.
 * @memberof chronology
 * @instance
 * @param {String} jsonTs
 * @param {Function} subPeriodBoundaries
 * @returns {RegularSeries|IrregularSeries}
 * @throws "INVALID_ARGUMENT: ..."
 * @throws "INVALID_JSONTS: ..."
 * @throws "NOT_SUPPORTED: ..."
 */
chronology.unserialize = function unserialize(jsonTs, subPeriodBoundaries) {
  // Check jsonTs type
  if (!check.string(jsonTs)) {
    throw new Error("INVALID_ARGUMENT: String required.");
  }

  // Check subPeriodBoundaries type if present
  if (!!subPeriodBoundaries && !check.function(subPeriodBoundaries)) {
    throw new Error("INVALID_ARGUMENT: Invalid subPeriodBoundaries function.");
  }

  // Parse JSON
  let obj;
  try {
    obj = JSON.parse(jsonTs);
  } catch (e) {
    throw new Error("INVALID_JSONTS: Invalid JSON.");
  }

  // Must be an object
  if (!check.object(obj)) {
    throw new Error("INVALID_JSONTS: Must be an object.");
  }

  // JsonTs property must be a string
  if (!check.string(obj.JsonTs)) {
    throw new Error("INVALID_JSONTS: JsonTs parameter must be a string.");
  }

  // JsonTs property must be 'regular' or 'irregular'
  const type = obj.JsonTs.toLowerCase();
  if (type !== "regular" && type !== "irregular") {
    throw new Error(
      "INVALID_JSONTS: JsonTs parameter must be 'regular' or 'irregular'.",
    );
  }

  // Observations property must be an array
  if (!check.array(obj.Observations)) {
    throw new Error("INVALID_JSONTS: Observations parameter must be an array.");
  }

  // Process according to type
  if (type === "regular") {
    return this._unserializeRegular(obj, subPeriodBoundaries);
  }
  return this._unserializeIrregular(obj);
};

/**
 * Unserializes a JSON-TimeSeries regular time series.
 * @memberof chronology
 * @instance
 * @private
 * @param {Ojbect} obj
 * @param {Function} subPeriodBoundaries
 * @returns {RegularSeries}
 * @throws "INVALID_JSONTS: ..."
 * @throws "NOT_SUPPORTED: ..."
 */
chronology._unserializeRegular = function _unserializeRegular(
  obj,
  subPeriodBoundaries,
) {
  // BasePeriod property must be an array of length 2
  if (!check.array(obj.BasePeriod) || obj.BasePeriod.length !== 2) {
    throw new Error(
      "INVALID_JSONTS: BasePeriod parameter must be array of length 2.",
    );
  }

  // BasePeriodNumber must be a positive integer
  if (!check.integer(obj.BasePeriod[0]) || obj.BasePeriod[0] < 1) {
    throw new Error(
      "INVALID_JSONTS: BasePeriodNumber parameter must be a strictly positive integer.",
    );
  }

  // BasePeriodType must be valid
  if (!chronology.regular._basePeriods.includes(obj.BasePeriod[1])) {
    throw new Error("INVALID_JSONTS: Invalid BasePeriodType.");
  }

  // BasePeriodType must be supported
  if (!chronology.regular._supportedBasePeriods.includes(obj.BasePeriod[1])) {
    throw new Error(
      "NOT_SUPPORTED: Sub-millisecond BasePeriodType is not supported.",
    );
  }

  // Anchor property must be valid if specified
  let anchor;
  if ("Anchor" in obj) {
    try {
      anchor = jsonTsDate.parse(obj.Anchor);
    } catch (e) {
      if (e.message.substr(0, 14) === "NOT_SUPPORTED:") {
        throw new Error(
          "NOT_SUPPORTED: Anchor specified beyond millisecond precision.",
        );
      } else {
        throw new Error("INVALID_JSONTS: Invalid Anchor parameter.");
      }
    }
  }

  // SubPeriods property must be valid if specified
  if (
    "SubPeriods" in obj &&
    (!check.integer(obj.SubPeriods) || obj.SubPeriods < 1)
  ) {
    throw new Error(
      "INVALID_JSONTS: SubPeriods parameter must be a positive integer if specified.",
    );
  }
  const subPeriods = obj.SubPeriods || 1;

  // Start assembling the object
  const options = {
    basePeriod: obj.BasePeriod,
    subPeriods,
  };
  if (anchor) {
    options.anchor = anchor;
  }
  if (subPeriodBoundaries) {
    options.subPeriodBoundaries = subPeriodBoundaries;
  }
  const rts = chronology.regular(options);

  // Check and add each observation
  for (let i = 0; i < obj.Observations.length; i += 1) {
    const obs = obj.Observations[i];

    // Element must be array
    if (!check.array(obs)) {
      throw new Error("INVALID_JSONTS: Invalid observation.");
    }

    // Array length must be valid
    if (obs.length < 1 || obs.length > 3) {
      throw new Error("INVALID_JSONTS: Invalid observation.");
    }

    if (obs.length === 3) {
      // Type 1 observations

      // Validate base period date
      let basePeriodDate;
      try {
        basePeriodDate = jsonTsDate.parse(obs[0]);
      } catch (e) {
        if (e.message.substr(0, 14) === "NOT_SUPPORTED:") {
          throw new Error(
            "NOT_SUPPORTED: Base period date specified beyond millisecond precision.",
          );
        } else {
          throw new Error("INVALID_JSONTS: Invalid base period date.");
        }
      }

      // Validate sub period number
      if (!check.integer(obs[1]) || obs[1] < 1 || obs[1] > subPeriods) {
        throw new Error("INVALID_JSONTS: Invalid sub period number.");
      }
      const subPeriod = obs[1];

      // Check chronology
      if (i > 0) {
        const last = rts.last();
        const comp = rts._comparePeriods(
          last.basePeriodStart(),
          last.subPeriod(),
          basePeriodDate,
          subPeriod,
        );
        if (comp >= 0) {
          throw new Error(
            "INVALID_JSONTS: Observation collision or observations not in chronological order.",
          );
        }
      }

      // Add the observation
      rts.period(basePeriodDate, subPeriod).obs.set(obs[2]);
    } else if (obs.length === 2) {
      // Type 2 observations

      // Ensure SubPeriods is 1
      if (subPeriods !== 1) {
        throw new Error("INVALID_JSONTS: Observation must specify sub period.");
      }

      // Validate base period date
      let basePeriodDate;
      try {
        basePeriodDate = jsonTsDate.parse(obs[0]);
      } catch (e) {
        if (e.message.substr(0, 14) === "NOT_SUPPORTED:") {
          throw new Error(
            "NOT_SUPPORTED: Base period date specified beyond millisecond precision.",
          );
        } else {
          throw new Error("INVALID_JSONTS: Invalid base period date.");
        }
      }

      // Check chronology
      if (i > 0) {
        const last = rts.last();
        const comp = rts._comparePeriods(
          last.basePeriodStart(),
          last.subPeriod(),
          basePeriodDate,
          1,
        );
        if (comp >= 0) {
          throw new Error(
            "INVALID_JSONTS: Observation collision or observations not in chronological order.",
          );
        }
      }

      // Add the observation
      rts.period(basePeriodDate, 1).obs.set(obs[1]);
    } else if (obs.length === 1) {
      // Type 3 observations

      // Throw if first
      if (i === 0) {
        throw new Error(
          "INVALID_JSONTS: First observation must specify an explicit period.",
        );
      }

      // Add the observation
      rts.last().forward().obs.set(obs[0]);
    }
  }

  // Done
  return rts;
};

/**
 * Unserializes a JSON-TimeSeries irregular time series.
 * @memberof chronology
 * @instance
 * @private
 * @param {Object} obj
 * @returns {IrregularSeries}
 * @throws "INVALID_JSONTS: ..."
 * @throws "NOT_SUPPORTED: ..."
 */
chronology._unserializeIrregular = function _unserializeIrregular(obj) {
  // Start assembling the object
  const its = chronology.irregular();

  // Check and add each observation
  // Operate in reverse chronological order so you can access
  // the start date of the next observation for Type 1 observations
  for (let i = obj.Observations.length - 1; i >= 0; i -= 1) {
    const obs = obj.Observations[i];

    // Check type
    if (!check.array(obs)) {
      throw new Error("INVALID_JSONTS: Invalid observation.");
    }

    // Check length
    if (obs.length < 2 || obs.length > 3) {
      throw new Error("INVALID_JSONTS: Invalid observation.");
    }

    if (obs.length === 2) {
      // Type 1 observations

      // Ensure this is not the last observation, which must have an explicit end
      if (its.count() === 0) {
        throw new Error(
          "INVALID_JSONTS: End date required for final observation.",
        );
      }

      // Validate date
      let startDate;
      try {
        startDate = jsonTsDate.parse(obs[0]);
      } catch (e) {
        if (e.message.substr(0, 14) === "NOT_SUPPORTED:") {
          throw new Error(
            "NOT_SUPPORTED: Start date specified beyond millisecond precision.",
          );
        } else {
          throw new Error("INVALID_JSONTS: Invalid start date.");
        }
      }

      // Check chronology - start must be strictly before next start
      const endDate = its.first().start();
      if (startDate >= endDate) {
        throw new Error(
          "INVALID_JSONTS: Observation collision or observations not in chronological order.",
        );
      }

      // Add the observation
      its.add(startDate, obs[1], endDate);
    } else if (obs.length === 3) {
      // Type 2 observations

      // Validate start date
      let startDate;
      try {
        startDate = jsonTsDate.parse(obs[0]);
      } catch (e) {
        if (e.message.substr(0, 14) === "NOT_SUPPORTED:") {
          throw new Error(
            "NOT_SUPPORTED: Start date specified beyond millisecond precision.",
          );
        } else {
          throw new Error("INVALID_JSONTS: Invalid start date.");
        }
      }

      // Validate end date
      let endDate;
      try {
        endDate = jsonTsDate.parse(obs[2]);
      } catch (e) {
        if (e.message.substr(0, 14) === "NOT_SUPPORTED:") {
          throw new Error(
            "NOT_SUPPORTED: End date specified beyond millisecond precision.",
          );
        } else {
          throw new Error("INVALID_JSONTS: Invalid end date.");
        }
      }

      // Validate start/end combo
      if (startDate >= endDate) {
        throw new Error(
          "INVALID_JSONTS: Observation end date must be strictly later than start date.",
        );
      }

      // Check chronology - end must be before or equal to next start, if present
      if (its.count() > 0 && endDate > its.first().start()) {
        throw new Error(
          "INVALID_JSONTS: Observation collision or observations not in chronological order.",
        );
      }

      // Add the observation
      its.add(startDate, obs[1], endDate);
    }
  }

  // Done
  return its;
};

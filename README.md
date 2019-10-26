[![Build Status](https://travis-ci.com/aarong/chronology.svg?branch=master)](https://travis-ci.com/aarong/chronology)
[![Coverage Status](https://coveralls.io/repos/github/aarong/chronology/badge.svg?branch=master)](https://coveralls.io/github/aarong/chronology?branch=master)

# Chronology.js

A flexible library for representing and manipulating time series data in
Javascript. Runs in Node.js and the browser.

- Create, query, and manipulate regular and irregular time series

- Observations can hold any type of Javascript value

- Highly configurable repetitive structure for regular time series

- Serialize and unserialize for storage

- Arbitrarily high frequencies for regular time series

- Millisecond precision for irregular time series

- Dense and sparse data represented efficiently

- Running time increases roughly linearly with observations

- Easily extensible

- Well documented and thoroughly tested

<!-- TOC depthFrom:2 -->

- [Getting Started](#getting-started)
  - [Installing the Package](#installing-the-package)
    - [NPM](#npm)
    - [CDN](#cdn)
  - [JSON-TimeSeries Primer](#json-timeseries-primer)
- [Regular Time Series API](#regular-time-series-api)
  - [RegularSeries Objects](#regularseries-objects)
    - [Initialization](#initialization)
    - [Methods](#methods)
      - [rts.period(date)](#rtsperioddate)
      - [rts.period(basePeriodDate, subPeriod)](#rtsperiodbaseperioddate-subperiod)
      - [rts.count()](#rtscount)
      - [rts.first()](#rtsfirst)
      - [rts.last()](#rtslast)
      - [rts.each(fn)](#rtseachfn)
      - [rts.eachPeriod(fn)](#rtseachperiodfn)
      - [rts.map(fn)](#rtsmapfn)
      - [rts.transform(fn)](#rtstransformfn)
      - [rts.reduce(fn, initialAccumulator)](#rtsreducefn-initialaccumulator)
      - [rts.filter(fn)](#rtsfilterfn)
      - [rts.subSeries(rpStart, rpEnd)](#rtssubseriesrpstart-rpend)
      - [rts.overlay(rts2)](#rtsoverlayrts2)
      - [rts.clone()](#rtsclone)
      - [rts.serialize()](#rtsserialize)
      - [rts.reset()](#rtsreset)
      - [rts.type()](#rtstype)
      - [rts.anchor()](#rtsanchor)
      - [rts.subPeriods()](#rtssubperiods)
  - [RegularPeriod Objects](#regularperiod-objects)
    - [Methods](#methods-1)
      - [rp.series()](#rpseries)
      - [rp.start()](#rpstart)
      - [rp.end()](#rpend)
      - [rp.basePeriodStart()](#rpbaseperiodstart)
      - [rp.basePeriodEnd()](#rpbaseperiodend)
      - [rp.subPeriod()](#rpsubperiod)
      - [rp.index()](#rpindex)
      - [rp.forward(num)](#rpforwardnum)
      - [rp.back(num)](#rpbacknum)
      - [rp.obs.exists()](#rpobsexists)
      - [rp.obs.set(value)](#rpobssetvalue)
      - [rp.obs.clear()](#rpobsclear)
      - [rp.obs.value()](#rpobsvalue)
      - [rp.obs.hasForward()](#rpobshasforward)
      - [rp.obs.forward()](#rpobsforward)
      - [rp.obs.hasBack()](#rpobshasback)
      - [rp.obs.back()](#rpobsback)
  - [Examples](#examples)
- [Irregular Time Series API](#irregular-time-series-api)
  - [IrregularSeries Objects](#irregularseries-objects)
    - [Initialization](#initialization-1)
    - [Methods](#methods-2)
      - [its.period(date)](#itsperioddate)
      - [its.add(start, value, end)](#itsaddstart-value-end)
      - [its.set(start, value, end)](#itssetstart-value-end)
      - [its.clear(start, end)](#itsclearstart-end)
      - [its.split(date)](#itssplitdate)
      - [its.count()](#itscount)
      - [its.first()](#itsfirst)
      - [its.last()](#itslast)
      - [its.each(fn)](#itseachfn)
      - [its.eachPeriod(fn)](#itseachperiodfn)
      - [its.map(fn)](#itsmapfn)
      - [its.reduce(fn)](#itsreducefn)
      - [its.filter(fn)](#itsfilterfn)
      - [its.subSeries(start, end)](#itssubseriesstart-end)
      - [its.overlay(its2)](#itsoverlayits2)
      - [its.clone()](#itsclone)
      - [its.serialize()](#itsserialize)
      - [its.reset()](#itsreset)
      - [its.type()](#itstype)
  - [IrregularPeriod Objects](#irregularperiod-objects)
    - [Methods](#methods-3)
      - [ip.series()](#ipseries)
      - [ip.date()](#ipdate)
      - [ip.start()](#ipstart)
      - [ip.end()](#ipend)
      - [ip.hasForward()](#iphasforward)
      - [ip.forward()](#ipforward)
      - [ip.hasBack()](#iphasback)
      - [ip.back()](#ipback)
      - [ip.obs.exists()](#ipobsexists)
      - [ip.obs.set(value)](#ipobssetvalue)
      - [ip.obs.clear()](#ipobsclear)
      - [ip.obs.value()](#ipobsvalue)
      - [ip.obs.hasForward()](#ipobshasforward)
      - [ip.obs.forward()](#ipobsforward)
      - [ip.obs.hasBack()](#ipobshasback)
      - [ip.obs.back()](#ipobsback)
  - [Examples](#examples-1)
- [Unserializing a Time Series](#unserializing-a-time-series)
- [Extending the Library](#extending-the-library)
  - [Extending RegularSeries](#extending-regularseries)
  - [Extending IrregularSeries](#extending-irregularseries)

<!-- /TOC -->

## Getting Started

### Installing the Package

#### NPM

Install the NPM package:

```
npm install chronology
```

Use the module:

```Javascript
const chronology = require("chronology");

// Create and iterate over a regular time series
const rts = chronology.regular({ basePeriod: [1, "y"] });
rts.period(new Date("2000-01-01Z")).obs.set(1)
  .forward().obs.set(2)
  .forward().obs.set(3);
rts.each(function(rp) {
  console.log(
    rp.start().toISOString(),
    rp.end().toISOString(),
    rp.obs.value()
  );
});

// Create and iterate over an irregular time series
const its = chronology.irregular();
its.add(new Date("2000-01-01Z"), 1, new Date("2000-06-30"));
      .add(new Date("2000-06-30Z"), 2, new Date("2000-07-15"))
      .add(new Date("2000-08-01Z"), 3, new Date("2001-02-01"));
its.each(function(ip) {
  console.log(
    ip.start().toISOString(),
    ip.end().toISOString(),
    ip.obs.value()
  );
});

```

#### CDN

The browser bundle can be included in a website as follows:

```HTML
<script
  type="text/javascript"
  src="https://cdn.jsdelivr.net/npm/chronology"
></script>
```

The module is bundled in UMD format and is named `chronology` in the global
scope.

### JSON-TimeSeries Primer

This library implements the
[JSON-TimeSeries](https://github.com/aarong/json-timeseries) format for
representing time series data. The format is relatively straight-forward and its
specification is recommended reading for library users.

Under the JSON-TimeSeries format, time is thought of as continuous and dates are
understood to refer to instants in time, as opposed to intervals of time. In the
JSON-TimeSeries format and in this library, intervals of time are represented by
a start date and an end date. An interval is considered to include the instant
referenced by its start date, but not the instant referenced by its end date,
which may be the start of a subsequent interval.

The JSON-TimeSeries format can represent regular time series of arbitrarily high
frequency and irregular time series with observation boundaries of arbitrarily
high precision. Unfortunately, since Javascript's date system operates only at
millisecond-level granularity, this library is subject to more stringent
limitations. In particular...

- `Regular time series`: To make use of all library functions, regular time
  series must have at most millisecond frequency. Higher-frequency time series
  can be represented using the JSON-TimeSeries concept of sub periods, but when
  working with such series, sub periods cannot be referenced by date and sub
  period boundaries cannot be described using dates.

- `Irregular time series`: Boundaries between observations can be specified only
  to millisecond precision.

When interacting with this library, `Date` objects should be understood to
represent the instant at the start of the specified millisecond, not the entire
millisecond. Microseconds and more granular date elements should be understood
to be exactly 0.

## Regular Time Series API

Observations in a regular time series occur over consistently-spaced intervals
of time. Applications interact with regular time series using `RegularSeries`
and `RegularPeriod` objects.

### RegularSeries Objects

#### Initialization

To create a new `RegularSeries` object representing a regular time series:

```Javascript
const rts = chronology.regular(options);
```

The `options` argument is an object with the following properties:

- `options.basePeriod` - Required `Array` specifying a JSON-TimeSeries base
  period.

  Takes the form `[basePeriodNumber, basePeriodType]`.

  The `basePeriodNumber` (positive integer) indicates the number of
  `basePeriodType`s that constitute a base period. For example, a two-week base
  period is specified using `[2, "w"]`.

  The `basePeriodType` (string) must be one of:

  - `y` - Year
  - `m` - Month
  - `w` - Week
  - `d` - Day
  - `h` - Hour
  - `n` - Minute
  - `s` - Second
  - `ms` - Millisecond
  - `e-3` - Millisecond

  Higher frequencies are not supported as base periods, as Javascript dates
  operate only at millisecond precision. However, higher frequencies can be
  achieved using numerically indexed sub periods.

- `options.anchor` - Optional `Date` specifying the JSON-TimeSeries anchor.

  Defaults to Monday at midnight UTC for weekly base periods and January 1st at
  midnight UTC for all other base periods.

- `options.subPeriods` - Optional positive integer specifying the number of
  JSON-TimeSeries sub periods within each base period.

  Sub periods can be used to create time series of arbitrarily high frequency.
  For example, microsecond frequency can be achieved by setting `basePeriod` to
  `ms` and `subPeriods` to 1000.

  Defaults to 1.

- `options.subPeriodBoundaries` - Optional function that specifies how to split
  base periods into sub periods in terms of calendar time. The JSON-TimeSeries
  format prescribes base period boundaries, but leaves sub period boundary
  determination to the library/application.

  If `subPeriodBoundaries` is omitted, the library will split base periods into
  sub periods of equal length, calculated to the millisecond.

  The `subPeriodBoundaries` function is called within the context of the time
  series object (ie `this` refers to `rts`) and is passed three arguments:

  1. `basePeriodStart` - A `Date` referencing the start of the base period
     (inclusive).

  2. `basePeriodEnd` - A `Date` referencing the end of the base period
     (exclusive).

  3. `subPeriod` - A positive integer between 1 and `subPeriods` indicating the
     sub period whose boundaries are being requested.

  Unless a precision issue arises (details below), the `subPeriodBoundaries`
  function must return an object containing two properties:

  1. `start` - A `Date` indicating the calendar start of the sub period. The
     instant represented by `start` is considered part of the sub period. The
     `start` date must be later than or equal to the start of the base period
     and strictly earlier than the end of the base period.

  2. `end` - A `Date` indicating the end of the sub period. The time leading up
     to `end` is considered part of the sub period, but the actual instant
     represented by `end` is considered part of the next sub period. The `end`
     date must be strictly later than `start` and earlier than or equal to the
     end of the base period.

  For a given base period, the `subPeriodBoundaries` function must return
  non-overlapping calendar boundaries for all sub periods. That is, the `start`
  of each sub period must be later than or equal to the `end` of the previous
  sub period.

  The `subPeriodBoundaries` function is not required to allocate the entire base
  period to sub periods. For example, a business day time series would have a
  base period of `[1, "w"]` and five sub periods representing Monday through
  Friday. In that case, Saturdays and Sundays would not correspond to sub
  periods.

  Since `start` and `end` are Javascript `Date` objects, the
  `subPeriodBoundaries` function can only describe boundaries to millisecond
  precision. If the overall frequency determined by `options.basePeriod` and
  `options.subPeriods` implies a shorter-than-millisecond duration for sub
  periods, then the library will not call `subPeriodBoundaries`. The
  `subPeriodBoundaries` function may also return `{start: null, end: null}` if
  Javascript dates are unable to represent sub period `start` and `end` dates to
  sufficient precision. In such cases, the application must reference sub
  periods by number.

  The `subPeriodBoundaries` function is subjected to a series of tests on
  initialization, which attempt to detect invalid behavior.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  There was a problem with one or more of the supplied arguments.

#### Methods

##### rts.period(date)

Returns a `RegularPeriod` object referencing the base/sub period at the
specified date.

Arguments:

- `date` (Date) references any time within the base/sub period.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  There was a problem with one or more of the supplied arguments.

- `err.message === "UNALLOCATED_DATE: ..."`

  The `options.subPeriodBoundaries` function does not allocate `date` to any sub
  period.

- `err.message === "INSUFFICIENT_PRECISION: ..."`

  Sub period boundaries could not be determined due to the precision limitations
  inherent in Javascript dates. Use `rts.period(basePeriodDate, subPeriod)`
  instead.

##### rts.period(basePeriodDate, subPeriod)

Returns a `RegularPeriod` object referencing the specified base/sub period.

Arguments:

- `basePeriodDate` (Date) references any time within the base period.

- `subPeriod` (number) indicates the number of the sub period to retrieve. Sub
  periods are indexed from 1 to `options.subPeriods`.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  There was a problem with one or more of the supplied arguments.

##### rts.count()

Returns a `number` indicating the number of observations in the series.

Errors thrown: None

##### rts.first()

Returns a `RegularPeriod` object referencing the earliest period with an
observation.

Errors thrown:

- `err.message === "MISSING: ..."`

  The time series has no observations.

##### rts.last()

Returns a `RegularPeriod` object referencing the latest period with an
observation.

Errors thrown:

- `err.message === "MISSING: ..."`

  The time series has no observations.

##### rts.each(fn)

Iterates chronologically through each observation in the time series calling
`fn(rp)`, where `rp` is a `RegularPeriod` object.

Iteration is performed using `rp.obs.forward()` after each call to `fn`, so time
series modifications by `fn` are reflected.

Returns a reference to `rts`.

Arguments:

- `fn` (Function) is called once for each observation as described above. It is
  run in the global scope.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  One or more of the supplied arguments was invalid.

- Errors thrown by `fn` are cascaded.

##### rts.eachPeriod(fn)

Iterates chronologically from the earliest to the latest observation in the time
series calling `fn(rp)` on all intervening periods, where `rp` is a
`RegularPeriod` object.

Iteration is performed using `rp.forward()` after each call to `fn`, so time
series modifications by `fn` are reflected.

Returns a reference to `rts`.

Arguments:

- `fn` (Function) is called once for each period as described above. It is run
  in the global scope.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  One or more of the supplied arguments was invalid.

- Errors thrown by `fn` are cascaded.

##### rts.map(fn)

Returns a new `RegularSeries` object constructed by iterating through all
observations in `rts` and calling `fn(v)`, where `v` is the observation value,
and assigning the return value to the same period in the new time series.

Iteration is performed using `rp.obs.forward()` after each call to `fn`, so time
series modifications by `fn` are reflected.

Arguments:

- `fn` (Function) is called once for each observation as described above. It is
  run in the global scope.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  One or more of the supplied arguments was invalid.

- Errors thrown by `fn` are cascaded.

##### rts.transform(fn)

Returns a new `RegularSeries` constructed by iterating through all observations
in `rts` and calling `fn(rpExisting, rpNew)`, where `rpExisting` is a
`RegularPeriod` referencing the observation in `rts` and `rpNew` is a
`RegularPeriod` referencing the same period in the new time series. `fn` may add
observations to the new time series using `rpNew.obs.set()`.

Iteration is performed using `rp.obs.forward()` after each call to `fn`, so time
series modifications by `fn` are reflected.

Arguments:

- `fn` (Function) is called once for each observation as described above. It is
  run in the global scope.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  One or more of the supplied arguments was invalid.

- Errors thrown by `fn` are cascaded.

##### rts.reduce(fn, initialAccumulator)

Iterates chronologically over each observation in `rts` calling
`fn(accumulator, rp)`, where `accumulator` is the current accumulator value and
`rp` is a `RegularPeriod` object referencing the current observation.

For the first observation, `fn` is passed `initialAccumulator` as the
accumulator value. For subsequent observations, `fn` is passed the return value
of the previous call to `fn` as the accumulator value.

The value returned by `fn` for the final observation is returned as the overall
method result. The return type is therefore determined by the application.

If there are no observations in `rts` then `initialAccumulator` is returned.

Iteration is performed using `rp.obs.forward()` after each call to `fn`, so time
series modifications by `fn` are reflected.

Arguments:

- `fn` (Function) is called once for each observation as described above. It is
  run in the global scope.

- `initialAccumulator` (any type) is passed as an argument with the first call
  to `fn`.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  One or more of the supplied arguments was invalid.

- Errors thrown by `fn` are cascaded.

##### rts.filter(fn)

Returns a new `RegularSeries` created by iterating chronologically over each
observation in `rts` and calling `fn(rp)`, where `rp` is a `RegularPeriod`
referencing the observation. If `fn` returns truthy, the observation is included
in the new series, otherwise it is omitted.

Iteration is performed using `rp.obs.forward()` after each call to `fn`, so time
series modifications by `fn` are reflected.

Arguments:

- `fn` (Function) is called once for each observation as described above. It is
  run in the global scope.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  One or more of the supplied arguments was invalid.

- Errors thrown by `fn` are cascaded.

##### rts.subSeries(rpStart, rpEnd)

Returns a new `RegularSeries` containing observations between `rpStart` and
`rpEnd`, inclusive.

Arguments:

- `rpStart` (RegularPeriod) indicates the startperiod for the sub series.

- `rpEnd` (RegularPeriod) indicates the end period for the sub series.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  One or more of the supplied arguments was invalid.

##### rts.overlay(rts2)

Returns a new `RegularSeries` object with observations from both `rts` `rts2`.
If `rts` and `rts2` both contain an observation for a given period, the
observation in `rts2` takes precedence.

Arguments:

- `rts2` (RegularSeries) is the time series to be overlaid on `rts`.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  One or more of the supplied arguments was invalid.

##### rts.clone()

Returns a new `RegularSeries` object with the same observations as `rts`.

Errors thrown: None

##### rts.serialize()

Returns a `string` JSON-TimeSeries serialization of the time series. Dates in
the serialization are expressed in UTC.

Observation values must be JSON-serializable using `JSON.stringify()`.

Errors thrown:

- `err.message === "NOT_SERIALIZABLE: ..."`

  The time series could not be serialized due to the presence of an `undefined`
  value, a `NaN` value, or a cyclical structure in one or more observations.

##### rts.reset()

Clears all observations and returns a reference to `rts`.

Errors thrown: None

##### rts.type()

Returns `"regular"`.

Errors thrown: None

- `rts.basePeriod()`

  Returns an `Array` with the JSON-TimeSeries base period. Takes the form
  `[basePeriodNumber, basePeriodType]`.

  Errors thrown: None

##### rts.anchor()

Returns a `Date` containing the JSON-TimeSeries anchor.

Errors thrown: None

##### rts.subPeriods()

Returns a `number` with the number of JSON-TimeSeries sub periods.

Errors thrown: None

### RegularPeriod Objects

Time periods in regular time series are represented using `RegularPeriod`
objects, which allow applications to navigate and modify observations. A
`RegularPeriod` represents a slot for an observation, but may not actually hold
and observation.

Observations are stored in the `RegularSeries` object, so modifications made to
a time series through one `RegularPeriod` object are immediately reflected in
all other `RegularPeriod` objects associated with that time series.

#### Methods

##### rp.series()

Returns a reference to the associated `RegularSeries` object.

Errors thrown: None

##### rp.start()

Returns a `Date` indicating the start of the period, which is calculated using
the `options.subPeriodBoundaries` function. The instant represented is
considered part of the period.

Returns `null` if the effective frequency of the time series is too high for sub
period boundaries to be represented using Javascript dates.

Errors thrown: None

##### rp.end()

Returns a `Date` indicating the end of the period, which is calculated using the
`options.subPeriodBoundaries` function. The instant represented is not
considered part of the current period.

Returns `null` if the effective frequency of the time series is too high for sub
period boundaries to be represented using Javascript dates.

Errors thrown: None

##### rp.basePeriodStart()

Returns a `Date` indicating the start of the base period. The instant
represented is considered part of the base period.

Errors thrown: None

##### rp.basePeriodEnd()

Returns a `Date` indicating the end of the base period. The instant represented
is not considered part of the current base period.

Errors thrown: None

##### rp.subPeriod()

Returns a `number` indicating the current sub period within the base period.

Errors thrown: None

##### rp.index()

Returns a `number` indicating the distance of the current period from the anchor
date, measured in the number of sub periods.

Errors thrown: None

##### rp.forward(num)

Returns a new `RegularPeriod` object referencing a later period in the time
series, which may or may not contain an observation.

Arguments:

- `num` (number) is the number of periods to advance. Defaults to 1. A negative
  number can be supplied to retrieve earlier periods in the time series.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  One or more of the supplied arguments was invalid.

##### rp.back(num)

Returns a new `RegularPeriod` object referencing an earlier period in the time
series, which may or may not contain an observation.

Arguments:

- `num` (number) is the number of periods to reverse. Defaults to 1. A negative
  number can be supplied to retrieve later periods in the time series.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  One or more of the supplied arguments was invalid.

##### rp.obs.exists()

Returns `true` if the period contains an observation and `false` otherwise.

Errors thrown: None

##### rp.obs.set(value)

Sets the observation value for the time period and returns a reference to `rp`.

Arguments:

- `value` (any type) is the value of the observation. Both `null` and
  `undefined` are valid observation values.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  There was a problem with one or more supplied arguments.

##### rp.obs.clear()

Clears the observation value for the time period and returns a reference to
`rp`. Returns success whether or not the period contains an observation.

Errors thrown: None

##### rp.obs.value()

Returns the observation value for the time period.

Errors thrown:

- `err.message === "MISSING: ..."`

  There is no observation assigned to the period.

##### rp.obs.hasForward()

Returns `true` if there is a later period in the time series with an observation
and `false` otherwise.

Errors thrown: None

##### rp.obs.forward()

Returns a new `RegularPeriod` referencing the next period in the time series
that contains an observation.

Errors thrown:

- `err.message === "MISSING: ..."`

  There is no later period with an observation.

##### rp.obs.hasBack()

Returns `true` if there is an earlier period in the time series with an
observation and `false` otherwise.

Errors thrown: None

##### rp.obs.back()

Returns a new `RegularPeriod` referencing the previous period in the time series
that contains an observation.

Errors thrown:

- `err.message === "MISSING: ..."`

  There is no earlier period with an obseration.

### Examples

Initialize, populate, and display a quarterly time series with an October 31
year-end:

```Javascript
// Initialize
var rts = chronology.regular({
  basePeriod: [1, "q"],
  anchor: new Date("2000-11-01")
});

// Populate
var period = rts.period(new Date("2000-11-01"));
for (var i = 0; i < 10; i += 1) {
  period.obs.set(i);
  period = period.forward();
}

// Display
rts.each(function(rp) {
  console.log(rp.start(), rp.end(), rp.obs.value());
});
```

Initialize, populate, and display a semi-monthly time series:

```Javascript
// Initialize
var rts = chronology.regular({
  basePeriod: [1, "m"],
  subPeriods: 2
});

// Populate
var period = rts.period(new Date("2000-01-01"));
for (var i = 0; i < 10; i += 1) {
  period.obs.set(i);
  period = period.forward();
}

// Display
rts.each(function(rp) {
  console.log(rp.start(), rp.end(), rp.obs.value());
});
```

Initialize, populate, and display a business day (Monday-Friday) time series:

```Javascript
// Initialize
var msPerDay = 24 * 60 * 60 * 1000;
var rts = chronology.regular({
  basePeriod: [1, "w"],
  subPeriods: 5,
  subPeriodBoundaries: function(bpStart, bpEnd, spNum) {
    return {
      start: new Date(bpStart.getTime() + (spNum - 1) * msPerDay),
      end: new Date(bpStart.getTime() + (spNum) * msPerDay)
    };
  }
});

// Populate
var period = rts.period(new Date("2000-01-03")); // Monday
for (var i = 0; i < 10; i += 1) {
  period.obs.set(i);
  period = period.forward();
}

// Display
rts.each(function(rp) {
  console.log(rp.start(), rp.end(), rp.obs.value());
});
```

Initialize, populate, and display a microsecond-frequency time series using sub
periods:

```Javascript
// Initialize
var rts = chronology.regular({
  basePeriod: [1, "ms"],
  subPeriods: 1000
});

// Populate
var period = rts.period(new Date("2000-01-01T00:00:00.000"), 995);
for (var i = 0; i < 10; i += 1) {
  period.obs.set(i);
  period = period.forward();
}

// Display
rts.each(function(rp) {
  console.log(rp.basePeriodStart(), rp.basePeriodEnd(), rp.subPeriod(), rp.obs.value());
});
```

Increment all observation values by 10 using `rts.map()`:

```Javascript
// Initialize
var rts = chronology.regular({
  basePeriod: [1, "y"]
});

// Populate
var period = rts.period(new Date("2000-01-01"));
for (var i = 0; i < 10; i += 1) {
  period.obs.set(i);
  period = period.forward();
}

// Display original
rts.each(function(rp) {
  console.log(rp.start(), rp.end(), rp.obs.value());
});

// Generate an incremented series
var rts2 = rts.map(function (val) { return val + 10; });

// Display new
rts2.each(function(rp) {
  console.log(rp.start(), rp.end(), rp.obs.value());
});
```

Generate a lagged time series using `rts.transform()`:

```Javascript
// Initialize
var rts = chronology.regular({
  basePeriod: [1, "y"]
});

// Populate
var period = rts.period(new Date("2000-01-01"));
for (var i = 0; i < 10; i += 1) {
  period.obs.set(i);
  period = period.forward();
}

// Display original
rts.each(function(rp) {
  console.log(rp.start(), rp.end(), rp.obs.value());
});

// Generate lagged series
var rts2 = rts.transform(function (rpExisting, rpNew) {
  rpNew.forward().obs.set(
    rpExisting.obs.value()
  );
});

// Display new
rts2.each(function(rp) {
  console.log(rp.start(), rp.end(), rp.obs.value());
});
```

Sum observation values using `rts.reduce()`:

```Javascript
// Initialize
var rts = chronology.regular({
  basePeriod: [1, "y"]
});

// Populate
var period = rts.period(new Date("2000-01-01"));
for (var i = 0; i < 10; i += 1) {
  period.obs.set(i);
  period = period.forward();
}

// Sum and display
var sum = rts.reduce(function (accum, rp) {
  return accum + rp.obs.value();
}, 0);
console.log(sum);
```

Retrieve observations with negative values using `rts.filter()`:

```Javascript
// Initialize
var rts = chronology.regular({
  basePeriod: [1, "y"]
});

// Populate
var period = rts.period(new Date("2000-01-01"));
for (var i = -5; i < 5; i += 1) {
  period.obs.set(i);
  period = period.forward();
}

// Display original
rts.each(function(rp) {
  console.log(rp.start(), rp.end(), rp.obs.value());
});

// Generate a filtered series
var rts2 = rts.filter(function (rp) {
  return rp.obs.value() < 0;
});

// Display new
rts2.each(function(rp) {
  console.log(rp.start(), rp.end(), rp.obs.value());
});
```

Serialize and unserialize a regular time series:

```Javascript
// Initialize
var rts = chronology.regular({
  basePeriod: [1, "y"]
});

// Populate
var period = rts.period(new Date("2000-01-01"));
for (var i = -5; i < 5; i += 1) {
  period.obs.set(i);
  period = period.forward();
}

// Display original
rts.each(function(rp) {
  console.log(rp.start(), rp.end(), rp.obs.value());
});

// Serialize and display
var ser = rts.serialize();
console.log(ser);

// Unserialize and display
var rts2 = chronology.unserialize(ser);
rts2.each(function(rp) {
  console.log(rp.start(), rp.end(), rp.obs.value());
});
```

## Irregular Time Series API

Observations in an irregular time series may occur over inconsistently-spaced
intervals of time. Applications interact with irregular time series using
`IrregularSeries` and `IrregularPeriod` objects.

### IrregularSeries Objects

#### Initialization

To create a new `IrregularSeries` object representing an irregular time series:

```Javascript
var its = chronology.irregular();
```

Errors thrown: None

#### Methods

##### its.period(date)

Returns an `IrregularPeriod` object referencing `date`. It is not required that
there be an observation spanning `date`.

Arguments:

- `date` (Date) specifies the date to be referenced by the `IrregularPeriod`
  object.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  There was a problem with one or more of the supplied arguments.

##### its.add(start, value, end)

Inserts a new observation into the time series and returns a reference to `its`.

Arguments:

- `start` (Date) indicates the start of the time period to which the observation
  value applies. The specified instant is considered part of the observation.

- `value` (any type) is the value of the observation. Both `null` and
  `undefined` are valid observation values.

- `end` (Date) indicates the end of the time period to which the observation
  value applies. The specified instant is not considered part of the
  observation.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  There was a problem with one or more of the supplied arguments.

- `err.message === "COLLISION: ..."`

  The interval defined by `start` and `end` overlaps with one or more existing
  observations.

##### its.set(start, value, end)

Inserts an observation into the time series, overwriting any existing
observations or portions of observations that would overlap. Returns a reference
to `its`.

Arguments:

- `start` (Date) indicates the start of the time period to which the observation
  value applies. The specified instant is considered part of the observation.

- `value` (any type) is the value of the observation. Both `null` and
  `undefined` are valid observation values.

- `end` (Date) indicates the end of the time period to which the observation
  value applies. The specified instant is not considered part of the
  observation.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  There was a problem with one or more of the supplied arguments.

##### its.clear(start, end)

Removes observations and portions of observations between `start` and `end`.
Returns a reference to `its`.

Returns success whether or not the period contains any observations.

Arguments:

- `start` (Date) is the start of the time period over which observations will be
  cleared. If an observation spans `start` then it will be truncated and the
  specified instant will be no longer be considered part of that observation.
- `end` (Date) is the end of the time period over which observations will be
  cleared. If an observation spans `end` then it will be truncated and the
  specified instant will continue to be considered part of that observation.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  There was a problem with one or more of the supplied arguments.

##### its.split(date)

Breaks an observation into two observations at `date`, each with the same value
as the original observation. Returns a reference to `its`.

If the observation at `date` begins at exactly `date` then no changes are made
to the time series.

Arguments:

- `date` (Date) is the date at which to split the observation. After the split,
  the referenced instant will be considered part of the later observation.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  There was a problem with one or more of the supplied arguments.

- `err.message === "MISSING: ..."`

  There was no observation at `date`.

##### its.count()

Returns a `number` indicating the number of observations in the series.

Errors thrown: None

##### its.first()

Returns an `IrregularPeriod` object referencing the start of the earliest
observation in the series.

Errors thrown:

- `err.message === "MISSING: ..."`

  The time series has no observations.

##### its.last()

Returns an `IrregularPeriod` object referencing the start of the latest
observation in the series.

Errors thrown:

- `err.message === "MISSING: ..."`

  The time series has no observations.

##### its.each(fn)

Iterates chronologically over each observation in the time series calling
`fn(ip)`, where `ip` is an `IrregularPeriod` object referencing the start of the
observation. Returns a reference to `its`.

Iteration is performed using `ip.obs.forward()` after each call to `fn`, so time
series modifications by `fn` are reflected.

Arguments:

- `fn` (Function) is called once for each observation as described above. It is
  run in the global scope.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  One or more of the supplied arguments was invalid.

- Errors thrown by `fn` are cascaded.

##### its.eachPeriod(fn)

Iterates chronologically from the first to the last observation in the time
series calling `fn(ip)` on all intervening periods, including observations and
gaps between observations. Each `ip` argument is an `IrregularPeriod` object
referencing the start of the current period. Returns a reference to `its`.

Iteration is performed using `ip.forward()` after each call to `fn`, so time
series modifications by `fn` are reflected.

Arguments:

- `fn` (Function) is called once for each period as described above. It is run
  in the global scope.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  One or more of the supplied arguments was invalid.

- Errors thrown by `fn` are cascaded.

##### its.map(fn)

Returns a new `IrregularSeries` object constructed by iterating chronologically
through all observations in `its`, calling `fn(v)` for each observation, where
`v` is the observation value, and assigning the return value as the observation
value for the same period in the new time series.

Iteration is performed using `ip.obs.forward()` after each call to `fn`, so time
series modifications by `fn` are reflected.

Arguments:

- `fn` (Function) is called once for each observation as described above. It is
  run in the global scope.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  One or more of the supplied arguments was invalid.

- Errors thrown by `fn` are cascaded.

##### its.reduce(fn)

Iterates chronologically over each observation in `its` calling
`fn(accumulator, ip)`, where `accumulator` is the current accumulator value and
`ip` is an `IrregularPeriod` object referencing the start of the current
observation.

For the first observation, `fn` is passed `initialAccumulator` as the
accumulator value. For subsequent observations, `fn` is passed the return value
of the previous call to `fn` as the accumulator value.

The value returned by `fn` for the final observation is returned as the overall
method result. The return type is therefore determined by the application.

If there are no observations in `its` then `initialAccumulator` is returned.

Iteration is performed using `ip.obs.forward()` after each call to `fn`, so time
series modifications by `fn` are reflected.

Arguments:

- `fn` (Function) is called once for each observation as described above. It is
  run in the global scope.

- `initialAccumulator` (any type) is passed as an argument with the first call
  to `fn`.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  One or more of the supplied arguments was invalid.

- Errors thrown by `fn` are cascaded.

##### its.filter(fn)

Returns a new `IrregularSeries` created by iterating chronologically over each
observation in `its` and calling `fn(ip)`, where `ip` is an `IrregularPeriod`
referencing the start of the observation. If `fn` returns truthy, the
observation is included in the new series, otherwise it is omitted.

Iteration is performed using `ip.obs.forward()` after each call to `fn`, so time
series modifications by `fn` are reflected.

Arguments:

- `fn` (Function) is called once for each observation as described above. It is
  run in the global scope.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  One or more of the supplied arguments was invalid.

- Errors thrown by `fn` are cascaded.

##### its.subSeries(start, end)

Returns a new `IrregularSeries` containing observations and portions of
observations between `start` and `end`.

Arguments:

- `start` (Date) indicates the starting date for the sub series.

- `end` (Date) indicates the ending date for the sub series.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  One or more of the supplied arguments was invalid.

##### its.overlay(its2)

Returns a new `IrregularSeries` object with observations from both `its` and
`its2`. When observations in `its` and `its2` would overlap, the observation in
`its2` takes precedence and the observation(s) in `its` are truncated or
discarded as required.

Arguments:

- `its2` (IrregularSeries) is the time series to be overlaid on `its`.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  One or more of the supplied arguments was invalid.

##### its.clone()

Returns a new `IrregularSeries` with the same observations as `its`.

Errors thrown: None

##### its.serialize()

Returns a `string` JSON-TimeSeries serialization of the time series. Dates in
the serialization are expressed in UTC.

Observation values must be JSON-serializable using `JSON.stringify()`.

Errors thrown:

- `err.message === "NOT_SERIALIZABLE: ..."`

  The time series could not be serialized due to the presence of an `undefined`
  value, a `NaN` value, or a cyclical structure in one or more observations.

##### its.reset()

Clears all observations and returns a reference to `its`.

Errors thrown: None

##### its.type()

Returns `"irregular"`.

Errors thrown: None

### IrregularPeriod Objects

Time periods in an irregular time series are represented using `IrregularPeriod`
objects, which allow applications to navigate and modify observations.

Each `IrregularPeriod` object references a specific instant in an irregular time
series. Depending on the time series and reference date, an `IrregularPeriod`
object may reference an observation, a gap between observations, the time before
the first observation, or the time after the last observation.

Observations are stored in the `IrregularSeries` object, so modifications made
to a time series through one `IrregularPeriod` object are immediately reflected
in all other `IrregularPeriod` objects associated with that time series.

#### Methods

##### ip.series()

Returns a reference to the associated `IrregularSeries` object.

Errors thrown: None

##### ip.date()

Returns a `Date` indicating the instant referenced by `ip`.

##### ip.start()

Returns a `Date` indicating the start of the current period.

If an observation spans `ip.date()`, then the start of the observation is
returned. The referenced instant is considered part of the observation.

If `ip.date()` references a gap between observations, then the end of the
previous observation is returned. The referenced instant is considered part of
the gap between observations, not part of the previous observation.

If `ip.date()` is before the first observation, then `null` is returned.

Errors thrown: None

##### ip.end()

Returns a `Date` indicating the end of the current period.

If an observation spans `ip.date()`, then the end of the observation is
returned. The referenced instant is not considered part of the observation.

If `ip.date()` references a gap between observations, then the start of the next
observation is returned. The referenced instant is considered part of the next
observation, not part of the gap between observations.

If `ip.date()` is after the last observation, then `null` is returned.

Errors thrown: None

##### ip.hasForward()

Returns `true` unless (1) `ip` references the last observation in the series,
(2) `ip` references an instant after the last observation in the series, or (3)
the time series has no observations.

If `ip.hasForward()` returns `true` then it is valid to call `ip.forward()`.

Errors thrown: None

##### ip.forward()

Returns a new `IrregularPeriod` object referencing the next period in the
series, which could be an observation or a gap between observations.

The start of the next period serves as the reference date for the returned
`IrregularPeriod` object.

Errors thrown:

- `err.message === "MISSING: ..."`

  The `ip` object already references the last observation in the time series, an
  instant after the last observation in the series, or the time series contains
  no observations.

##### ip.hasBack()

Returns `true` unless (1) `ip` references the first observation in the series,
(2) `ip` references an instant before the first observation in the series, or
(3) the time series has no observations.

If `ip.hasBack()` returns `true` then it is valid to call `ip.back()`.

Errors thrown: None

##### ip.back()

Returns a new `IrregularPeriod` object referencing the previous period in the
series, which could be an observation or a gap between observations.

The start of the previous period serves as the reference date for the returned
`IrregularPeriod` object.

Errors thrown:

- `err.message === "MISSING: ..."`

  The `ip` object already references the first observation in the time series,
  an instant before the first observation in the series, or the time series
  contains no observations.

##### ip.obs.exists()

Returns `true` if the period referenced by `ip` contains an observation and
`false` otherwise.

Returns `false` if there are no observations, or if `ip` references a date
before the first observation or after the last observation.

Errors thrown: None

##### ip.obs.set(value)

Sets the observation value for the period referenced by `ip` and returns a
reference to `ip`.

Arguments:

- `value` (any type) is the value of the observation. Both `null` and
  `undefined` are valid observation values.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."`

  There was a problem with one or more supplied arguments.

- `err.message === "INVALID_PERIOD: ..."`

  The date referenced by `ip` is before the first observation or after the last
  observation in the series, or the series has no observations. Use
  `its.add(...)` instead.

##### ip.obs.clear()

Clears the observation value for the period referenced by `ip` and returns a
reference to `ip`.

Returns success if there is no observation for the period.

Errors thrown:

- `err.message === "INVALID_PERIOD: ..."`

  The date referenced by `ip` is before the first observation or after the last
  observation in the series, or the series has no observations.

##### ip.obs.value()

Returns the observation value for the period.

Errors thrown:

- `err.message === "MISSING: ..."`

  There is no observation assigned to the period.

- `err.message === "INVALID_PERIOD: ..."`

  The date referenced by `ip` is before the first observation or after the last
  observation in the series, or the series has no observations.

##### ip.obs.hasForward()

Returns `true` unless (1) `ip` references the last observation in the series,
(2) `ip` references an instant after the last observation in the series, or (3)
the time series has no observations.

If `ip.obs.hasForward()` returns `true` then it is valid to call
`ip.obs.forward()`.

Errors thrown: None

##### ip.obs.forward()

Returns a new `IrregularPeriod` object referencing the next observation in the
time series.

The start of the next observation serves as the reference date for the returned
`IrregularPeriod` object.

Errors thrown:

- `err.message === "MISSING: ..."`

  There are no observations beginning after `its.date()`.

##### ip.obs.hasBack()

Returns `true` unless (1) `ip` references the first observation in the series,
(2) `ip` references an instant before the first observation in the series, or
(3) the time series has no observations.

If `ip.obs.hasBack()` returns `true` then it is valid to call `ip.obs.back()`.

Errors thrown: None

##### ip.obs.back()

Returns a new `IrregularPeriod` object referencing the previous observation in
the time series.

The start of the previous observation serves as the reference date for the
returned `IrregularPeriod` object.

Errors thrown:

- `err.message === "MISSING: ..."`

  There are no observations ending before or on `its.date()`.

### Examples

Initialize, populate, and display an irregular time series:

```Javascript
// Initialize
var its = chronology.irregular();

// Populate
its.add(
  new Date("2000-01-01T00:00:00.000Z"),
  "value 1",
  new Date("2001-02-03T12:34:56.789Z")
);
its.add(
  new Date("2003-04-05T00:12:34.567Z"),
  "value 2",
  new Date("2003-04-05T12:45:56.789Z")
);
its.add(
  new Date("2003-04-05T12:45:56.789Z"),
  "value 3",
  new Date("2004-01-01T00:00:00.000Z")
);

// Display
its.each(function(ip) {
  console.log(ip.start(), ip.end(), ip.obs.value());
});
```

Increment all observation values by 10 using `its.map()`:

```Javascript
// Initialize
var its = chronology.irregular();

// Populate
its.add(
  new Date("2000-01-01T00:00:00.000Z"),
  1,
  new Date("2001-02-03T12:34:56.789Z")
);
its.add(
  new Date("2003-04-05T00:12:34.567Z"),
  2,
  new Date("2003-04-05T12:45:56.789Z")
);
its.add(
  new Date("2003-04-05T12:45:56.789Z"),
  3,
  new Date("2004-01-01T00:00:00.000Z")
);

// Display original
its.each(function(ip) {
  console.log(ip.start(), ip.end(), ip.obs.value());
});

// Generate an incremented series
var its2 = its.map(function (val) { return val + 10; });

// Display new
its2.each(function(ip) {
  console.log(ip.start(), ip.end(), ip.obs.value());
});
```

Sum observation values using `its.reduce()`:

```Javascript
// Initialize
var its = chronology.irregular();

// Populate
its.add(
  new Date("2000-01-01T00:00:00.000Z"),
  1,
  new Date("2001-02-03T12:34:56.789Z")
);
its.add(
  new Date("2003-04-05T00:12:34.567Z"),
  2,
  new Date("2003-04-05T12:45:56.789Z")
);
its.add(
  new Date("2003-04-05T12:45:56.789Z"),
  3,
  new Date("2004-01-01T00:00:00.000Z")
);

// Sum and display
var sum = its.reduce(function (accum, ip) {
  return accum + ip.obs.value();
}, 0);
console.log(sum);
```

Retrieve observations with negative values using `its.filter()`:

```Javascript
// Initialize
var its = chronology.irregular();

// Populate
its.add(
  new Date("2000-01-01T00:00:00.000Z"),
  -1,
  new Date("2001-02-03T12:34:56.789Z")
);
its.add(
  new Date("2003-04-05T00:12:34.567Z"),
  0,
  new Date("2003-04-05T12:45:56.789Z")
);
its.add(
  new Date("2003-04-05T12:45:56.789Z"),
  1,
  new Date("2004-01-01T00:00:00.000Z")
);

// Display original
its.each(function(ip) {
  console.log(ip.start(), ip.end(), ip.obs.value());
});

// Generate a filtered series
var its2 = its.filter(function (ip) {
  return ip.obs.value() < 0;
});

// Display new
its2.each(function(ip) {
  console.log(ip.start(), ip.end(), ip.obs.value());
});
```

Serialize and unserialize an irregular time series:

```Javascript
// Initialize
var its = chronology.irregular();

// Populate
its.add(
  new Date("2000-01-01T00:00:00.000Z"),
  -1,
  new Date("2001-02-03T12:34:56.789Z")
);
its.add(
  new Date("2003-04-05T00:12:34.567Z"),
  0,
  new Date("2003-04-05T12:45:56.789Z")
);
its.add(
  new Date("2003-04-05T12:45:56.789Z"),
  1,
  new Date("2004-01-01T00:00:00.000Z")
);

// Display original
its.each(function(ip) {
  console.log(ip.start(), ip.end(), ip.obs.value());
});

// Serialize and display
var ser = its.serialize();
console.log(ser);

// Unserialize and display
var its2 = chronology.unserialize(ser);
its2.each(function(ip) {
  console.log(ip.start(), ip.end(), ip.obs.value());
});
```

## Unserializing a Time Series

Regular and irregular time series represented in JSON-TimeSeries format can be
unserialized as follows:

```Javascript
var ts = chronology.unserialize(jsonTs, subPeriodBoundaries);
```

The resulting value of `ts` is either a `RegularSeries` or an `IrregularSeries`
object. The type of series can be determined using `ts.type()`.

Arguments:

- `jsonTs` (required string) is a time series serialized in JSON-TimeSeries
  format.

- `subPeriodBoundaries` (optional function) specifies how to determine sub
  period boundaries for regular time series. The option is disregarded for
  irregular time series. See the regular time series initialization
  documentation for details.

Errors thrown:

- `err.message === "INVALID_ARGUMENT: ..."

One or more supplied arguments was invalid.

- `err.message === "INVALID_JSONTS: ..."

There was a problem with the structure of `jsonTs`.

- `err.message === "NOT_SUPPORTED: ..."

The supplied time series uses a JSON-TimeSeries feature that is not supported by
this library.

## Extending the Library

### Extending RegularSeries

The prototype for `RegularSeries` objects is exposed as
`chronology.regular.proto` for extension.

For example, a `sum()` function can be added as follows:

```Javascript
chronology.regular.proto.sum = function() {
  return this.reduce(function(a, rp) {
    return a + rp.obs.value();
  }, 0);
};
```

And used as follows:

```Javascript
// Initialize
var rts = chronology.regular({
  basePeriod: [1, "y"]
});

// Populate
var period = rts.period(new Date("2000-01-01"));
for (var i = 0; i < 10; i += 1) {
  period.obs.set(i);
  period = period.forward();
}

// Use the sum function
console.log(rts.sum());
```

### Extending IrregularSeries

The prototype for `IrregularSeries` objects is exposed as
`chronology.irregular.proto` for extension.

For example, a `sum()` function can be added as follows:

```Javascript
chronology.irregular.proto.sum = function() {
  return this.reduce(function(a, ip) {
    return a + ip.obs.value();
  }, 0);
};
```

And used as follows:

```Javascript
// Initialize
var its = chronology.irregular();

// Populate
its.add(
  new Date("2000-01-01T00:00:00.000Z"),
  1,
  new Date("2001-02-03T12:34:56.789Z")
);
its.add(
  new Date("2003-04-05T00:12:34.567Z"),
  2,
  new Date("2003-04-05T12:45:56.789Z")
);
its.add(
  new Date("2003-04-05T12:45:56.789Z"),
  3,
  new Date("2004-01-01T00:00:00.000Z")
);

// Use the sum function
console.log(its.sum());
```

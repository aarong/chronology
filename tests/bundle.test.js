import chronology from "../build/bundle";

// Run the examples from the documentation as a basic smoke test
// Identical for index.js and bundle.js

describe("Initialization example", () => {
  it("Should work", () => {
    // Create and iterate over a regular time series
    const rts = chronology.regular({ basePeriod: [1, "y"] });
    rts
      .period(new Date("2000-01-01Z"))
      .obs.set(1)
      .forward()
      .obs.set(2)
      .forward()
      .obs.set(3);
    // rts.each(rp => {
    //   console.log(
    //     rp.start().toISOString(),
    //     rp.end().toISOString(),
    //     rp.obs.value()
    //   );
    // });

    // Create and iterate over an irregular time series
    const its = chronology.irregular();
    its
      .add(new Date("2000-01-01Z"), 1, new Date("2000-06-30"))
      .add(new Date("2000-06-30Z"), 2, new Date("2000-07-15"))
      .add(new Date("2000-08-01Z"), 3, new Date("2001-02-01"));
    // its.each(ip => {
    //   console.log(
    //     ip.start().toISOString(),
    //     ip.end().toISOString(),
    //     ip.obs.value()
    //   );
    // });

    expect(true).toBe(true);
  });
});

describe("RegularSeries examples", () => {
  it("Initialize, populate, and display a quarterly time series with October 31st year-end:", () => {
    // Initialize
    const rts = chronology.regular({
      basePeriod: [1, "q"],
      anchor: new Date("2000-11-01")
    });

    // Populate
    let period = rts.period(new Date("2000-11-01"));
    for (let i = 0; i < 10; i += 1) {
      period.obs.set(i);
      period = period.forward();
    }

    // Display
    // rts.each(rp => {
    //   console.log(rp.start(), rp.end(), rp.obs.value());
    // });

    expect(true).toBe(true);
  });

  it("Initialize, populate, and display a semi-monthly time series:", () => {
    // Initialize
    const rts = chronology.regular({
      basePeriod: [1, "m"],
      subPeriods: 2
    });

    // Populate
    let period = rts.period(new Date("2000-01-01"));
    for (let i = 0; i < 10; i += 1) {
      period.obs.set(i);
      period = period.forward();
    }

    // Display
    // rts.each(rp => {
    //   console.log(rp.start(), rp.end(), rp.obs.value());
    // });

    expect(true).toBe(true);
  });

  it("Initialize, populate, and display a business day (Monday-Friday) time series:", () => {
    // Initialize
    const msPerDay = 24 * 60 * 60 * 1000;
    const rts = chronology.regular({
      basePeriod: [1, "w"],
      subPeriods: 5,
      subPeriodBoundaries(bpStart, bpEnd, spNum) {
        return {
          start: new Date(bpStart.getTime() + (spNum - 1) * msPerDay),
          end: new Date(bpStart.getTime() + spNum * msPerDay)
        };
      }
    });

    // Populate
    let period = rts.period(new Date("2000-01-03")); // Monday
    for (let i = 0; i < 10; i += 1) {
      period.obs.set(i);
      period = period.forward();
    }

    // Display
    // rts.each(rp => {
    //   console.log(rp.start(), rp.end(), rp.obs.value());
    // });

    expect(true).toBe(true);
  });

  it("Initialize, populate, and display a microsecond-frequency time series using sub periods:", () => {
    // Initialize
    const rts = chronology.regular({
      basePeriod: [1, "ms"],
      subPeriods: 1000
    });

    // Populate
    let period = rts.period(new Date("2000-01-01T00:00:00.000"), 995);
    for (let i = 0; i < 10; i += 1) {
      period.obs.set(i);
      period = period.forward();
    }

    // Display
    // rts.each(rp => {
    //   console.log(
    //     rp.basePeriodStart(),
    //     rp.basePeriodEnd(),
    //     rp.subPeriod(),
    //     rp.obs.value()
    //   );
    // });

    expect(true).toBe(true);
  });

  it("Increment all observation values by 10 using `rts.map()`:", () => {
    // Initialize
    const rts = chronology.regular({
      basePeriod: [1, "y"]
    });

    // Populate
    let period = rts.period(new Date("2000-01-01"));
    for (let i = 0; i < 10; i += 1) {
      period.obs.set(i);
      period = period.forward();
    }

    // // Display original
    // rts.each(rp => {
    //   console.log(rp.start(), rp.end(), rp.obs.value());
    // });

    // // Generate an incremented series
    // const rts2 = rts.map(val => val + 10);

    // // Display new
    // rts2.each(rp => {
    //   console.log(rp.start(), rp.end(), rp.obs.value());
    // });

    expect(true).toBe(true);
  });

  it("Generate a lagged time series using `rts.transform()`:", () => {
    // Initialize
    const rts = chronology.regular({
      basePeriod: [1, "y"]
    });

    // Populate
    let period = rts.period(new Date("2000-01-01"));
    for (let i = 0; i < 10; i += 1) {
      period.obs.set(i);
      period = period.forward();
    }

    // // Display original
    // rts.each(rp => {
    //   console.log(rp.start(), rp.end(), rp.obs.value());
    // });

    // // Generate lagged series
    // const rts2 = rts.transform((rpExisting, rpNew) => {
    //   rpNew.forward().obs.set(rpExisting.obs.value());
    // });

    // // Display new
    // rts2.each(rp => {
    //   console.log(rp.start(), rp.end(), rp.obs.value());
    // });

    expect(true).toBe(true);
  });

  it("Sum observation values using `rts.reduce()`:", () => {
    // Initialize
    const rts = chronology.regular({
      basePeriod: [1, "y"]
    });

    // Populate
    let period = rts.period(new Date("2000-01-01"));
    for (let i = 0; i < 10; i += 1) {
      period.obs.set(i);
      period = period.forward();
    }

    // Sum and display
    // const sum = rts.reduce((accum, rp) => accum + rp.obs.value(), 0);
    // console.log(sum);

    expect(true).toBe(true);
  });

  it("Retrieve observations with negative values using `rts.filter()`:", () => {
    // Initialize
    const rts = chronology.regular({
      basePeriod: [1, "y"]
    });

    // Populate
    let period = rts.period(new Date("2000-01-01"));
    for (let i = -5; i < 5; i += 1) {
      period.obs.set(i);
      period = period.forward();
    }

    // Display original
    // rts.each(rp => {
    //   console.log(rp.start(), rp.end(), rp.obs.value());
    // });

    // // Generate a filtered series
    // const rts2 = rts.filter(rp => rp.obs.value() < 0);

    // // Display new
    // rts2.each(rp => {
    //   console.log(rp.start(), rp.end(), rp.obs.value());
    // });

    expect(true).toBe(true);
  });

  it("Serialize and unserialize a regular time series:", () => {
    // Initialize
    const rts = chronology.regular({
      basePeriod: [1, "y"]
    });

    // Populate
    let period = rts.period(new Date("2000-01-01"));
    for (let i = -5; i < 5; i += 1) {
      period.obs.set(i);
      period = period.forward();
    }

    // Display original
    // rts.each(rp => {
    //   console.log(rp.start(), rp.end(), rp.obs.value());
    // });

    // // Serialize and display
    // const ser = rts.serialize();
    // console.log(ser);

    // // Unserialize and display
    // const rts2 = chronology.unserialize(ser);
    // rts2.each(rp => {
    //   console.log(rp.start(), rp.end(), rp.obs.value());
    // });

    expect(true).toBe(true);
  });
});

describe("IrregularSeries examples", () => {
  it("Initialize, populate, and display an irregular time series:", () => {
    // Initialize
    const its = chronology.irregular();

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
    // its.each(ip => {
    //   console.log(ip.start(), ip.end(), ip.obs.value());
    // });

    expect(true).toBe(true);
  });

  it("Increment all observation values by 10 using `its.map()`:", () => {
    // Initialize
    const its = chronology.irregular();

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

    // // Display original
    // its.each(ip => {
    //   console.log(ip.start(), ip.end(), ip.obs.value());
    // });

    // // Increment
    // const its2 = its.map(val => val + 10);

    // // Display new
    // its2.each(ip => {
    //   console.log(ip.start(), ip.end(), ip.obs.value());
    // });

    expect(true).toBe(true);
  });

  it("Sum observation values using `its.reduce()`:", () => {
    // Initialize
    const its = chronology.irregular();

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
    // const sum = its.reduce((accum, ip) => accum + ip.obs.value(), 0);
    // console.log(sum);

    expect(true).toBe(true);
  });

  it("Retrieve observations with negative values using `its.filter()`:", () => {
    // Initialize
    const its = chronology.irregular();

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
    // its.each(ip => {
    //   console.log(ip.start(), ip.end(), ip.obs.value());
    // });

    // Apply a filter
    // const its2 = its.filter(ip => ip.obs.value() < 0);

    // Display new
    // its2.each(ip => {
    //   console.log(ip.start(), ip.end(), ip.obs.value());
    // });

    expect(true).toBe(true);
  });

  it("Serialize and unserialize an irregular time series:", () => {
    // Initialize
    const its = chronology.irregular();

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
    // its.each(ip => {
    //   console.log(ip.start(), ip.end(), ip.obs.value());
    // });

    // Serialize and display
    // const ser = its.serialize();
    // console.log(ser);

    // Unserialize and display
    // const its2 = chronology.unserialize(ser);
    // its2.each(ip => {
    //   console.log(ip.start(), ip.end(), ip.obs.value());
    // });

    expect(true).toBe(true);
  });
});

describe("Extension examples", () => {
  it("Extending RegularSeries", () => {
    chronology.regular.proto.sum = function sum() {
      return this.reduce((a, rp) => a + rp.obs.value(), 0);
    };

    // Initialize
    const rts = chronology.regular({
      basePeriod: [1, "y"]
    });

    // Populate
    let period = rts.period(new Date("2000-01-01"));
    for (let i = 0; i < 10; i += 1) {
      period.obs.set(i);
      period = period.forward();
    }

    // Use the sum function
    // console.log(rts.sum());

    expect(true).toBe(true);
  });

  it("Extending IrregularSeries", () => {
    chronology.irregular.proto.sum = function sum() {
      return this.reduce((a, ip) => a + ip.obs.value(), 0);
    };

    // Initialize
    const its = chronology.irregular();

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
    // console.log(its.sum());

    expect(true).toBe(true);
  });
});

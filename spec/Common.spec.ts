import { ParameterManager } from "../src/common/ParameterManager";

describe("Parameter Manager", () => {
  it("Should Configure", () => {
    const parameterManager = new ParameterManager();
    parameterManager.configure({ count: 10 });
    expect(parameterManager.getParameterCount()).toBe(10);
  });

  it("Should Accept An Empty Config", () => {
    const parameterManager = new ParameterManager();

    // Setting empty config
    parameterManager.configure({});

    // Want a the count to increment
    expect(parameterManager.getParameterCount()).toBe(0);
  });

  it("Should add a Value", () => {
    const parameterManager = new ParameterManager();

    // Set a count value
    parameterManager.configure({ count: 1 });

    // Adding 1
    const parameter = parameterManager.addValue(1);

    // Expect a parameterized response
    expect(parameter).toBe("$2");

    // Want a the count to increment
    expect(parameterManager.getParameterCount()).toBe(2);

    // Want 1 set in the parameters
    expect(parameterManager.getParameters()).toStrictEqual([1]);
  });

  it("Should add a Array Value", () => {
    const parameterManager = new ParameterManager();

    // Set a count value
    parameterManager.configure({ count: 1 });

    // Adding 1
    const parameter = parameterManager.addValue([1, 2, 3, 4, 5]);

    // Expect a parameterized response
    expect(parameter).toBe("{ $2, $3, $4, $5, $6 }");

    // Want a the count to increment
    expect(parameterManager.getParameterCount()).toBe(6);

    // Want have array set in the parameters
    expect(parameterManager.getParameters()).toStrictEqual([1, 2, 3, 4, 5]);
  });

  it("Should add a List Value", () => {
    const parameterManager = new ParameterManager();

    // Set a count value
    parameterManager.configure({ count: 1 });

    // Adding 1
    const parameter = parameterManager.addList([1, 2, 3, 4, 5]);

    // Expect a parameterized response
    expect(parameter).toBe("$2, $3, $4, $5, $6");

    // Want list set in the parameters
    expect(parameterManager.getParameters()).toStrictEqual([1, 2, 3, 4, 5]);

    // Want a the count to increment
    expect(parameterManager.getParameterCount()).toBe(6);

  });

  it("Should Merge with Another parameter manager", () => {
    const parameterManagerOne = new ParameterManager();
    const parameterManagerTwo = new ParameterManager();

    parameterManagerOne.addValue(1);
    parameterManagerTwo.addValue([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

    parameterManagerOne.merge(parameterManagerTwo);

    expect(parameterManagerOne.getParameterCount()).toBe(10);

    expect(parameterManagerOne.getParameters()).toStrictEqual([
      1,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
    ]);
  });
});

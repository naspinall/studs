import { OperatorConfiguration } from "../operators/Operator";
import { toParameterList } from "../utility/array";
import { Primitive } from "../utility/types";

export class ParameterManager {
  private parameterCount: number = 0;
  private parameters: Array<Primitive> = [];

  configure({ count }: OperatorConfiguration) {
    this.parameterCount = count || this.parameterCount;
  }

  addValue = (value: Primitive | Array<Primitive>): string => {
    if (Array.isArray(value)) {
      // Converting to correct SQL Type
      const SQLString = `{ ${toParameterList(
        this.parameterCount,
        value.length
      )} }`;
      this.parameters.push(...value);
      this.parameterCount += value.length;
      return SQLString;
    }
    // Adding Parameter
    this.parameterCount++;
    this.parameters.push(value);
    return `$${this.parameterCount}`;
  };

  addList = (values: Array<Primitive>): string => {
    // Converting to correct SQL Type
    const SQLString = `${toParameterList(this.parameterCount, values.length)}`;
    this.parameters.push(...values);
    this.parameterCount += values.length;
    return SQLString;
  };

  getParameters() {
    return this.parameters;
  }

  getParameterCount() {
    return this.parameterCount;
  }

  merge(parameterManager: ParameterManager) {
    this.parameterCount +=
      parameterManager.getParameterCount() - this.parameterCount;
    this.parameters.push(...parameterManager.getParameters());
  }
}

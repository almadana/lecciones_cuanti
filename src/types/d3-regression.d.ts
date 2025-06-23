declare module 'd3-regression' {
  export interface RegressionFunction {
    x(accessor: (d: any) => number): RegressionFunction;
    y(accessor: (d: any) => number): RegressionFunction;
    (data: any[]): [number, number][];
  }

  export function regressionLinear(): RegressionFunction;
} 
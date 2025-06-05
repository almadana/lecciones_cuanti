declare module 'jstat' {
  export interface JStat {
    studentt: {
      inv: (p: number, df: number) => number;
    };
  }
  const jStat: JStat;
  export default jStat;
} 
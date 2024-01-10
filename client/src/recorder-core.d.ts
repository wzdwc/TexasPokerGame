declare module 'recorder-core' {
  interface RecorderInstace {
    [index: string]: any;
  }

  function Recorder(options: any): RecorderInstace;

  export default Recorder;
}


declare module 'recorder-core' {
  function Recorder(...args: any[]): Recorder.RecorderInstace;

  namespace Recorder {
    interface RecorderInstace {
      [index: string]: any;
    }

    function Support(): boolean;
  }

  export = Recorder;
}

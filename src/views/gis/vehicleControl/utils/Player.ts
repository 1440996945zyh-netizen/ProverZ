/**
 * @Author linqi
 * @Description 播放器的逻辑封装
 * @Date 2023-06-14 16:55
 */
export default class Player {

  private _state: number = 0

  private _frames: any[]

  private _index: number = 0

  private _frameRate: number

  private _callback: (frame: any, index: number) => {}

  private _isStreaming: boolean

  private _completedCallback: () => {}

  private _executor = (): void => {
    switch (this._state) {
      case 0: {
        this._index = 0
        break
      }
      case 1: {
        const frame = this._frames[this._index]
        if (typeof frame !== 'undefined') {
          window.setTimeout(this._executor, 1 / this._frameRate)
          this._callback(frame, this._index++)
        } else {
          if (!this._isStreaming) {
            this._state = 0
            this._index = 0
            if (this._completedCallback) this._completedCallback()
          } else {
            window.setTimeout(this._executor, 1 / this._frameRate)
          }
        }
        break
      }
      case 2: {
        break
      }
    }
  }

  state(): number {
    return this._state
  }

  play(): void {
    if (this._state === 1) return
    this._state = 1
    this._executor()
  }

  stop(): void {
    if (this._state === 0) return
    this._state = 0
    this._index = 0
  }

  pause(): void {
    if (this._state !== 1) return
    this._state = 2
  }

  seeking(index: number): void {
    if (index < 0 || index >= this._frames.length) return
    this._index = index
  }

  timeLapse(frameRate: number) {
    this._frameRate = frameRate
  }

  appendFrame(frame: any) {
    if (!this._isStreaming) return
    this._frames.push(frames)
  }

  appendFrames(frames: any[]) {
    if (!this._isStreaming) return
    this._frames.push(...frames)
  }

  static newBuilder() {
    return new this.PlayerBuilder()
  }

  private static PlayerBuilder = class {

    private _frames: any[] = []

    private _frameRate: number = 0.1

    private _callback: (frame: any, index: number) => {}

    private _isStreaming: boolean = false

    private _completedCallback: () => {}

    frames(frames: any[]) {
      this._frames = frames
      return this
    }

    frameRate(frameRate: number) {
      this._frameRate = frameRate
      return this
    }

    callback(callback: (frame: any, index: number) => {}) {
      this._callback = callback
      return this
    }

    isStreaming(isStreaming: boolean) {
      this._isStreaming = isStreaming
      return this
    }

    completedCallback(completedCallback: () => {}) {
      this._completedCallback = completedCallback
      return this
    }

    validate(): void {
      if (this._frames.length === 0) {
        throw Error('帧不能为空')
      }
      if (this._frameRate === 0) {
        throw Error('播放间隔不能为空')
      }
    }

    build(): Player {
      this.validate()
      const player: Player = new Player()
      player._frames = this._frames
      player._frameRate = this._frameRate
      player._callback = this._callback
      player._isStreaming = this._isStreaming
      player._completedCallback = this._completedCallback
      return player
    }
  }
}

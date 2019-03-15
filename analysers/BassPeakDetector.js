class BassPeakDetector {
    constructor(options) {
        this.lowPassFrequency = 200;
        this.thresholdMaxLevel = 255;
        this.minimumLevel = 120;
        this.decayRatePerSecond = 15;
        this.beatTimeoutMs = 250;
        Object.assign(this, options);

        this.thresholdLevel = this.thresholdMaxLevel;
        this.lastBeat = Date.now();
    }

    detect(beatObj) {
        let sample = beatObj.lastFrequencySample;

        let peak = beatObj.lowPass(this.lowPassFrequency, sample.data).reduce((a, b) => a > b ? a : b);
        if (peak >= this.thresholdLevel) {
            this.thresholdLevel = peak < this.thresholdMaxLevel ? peak : this.thresholdMaxLevel;
            if (sample.timestamp - this.lastBeat >= this.beatTimeoutMs) {
                this.lastBeat = sample.timestamp;
                sample.BassPeakDetector = {
                    detected: true,
                    level: peak
                };
                beatObj.emit("BassPeakDetector", sample);
            }
        } else {
            if (this.thresholdLevel > this.minimumLevel)
                this.thresholdLevel -= beatObj.sampleTime * this.decayRatePerSecond;
            sample.BassPeakDetector = {
                detected: false
            };
        }
    }
}

module.exports = BassPeakDetector;
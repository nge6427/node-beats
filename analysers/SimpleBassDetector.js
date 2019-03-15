class SimpleBassDetector {
    constructor(options) {
        this.lowPassFrequency = 200;
        this.thresholdMaxLevel = 230;
        this.minimumLevel = 120;
        this.decayRatePerSecond = 10;
        this.beatTimeoutMs = 250;
        Object.assign(this, options);

        this.thresholdLevel = this.thresholdMaxLevel;
        this.lastBeat = Date.now();
    }

    detect(beatObj) {
        let sample = beatObj.lastFrequencySample;

        let sampleAvg = beatObj.getAverage(beatObj.lowPass(this.lowPassFrequency, sample.data));
        if (sampleAvg >= this.thresholdLevel && sample.timestamp - this.lastBeat >= this.beatTimeoutMs) {
            this.thresholdLevel = sampleAvg < this.thresholdMaxLevel ? sampleAvg : this.thresholdMaxLevel;
            this.lastBeat = sample.timestamp;
            sample.SimpleBassDetector = {
                detected: true,
                level: sampleAvg
            };
            beatObj.emit("SimpleBassDetector", sample);
        } else {
            if (this.thresholdLevel > this.minimumLevel)
                this.thresholdLevel -= beatObj.sampleTime * this.decayRatePerSecond;
            sample.SimpleBassDetector = {
                false: true
            };
        }
    }
}

module.exports = SimpleBassDetector;
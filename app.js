const EventEmitter = require('events');

class Beats extends EventEmitter {
    constructor(options) {
        super();

        this.sampleRate = options.sampleRate;
        this.bufferSize = options.bufferSize;
        this.fftSize = options.fftSize;
        this.sampleSeconds = options.sampleSeconds || 2;
        this.sampleTime = this.bufferSize / this.sampleRate;
        this.bins = this.fftSize / 2;
        this.binSize = this.sampleRate / this.fftSize;
        this.arraySize = this.sampleSeconds * 1000 / this.sampleTime << 0;

        this.frequencySamples = [];
        this.timeDomainSamples = [];

        this.analysers = [];
    }

    frequency(data) {
        this.addSample(data, this.frequencySamples);
    }

    timeDomain(data) {
        this.addSample(data, this.timeDomainSamples);
    }

    addSample(data, array) {
        array.length > this.arraySize && array.shift();
        array.push({
            data: data,
            timestamp: Date.now()
        });
    }

    get lastFrequencySample() {
    	return this.frequencySamples[this.frequencySamples.length - 1];
    }

    get lastTimeDomainSample() {
    	return this.timeDomainSamples[this.timeDomainSamples.length - 1];
    }

    addAnalyser(analyser) {
        this.analysers.push(analyser);
    }

    runAnalysers() {
        this.analysers.forEach(analyser => analyser.detect(this));
    }

    lowPass(freq, freqData) {
        return freqData.slice(0, freq / this.binSize << 0 + 1);
    }

    highPass(freq, freqData) {
        return freqData.slice(freq / this.binSize << 0 + 1);
    }

    bandPass(freqStart, freqEnd, freqData) {
        return this.highPass(freqStart, this.lowPass(freqEnd, freqData));
    }

    getAverage (sample) {
        return sample.reduce((a, b) => a + b) / sample.length << 0;
    }
}

module.exports = Beats;
// Copyright 2015 Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

/**
 * @class hIST
 * @module PNG
 * @submodule PNGChunks
 */
module.exports = {

	/**
	 * Gets the chunk-type as string
	 *
	 * @method getType
	 * @return {string}
	 */
	getType: function () {
		return 'hIST';
	},

	/**
	 * Gets the chunk-type as id
	 *
	 * @method getTypeId
	 * @return {int}
	 */
	getTypeId: function () {
		return 0x68495354;
	},

	/**
	 * Gets the sequence
	 *
	 * @method getSequence
	 * @return {int}
	 */
	getSequence: function () {
		return 350;
	},


	/**
	 * Gets the relative color frequency by palette index
	 *
	 * @method getFrequency
	 * @param {int} index Index of the color from the color palette
	 */
	getFrequency: function (index) {
		if (!this._frequency || (index < 0) || (index * 2 > this._frequency.length)) {
			return 0;
		} else {
			return this._frequency.readUInt16BE(index * 2);
		}
	},

	/**
	 * Sets the relative color frequency by palette index
	 *
	 * @method setFrequency
	 * @param {int} index Index of the color from the color palette
	 * @param {int} frequency Relative color frequency
	 */
	setFrequency: function (index, frequency) {

		var paletteChunk = this.getChunksByType('PLTE', true),
			paletteLength = paletteChunk.getColorCount(),
			buffer;

		// Make sure the palette has the right size
		if (!this._frequency || ((this._frequency.length / 2) != paletteLength)) {
			buffer = new Buffer(paletteLength);
			if (this._frequency) {
				this._frequency.copy(buffer, 0, 0, Math.min(paletteLength, this._frequency.length));
			}
		}

		this._frequency.writeUInt16BE(frequency, index * 2);
	},

	/**
	 * Sets all frequencies at once
	 *
	 * @method setFrequencies
	 * @param {int[]} frequencies List of all frequencies in order of the palette color indexes
	 */
	setFrequencies: function (frequencies) {

		this._frequency = new Buffer(frequencies.length * 2);

		for(var i = 0, len = this._frequency.length; i < len; i++) {
			this._frequency.writeUInt16BE(frequencies[i], index * 2);
		}
	},


	/**
	 * Encoding of chunk data
	 *
	 * @method encode
	 * @param {BufferedStream} stream Data stream
	 */
	encode: function (stream) {
		if (this._frequency) {
			stream.writeBuffer(this._frequency);
		}
	},

	/**
	 * Decoding of chunk data
	 *
	 * @method decode
	 * @param {BufferedStream} stream Data stream
	 * @param {int} length Length of chunk data
	 * @param {boolean} strict Should parsing be strict?
	 */
	decode: function (stream, length, strict) {

		// Validation
		if (!this.getFirstChunk('IHDR', false) === null) {
			throw new Error('Chunk ' + this.getType() + ' requires the IHDR chunk.');
		}

		if (this.getFirstChunk(this.getType(), false) !== null) {
			throw new Error('Only one ' + this.getType() + ' is allowed in the data.');
		}

		this._frequency = stream.readBuffer(length);
	}
};
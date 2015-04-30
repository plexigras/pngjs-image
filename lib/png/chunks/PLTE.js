// Copyright 2015 Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

// PLTE - Palette

/**
 * @class PLTE
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
		return 'PLTE';
	},

	/**
	 * Gets the chunk-type as id
	 *
	 * @method getTypeId
	 * @return {int}
	 */
	getTypeId: function () {
		return 0x504c5445;
	},

	/**
	 * Gets the sequence
	 *
	 * @method getSequence
	 * @return {int}
	 */
	getSequence: function () {
		return 250;
	},


	/**
	 * Encoding of chunk data
	 *
	 * @method encode
	 * @param {BufferedStream} stream Data stream
	 */
	encode: function (stream) {
		//TODO
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

		var headerChunk;

		// Validation
		if (!this.getFirstChunk('IHDR', false) === null) {
			throw new Error('Chunk ' + this.getType() + ' requires the IHDR chunk.');
		}

		if (this.getFirstChunk(this.getType(), false) !== null) {
			throw new Error('Only one ' + this.getType() + ' is allowed in the data.');
		}

		// Palette length should be divisible by three (each of r, g, b has one byte)
		if ((length % 3) !== 0) {
			throw new Error('Palette length should be a multiple of 3. Length: ' + length);
		}

		headerChunk = this.getHeaderChunk();

		// Check for valid palette color-types
		if (!headerChunk.hasPalette()) {
			throw new Error('Palette is not allowed to appear with this color-type: ' + headerChunk.getColorType());
		}

		// Make sure palette is big enough
		if (Math.pow(2, headerChunk.getBitDepth()) > (length / 3)) {
			throw new Error('Bit-depth greater than the size of the palette.');
		}

		// Copy palette
		this._palette = new Buffer(length);
		data.copy(this._palette, 0, offset, offset + length);
	},


	/**
	 * Gets the color at
	 *
	 * @method getColor
	 * @param {int} index
	 * @return {object}
	 */
	getColor: function (index) {

		var internalIndex = index * 3,
			data = this._palette;

		if (internalIndex + 3 > this._palette.length) {
			throw new Error('Palette index of ' + index + ' is out of bounds.');
		}

		return {
			r: data.readUInt8(internalIndex),
			g: data.readUInt8(internalIndex + 1),
			b: data.readUInt8(internalIndex + 2)
		}
	},

	/**
	 * Gets the number of colors available in the palette
	 *
	 * @method getColorCount
	 * @return {int}
	 */
	getColorCount: function () {
		return this._palette.length / 3;
	},


	/**
	 * Converts the input data to an image
	 *
	 * @method applyToImage
	 * @param {Buffer} input Input data
	 * @param {int} inputOffset Offset in input data
	 * @param {Buffer} image Image data
	 * @param {int} imageOffset Offset in image data
	 */
	applyToImage: function (input, inputOffset, image, imageOffset) {

		var i,
			index, internalIndex,
			headerChunk,
			bytesPerPixel,
			outputOffset,
			r, g, b;

		headerChunk = this.getHeaderChunk();
		bytesPerPixel = headerChunk.getImageBytesPerPixel();

		for (i = 0; i < input.length; i++) {

			// Get index from input
			index = input.readUInt8(inputOffset + i);

			// Lookup color in palette
			internalIndex = index * 3;
			if (internalIndex >= this._palette.length) {
				throw new Error('Palette: Index of color out of bounds.');
			}
			r = this._palette.readUInt8(internalIndex);
			g = this._palette.readUInt8(internalIndex + 1);
			b = this._palette.readUInt8(internalIndex + 2);

			// Write to image
			outputOffset = imageOffset + (i * bytesPerPixel);
			image.writeUInt8(outputOffset, r);
			image.writeUInt8(outputOffset + 1, g);
			image.writeUInt8(outputOffset + 2, b);
		}
	}
};
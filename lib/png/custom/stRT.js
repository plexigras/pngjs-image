// Copyright 2015 Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

// stRT - Structured Data

var Compressor = require('../compressor');
var BufferedStream = require('../bufferedStream');

/**
 * @class stRT
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
		return 'stRT';
	},

	/**
	 * Gets the chunk-type as id
	 *
	 * @method getTypeId
	 * @return {int}
	 */
	getTypeId: function () {
		return 0x73745254;
	},

	/**
	 * Gets the sequence
	 *
	 * @method getSequence
	 * @return {int}
	 */
	getSequence: function () {
		return 600;
	},


	/**
	 * Gets the type of the structural data
	 *
	 * @method getDataType
	 * @return {string}
	 */
	getDataType: function () {
		return this._dataType;
	},

	/**
	 * Sets the type of the structural data
	 *
	 * @method setDataType
	 * @param {string} type
	 */
	setDataType: function (type) {
		if (type.length !== 4) {
			throw new Error('The type has to have four characters.');
		}
		this._dataType = type;
	},


	/**
	 * Gets the major version
	 *
	 * @method getMajor
	 * @return {int}
	 */
	getMajor: function () {
		return this._dataMajor;
	},

	/**
	 * Sets the major version
	 *
	 * @method setMajor
	 * @param {int} major
	 */
	setMajor: function (major) {
		if (major > 255) {
			throw new Error('Major version cannot be greater than 255');
		}
		this._dataMajor = major;
	},


	/**
	 * Gets the minor version
	 *
	 * @method getMinor
	 * @return {int}
	 */
	getMinor: function () {
		return this._dataMinor;
	},

	/**
	 * Sets the minor version
	 *
	 * @method setMinor
	 * @param {int} minor
	 */
	setMinor: function (minor) {
		if (minor > 255) {
			throw new Error('Minor version cannot be greater than 255');
		}
		this._dataMinor = minor;
	},


	/**
	 * Gets the data content
	 *
	 * @method getContent
	 * @return {object}
	 */
	getContent: function () {
		return this._content;
	},

	/**
	 * Sets the data content
	 *
	 * @method setContent
	 * @param {object} data
	 */
	setContent: function (data) {
		this._content = data;
	},


	/**
	 * Encoding of chunk data
	 *
	 * @method encode
	 * @param {BufferedStream} stream Data stream
	 */
	encode: function (stream) {

		var compressor,
			dataStr,
			data;

		dataStr = JSON.stringify(this._content || {});

		// Compress the data
		compressor = new Compressor();
		data = compressor.compress(new Buffer(dataStr, 'utf8'));

		// Write the data-type
		stream.writeASCIIString(this._dataType);

		// Write the version
		stream.writeUInt8(this._dataMajor & 0xff);
		stream.writeUInt8(this._dataMinor & 0xff);

		// Write the rest of the data
		stream.writeBuffer(data);
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

		var compressor,
			data;

		// Validation
		if (this.getFirstChunk(this.getType(), false) !== null) {
			throw new Error('Only one ' + this.getType() + ' is allowed in the data.');
		}

		// Read the type
		this._dataType = stream.readString(4, 'ascii');

		// Read the version
		this._dataMajor = stream.readUInt8();
		this._dataMinor = stream.readUInt8();

		// Read the data
		data = stream.readBuffer(length - 6);

		// Decompress
		compressor = new Compressor();
		data = compressor.decompress(data);

		// Convert buffer into string
		this._content = JSON.parse(data.toString('utf8'));
	}
};
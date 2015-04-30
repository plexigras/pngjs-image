// Copyright 2015 Yahoo! Inc.
// Copyrights licensed under the Mit License. See the accompanying LICENSE file for terms.

var utils = require('./utils');
var path = require('path');

/**
 * @class Chunk
 * @module PNG
 * @submodule PNGCore
 * @extends chunkUtils
 * @param {string} type Chunk-type for loading the right chunk
 * @param {object} chunks Dictionary of available chunks
 * @constructor
 */
var Chunk = function (type, chunks) {
	this._chunks = chunks;

	// Import utils
	utils.loadModule(path.join(__dirname, 'chunkUtils.js'), this);

	// Import chunk
	Chunk.applyChunkType(type, this);
};


/**
 * Gets the chunk-type as string
 *
 * Note:
 * Identifier for chunk that is the string of the chunk-type.
 *
 * @method getType
 * @return {string|null}
 */
Chunk.prototype.getType = function () {
	return null;
};

/**
 * Gets the chunk-type as id
 *
 * Note:
 * This is the numeric version of `getType`.
 *
 * @method getTypeId
 * @return {int}
 */
Chunk.prototype.getTypeId = function () {
	return 0;
};

/**
 * Gets the sequence
 *
 * Note:
 * This defines the sequence the chunk will have when all chunks are written to the blob.
 * Lowest sequence numbers will be written first.
 *
 * Range:
 * * 0 - Header
 * * 500 - Data
 * * 1000 - End
 *
 * @method getSequence
 * @return {int}
 */
Chunk.prototype.getSequence = function () {
	return 750;
};


/**
 * Should the chunk be used for the data stream?
 *
 * Note:
 * Overwrite this method if you want to write this chunk into the stream on conditions.
 *
 * @method useChunks
 * @return {boolean}
 */
Chunk.prototype.useChunk = function () {
	return true;
};


/**
 * Is value an upper-case ASCII character?
 *
 * @method _isUpperCase
 * @param {int} value
 * @return {boolean}
 * @private
 */
Chunk.prototype._isUpperCase = function (value) {
	return !(value & 0x20); // 0x20 = 32 dec -> Lowercase has bit 32 set
};


// Critical chunks are necessary for successful display of the contents of the datastream, for example the image header chunk (IHDR). A decoder trying to extract the image, upon encountering an unknown chunk type in which the ancillary bit is 0, shall indicate to the user that the image contains information it cannot safely interpret.
// Ancillary chunks are not strictly necessary in order to meaningfully display the contents of the datastream, for example the time chunk (tIME). A decoder encountering an unknown chunk type in which the ancillary bit is 1 can safely ignore the chunk and proceed to display the image.
/**
 * Is the chunk a critical chunk that cannot be ignored?
 *
 * @method isCritical
 * @return {boolean}
 */
Chunk.prototype.isCritical = function () {
	return this._isUpperCase(this._type[0]);
};

/**
 * Is the chunk an ancillary chunk that can be ignored when unknown?
 *
 * @method isAncillary
 * @return {boolean}
 */
Chunk.prototype.isAncillary = function () {
	return !this.isCritical();
};


// A public chunk is one that is defined in this International Standard or is registered in the list of PNG special-purpose public chunk types maintained by the Registration Authority (see 4.9 Extension and registration). Applications can also define private (unregistered) chunk types for their own purposes. The names of private chunks have a lowercase second letter, while public chunks will always be assigned names with uppercase second letters. Decoders do not need to test the private-chunk property bit, since it has no functional significance; it is simply an administrative convenience to ensure that public and private chunk names will not conflict. See clause 14: Editors and extensions and 12.10.2: Use of private chunks.
/**
 * Is the chunk a public chunk?
 *
 * @method isPublic
 * @return {boolean}
 */
Chunk.prototype.isPublic = function () {
	return this._isUpperCase(this._type[1]);
};

/**
 * Is the chunk a private chunk?
 *
 * @method isPrivate
 * @return {boolean}
 */
Chunk.prototype.isPrivate = function () {
	return !this.isPublic();
};


// This property bit is not of interest to pure decoders, but it is needed by PNG editors. This bit defines the proper handling of unrecognized chunks in a datastream that is being modified. Rules for PNG editors are discussed further in 14.2: Behaviour of PNG editors.
/**
 * Is the data safe to copy?
 *
 * @method isSafe
 * @return {boolean}
 */
Chunk.prototype.isSafe = function () {
	return !this.isUnsafe();
};

/**
 * Is the data safe to copy?
 *
 * @method isUnsafe
 * @return {boolean}
 */
Chunk.prototype.isUnsafe = function () {
	return this._isUpperCase(this._type[3]);
};


/**
 * Encoding of chunk data
 *
 * Note:
 * Overwrite this to encode chunk-data.
 *
 * @method encode
 * @return {Buffer}
 */
Chunk.prototype.encode = function () {
	throw new Error('Unimplemented method "encode".');
};

/**
 * Decoding of chunk data
 *
 * Note:
 * Overwrite this to decode chunk-data.
 *
 * @method parse
 * @param {Buffer} data Chunk data
 * @param {int} offset Offset in chunk data
 * @param {int} length Length of chunk data
 * @param {boolean} strict Should decoding be strict?
 */
Chunk.prototype.decode = function (data, offset, length, strict) {
	if (this.isCritical()) {
		throw new Error('Unknown chunk-type is declared critical. Stopping decoder.');
	}
};


/**
 * Encodes chunk-data from an external data-object
 *
 * Note:
 * Overwrite this to import data from the data-object.
 *
 * @method encodeData
 * @param {Data} data Object that will be used to import data to the chunk
 */
Chunk.prototype.encodeData = function (data) {
	// Do nothing by default
};

/**
 * Decodes chunk-data to an external data-object
 *
 * Note:
 * Overwrite this to export data to the data-object.
 *
 * @method decodeData
 * @param {Data} data Data-object that will be used to export values
 */
Chunk.prototype.decodeData = function (data) {
	// Do nothing by default
};



/**
 * Registry
 *
 * @static
 * @type {object}
 * @private
 */
Chunk._registry = {};

/**
 * Adds a new chunk-type to the registry
 *
 * @static
 * @method addChunkType
 * @param {string} type Name of the chunk
 * @param {object} module List of methods specific for the chunk-type
 */
Chunk.addChunkType = function (type, module) {
	this._registry[type] = module;
};

/**
 * Gets a specific chunk-type module, listing all chunk-type specific methods
 *
 * @static
 * @method getChunkType
 * @param {string} type Name of the chunk
 * @return {object} Chunk module
 */
Chunk.getChunkType = function (type) {
	return this._registry[type];
};

/**
 * Applies the chunk-module on an object
 *
 * @static
 * @method applyChunkType
 * @param {string} type Name of the chunk
 * @param {object} obj Object the module to apply to
 */
Chunk.applyChunkType = function (type, obj) {
	var methods = this.getChunkType(type);

	if (methods) {
		utils.copyModule(methods, obj);
	} else {
		throw new Error('Unknown chunk-type ' + type);
	}
};

/**
 * Initializes all official chunk types
 *
 * @static
 * @method initDefaultChunkTypes
 */
Chunk.initDefaultChunkTypes = function () {
	var chunks = ['bKGD', 'cHRM', 'gAMA', 'hIST', 'iCCP', 'IDAT', 'IEND', 'IHDR', 'iTXt', 'pHYs', 'PLTE', 'sBIT', 'sPLT', 'sRGB', 'tEXt', 'tIME', 'tRNS', 'zTXt'];

	chunks.forEach(function (chunkType) {
		this.addChunkType(chunkType, require(path.join(__dirname, 'chunks', chunkType)));
	}.bind(this));
};

/**
 * Initializes all known custom chunk types
 *
 * @static
 * @method initCustomChunkTypes
 */
Chunk.initCustomChunkTypes = function () {
	var chunks = ['stRT'];

	chunks.forEach(function (chunkType) {
		this.addChunkType(chunkType, require(path.join(__dirname, 'custom', chunkType)));
	}.bind(this));
};

// Initialize
Chunk.initDefaultChunkTypes();
Chunk.initCustomChunkTypes();

module.exports = Chunk;
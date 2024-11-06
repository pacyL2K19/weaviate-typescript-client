'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const batch_js_1 = require('../proto/v1/batch.js');
const errors_js_1 = require('../errors.js');
const batch_delete_js_1 = require('../proto/v1/batch_delete.js');
const base_js_1 = __importDefault(require('./base.js'));
const retry_js_1 = require('./retry.js');
class Batcher extends base_js_1.default {
  constructor() {
    super(...arguments);
    this.withDelete = (args) => this.callDelete(batch_delete_js_1.BatchDeleteRequest.fromPartial(args));
    this.withObjects = (args) => this.callObjects(batch_js_1.BatchObjectsRequest.fromPartial(args));
  }
  static use(connection, collection, metadata, timeout, consistencyLevel, tenant) {
    return new Batcher(connection, collection, metadata, timeout, consistencyLevel, tenant);
  }
  callDelete(message) {
    return this.sendWithTimeout((signal) =>
      this.connection.batchDelete(
        Object.assign(Object.assign({}, message), {
          collection: this.collection,
          consistencyLevel: this.consistencyLevel,
          tenant: this.tenant,
        }),
        {
          metadata: this.metadata,
          signal,
        }
      )
    ).catch((err) => {
      throw new errors_js_1.WeaviateDeleteManyError(err.message);
    });
  }
  callObjects(message) {
    return this.sendWithTimeout((signal) =>
      this.connection
        .batchObjects(
          Object.assign(Object.assign({}, message), { consistencyLevel: this.consistencyLevel }),
          Object.assign({ metadata: this.metadata, signal }, retry_js_1.retryOptions)
        )
        .catch((err) => {
          throw new errors_js_1.WeaviateBatchError(err.message);
        })
    );
  }
}
exports.default = Batcher;

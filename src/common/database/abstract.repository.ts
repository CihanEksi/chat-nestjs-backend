import { Logger } from '@nestjs/common';
import { AbstractDocument } from './abstract.schema';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected abstract readonly logger: Logger;
  constructor(protected readonly model: Model<TDocument>) {}

  async create(document: Omit<TDocument, '_id'>): Promise<TDocument> {
    // this.logger.debug(`Creating a new document`);
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    const returnedDocument = await createdDocument.save();
    const toJson = returnedDocument.toJSON() as unknown as TDocument;
    return toJson;
  }

  async findOne(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<TDocument | null> {
    // this.logger.debug(`Finding a document`);
    const document = await this.model.findOne(filterQuery).lean<TDocument>();
    if (!document) {
      this.logger.warn(`Document not found`);
      return null;
    }
    return document;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument | null> {
    // this.logger.debug(`Finding and updating a document`);
    const document = await this.model
      .findOneAndUpdate(filterQuery, update, { new: true })
      .lean<TDocument>();
    if (!document) {
      this.logger.warn(`Document not updated on findOne and update`);
      return null;
    }
    return document;
  }

  async find(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
    // this.logger.debug(`Finding documents`);
    const documents = await this.model.find(filterQuery).lean<TDocument[]>();
    return documents;
  }

  async findOneAndDelete(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<TDocument> {
    // this.logger.debug(`Finding and deleting a document`);
    return this.model.findOneAndDelete(filterQuery).lean<TDocument>();
  }

  async deleteOne(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<TDocument | null> {
    // this.logger.debug(`Deleting a document`);
    return this.model.deleteOne(filterQuery).lean<TDocument>();
  }

  async updateMany(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument[]> {
    // this.logger.debug(`Updating many documents`);
    return this.model.updateMany(filterQuery, update).lean<TDocument[]>();
  }

  async deleteMany(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
    // this.logger.debug(`Deleting many documents`);
    return this.model.deleteMany(filterQuery).lean<TDocument[]>();
  }

  async updateOne(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument | null> {
    // this.logger.debug(`Updating a document`);
    return this.model.updateOne(filterQuery, update).lean<TDocument>();
  }

  async aggregate(pipeline: any[]): Promise<TDocument[]> {
    // this.logger.debug(`Aggregating documents`);
    return this.model.aggregate(pipeline).exec();
  }
  async countDocuments(filterQuery: FilterQuery<TDocument>): Promise<number> {
    // this.logger.debug(`Counting documents`);
    return this.model.countDocuments(filterQuery).lean();
  }

  async groupBy(
    groupBy: string,
    filterQuery: FilterQuery<TDocument>,
  ): Promise<TDocument[]> {
    // this.logger.debug(`Grouping documents`);
    return this.model.aggregate([
      {
        $match: filterQuery,
      },
      {
        $group: {
          _id: `$${groupBy}`,
          count: { $sum: 1 },
        },
      },
    ]);
  }
}

import { Logger } from '@nestjs/common';
import { AbstractEntity } from './abstract.entity';
import { FilterQuery, Model, Types, UpdateQuery } from 'mongoose';

export abstract class AbstractRepository<T extends AbstractEntity> {
  protected abstract readonly logger: Logger;
  constructor(protected readonly model: Model<T>) {}

  async create(document: Omit<T, '_id'>): Promise<T> {
    // this.logger.debug(`Creating a new document`);
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    const returnedDocument = await createdDocument.save();
    const toJson = returnedDocument.toJSON() as unknown as T;
    return toJson;
  }

  async findOne(filterQuery: FilterQuery<T>): Promise<T | null> {
    // this.logger.debug(`Finding a document`);
    const document = await this.model.findOne(filterQuery).lean<T>();
    if (!document) {
      this.logger.warn(`Document not found`);
      return null;
    }
    return document;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<T>,
    update: UpdateQuery<T>,
  ): Promise<T | null> {
    // this.logger.debug(`Finding and updating a document`);
    const document = await this.model
      .findOneAndUpdate(filterQuery, update, { new: true })
      .lean<T>();
    if (!document) {
      this.logger.warn(`Document not updated on findOne and update`);
      return null;
    }
    return document;
  }

  async find(filterQuery: FilterQuery<T>): Promise<T[]> {
    // this.logger.debug(`Finding documents`);
    const documents = await this.model.find(filterQuery).lean<T[]>();
    return documents;
  }

  async findOneAndDelete(filterQuery: FilterQuery<T>): Promise<T> {
    // this.logger.debug(`Finding and deleting a document`);
    return this.model.findOneAndDelete(filterQuery).lean<T>();
  }

  async deleteOne(filterQuery: FilterQuery<T>): Promise<T | null> {
    // this.logger.debug(`Deleting a document`);
    return this.model.deleteOne(filterQuery).lean<T>();
  }

  async updateMany(
    filterQuery: FilterQuery<T>,
    update: UpdateQuery<T>,
  ): Promise<T[]> {
    // this.logger.debug(`Updating many documents`);
    return this.model.updateMany(filterQuery, update).lean<T[]>();
  }

  async deleteMany(filterQuery: FilterQuery<T>): Promise<T[]> {
    // this.logger.debug(`Deleting many documents`);
    return this.model.deleteMany(filterQuery).lean<T[]>();
  }

  async updateOne(
    filterQuery: FilterQuery<T>,
    update: UpdateQuery<T>,
  ): Promise<T | null> {
    // this.logger.debug(`Updating a document`);
    return this.model.updateOne(filterQuery, update).lean<T>();
  }

  async aggregate(pipeline: any[]): Promise<T[]> {
    // this.logger.debug(`Aggregating documents`);
    return this.model.aggregate(pipeline).exec();
  }
  async counTs(filterQuery: FilterQuery<T>): Promise<number> {
    // this.logger.debug(`Counting documents`);
    return this.model.countDocuments(filterQuery);
  }

  async groupBy(groupBy: string, filterQuery: FilterQuery<T>): Promise<T[]> {
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

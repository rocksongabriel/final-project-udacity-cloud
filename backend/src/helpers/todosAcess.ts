import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

const TODOS_TABLE = process.env.TODOS_TABLE
const BUCKET_NAME = process.env.ATTACHEMENT_S3_BUCKET

export class TodosAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = TODOS_TABLE,
    private readonly bucketName = BUCKET_NAME
  ) {}

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    logger.info('Creating a new todo item in dynamodb')
    const res = await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise()

    return todo
  }

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Fetching all todos from dynamo db')
    const res = await this.docClient
      .query({
        TableName: this.todosTable,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      })
      .promise()

    return res.Items as TodoItem[]
  }

  async updateTodo(
    userId: string,
    todoId: string,
    newData: TodoUpdate
  ): Promise<void> {
    logger.info(`Updating todo item of id : ${todoId}`)
    const res = await this.docClient
      .update({
        TableName: this.todosTable,
        Key: { userId: todoId, todoId: todoId },
        ConditionExpression: 'attribute_exists(todoId)',
        UpdateExpression: 'set #n = :n, dueDate = :due, done = :dn',
        ExpressionAttributeNames: { '#n': 'name' },
        ExpressionAttributeValues: {
          ':n': newData.name,
          ':due': newData.dueDate,
          dn: newData.done
        }
      })
      .promise()
  }

  async deleteTodo(userId: string, todoId: string): Promise<void> {
    const res = await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          userId: userId,
          todoId: todoId
        }
      })
      .promise()
  }

  async updateTodoAttachmentUrl(todoId: string, userId: string) {
    const res = await this.docClient
      .update({
        TableName: this.todosTable,
        Key: {
          userId,
          todoId
        },
        UpdateExpression: 'set attachmentUrl = :attachmentUrl',
        ExpressionAttributeValues: {
          ':attachmentUrl': `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
        }
      })
      .promise()
  }
}

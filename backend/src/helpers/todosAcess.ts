import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic

const docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient()
const TODOS_TABLE = process.env.TODOS_TABLE
const BUCKET_NAME = process.env.ATTACHEMENT_S3_BUCKET

const createTodo = async (todo: TodoItem): Promise<TodoItem> => {
  logger.info('Creating a new todo item in dynamodb')
  const res = await docClient
    .put({
      TableName: TODOS_TABLE,
      Item: todo
    })
    .promise()

  return todo
}

const getAllTodos = async (userId: string): Promise<TodoItem[]> => {
  logger.info('Fetching all todos from dynamo db')
  const res = await docClient
    .query({
      TableName: TODOS_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
    .promise()

  return res.Items as TodoItem[]
}

const updateTodo = async (
  userId: string,
  todoId: string,
  newData: TodoUpdate
): Promise<void> => {
  logger.info(`Updating todo item of id : ${todoId}`)
  const res = await docClient
    .update({
      TableName: TODOS_TABLE,
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

const deleteTodo = async (userId: string, todoId: string): Promise<void> => {
  const res = await docClient
    .delete({
      TableName: TODOS_TABLE,
      Key: {
        userId: userId,
        todoId: todoId
      }
    })
    .promise()
}

const updateTodoAttachmentUrl = async (todoId: string, userId: string) => {
  const res = await docClient
    .update({
      TableName: TODOS_TABLE,
      Key: {
        userId,
        todoId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': `https://${BUCKET_NAME}.s3.amazonaws.com/${todoId}`
      }
    })
    .promise()
}

export const TodosAccess = {
  createTodo,
  getAllTodos,
  updateTodo,
  deleteTodo,
  updateTodoAttachmentUrl
}

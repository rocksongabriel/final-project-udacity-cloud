import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

// TODO: Implement businessLogic

export const createTodo = async (
  createTodoRequest: CreateTodoRequest,
  userId: string
): Promise<TodoItem> => {
  createLogger('Creating a new todo item ...')
  const res = await TodosAccess.createTodo({
    userId: userId,
    todoId: uuid.v4(),
    name: createTodoRequest.name,
    createdAt: new Date().toISOString(),
    dueDate: createTodoRequest.dueDate,
    done: false,
    attachmentUrl: ''
  })

  return res
}

export const getUsersTodos = async (userId: string): Promise<TodoItem[]> => {
  try {
    const res = await TodosAccess.getAllTodos(userId)
    return res
  } catch (error) {
    createError(`Error getting user todos: ${error}`)
    return error
  }
}

export const updateTodo = async (
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<void> => {
  createLogger(`Updating todo item of id: ${todoId}`)

  const res = TodosAccess.updateTodo(userId, todoId, updateTodoRequest)

  return res
}

export const deleteTodo = async (
  userId: string,
  todoId: string
): Promise<void> => {
  const res = TodosAccess.deleteTodo(userId, todoId)

  return res
}

export const createPresignedUrl = async (todoId: string): Promise<String> => {
  const res = await AttachmentUtils.createPresignedUrl(todoId)

  return res
}

export const updateTodoAttachmentUrl = async (
  userId: string,
  todoId: string
): Promise<void> => {
  const res = await TodosAccess.updateTodoAttachmentUrl(todoId, userId)

  return res
}

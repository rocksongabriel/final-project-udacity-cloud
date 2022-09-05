import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

// TODO: Implement the fileStogare logic

const s3 = new AWS.S3({ signatureVersion: 'v4' })
const EXPIRATION_TIME = process.env.SIGNED_URL_EXPIRATION
const BUCKET_NAME = process.env.ATTACHEMENT_S3_BUCKET

const createPresignedUrl = async (todoId: string): Promise<String> => {
  const signedUrl = s3.getSignedUrl('putObject', {
    Key: todoId,
    Bucket: BUCKET_NAME,
    Expires: EXPIRATION_TIME
  })

  return signedUrl
}

export const AttachmentUtils = {
  createPresignedUrl
}


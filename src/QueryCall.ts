import type { Stringable } from '@skmtc/skmtc/dsl'
import { SchematicBase, EMPTY } from '@skmtc/skmtc/dsl'
import type { CoreContext } from '@skmtc/skmtc/CoreContext.ts'
import type { OasOperation } from '@skmtc/skmtc/Operation.ts'
import type { OasParameter } from '@skmtc/skmtc/Parameter.ts'
import { toPathTemplate } from '@skmtc/skmtc/typescript/toPathTemplate.ts'
import type { OasRequestBody } from '@skmtc/skmtc/RequestBody.ts'
import type { OasRef } from '@skmtc/skmtc/Ref.ts'
import { keyValues } from '@skmtc/skmtc/typescript/keyValues.ts'
import { toParamsObject } from '@skmtc/skmtc/typescript/toParamsObject.ts'

type QueryCallProps = {
  queryArg: string
  operation: OasOperation
  context: CoreContext
}

type QueryProperties = {
  params: OasParameter[] | undefined
  headers: OasParameter[] | undefined
  body: OasRequestBody | OasRef<'requestBody'> | undefined
}

export class QueryCall extends SchematicBase implements Stringable {
  operation: OasOperation
  queryArg: string
  properties: QueryProperties

  private constructor({ operation, context, queryArg }: QueryCallProps) {
    super({ context })

    this.queryArg = queryArg
    this.operation = operation

    this.properties = toArgProperties({ operation, queryArg })
  }

  static create(args: QueryCallProps): QueryCall {
    return new QueryCall(args)
  }

  toString(): string {
    const { params, headers, body } = this.properties
    const { path } = this.operation
    const isEmpty = !params?.length && !headers?.length && !body

    return `(${isEmpty ? '' : this.queryArg}) => (${keyValues({
      url: toPathTemplate(path, this.queryArg),
      method: `'${this.operation.method.toUpperCase()}'`,
      params: params?.length ? toParamsObject(params, this.queryArg) : EMPTY,
      headers: headers?.length ? toParamsObject(headers, this.queryArg) : EMPTY,
      body: this.operation.requestBody ? `${this.queryArg}.body` : EMPTY
    })})`
  }
}

type ToPropertiesArgs = {
  operation: OasOperation
  queryArg: string
}

const toArgProperties = ({ operation }: ToPropertiesArgs) => {
  const parameters = operation.parameters?.map(parameter => parameter.resolve())

  const params = parameters?.filter(
    ({ location }) => location === 'path' || location === 'query'
  )

  const headers = parameters?.filter(
    ({ location, name }) => location === 'header' && name !== 'Authorization'
  )

  return { params, headers, body: operation.requestBody }
}

import { QueryCall } from './QueryCall.ts'
import { toOperationResponse } from '@skmtc/skmtc/typescript/toOperationResponse.ts'
import type { CoreContext } from '@skmtc/skmtc/CoreContext.ts'
import { SchematicBase } from '@skmtc/skmtc/dsl'
import type { OperationSettings } from '@skmtc/skmtc/OperationSettings.ts'
import type { Stringable, Definition } from '@skmtc/skmtc/dsl'
import { toInferredType } from '@skmtc/skmtc/typescript/toInferredType.ts'
import type { OasOperation } from '@skmtc/skmtc/Operation.ts'
import { toEndpointName, toEndpointType } from '@skmtc/skmtc/naming.ts'
import { toOperationArg } from '@skmtc/skmtc/typescript/toOperationArg.ts'

export type EndpointArgs = {
  context: CoreContext
  settings: OperationSettings
  operation: OasOperation
}

export class Endpoint extends SchematicBase implements Stringable {
  operation: OasOperation
  settings: OperationSettings

  response: Definition
  responseType: Definition

  arg: Definition
  argType: Definition

  queryCall: QueryCall

  private constructor({ operation, settings, context }: EndpointArgs) {
    super({ context })

    this.operation = operation
    this.settings = settings

    const destinationPath = settings.getExportPath()

    this.response = toOperationResponse({
      context,
      destinationPath,
      operation
    })

    this.responseType = toInferredType(this.response.identifier)

    this.arg = toOperationArg({
      context,
      destinationPath,
      operation
    })

    this.argType = toInferredType(this.arg.identifier)

    this.queryCall = QueryCall.create({
      context,
      operation,
      queryArg: 'queryArg'
    })

    this.register({
      definitions: [this.response, this.responseType, this.arg, this.argType],
      destinationPath
    })
  }

  static create(args: EndpointArgs): Endpoint {
    return new Endpoint(args)
  }

  toString(): string {
    const { queryCall, operation, responseType, argType, response } = this

    return `${toEndpointName(operation)}: build.${toEndpointType(operation)}<${
      responseType.identifier
    },${argType.identifier}>
    ({
      query: ${queryCall},
      transformResponse: response => ${response.identifier}.parse(response)
    })`
  }
}

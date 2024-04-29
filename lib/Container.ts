import type { CoreContext } from '@skmtc/skmtc/CoreContext.ts'
import type { TransformerSettings } from '@skmtc/skmtc/TransformerSettings.ts'
import { SchematicBase } from '@skmtc/skmtc/dsl'
import type { Stringable } from '@skmtc/skmtc/dsl'

type QueryContainerProps = {
  context: CoreContext
  operations: Stringable[]
  transformerSettings: TransformerSettings
}

export class QueryContainer extends SchematicBase implements Stringable {
  transformerSettings: TransformerSettings

  private constructor({
    context,
    operations,
    transformerSettings
  }: QueryContainerProps) {
    super({ context, children: operations })

    this.transformerSettings = transformerSettings

    this.register({
      imports: {
        '@reduxjs/toolkit/query/react': {
          importNames: ['createApi', 'fetchBaseQuery'],
          external: '@reduxjs/toolkit'
        }
      },
      destinationPath: this.transformerSettings.getExportPath({
        appendFileName: true
      })
    })
  }

  static create(args: QueryContainerProps): QueryContainer {
    return new QueryContainer(args)
  }

  toString(): string {
    return `export const injectedRtkApi = createApi({
      baseQuery: fetchBaseQuery({ baseUrl: '/' }),
      endpoints: build => ({${this.renderChildren(',\n')}})
    })`
  }
}

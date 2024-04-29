import type { TransformerArgs } from '@skmtc/skmtc/schematic-types'
import { Endpoint } from './src/Endpoint.ts'
import { QueryContainer } from './src/Container.ts'
import { withDescription } from '@skmtc/skmtc/typescript/withDescription.ts'

const transform = ({ context, transformerSettings }: TransformerArgs) => {
  const operations = context.schemaModel.operations
    .map(operation => {
      const settings = transformerSettings.getOperationSettings({
        path: operation.path,
        method: operation.method
      })

      return {
        operation,
        settings
      }
    })
    .filter(({ settings }) => settings.isSelected())
    .map(({ operation, settings }, index) => {
      console.log(
        `${index}. `.padEnd(5),
        operation.method.toUpperCase().padEnd(8),
        operation.path
      )

      return withDescription(
        Endpoint.create({ context, operation, settings }),
        operation.description
      )
    })

  const rtkContainer = QueryContainer.create({
    context,
    transformerSettings,
    operations
  })

  context.register({
    content: rtkContainer,
    destinationPath: transformerSettings.getExportPath({
      appendFileName: true
    })
  })
}

export default transform

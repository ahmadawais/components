import { all, isEmpty, map } from '@serverless/utils'
import resolveComponentVariables from '../component/resolveComponentVariables'
import cloneGraph from './cloneGraph'

const removeNode = async (node, context) => {
  let { prevInstance } = node
  if (!isEmpty(prevInstance) && ['remove', 'replace'].includes(node.operation)) {
    prevInstance = resolveComponentVariables(prevInstance)
    await prevInstance.remove(context)
  }
}

const removeNodeIds = async (nodeIds, graph, context) =>
  all(
    map(async (nodeId) => {
      const node = graph.node(nodeId)
      await removeNode(node, context)
      graph.removeNode(nodeId)
    }, nodeIds)
  )

const removeLeaves = async (graph, context) => {
  const leaves = graph.sources()

  if (isEmpty(leaves)) {
    return graph
  }

  await removeNodeIds(leaves, graph, context)
  return removeLeaves(graph, context)
  //
  // // allow all executions to complete without terminating
  // const suppressErrors = (p) => p.catch(() => {})
  // await Promise.all(map(suppressErrors, executions))
  //
  // // if any executions failed, throw the error
  // await Promise.all(executions)
  //
  // return execute(graph, components, stateFile, archive, command, options, rollback)
}

const removeGraph = async (graph, context) => removeLeaves(cloneGraph(graph), context)

export default removeGraph

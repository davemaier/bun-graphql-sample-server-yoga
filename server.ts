import { makeExecutableSchema } from '@graphql-tools/schema'
import { compileQuery, isCompiledQuery } from 'graphql-jit'
import { graphql, parse } from 'graphql'
import { gqlSchema } from './gqlSchema'

const queryCache = new Map()

function sendJson(result: any) {
  return new Response(JSON.stringify(result), {
    headers: {
      'content-type': 'application/json'
    }
  })
}

const server = Bun.serve({
  port: 3000,
  development: true,
  async fetch(request) {
    if (request.method === 'POST') {
      const body = (await request.json()) as {
        query: string
        variables?: Record<string, any>
      }
      console.log('request:', body)

      let compiledQuery = queryCache.get(body.query)

      if (!compiledQuery) {
        const document = parse(body.query)

        if (document.definitions.length > 1) {
          throw new Error(
            'Only one graphql operation is allowed in single request'
          )
        }

        const result = await graphql({
          schema: gqlSchema,
          variableValues: body.variables,
          source: body.query
        })

        if (result.errors) {
          console.error(result.errors)
          return new Response(
            JSON.stringify({
              data: null,
              ...result
            }),
            {
              status: 400,
              headers: {
                'content-type': 'application/json'
              }
            }
          )
        }

        compiledQuery = compileQuery(gqlSchema, document, undefined, {
          customJSONSerializer: true
        })
        // check if the compilation is successful
        if (!isCompiledQuery(compiledQuery)) {
          console.error(compiledQuery)
          throw new Error('Error compiling query')
        }
        queryCache.set(body.query, compiledQuery)

        return sendJson(result)
      }

      const executionResult = await compiledQuery.query({}, {}, body.variables)
      console.log('executionResult:', executionResult)
      return sendJson(executionResult)
    }

    return new Response(
      JSON.stringify({
        status: 404
      }),
      {
        status: 404,
        headers: {
          'content-type': 'application/json'
        }
      }
    )
  }
})

console.log(`Listening on http://localhost:${server.port}`)

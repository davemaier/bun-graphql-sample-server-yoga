import { makeExecutableSchema } from '@graphql-tools/schema'
import { compileQuery, isCompiledQuery } from 'graphql-jit'
import { parse } from 'graphql'

const typeDefs = `
type Query {
  hello: String
}
`
const resolvers = {
  Query: {
    hello() {
      return new Promise((resolve) => setTimeout(() => resolve('World!'), 200))
    }
  }
}

const schema = makeExecutableSchema({ typeDefs, resolvers })

const query = `
{
  hello
}
`
const document = parse(query)

const compiledQuery = compileQuery(schema, document)
// check if the compilation is successful

if (!isCompiledQuery(compiledQuery)) {
  console.error(compiledQuery)
  throw new Error('Error compiling query')
}

const executionResult = await compiledQuery.query({}, {}, {})
console.log(executionResult)

// const server = Bun.serve({
//   port: 3000,
//   development: true,
//   async fetch(request) {
//     const body = request.body

//     return new Response('Welcome to Bun!')
//   }
// })

// console.log(`Listening on http://localhost:${server.port}`)

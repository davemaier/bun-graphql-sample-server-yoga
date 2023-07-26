import { Query, Resolver } from 'type-graphql'

@Resolver()
export class RootResolver {
  @Query(() => String)
  osTime() {
    return new Date().toISOString()
  }
}

import { GraphQLServer } from 'graphql-yoga';

// Type definitions (schema)
const typeDefs = `
type Query{
  me:User!
  post:Post!
}
type User{
  id:ID!
  name:String!
  email:String!
  age:Int
}
type Post{
  id:ID!
  title:String!
  body:String!
  published:Boolean!
}
`;

// resolvers
const resolvers = {
  Query: {
    me() {
      return {
        id: '12',
        name: 'ravraw',
        email: 'r@r.com',
        age: 23
      };
    },
    post() {
      return {
        id: '16',
        title: 'Some title',
        body: 'Some body',
        published: true
      };
    }
  }
};

const server = new GraphQLServer({
  typeDefs,
  resolvers
});

server.start(() => {
  console.log('Server is listening .....');
});

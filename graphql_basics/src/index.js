import { GraphQLServer } from 'graphql-yoga';
import faker from 'faker';

const usersArr = [];
const userIds = [];
const postIds = [];
const postsArr = [];
const commentsArr = [];
for (let i = 0; i < 10; i++) {
  let user = {
    id: faker.random.uuid(),
    name: faker.name.firstName(),
    email: faker.internet.email(),
    age: faker.random.number({ min: 18, max: 72 })
  };
  userIds.push(user.id);
  usersArr.push(user);
}
for (let i = 0; i < 50; i++) {
  let post = {
    id: faker.random.uuid(),
    title: faker.lorem.sentence(2),
    body: faker.lorem.paragraphs(2),
    published: faker.random.boolean(),
    author: userIds[Math.floor(Math.random() * userIds.length)]
  };
  postIds.push(post.id);
  postsArr.push(post);
}

for (let i = 0; i < 100; i++) {
  let comment = {
    id: faker.random.uuid(),
    text: faker.lorem.sentence(10),
    author: userIds[Math.floor(Math.random() * userIds.length)],
    post: postIds[Math.floor(Math.random() * postIds.length)]
  };
  commentsArr.push(comment);
}

// Type definitions (schema)
const typeDefs = `
type Query{
  users(query:String):[User!]!
  posts(query:String):[Post!]!
  comments(query:String):[Comment!]!
  user:User!
  post:Post!
  comment:Comment!
}
type User{
  id:ID!
  name:String!
  email:String!
  age:Int
  posts:[Post!]!
  comments:[Comment!]!
}
type Post{
  id:ID!
  title:String!
  body:String!
  published:Boolean!
  author:User!
  comments:[Comment!]!
},
type Comment{
  id:ID!
  text:String!
  author:User!
  post:Post!
}
`;

// resolvers
const resolvers = {
  Query: {
    users(parent, args, ctx, info) {
      if (!args.query) {
        return usersArr;
      }
      return usersArr.filter(user => {
        return user.name.toLowerCase().includes(args.query.toLowerCase());
      });
    },
    posts(parent, args, ctx, info) {
      if (!args.query) {
        return postsArr;
      }
      return postsArr.filter(post => {
        const isTitleMatch = post.title
          .toLowerCase()
          .includes(args.query.toLowerCase());
        const isBodyMatch = post.body
          .toLowerCase()
          .includes(args.query.toLowerCase());
        return isTitleMatch || isBodyMatch;
      });
    },
    comments(parent, args, ctx, info) {
      return commentsArr;
    },
    user() {
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
  },

  Post: {
    author(parent, args, ctx, info) {
      return usersArr.find(user => user.id === parent.author);
    },
    comments(parent, args, ctx, info) {
      return commentsArr.filter(comment => comment.post === parent.id);
    }
  },
  User: {
    posts(parent, args, ctx, info) {
      return postsArr.filter(post => post.author === parent.id);
    },
    comments(parent, args, ctx, info) {
      return commentsArr.filter(comment => comment.author === parent.id);
    }
  },
  Comment: {
    author(parent, args, ctx, info) {
      return usersArr.find(user => user.id === parent.author);
    },
    post(parent, args, ctx, info) {
      return postsArr.find(post => post.id === parent.post);
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

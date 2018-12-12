const { ApolloServer, gql } = require('apollo-server');

const faker = require('faker');

// Generate data with faker
const usersArr = [];
const userIds = [];
const postIds = [];
const postsArr = [];
const commentsArr = [];
// generate users
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
// generate posts
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
// generate commnets
for (let i = 0; i < 100; i++) {
  let comment = {
    id: faker.random.uuid(),
    text: faker.lorem.sentence(10),
    author: userIds[Math.floor(Math.random() * userIds.length)],
    post: postIds[Math.floor(Math.random() * postIds.length)]
  };
  commentsArr.push(comment);
}

const typeDefs = gql`
  type Query {
    users(query: String): [User!]!
    posts(query: String): [Post!]!
    comments(query: String): [Comment!]!
    user: User!
    post: Post!
    comment: Comment!
  }
  type Mutation {
    createUser(data: createUserInput): User!
    deleteUser(id: ID!): User!
    createPost(data: createPostInput): Post!
    deletePost(id: ID!): Post!
    createComment(data: createCommentInput): Comment!
    deleteComment(id: ID!): Comment!
  }
  input createUserInput {
    name: String!
    email: String!
    age: Int!
  }
  input createPostInput {
    title: String!
    body: String!
    published: Boolean!
    author: ID!
  }
  input createCommentInput {
    text: String!
    author: ID!
    post: ID!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post!]!
    comments: [Comment!]!
  }
  type Post {
    id: ID!
    title: String!
    body: String!
    published: Boolean!
    author: User!
    comments: [Comment!]!
  }
  type Comment {
    id: ID!
    text: String!
    author: User!
    post: Post!
  }
`;

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
  Mutation: {
    // create user
    createUser(parent, args, ctx, info) {
      const emailTaken = usersArr.some(user => {
        return user.email === args.data.email;
      });
      if (emailTaken) {
        throw new Error('Email taken.');
      }
      let newUser = { id: faker.random.uuid(), ...args.data };
      usersArr.push(newUser);
      return newUser;
    },
    // delete a user
    deleteUser(parent, args, ctx, info) {
      const userIndex = usersArr.findIndex(user => user.id === args.id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      const deletedUser = usersArr.splice(userIndex, 1);
      postsArr = postArr.filter(post => {
        const match = post.author === args.id;
        if (match) {
          commentsArr = commentsArr.filter(comment => comment.post !== post.id);
        }
        return !match;
      });
      commentsArr = comments.filter(comment => comment.author !== args.id);
      return deletedUser[0];
    },
    createPost(parent, args, ctx, info) {
      // const { title, body, published, author } = args;
      const userExists = usersArr.some(user => user.id === args.data.author);
      if (!userExists) {
        throw new Error('No user found');
      }
      let newPost = {
        id: faker.random.uuid(),
        ...args.data
      };
      postsArr.push(newPost);
      return newPost;
    },
    deletePost(parent, args, ctx, info) {
      const postIndex = postsArr.findIndex(post => post.id === args.id);
      if (postIndex === -1) {
        throw new Error('Post not found');
      }
      const deletedPost = postsArr.splice(postIndex, 1);

      commenstArr = commentsArr.filter(comments => comments.post !== args.id);
      return deletedPost[0];
    },
    createComment(parent, args, ctx, info) {
      // const { text, author, post } = args;
      const postExists = postsArr.some(
        somePost => somePost.id === args.data.post && somePost.published
      );
      const userExists = usersArr.some(user => user.id === args.data.author);

      if (!postExists || !userExists) {
        throw new Error('Invalid post or user');
      }
      let newComment = {
        id: faker.random.uuid(),
        ...args.data
      };
      commentsArr.push(newComment);
      return newComment;
    },
    deleteComment(parent, args, ctx, info) {
      const commentIndex = commentsArr.findIndex(
        comment => comment.id === args.id
      );
      if (commentIndex === -1) {
        throw new Error('Comment not found');
      }
      const deletedComment = commentsArr.splice(commentIndex, 1);
      return deletedComment[0];
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

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});

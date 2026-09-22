const store = require('../data/postStore');

function listPosts(query = {}) {
  const allPosts = store.getAllPosts();

  // Read page and limit from query parameters
  const page = Math.max(Number(query.page) || 1, 1);
  const requestedLimit = Math.max(Number(query.limit) || 20, 1);

  // Never allow more than 100 posts per request
  const limit = Math.min(requestedLimit, 100);

  // Calculate pagination
  const total = allPosts.length;
  const pages = Math.ceil(total / limit);

  // Get only the posts for the requested page
  const start = (page - 1) * limit;
  const rows = allPosts.slice(start, start + limit);

  return {
    rows,
    meta: {
      page,
      limit,
      total,
      pages
    }
  };
}

function getPost(id) {
  return store.getPostById(id);
}

function createPost(body = {}) {
  return store.createPost({
    title: body.title,
    author: body.author
  });
}

function likePost(id) {
  const post = store.incrementLikes(id);

  if (!post) {
    return null;
  }

  return post;
}

function explode() {
  const err = new Error('Internal service failure');
  err.statusCode = 500;
  throw err;
}

module.exports = {
  listPosts,
  getPost,
  createPost,
  likePost,
  explode
};
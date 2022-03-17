const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./list_helper')

const api = supertest(app)

const Blog = require('../models/blog')

describe('initial state contain blogs', () => {
    beforeEach(async () => {
        await Blog.deleteMany({})
        await Blog.insertMany(helper.initialBlogs)
    })
      
      //4.8 all blog posts in the JSON format
    test('blogs are returned as json', async () => {
      await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)
    })
      //4.8 right amout of blog posts returned
    test('all blogs are returned', async () => {
        const response = await api.get('/api/blogs')
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    //4.9 unique identifier
    test('unique identifier of the blog post is id', async () => {
        const response = await api.get('/api/blogs')
        const blogs = response.body
        console.log('blogs', blogs)
        expect(blogs[0].id).toBeDefined()
    })

    //4.10
    test('a valid blog can be added', async () => {
    const newBlog = {
        _id: "5a422b3a1b54a676234d17f9",
        title: "Canonical string reduction",
        author: "Edsger W. Dijkstra",
        url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
        likes: 12,
        __v: 0
    }

    await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')

    const titles = response.body.map(r => r.title)

    expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
    expect(titles).toContain(
        'Canonical string reduction'
    )
    })
    //4.11
    test('if missing likes default to 0', async () => {
        const newBlog = {
            _id: "5a422b891b54a676234d17fa",
            title: "First class tests",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
            __v: 0
        }
        
        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const response = await api.get('/api/blogs')

        const all_likes =response.body.map(r => r.likes)
        expect(response.body).toHaveLength(helper.initialBlogs.length + 1)
        expect(all_likes).toContain(0)
    })

    //4.12
    test('title and url missing', async () => {
        const newBlog = {
            _id: "5a422b891b54a676234d17fa",
            author: "Liu",
            __v: 0
        }
        
        await api
        .post('/api/blogs')
        .send(newBlog)
        .expect(400)

        const blogsAtEnd = await helper.blogsInDb()

        expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
        
    })
}) 



afterAll(() => {
  mongoose.connection.close()
})
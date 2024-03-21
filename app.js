const express = require('express')
const app = express()
app.use(express.json())

const path = require('path')
const dbPath = path.join(__dirname, 'todoApplication.db')
console.log(dbPath)

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const format = require('date-fns/format')
const isValid = require('date-fns/isValid')
const toDate = require('date-fns/toDate')

let db = null
const initialize = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log(`server running at http://localhost:3000`)
    })
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initialize()

const checkingRequestQuerys = async (request, response, next) => {
  const {search_q, category, priority, status, date} = request.query

  const {todoId} = request.params

  if (category !== undefined) {
    const categorylist = ['WORK', 'HOME', 'LEARNING']
    const checkCategoryList = categorylist.includes(category)
    if (checkCategoryList === true) {
      request.category = category
    } else {
      request.send(400)
      request.send('Invalid Todo Category')
      return
    }
  }

  if (priority !== undefined) {
    const priorityArray = ['HIGH', 'MEDIUM', 'LOW']
    const checkPriorityList = priorityArray.includes(priority)
    if (checkPriorityList === true) {
      request.priority = priority
    } else {
      request.send(400)
      request.send('Invalid Todo Priority')
      return
    }
  }

  if (status !== undefined) {
    const statusArray = ['TO DO', 'IN PROGRESS', 'DONE']
    const statusArrayList = statusArray.includes(status)
    if (statusArrayList === true) {
      request.status = status
    } else {
      request.send(400)
      request.send('Invalid Todo Status')
      return
    }
  }

  if (date !== undefined) {
    try {
      const myDate = new Date(date)

      const formateDate = format(new Date(date), 'yyyy-MM-dd')

      const result = toDate(
        new Date(
          `${myDate.getFullYear()}-${
            myDate.getMonth() + 1
          }-${myDate.getDate()}`,
        ),
      )

      const isValidDate = await isValid(result)

      if (isValidDate === true) {
        request.date = formateDate
      } else {
        request.status(400)
        request.send('Invalid Due Date')
        return
      }
    } catch (error) {
      request.status(400)
      request.send('Invalid Due Date')
      return
    }
  }

  request.todoId = todoId
  request.search_q = search_q
  next()
}

const checkingRequestbody = async (request, response, next) => {
  const {id, todo, category, priority, status, due_date} = request.body
  const {todoId} = request.params
  if (category !== undefined) {
    const categorylist = ['WORK', 'HOME', 'LEARNING']
    const checkCategoryList = categorylist.includes(category)
    if (checkCategoryList === true) {
      request.category = category
    } else {
      request.send(400)
      request.send('Invalid Todo Category')
    }
  }

  if (priority !== undefined) {
    const priorityArray = ['HIGH', 'MEDIUM', 'LOW']
    const checkPriorityList = priorityArray.includes(priority)
    if (checkPriorityList === true) {
      request.priority = priority
    } else {
      request.send(400)
      request.send('Invalid Todo Priority')
    }
  }

  if (status !== undefined) {
    const statusArray = ['TO DO', 'IN PROGRESS', 'DONE']
    const statusArrayList = statusArray.includes(status)
    if (statusArrayList === true) {
      request.status = status
    } else {
      request.send(400)
      request.send('Invalid Todo Status')
    }
  }

  if (due_date !== undefined) {
    try {
      const myDate = new Date(due_date)
      console.log(myDate)
      const formateDate = format(new Date(due_date), 'yyyy-MM-dd')
      console.log(formateDate)
      const result = toDate(
        new Date(
          `${myDate.getFullYear()}-${
            myDate.getMonth() + 1
          }-${myDate.getDate()}`,
        ),
      )
      console.log(result)
      const isValidDate = await isValid(result)
      if (isValidDate === true) {
        request.due_date = formateDate
      } else {
        request.status(400)
        request.send('Invalid Due Date')
      }
    } catch (error) {
      request.status(400)
      request.send('Invalid Due Date')
    }
  }

  request.todo = todo
  request.id = id
  request.todoId = todoId
  next()
}

const hasStatus = requestQuery => {
  return requestQuery.status !== undefined
}

const hasPrority = requestQuery => {
  return requestQuery.priority !== undefined
}

const hasCategory = requestQuery => {
  return requestQuery.category !== undefined
}

const hasProrityAndStatus = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  )
}

const hasCategoryAndStatus = requestQuery => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  )
}

const hasCategoryAndPriority = requestQuery => {
  return (
    requestQuery.priority !== undefined && requestQuery.category !== undefined
  )
}

app.get('/todos/', checkingRequestQuerys, async (request, response) => {
  const {status = '', priority = '', search_q = '', category = ''} = request
  console.log(status, priority, category, search_q)

  let queryResult = ''

  switch (true) {
    case hasStatus(request.query):
      queryResult = `
    SELECT id, todo, priority, status, category, due_date AS dueDate
    FROM todo
    WHERE todo LIKE "%${search_q}%" AND status = "${status}"
    `
      break
    case hasPrority(request.query):
      queryResult = `
    SELECT id, todo, priority, status, category, due_date AS dueDate
    FROM todo
    WHERE todo LIKE "%${search_q}%" AND priority = "${priority}"
    `
      break
    case hasCategory(request.query):
      queryResult = `
    SELECT id, todo, priority, status, category, due_date AS dueDate
    FROM todo
    WHERE todo LIKE "%${search_q}%" AND category = "${category}"
    `
      break
    case hasProrityAndStatus(request.query):
      queryResult = `
    SELECT id, todo, priority, status, category, due_date AS dueDate
    FROM todo
    WHERE todo LIKE "%${search_q}%" AND priority = "${priority}" AND status = "${status}"
    `
      break
    case hasCategoryAndStatus(request.query):
      queryResult = `
    SELECT id, todo, priority, status, category, due_date AS dueDate
    FROM todo
    WHERE todo LIKE "%${search_q}%" AND category = "%${category}%" AND status = "${status}"
    `
      break
    case hasCategoryAndPriority(request.query):
      queryResult = `
    SELECT id, todo, priority, status, category, due_date AS dueDate
    FROM todo
    WHERE todo LIKE "%${search_q}%" AND category = "%${category}%" AND priority = "%${priority}%"
    `
      break
    default:
      queryResult = `
    SELECT id, todo, priority, status, category, due_date AS dueDate
    FROM todo
    WHERE todo LIKE "%${search_q}%"
    `
  }

  const result = await db.all(queryResult)
  console.log(result)
  response.send(result)
})

app.get('/todos/:todoId', checkingRequestQuerys, async (request, response) => {
  const {todoId} = request
  const getTodo = `
  SELECT id, todo, priority, status, category, due_date AS dueDate
  FROM todo
  WHERE id = "${todoId}"
  `
  const result = await db.get(getTodo)
  response.send(result)
})

app.get('/agenda/', checkingRequestQuerys, async (request, response) => {
  const {date} = request
  console.log(date)
  const getTodo = `
  SELECT id, todo, priority, status, category, due_date AS dueDate
  FROM todo
  WHERE dueDate = ${date}
  `
  const result = await db.all(getTodo)
  console.log(result)
  response.send(
    result.map(each => {
      each
    }),
  )
})

app.delete(
  '/todos/:todoId',
  checkingRequestQuerys,
  async (request, response) => {
    const {todoId} = request
    const getTodo = `
  DELETE
  FROM todo
  WHERE id = "${todoId}"
  `
    await db.run(getTodo)
    response.send('Todo Deleted')
  },
)

app.post('/todos/', checkingRequestbody, async (request, response) => {
  const {
    id = '',
    todo = '',
    priority = '',
    status = '',
    category = '',
    due_date = '',
  } = request

  console.log(id, todo, status, priority, category, due_date)

  const newTodo = `
  INSERT INTO todo(id, todo, category, priority, status, due_date)
  VALUES(${id}, "${todo}", "${category}", "${priority}", "${status}", "${due_date}")
  `
  await db.run(newTodo)
  response.send('Todo Successfully Added')
})

app.put('/todos/:todoId/', checkingRequestbody, async (request, response) => {
  const {
    id = '',
    todo = '',
    category = '',
    priority = '',
    status = '',
    due_date = '',
  } = request

  const {todoId} = request

  console.log(todo, todoId, status, priority, category, due_date)

  let updatedTodo = ''
  switch (true) {
    case status !== undefined:
      updatedTodo = `
    UPDATE todo
    SET status = "${status}"
    WHERE id = ${todoId}
    `
      break
    case priority !== undefined:
      updatedTodo = `
    UPDATE todo
    SET priority = "${priority}"
    WHERE id = ${todoId}
    `
      break
    case category !== undefined:
      updatedTodo = `
    UPDATE todo
    SET category = "${category}"
    WHERE id = ${todoId}
    `
      break
    case todo !== undefined:
      updatedTodo = `
    UPDATE todo
    SET todo = "${todo}"
    WHERE id = ${todoId}
    `
      break
    case due_date !== undefined:
      updatedTodo = `
    UPDATE todo
    SET due_date = "${due_date}"
    WHERE id = ${todoId}
    `
  }

  let updatedColumn = ''
  switch (true) {
    case status !== undefined:
      updatedColumn = 'Status'
    case priority !== undefined:
      updatedColumn = 'Priority'
    case category !== undefined:
      updatedColumn = 'Category'
    case todo !== undefined:
      updatedColumn = 'Todo'
    case due_date !== undefined:
      updatedColumn = 'Due Date'
  }

  const result = await db.run(updatedTodo)
  console.log(result)
  response.send(`${updatedColumn} Updated`)
})

module.exports = app
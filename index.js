require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

app.use(express.static('build'))
app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

morgan.token('body', function (req, res) {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  } else {
    return ' '
  }
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/info', (request, response) => {
  Person.estimatedDocumentCount().then(count => {
    const todays_date = new Date()
    const res = `
    <p>Phonebook has info for ${count} people</p>
    <p>${todays_date}</p>
    `
    response.send(res)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ error: 'name and/or number are missing' })
  }

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    persons = Person.find({})
    response.json(persons)
  })
})
// app.post('/api/persons', (request, response) => {
//   const body = request.body
//   const names = persons.map(person => person.name)

//   if (!body.name || !body.number) {
//     return response.status(400).json({
//       error: 'name and/or number are missing'
//     })
//   } else if (names.includes(body.name)) {
//     return response.status(400).json({
//       error: 'name already exists'
//     })
//   }

//   const person = {
//     id: generateId(),
//     name: body.name,
//     number: body.number,
//   }

//   persons = persons.concat(person)

//   response.json(persons)
// })

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})
// app.delete('/api/persons/:id', (request, response) => {
//   const id = Number(request.params.id)
//   persons = persons.filter(person => person.id !== id)

//   response.status(204).end()
// })

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

// const generateId = () => {
//   const maxId = Math.floor(Math.random() * 1000)
//   return maxId
// }

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const mongoose = require("mongoose")

// eslint-disable-next-line no-undef
if (process.argv.length < 3) {
  console.log("Please provide the password as an argument: node mongo.js <password>")
  // eslint-disable-next-line no-undef
  process.exit(1)
}

// eslint-disable-next-line no-undef
const password = process.argv[2]

const url =
  `mongodb+srv://fullstack:${password}@cluster0.r0la4.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model("Person", personSchema)

// eslint-disable-next-line no-undef
if (process.argv.length === 3) {
  console.log("phonebook:")
  Person.find({}).then(result => {
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
  // eslint-disable-next-line no-undef
} else if (process.argv.length === 4) {
  console.log("Please provide a name and number as arguments: node mongo.js <password> <name> <number>")
  mongoose.connection.close()
  // eslint-disable-next-line no-undef
  process.exit(1)
}
else {
  // eslint-disable-next-line no-undef
  const name = process.argv[3]
  // eslint-disable-next-line no-undef
  const number = process.argv[4]
  const person = new Person({
    name,
    number,
  })

  person.save().then(result => {
    console.log("person saved!", result)
    mongoose.connection.close()
  })
}


const express = require('express')
const path = require('path')
const { get } = require('request')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const viewsDir = path.join(__dirname, 'views')
app.use(express.static(viewsDir))
app.use(express.static(path.join(__dirname, './libs')))
app.use(express.static(path.join(__dirname, './models')))

app.get('/', (req, res) => res.sendFile(path.join(viewsDir, 'record.html')))
app.get('/enroll_user', (req, res) => res.sendFile(path.join(viewsDir, 'enroll.html')))

app.listen(1337, () => console.log('Listening on port 1337!'))
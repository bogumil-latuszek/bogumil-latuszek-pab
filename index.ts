const express = require('express')
const app = express()
app.get('/', function (req, res) {
    res.send('Hello World')
})
app.get('/calc/', function (req, res) {
    let operation = req.query.operation
    let op
    let result
    let num1 = +req.query.num1
    let num2 = +req.query.num2
    switch(operation) {
        case "dodaj":
            op = '+'
            result = num1 + num2
            break
      
        case "usun":
            op = '-'
            result = num1 - num2
            break
            
        case "podziel":
            op = '/'
            result = num1 / num2
            break

        case "pomnoz":
            op = '*'
            result = num1 * num2
            break
      
        default:
            res.send(`Unknown operation=${operation} - allowed: "dodaj", "usun", "podziel", "pomnoz"`)
    }
    res.send(`${num1} ${op} ${num2} = ${result}`)
})
app.listen(3000)


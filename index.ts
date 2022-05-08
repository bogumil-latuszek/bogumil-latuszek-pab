const express = require('express')
const app = express()

function calculate(operation, num1, num2){
    let op
    let result
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
            return `Unknown operation=${operation} - allowed: "dodaj", "usun", "podziel", "pomnoz"`
    }
    return `${num1} ${op} ${num2} == ${result}`
}
app.get('/', function (req, res) {
    res.send('Hello World')
})
app.get('/calc/', function (req, res) {
    let operation = req.query.operation
    let num1 = +req.query.num1
    let num2 = +req.query.num2
    let output = calculate(operation, num1, num2)
    res.send(output)
})
app.get('/calc/:operation/:num1/:num2', function (req, res) {
    let operation = req.params.operation
    let num1 = +req.params.num1
    let num2 = +req.params.num2
    let output = calculate(operation, num1, num2)
    res.send(output)
})
app.listen(3000)

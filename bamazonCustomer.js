var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require("console.table");
var total = 0;
var connection = mysql.createConnection({
    host: "localhost",
    // Your port; if not 3306
    port: 3306,
    // Your username
    user: "root",
    // Your password
    password: "root",
    database: "bamazondb"
});
showOptions();

function showOptions() {
    var id = "";
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) return console.log(err);
        console.log("\n");
        console.table(res)
        console.log("\n");
        inquirer.prompt([
            {
                name: "id",
                message: "What is the id of the item you want to buy? Or q to quit",
                type: "input",
                validate: function (e) {
                    return e.toLowerCase() === "q" || (parseInt(e) !== NaN && parseInt(e) > 0 && parseInt(e) < res.length);
                }
            },
        ]).then(function (iR) {
            if (iR.id.toLowerCase() === "q") {
                connection.end()
                return
            }
            else {
                id = parseInt(iR.id)
                var query = connection.query("SELECT * FROM products WHERE id = ?", [id], function (err, res) {
                    if (err) return console.log(err);

                    var result = res[0];

                    inquirer.prompt([
                        {
                            name: "quan",
                            message: "How many do you want?",
                            type: "input",
                            validate: function (e) {
                                return parseInt(e) !== NaN && e !== undefined && parseInt(e) > 0 && parseInt(e) <= result.stock_quantity;
                            }
                        }
                    ]).then(function (r) {
                        var quantity = parseInt(r.quan);
                        if (quantity <= result.stock_quantity) {
                            console.log(quantity * result.price)
                            total += (quantity * result.price)

                            console.log("\n Your current total is " + total)

                            updateOptions(id, quantity, result.stock_quantity);
                        }

                        else {
                            console.log("Not enough in inventory");
                            showOptions();
                        }
                    })
                })
            }
        })
    })
}
//p for product q for quantity. s for stock
function updateOptions(p, q, s) {
    connection.query(
        "UPDATE products SET stock_quantity = ? WHERE id = ?", [s - q, p], function (err, res) {
            if (err) return console.log(err);
            showOptions();
        })
}
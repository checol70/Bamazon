var inquirer = require("inquirer");
var mysql = require("mysql");
var cTable = require("console.table");

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
options();
function options() {
    inquirer.prompt([
        {
            name: "choice",
            message: "What do you want to do?",
            type: "list",
            choices: ["View products on sale", "View low inventory", "Add to inventory", "Add new product", "Quit"]
        }]).then(function (r) {
            switch (r.choice) {
                case "View products on sale":
                    viewSales();
                    break;
                case "View low inventory":
                    viewLow();
                    break;
                case "Add to inventory":
                    addInv();
                    break;
                case "Add new product":
                    addProduct();
                    break;
                case "Quit":
                    connection.end()
                    break;
                default:
                    console.log("unhandled choice, please see your choice:" + r.choice);
                    connection.end();
                    break;
            }
        })
}

function viewSales() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) return console.log(err);
        console.log("\n");
        console.table(res)
        console.log("\n");
        options()
    })
}
function viewLow() {
    connection.query("SELECT * FROM products WHERE stock_quantity <5", function (err, res) {
        if (err) return console.log(err);
        console.log(res);
        if (res.length === 0) {
            console.log("No low inventory");
            options()
        }
        else {
            console.log("\n");
            console.table(res)
            console.log("\n");
            options();
        }
    })
}
function addInv() {
    connection.query("SELECT * FROM products", function (err, res) {
        if (err) return console.log(err);
        console.log("\n");
        console.table(res)
        console.log("\n");
        inquirer.prompt([
            {
                name: "id",
                message: "What is the id of the item you want to add",
                type: "input",
                validate: function (e) {
                    return (parseInt(e) !== NaN && parseInt(e) > 0 && parseInt(e) < res.length - 1);
                }
            }, {
                name: "quan",
                message: "How many do you want to add?",
                type: "input",
                validate: function (e) {
                    return parseInt(e) !== NaN && e !== undefined && parseInt(e) > 0;
                }
            }
        ]).then(function (r) {
            var p = r.id;
            var s = parseInt(r.quan);
            var q = res[p].stock_quantity
            connection.query(
                "UPDATE products SET stock_quantity = ? WHERE id = ?", [s + q, p], function (err, res) {
                    if (err) return console.log(err);
                    console.log("Stock successfully added!");
                    options();
                })
        })
    })
}
function addProduct() {
    inquirer.prompt([
        {
            name: "name",
            message: "What is this products name?",
            type: "input"
        },{
            name: "dep",
            message:"What department is this product in?",
            type:"input"
        },{
            name: "price",
            message:"What is the cost of this product?",
            type:"input",
            validate:function(e){
                return parseInt(e) !== NaN && e !== undefined && parseFloat(e) > 0;
            }
        },{
            name:"quan",
            message:"How many do we have?",
            type: "input",
            validate:function(e){
                return parseInt(e) !== NaN && e !== undefined && parseInt(e) > 0;
            }
        }
    ]).then(function(r){
        var query = connection.query("INSERT INTO products(product_name, department_name, price, stock_quantity) VALUES (?,?,?,?)", [r.name, r.dep, r.price, r.quan], function (err, res) {
            console.log(query.sql)
            if (err) return console.log(err);
            console.log("Successfully added product: " + r.name);
            options();
        })
    })
}
const mongoose = require("mongoose")
mongoose.Promise = global.Promise

mongoose.connect("mongodb://localhost/cadastroDeFuncionarios", {

}).then(() => console.log("Connected"))
    .catch((err) => console.log (err))
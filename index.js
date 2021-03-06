//importações
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const session = require("express-session");
const connection = require("./database/database");

const categoriesController = require("./categories/categoriesController");
const articlesController = require("./articles/articlesController");
const usersController = require("./users/usersController");

const Article = require("./articles/Article");
const Category = require("./categories/Category");
const User = require("./users/User");

//carregar view engine
app.set('view engine', 'ejs');

//Sessions
app.use(session({
    secret: "21dsa@*()f1050a1#s31f1sa$q12d0as%cvxzvvzxvewt",
    cookie: { maxAge: 30000000 }
}));

//static
app.use(express.static('public'));

//body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//database
connection.authenticate().then(() => {
    console.log("Conectado com sucesso ao BD");
}).catch((error) => {
    console.log("Erro na conexão com o BD" + error);
});

app.use("/", categoriesController);
app.use("/", articlesController);
app.use("/", usersController);

//rotas
app.get("/", (req, res) => {
    Article.findAll({
        order: [
            ['id', 'DESC']
        ],
        limit: 4
    }).then(articles => {

        Category.findAll().then(categories => {
            res.render("index", { articles: articles, categories: categories });
        });
    });
});

app.get("/:slug", (req, res) => {
    var slug = req.params.slug;

    Article.findOne({
        where: {
            slug: slug
        }
    }).then(article => {
        if (article != undefined) {
            Category.findAll().then(categories => {
                res.render("article", { article: article, categories: categories });
            });
        } else {
            res.redirect("/");
        }
    }).catch(err => {
        res.redirect("/");
    });
});

app.get("/category/:slug", (req, res) => {
    var slug = req.params.slug;

    Category.findOne({
        where: {
            slug: slug
        },
        include: [{ model: Article }]
    }).then(category => {
        if (category != undefined) {
            Category.findAll().then(categories => {
                res.render("index", { articles: category.articles, categories: categories });
            });
        } else {
            res.redirect("/");
        }
    }).catch(err => {
        res.redirect("/");
    })
});

//porta
app.listen(3000, () => {
    console.log("App rodando");
});
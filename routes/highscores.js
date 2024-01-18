var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const { getHighscores, saveHighscore } = require("./persistence.js");
// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
    console.log('Time: ', Date());
    next();
})

router.get('/list', urlencodedParser, async function(req, res, next) {
    console.log('[GET /highscores/list]');
    let hs= await getHighscores();
    // Retrieve the top 10 high scores
    res.json(hs);
});

// Accessed at /highscores
router.post('/', urlencodedParser, function(req, res, next) {
    console.log('[POST /highscores] body =', req.body,
                ' host =', req.headers.host,
                ' user-agent =', req.headers['user-agent'],
                ' referer =', req.headers.referer);

    var userScore = parseInt(req.body.score, 10),
        userLevel = parseInt(req.body.level, 10);

    let result= saveHighscore(req.body.name, userScore, userLevel);
                res.json({
                    name: req.body.name,
                    zone: "",
                    score: userScore,
                    level: userLevel,
                    rs: result
                });
});

module.exports = router;

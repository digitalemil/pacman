var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
const { getLivestats } = require("./persistence.js");

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })


// middleware that is specific to this router
router.use(function timeLog (req, res, next) {
    console.log('Time: ', Date());
    next();
})

/*
router.get('/id', function(req, res, next) {
    console.log('[GET /user/id]');
    res.json(createUser());
});
*/

router.post('/stats', urlencodedParser, function(req, res, next) {
    console.log('[POST /user/stats]\n',
                ' body =', req.body, '\n',
                ' host =', req.headers.host,
                ' user-agent =', req.headers['user-agent'],
                ' referer =', req.headers.referer);

    var userScore = parseInt(req.body.score, 10),
        userLevel = parseInt(req.body.level, 10),
        userLives = parseInt(req.body.lives, 10),
        userET = parseInt(req.body.elapsedTime, 10);

        res.json(updateHighscore(userScore, userLevelm, userLives, userET));
  //      db.collection('userstats').updateOne({
});

router.get('/stats', async function(req, res, next) {
    console.log('[GET /user/stats]');

 /*
                                score: item['score'],
                                level: item['level'],
                                lives: item['lives'],
                                */
        let stats= await getLivestats();
        console.log("User"+ JSON.stringify(stats))
        res.json(stats);
});


module.exports = router;

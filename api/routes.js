const router = require('express').Router()

router.get('/charts', (req, res) => {
  res.json(['this', 'that'])
})

router.post('/charts', (req, res) => {
  let name = req.body
  res.json(['this post', 'that post'])
})

module.exports = router

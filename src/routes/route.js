const express = require('express');
const router = express.Router();

router.get('/',
async(req,res)=>{
    return res.send('This is landing page route ')
}
),
router.get('/api',
async(req,res)=>{
    return res.send('This is default route for API ')
}
),
router.get('/api/admin',
async(req,res)=>{
    return res.send('This is  default api route for ADMIN ')
}
),
router.get('/api/author',
async(req,res)=>{
    return res.send('This is  default api route for AUTHOR')
}
),
router.get('/api/user',
async(req,res)=>{
    return res.send('This is default api route for USER')
}
),

module.exports = router;
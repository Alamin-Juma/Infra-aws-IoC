const { Router } = require('express');
const router = Router();


const dashboardcontroller = require('../components/dashboard/welcome')


router.get('dashbaord',[],dashboardcontroller.dashboard)

module.exports = router;


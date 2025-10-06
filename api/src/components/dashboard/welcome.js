module.exports.dashboard = async (req,res,next) => {
    try {
        return res.json({
            status: 200,
            message: 'success'
        })
    } catch(err){
        return next(err);
    }

};


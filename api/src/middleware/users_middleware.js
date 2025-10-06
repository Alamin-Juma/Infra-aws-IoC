//use yup to validate the requests
let yup = require('yup');
//login validations
let login_validations = yup.object().shape({
    email: yup
        .string()
        .required('Please enter email')
        .email('Please enter a valid email'),
    password: yup
        .string()
        .required('Please enter password')
        .min(6,'Please enter minimum 6 characters'),
});

//validation Logins
module.exports.validate_login = (req,res,next) =>{
    login_validations.validate(
        {
            email: req.body.email,
            password: req.body.password,
        },
        {abortEarly: false}
    ).then(function (){
        next();
    })
    .catch(function (err){
        return next(err);
    });

}


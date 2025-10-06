import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';
import bgImage from '../../../assets/bg003.png'
import projectLogo from '../../../assets/logo.png'
import Lottie from 'lottie-react';
import animationData from '../../../assets/lottie/forgot-pass.json';
import AuthLayout from '../../../layouts/AuthLayout';
import withAuth from '../../../utils/withAuth';
import config from '../../../configs/app.config';
import { toast } from 'react-toastify';
import { IoIosArrowRoundBack } from "react-icons/io";


const ForgotPasswordPage = () => {

    const navigate = useNavigate();

    const API_BASE_URL = config.API_BASE_URL;

    const [state, setState] = useState({
        email: ""
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [disableButton, setDisableButton] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target
        setState(prevState => ({
            ...prevState,
            [id]: value
        }))
    };

    const validateEmail = (email) => {
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
        return emailRegex.test(email);
    };

    const resetPassword = (e) => {
        e.preventDefault()
        setError('');
        setSuccessMessage('');
        if (!state.email) {
            setError('Please enter your email address.');
        } else if (!validateEmail(state.email)) {
            setError('Please enter a valid email address.');
        } else {
            //strip the email domain
            const emailParts = state.email.split('@');
            const domain = emailParts[1];
            const domainsArray = config.acceptable_domains;
            if (!domainsArray.includes(domain)) {
                setError('Please use a valid company email address e.g. user@griffinglobaltech.com');
            } else {
                setError('');
                setSuccessMessage('');
                const payload = {
                    "email": state.email
                };
                axios.post(API_BASE_URL + '/forgot-password', payload)
                    .then(function (response) {
                        if (response.status === 201) {
                            setDisableButton(true);
                            setSuccessMessage('Requested submitted successfully. Please check your email for further instructions.');
                            toast.success('Request submitted successfully');

                        } else if (response.status === 404) {
                            setError('The account does not exist. Please contact the system administrator.');
                        } else {
                            setError('Unexpected Error. Please contact the system administrator.');
                        }
                    })
                    .catch(function (error) {
                        if (error.status === 404) {
                            setError('The account does not exist. Please contact the system administrator.');
                        } else {
                            setError('Unexpected Error. Please contact the system administrator.');
                        }
                    });

            }

        }

        // navigate('/app/dashboard')
    }

    return (
        <div className="bg-gray-100 flex justify-center items-center h-screen overflow-hidden">
            <div className="w-1/2 h-screen hidden lg:block relative">
                <img src={bgImage} alt="Placeholder Image" className="object-cover w-full h-full" />


                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
                    <h2 className="text-4xl font-bold mb-4">Forgot Password</h2>
                    <p className="text-lg">Please provide your email address to proceed</p>
                </div>
            </div>


            <div className="lg:p-36 md:p-52 sm:20 p-8 w-full lg:w-1/2">
                {/* <h1 className="text-2xl font-semibold mb-4">Login</h1> */}

                <div className='flex justify-center items-center w-full flex-col'>
                    <img src={projectLogo} alt="Logo" />
                    <Lottie animationData={animationData} loop={true} className='h-40' />
                </div>
                <h1 className="text-md text-center text-3xl font-semibold mb-6">Forgot Password?</h1>
                <form>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-gray-600">Email Address<span className="text-red-500">*</span></label>
                        <input type="email" id="email" name="email"
                            value={state.email}
                            placeholder='Enter your email address'
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500" autoComplete="off" />
                    </div>

                    {/* <div className="mb-6 text-blue-500">
                        <a href="#" className="hover:underline">Forgot Password?</a>
                    </div> */}
                    {error && <div className="mb-4 alert alert-error" >
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM24 26C22.9 26 22 25.1 22 24V16C22 14.9 22.9 14 24 14C25.1 14 26 14.9 26 16V24C26 25.1 25.1 26 24 26ZM26 34H22V30H26V34Z" fill="#E92C2C" />
                        </svg>
                        <div className="flex flex-col">
                            <span>Error!</span>
                            <span className="text-content2">{error}</span>
                        </div>
                    </div>}
                    {successMessage && <div className="alert alert-success">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M24 4C12.96 4 4 12.96 4 24C4 35.04 12.96 44 24 44C35.04 44 44 35.04 44 24C44 12.96 35.04 4 24 4ZM18.58 32.58L11.4 25.4C10.62 24.62 10.62 23.36 11.4 22.58C12.18 21.8 13.44 21.8 14.22 22.58L20 28.34L33.76 14.58C34.54 13.8 35.8 13.8 36.58 14.58C37.36 15.36 37.36 16.62 36.58 17.4L21.4 32.58C20.64 33.36 19.36 33.36 18.58 32.58Z" fill="#00BA34" />
                        </svg>
                        <div className="flex flex-col">
                            <span>Success</span>
                            <span className="text-content2">{successMessage}</span>
                        </div>
                    </div>}

                    <button type="submit" onClick={resetPassword}  disabled={disableButton} className={`rounded-lg btn text-white bg-[#77B634] btn-block ${disableButton ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}>Submit</button>
                </form>
                <div className="mt-6 text-blue-500">
                    <Link className='flex gap-2 items-center text-center justify-center' to={'/auth/login'}>
                        <IoIosArrowRoundBack /> <a className="hover:underline">Back to Login</a>
                    </Link>

                </div>
            </div>
        </div>
    )
}


const WrappedLanding = withAuth(ForgotPasswordPage, true);
export default () => <AuthLayout><WrappedLanding /></AuthLayout>;

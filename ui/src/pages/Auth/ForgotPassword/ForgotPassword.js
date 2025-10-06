import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

import bgImage from '../../../assets/bg003.png';
import projectLogo from '../../../assets/logo.png';
import Lottie from 'lottie-react';
import animationData from '../../../assets/lottie/forgot-pass.json'
import AuthLayout from '../../../layouts/AuthLayout'
import withAuth from '../../../utils/withAuth';


const ForgotPassword = () => {

    const navigate = useNavigate();

    const loginUser = (e) => {
        e.preventDefault()
        navigate('/app/dashboard')
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
                        <label htmlFor="username" className="block text-gray-600">Email</label>
                        <input type="text" id="username" name="username" className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:border-blue-500" autoComplete="off" />
                    </div>


                    <button type="submit" onClick={loginUser} className="bg-[#77B634] hover:bg-[#77B634] cursor-pointer text-white font-semibold rounded-md py-2 px-4 w-full">Send Forgot Link</button>
                </form>

                <div className="mt-6 text-blue-500 text-center">
                    <Link to={'/'}>
                        <a className="hover:underline">Back to Login?</a>
                    </Link>
                </div>
            </div>
        </div>
    )
}


const WrappedLanding = withAuth(ForgotPassword, true);
export default () => <AuthLayout><WrappedLanding /></AuthLayout>;


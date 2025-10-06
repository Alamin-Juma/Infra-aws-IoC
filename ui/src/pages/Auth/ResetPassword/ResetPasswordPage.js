import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';
import projectLogo from '../../../assets/logo.png';
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from '../../../layouts/AuthLayout';
import withAuth from '../../../utils/withAuth';
import config from '../../../configs/app.config';
import Spinner from '../../../components/Spinner';
import { IoIosArrowRoundBack } from "react-icons/io";
import { toast } from 'react-toastify';

const ResetPasswordPage = () => {

    const { token } = useParams();

    const API_BASE_URL = config.API_BASE_URL;

    const navigate = useNavigate();
    const [state, setState] = useState({
        password: "",
        confirm_password: ""
    });

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [disableButton, setDisableButton] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showForm, setShowForm] = useState(true);

    useEffect(() => {
        if (!token) {
            // If 'id' is missing, redirect to the login page
            navigate('/auth/login');
        } else {
            axios.get(API_BASE_URL + `/forgot-password/validate-token/${token}`)
                .then(function (response) {
                    if (response.status !== 200) {
                        setDisableButton(false);
                        setShowForm(false);
                        setError('Invalid Request. Please reset the password again.');
                    }
                })
                .catch(function (error) {
                    setDisableButton(false);
                    setShowForm(false);
                    setError('Invalid Request. Please reset the password again.');
                });
        }

    }, [token, navigate]);


    const handleChange = (e) => {
        const { id, value } = e.target
        setState(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault()
        setError('');
        if (!state.password || !state.confirm_password) {
            setError('Please enter your passwords.');
        } else if (!validatePassword(state.password)) {
            //Invalid Password. Error message already displayed by the validation method
        } else if (state.password !== state.confirm_password) {
            setError('The two passwords do not match!.');
        } else {
            setLoading(true);
            setError('');
            setSuccessMessage('');
            setDisableButton(true);
            setShowPassword(false);
            setShowConfirmPassword(false);
            const payload = {
                "password": state.password,
                "token": token
            }
            axios.post(API_BASE_URL + '/forgot-password/reset-password', payload)
                .then(function (response) {
                    setLoading(false);
                    if (response.status === 201) {
                        setSuccessMessage('Password changed successfully. Please proceed to login with the new password.');
                        toast.success('Password changed successfully');

                    } else if (response.status === 404) {
                        setDisableButton(false);
                        setError('Invalid Request. Please contact the system administrator.');
                    } else {
                        setDisableButton(false);
                        setError('Unexpected Error. Please contact the system administrator.');
                    }
                })
                .catch(function (error) {
                    setLoading(false);
                    setDisableButton(false);
                    if (error.status === 404) {
                        setError('Invalid request. Please contact the system administrator.');
                    } else {
                        setError('Unexpected Error. Please contact the system administrator.');
                    }

                });

        }
    };

    const validatePassword = (password) => {
        // Reset error message
        setError('');
        if (!password) {
            setError('Password is required');
            return false;
        }
        // Check if password contains at least one number
        if (!/\d/.test(password)) {
            setError('Password must contain at least one number');
            return false;
        }

        // Check if password contains at least one special character
        if (!/[!@#$%^&*()\[\]{}\-_=+~`.,<>?/\\|:;"']/g.test(password)) {
            setError('Password must contain at least one special character');
            return false;
        }

        // Check if password contains at least one uppercase letter
        if (!/[A-Z]/.test(password)) {
            setError('Password must contain at least one uppercase letter');
            return false;
        }
        // Check password length (at least 8 characters)
        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return false;
        }
        return true;
    };

    return (
        <div className="bg-gray-100 flex justify-center items-center h-screen p-4">
            <div className="w-full max-w-5xl bg-white rounded-lg shadow-lg flex flex-col lg:flex-row overflow-hidden">
                {showForm && <div className="w-full lg:w-1/3 bg-gray-50 p-6 flex flex-col justify-center border-r">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Secure Password Requirements</h2>
                    <ul className="list-disc pl-5 text-gray-600 space-y-2">
                        <li>At least 8 characters long</li>
                        <li>Includes uppercase and lowercase letters</li>
                        <li>Contains at least one number</li>
                        <li>Has at least one special character</li>
                    </ul>
                </div>}
                {!showForm && <div className="w-full lg:w-1/3 bg-white-50 p-6 flex flex-col justify-center border-r">
                    <h2 className="text-2xl font-bold text-gray-700 mb-4">Request Expired!</h2>
                </div>}


                <div className="w-full lg:w-2/3 p-8 flex flex-col justify-center">
                    <div className='flex justify-center items-center w-full flex-col mb-6'>
                        <img src={projectLogo} alt="Logo" className="h-16" />
                    </div>
                    <form>
                        {showForm && <div>
                            <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Set Password</h1>
                            <div className="mb-4 relative" >
                                <label htmlFor="password" className="block text-gray-700 font-medium">Enter Password<span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} id="password" name="password"
                                        value={state.password}
                                        placeholder='Enter password'
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" autoComplete="off" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div className="mb-4 relative">
                                <label htmlFor="confirm_password" className="block text-gray-700 font-medium">Confirm Password<span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input type={showConfirmPassword ? "text" : "password"} id="confirm_password" name="confirm_password"
                                        value={state.confirm_password}
                                        placeholder='Enter confirm password'
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" autoComplete="off" />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                                    >
                                        {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                        </div>}
                        {error && <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-center">
                            <span>{error}</span>
                        </div>}
                        {successMessage && <div className="mb-4 p-3 bg-green-100 text-green-600 rounded-lg text-center">
                            <span>{successMessage}</span>
                        </div>}
                        {showForm && <div className="mt-4">
                            <button
                                type="submit"
                                onClick={onSubmit}
                                className={`rounded-lg btn text-white bg-[#77B634] btn-block ${disableButton ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                disabled={disableButton || loading}
                            >
                                {loading ? <Spinner /> : 'Submit'}
                            </button>
                        </div>}
                    </form>
                    <div className="mt-6 text-blue-500">
                        <Link className='flex gap-2 items-center text-center justify-center' to={'/auth/login'}>
                            <IoIosArrowRoundBack /> <a className="hover:underline">Back to Login</a>
                        </Link>

                    </div>
                </div>
            </div>
        </div>

    )

}


const WrappedLanding = withAuth(ResetPasswordPage, true);
export default () => <AuthLayout><WrappedLanding /></AuthLayout>;

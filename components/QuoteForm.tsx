'use client';

import { useState } from 'react';

interface Service {
    name: string;
    price: number;
    description: string;
    unit: string;
}

interface SelectedService {
    name: string;
    quantity: number;
}

const SERVICES: Service[] = [
    {
        name: 'Web Development',
        price: 500,
        description: 'Custom website development',
        unit: 'base'
    },
    {
        name: 'SEO',
        price: 300,
        description: 'Search engine optimization',
        unit: 'month'
    },
    {
        name: 'Social Media Management',
        price: 200,
        description: 'Social media strategy & management',
        unit: 'month'
    }
];

export default function QuoteForm() {
    const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calculate pricing in real-time
    const calculatePricing = () => {
        const subtotal = selectedServices.reduce((acc, selected) => {
            const service = SERVICES.find(s => s.name === selected.name);
            return acc + (service ? service.price * selected.quantity : 0);
        }, 0);

        const tax = subtotal * 0.10;
        const total = subtotal + tax;

        return { subtotal, tax, total };
    };

    const { subtotal, tax, total } = calculatePricing();

    // Handle service selection
    const handleServiceToggle = (serviceName: string) => {
        setError(null);
        const exists = selectedServices.find(s => s.name === serviceName);

        if (exists) {
            setSelectedServices(selectedServices.filter(s => s.name !== serviceName));
        } else {
            setSelectedServices([...selectedServices, { name: serviceName, quantity: 1 }]);
        }
    };

    // Handle quantity change
    const handleQuantityChange = (serviceName: string, quantity: number) => {
        setError(null);
        if (quantity < 1) return;

        setSelectedServices(selectedServices.map(s =>
            s.name === serviceName ? { ...s, quantity } : s
        ));
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedServices.length === 0) {
            setError('Please select at least one service');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/quote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ services: selectedServices }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit quote');
            }

            setShowSuccess(true);
            setSelectedServices([]);

            // Hide success message after 5 seconds
            setTimeout(() => setShowSuccess(false), 5000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit quote');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Get Your Quote
                    </h1>
                    <p className="text-lg text-gray-600">
                        Select the services you need and see your estimate in real-time
                    </p>
                </div>

                {/* Success Message */}
                {showSuccess && (
                    <div className="mb-8 p-6 bg-green-50 border-l-4 border-green-500 rounded-lg shadow-md animate-fade-in">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-green-800">Success!</h3>
                                <p className="text-green-700">Your quote has been submitted successfully. We'll be in touch soon!</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-8 p-6 bg-red-50 border-l-4 border-red-500 rounded-lg shadow-md">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-red-700">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">
                    {/* Services Selection */}
                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Select Services</h2>
                        <div className="space-y-4">
                            {SERVICES.map((service) => {
                                const selected = selectedServices.find(s => s.name === service.name);
                                const isSelected = !!selected;

                                return (
                                    <div
                                        key={service.name}
                                        className={`border-2 rounded-xl p-6 transition-all duration-300 cursor-pointer ${isSelected
                                                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                                : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                                            }`}
                                        onClick={() => handleServiceToggle(service.name)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-4 flex-1">
                                                <div className="flex items-center h-6">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleServiceToggle(service.name)}
                                                        className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                                                    <p className="text-gray-600 mt-1">{service.description}</p>
                                                    <p className="text-indigo-600 font-bold mt-2">
                                                        ${service.price}/{service.unit}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Quantity Selector */}
                                            {isSelected && (
                                                <div className="ml-4" onClick={(e) => e.stopPropagation()}>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Quantity
                                                    </label>
                                                    <div className="flex items-center space-x-3">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuantityChange(service.name, (selected?.quantity || 1) - 1)}
                                                            className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors flex items-center justify-center font-semibold"
                                                            disabled={(selected?.quantity || 1) <= 1}
                                                        >
                                                            −
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={selected?.quantity || 1}
                                                            onChange={(e) => handleQuantityChange(service.name, parseInt(e.target.value) || 1)}
                                                            className="w-16 text-center border-2 border-gray-300 rounded-lg py-1 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => handleQuantityChange(service.name, (selected?.quantity || 1) + 1)}
                                                            className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors flex items-center justify-center font-semibold"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Price Summary */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-8">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Price Estimate</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between text-gray-700">
                                <span>Subtotal:</span>
                                <span className="font-semibold">${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-700">
                                <span>Tax (10%):</span>
                                <span className="font-semibold">${tax.toFixed(2)}</span>
                            </div>
                            <div className="border-t-2 border-gray-300 pt-3 mt-3">
                                <div className="flex justify-between text-xl font-bold text-gray-900">
                                    <span>Total:</span>
                                    <span className="text-indigo-600">${total.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || selectedServices.length === 0}
                        className={`w-full py-4 px-6 rounded-xl text-white font-semibold text-lg transition-all duration-300 ${isSubmitting || selectedServices.length === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                            }`}
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                            </span>
                        ) : (
                            'Get Quote'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

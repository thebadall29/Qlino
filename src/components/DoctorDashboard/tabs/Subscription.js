import React, { useState, useEffect } from 'react';
import './Subscription.scss';

const Subscription = () => {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    const [plans, setPlans] = useState({
        trial: {
            name: 'Trial',
            duration: 30,
            price: 0,
            features: {
                appointments: true,
                patientManagement: true,
                chat: true,
                photos: false,
                analytics: false,
                priority: false
            },
            description: '30-day free trial with essential features'
        },
        monthly: {
            name: 'Monthly Pro',
            duration: 30,
            price: 999,
            features: {
                appointments: true,
                patientManagement: true,
                chat: true,
                photos: true,
                analytics: false,
                priority: false
            },
            description: 'Full access to basic features with monthly billing'
        },
        semiAnnual: {
            name: '6 Months Premium',
            duration: 180,
            price: 4999,
            features: {
                appointments: true,
                patientManagement: true,
                chat: true,
                photos: true,
                analytics: true,
                priority: false
            },
            description: 'Enhanced features with 6-month billing (Save 16%)'
        },
        annual: {
            name: 'Annual Elite',
            duration: 365,
            price: 8999,
            features: {
                all: true,
                appointments: true,
                patientManagement: true,
                chat: true,
                photos: true,
                analytics: true,
                priority: true
            },
            description: 'Full access to all premium features with annual billing (Save 25%)'
        }
    });

    useEffect(() => {
        fetchSubscriptionStatus();
        fetchSubscriptionPlans();
    }, []);

    const fetchSubscriptionStatus = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/subscription/status', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch subscription status');
            }

            const data = await response.json();
            console.log('Subscription status:', data);
            setSubscription(data);
        } catch (error) {
            console.error('Error fetching subscription status:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubscriptionPlans = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/subscription/plans');
            if (!response.ok) {
                throw new Error('Failed to fetch subscription plans');
            }

            const data = await response.json();
            console.log('Subscription plans:', data);
            setPlans(data.plans);
        } catch (error) {
            console.error('Error fetching subscription plans:', error);
        }
    };

    const startTrial = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/subscription/trial', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to start trial');
            }

            const data = await response.json();
            console.log('Trial started:', data);
            await fetchSubscriptionStatus(); // Refresh subscription status
            alert('Trial started successfully!');
        } catch (error) {
            console.error('Error starting trial:', error);
            alert(error.message || 'Failed to start trial');
        }
    };

    const handleSubscribe = async (planType) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/subscription/subscribe', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ plan: planType })
            });
            
            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to activate subscription');
            }

            const data = await response.json();
            console.log('Subscription activated:', data);
            await fetchSubscriptionStatus(); // Refresh subscription status
            alert(`Successfully subscribed to ${planType} plan!`);
        } catch (error) {
            console.error('Error activating subscription:', error);
            alert(error.message || 'Failed to activate subscription');
        }
    };

    const cancelSubscription = async () => {
        if (window.confirm('Are you sure you want to cancel your subscription?')) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/subscription/cancel', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || 'Failed to cancel subscription');
                }

                await fetchSubscriptionStatus(); // Refresh subscription status
                alert('Subscription cancelled successfully!');
            } catch (error) {
                console.error('Error cancelling subscription:', error);
                alert(error.message || 'Failed to cancel subscription');
            }
        }
    };

    if (loading) {
        return <div className="subscription-loading">Loading...</div>;
    }

    return (
        <div className="subscription-container">
            {/* Current Subscription Status */}
            <div className="current-subscription">
                <h2>Current Subscription Status</h2>
                {subscription?.status === 'active' ? (
                    <div className="active-subscription">
                        <div className="status-card">
                            <h3>Active Plan: {
                                subscription.subscription.plan === 'monthly' ? 'Monthly Pro' :
                                subscription.subscription.plan === 'semiAnnual' ? '6 Months Premium' :
                                subscription.subscription.plan === 'annual' ? 'Annual Elite' :
                                'Trial'
                            }</h3>
                            <p className="days-remaining">
                                {subscription.subscription.remainingDays} days remaining
                            </p>
                            <p className="expiry-date">
                                Expires: {new Date(subscription.subscription.endDate).toLocaleDateString()}
                            </p>
                            <button 
                                onClick={cancelSubscription}
                                className="cancel-subscription-btn"
                            >
                                Cancel Subscription
                            </button>
                        </div>
                        <div className="features-list">
                            <h4>Your Active Features:</h4>
                            <ul>
                                {subscription.subscription.features && Object.entries(subscription.subscription.features).map(([feature, hasAccess]) => (
                                    hasAccess && (
                                        <li key={feature}>✓ {
                                            feature === 'patientManagement' ? 'Patient Management' :
                                            feature === 'appointments' ? 'Appointments' :
                                            feature === 'chat' ? 'Chat' :
                                            feature === 'photos' ? 'Photo Upload' :
                                            feature === 'analytics' ? 'Advanced Analytics' :
                                            feature === 'priority' ? 'Priority Support' :
                                            feature === 'all' ? 'All Features' :
                                            feature
                                        }</li>
                                    )
                                ))}
                            </ul>
                        </div>
                    </div>
                ) : subscription?.status === 'eligible_for_trial' ? (
                    <div className="trial-eligible">
                        <p>{subscription.message}</p>
                        <button onClick={startTrial} className="start-trial-btn">
                            Start 30-Day Free Trial
                        </button>
                    </div>
                ) : (
                    <div className="no-subscription">
                        <p>No active subscription</p>
                        <p>Choose a plan below to get started</p>
                    </div>
                )}
            </div>

            {/* Available Plans */}
            <div className="subscription-plans">
                <h2>Available Plans</h2>
                <div className="plans-grid">
                    {Object.entries(plans).map(([planKey, plan]) => (
                        <div key={planKey} className="plan-card">
                            <div className="plan-header">
                                <h3>{plan.name}</h3>
                                <div className="price">
                                    ₹{plan.price}
                                    <span className="duration">
                                        /{planKey === 'annual' ? 'year' : 
                                          planKey === 'semiAnnual' ? '6 months' : 
                                          planKey === 'monthly' ? 'month' : 'free trial'}
                                    </span>
                                </div>
                            </div>
                            <p className="description">{plan.description}</p>
                            <div className="features">
                                <h4>Features:</h4>
                                <ul>
                                    {Object.entries(plan.features).map(([feature, hasAccess]) => (
                                        hasAccess && (
                                            <li key={feature}> {
                                                feature === 'patientManagement' ? 'Patient Management' :
                                                feature === 'appointments' ? 'Appointments' :
                                                feature === 'chat' ? 'Chat' :
                                                feature === 'photos' ? 'Photo Upload' :
                                                feature === 'analytics' ? 'Advanced Analytics' :
                                                feature === 'priority' ? 'Priority Support' :
                                                feature === 'all' ? 'All Features' :
                                                feature
                                            }</li>
                                        )
                                    ))}
                                </ul>
                            </div>
                            {planKey !== 'trial' && (
                                <button 
                                    onClick={() => handleSubscribe(planKey)}
                                    className="subscribe-btn"
                                    disabled={subscription?.status === 'active'}
                                >
                                    {subscription?.status === 'active' 
                                        ? 'Already Subscribed' 
                                        : `Subscribe to ${plan.name}`}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Subscription;

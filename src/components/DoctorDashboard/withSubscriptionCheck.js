import React, { useState, useEffect } from 'react';
import config from '../../config/config';
import { useNavigate } from 'react-router-dom';

const withSubscriptionCheck = (WrappedComponent, requiredFeature) => {
    return function SubscriptionWrapper(props) {
        const [hasAccess, setHasAccess] = useState(false);
        const [loading, setLoading] = useState(true);
        const navigate = useNavigate();

        useEffect(() => {
            const checkAccess = async () => {
                try {
                    const token = localStorage.getItem('token');
                    console.log(`Checking access for feature: ${requiredFeature}`);
                    // First check subscription status
                    const statusResponse = await fetch(`${config.API_URL}/api/subscription/status`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!statusResponse.ok) {
                        throw new Error('Failed to check subscription status');
                    }

                    const statusData = await statusResponse.json();
                    console.log('Current subscription status:', statusData);

                    // If subscription is active, check features
                    if (statusData.status === 'active' && statusData.subscription) {
                        // Check if has all features or the specific feature
                        if (statusData.subscription.features?.all || 
                            statusData.subscription.features?.[requiredFeature]) {
                            setHasAccess(true);
                            setLoading(false);
                            return;
                        }
                    }

                    // If not all features, check specific feature access
                    const response = await fetch(`${config.API_URL}/api/subscription/check-feature/${requiredFeature}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        console.error('Subscription check failed:', response.status);
                        throw new Error('Failed to check subscription access');
                    }

                    const data = await response.json();
                    console.log('Subscription check response:', data);
                    
                    // Check if we have access to the specific feature
                    if (!data.hasAccess) {
                        console.log(`No access to feature: ${requiredFeature}`);
                        setHasAccess(false);
                        setLoading(false);
                        
                        // Only redirect if we're not already on the subscription page
                        if (window.location.pathname !== '/doctor-dashboard/subscription') {
                            window.history.pushState(
                                { requiredFeature, message: data.message },
                                '',
                                '/doctor-dashboard'
                            );
                            props.onTabChange?.('subscription');
                        }
                        return;
                    }

                    console.log(`Access granted to feature: ${requiredFeature}`);
                    setHasAccess(true);
                } catch (error) {
                    console.error('Error checking subscription access:', error);
                    navigate('/doctor-dashboard/subscription');
                } finally {
                    setLoading(false);
                }
            };

            checkAccess();
        }, [navigate, props.onTabChange, requiredFeature]);

        if (loading) {
            return <div className="loading">Checking access...</div>;
        }

        if (!hasAccess) {
            return null; // Component will unmount as navigation occurs
        }

        return <WrappedComponent {...props} />;
    };
};

export default withSubscriptionCheck;

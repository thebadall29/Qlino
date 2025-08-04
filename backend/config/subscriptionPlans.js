const subscriptionPlans = {
    trial: {
        name: 'Trial',
        duration: 30, // days
        price: 0,
        features: {
            appointments: true,
            patientManagement: true,
            chat: true,
            photos: false,
            analytics: false,
            priority: false
        },
        description: '30-day free trial with access to essential features'
    },
    monthly: {
        name: 'Basic',
        duration: 30,
        price: 999, // ₹999 per month
        features: {
            appointments: true,
            patientManagement: true,
            chat: true,
            photos: false,
            analytics: false,
            priority: false
        },
        description: 'Full access to essential features with monthly billing'
    },
    semi_annual: {
        name: 'Professional',
        duration: 180,
        price: 4999, // ₹4,999 for 6 months
        features: {
            appointments: true,
            patientManagement: true,
            chat: true,
            photos: true,
            analytics: false,
            priority: false
        },
        description: 'Enhanced features with 6-month billing (Save 16%)'
    },
    annual: {
        name: 'Premium',
        duration: 365,
        price: 8999, // ₹8,999 per year
        features: {
            appointments: true,
            patientManagement: true,
            chat: true,
            photos: true,
            analytics: true,
            priority: true
        },
        description: 'Full access to all premium features with annual billing (Save 25%)'
    }
};

module.exports = {
    subscriptionPlans,
    // Helper function to calculate end date based on plan
    calculateEndDate: (planType) => {
        const plan = subscriptionPlans[planType];
        if (!plan) throw new Error('Invalid plan type');
        
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.duration);
        return endDate;
    },
    // Helper function to check if feature is available in plan
    isFeatureAvailable: (planType, feature) => {
        const plan = subscriptionPlans[planType];
        if (!plan) return false;
        return plan.features[feature] === true;
    }
};

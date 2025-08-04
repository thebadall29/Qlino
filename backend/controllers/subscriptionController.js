const Subscription = require('../models/Subscription');
const { subscriptionPlans, calculateEndDate } = require('../config/subscriptionPlans');
const Doctor = require('../models/Doctor');

// Check feature access
exports.checkFeature = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const { feature } = req.params;

        console.log('Checking feature access:', { doctorId, feature });

        const subscription = await Subscription.findOne({
            doctorId,
            status: 'active',
            endDate: { $gte: new Date() }
        });

        console.log('Found subscription:', subscription);

        if (!subscription) {
            return res.json({
                hasAccess: false,
                message: 'No active subscription. Please subscribe to access this feature.'
            });
        }

        // Check if subscription has all features or specific feature
        const hasAccess = subscription.features.all || subscription.features[feature];

        console.log('Access check result:', { hasAccess, features: subscription.features });

        res.json({
            hasAccess,
            message: hasAccess ? 'Access granted' : 'This feature requires a higher subscription level'
        });
    } catch (error) {
        console.error('Error checking feature access:', error);
        res.status(500).json({
            hasAccess: false,
            message: 'Error checking feature access'
        });
    }
};

exports.getSubscriptionStatus = async (req, res) => {
    try {
        const doctorId = req.user.id;
        
        const subscription = await Subscription.findOne({
            doctorId,
            status: 'active',
            endDate: { $gte: new Date() }
        });

        if (!subscription) {
            // Check if eligible for trial
            const existingSubscriptions = await Subscription.find({ doctorId });
            if (existingSubscriptions.length === 0) {
                return res.json({
                    success: true,
                    status: 'eligible_for_trial',
                    message: 'Eligible for 30-day trial'
                });
            }

            return res.json({
                success: true,
                status: 'inactive',
                message: 'No active subscription'
            });
        }

        // Calculate remaining days
        const remainingDays = Math.ceil((subscription.endDate - new Date()) / (1000 * 60 * 60 * 24));

        return res.json({
            success: true,
            status: 'active',
            subscription: {
                plan: subscription.plan,
                endDate: subscription.endDate,
                remainingDays,
                features: subscription.features
            }
        });
    } catch (error) {
        console.error('Error getting subscription status:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription status'
        });
    }
};

exports.getSubscriptionPlans = async (req, res) => {
    try {
        res.json({
            success: true,
            plans: subscriptionPlans
        });
    } catch (error) {
        console.error('Error getting subscription plans:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching subscription plans'
        });
    }
};

exports.subscribeToPlan = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const { plan } = req.body;

        console.log('Creating subscription for:', { doctorId, plan });

        // Validate plan
        if (!subscriptionPlans[plan]) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subscription plan'
            });
        }

        // Cancel any existing active subscriptions
        await Subscription.updateMany(
            { 
                doctorId, 
                status: 'active' 
            },
            { status: 'cancelled' }
        );

        // Create new subscription
        const subscription = new Subscription({
            doctorId,
            plan,
            status: 'active',
            startDate: new Date(),
            endDate: calculateEndDate(plan),
            amount: subscriptionPlans[plan].price,
            features: subscriptionPlans[plan].features
        });

        console.log('Saving subscription:', subscription);

        await subscription.save();

        // Update doctor's subscription status
        await Doctor.findByIdAndUpdate(doctorId, {
            subscriptionStatus: 'active',
            currentPlan: plan
        });

        res.json({
            success: true,
            message: 'Subscription activated successfully',
            subscription: {
                plan: subscription.plan,
                endDate: subscription.endDate,
                features: subscription.features,
                status: 'active'
            }
        });
    } catch (error) {
        console.error('Error creating subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Error activating subscription'
        });
    }
};

exports.startTrial = async (req, res) => {
    try {
        const doctorId = req.user.id;

        console.log('Starting trial for doctor:', doctorId);

        // Check if already had a trial
        const existingSubscriptions = await Subscription.find({ doctorId });
        if (existingSubscriptions.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Trial period already used'
            });
        }

        // Create trial subscription
        const trial = new Subscription({
            doctorId,
            plan: 'trial',
            status: 'active',
            startDate: new Date(),
            endDate: calculateEndDate('trial'),
            amount: 0,
            features: subscriptionPlans.trial.features
        });

        console.log('Saving trial subscription:', trial);

        await trial.save();

        // Update doctor's subscription status
        await Doctor.findByIdAndUpdate(doctorId, {
            subscriptionStatus: 'active',
            currentPlan: 'trial'
        });

        res.json({
            success: true,
            message: 'Trial period started successfully',
            subscription: {
                plan: trial.plan,
                endDate: trial.endDate,
                features: trial.features,
                status: 'active'
            }
        });
    } catch (error) {
        console.error('Error starting trial:', error);
        res.status(500).json({
            success: false,
            message: 'Error starting trial period'
        });
    }
};

exports.checkFeatureAccess = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const { feature } = req.params;

        const subscription = await Subscription.findOne({
            doctorId,
            status: 'active',
            endDate: { $gte: new Date() }
        });
        
        if (!subscription) {
            return res.json({
                hasAccess: false,
                message: 'No active subscription. Please subscribe to access this feature.'
            });
        }

        const hasAccess = subscription.features[feature];
        
        res.json({
            hasAccess,
            message: hasAccess ? 'Access granted' : 'This feature requires a higher subscription level'
        });
    } catch (error) {
        console.error('Error checking feature access:', error);
        res.status(500).json({ 
            hasAccess: false, 
            message: 'Error checking feature access' 
        });
    }
};

exports.subscribeToPlan = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const { plan } = req.body;

        if (!subscriptionPlans[plan]) {
            return res.status(400).json({
                success: false,
                message: 'Invalid subscription plan'
            });
        }

        // Create new subscription
        const subscription = new Subscription({
            doctorId,
            plan,
            status: 'active',
            startDate: new Date(),
            endDate: calculateEndDate(plan),
            amount: subscriptionPlans[plan].price,
            features: subscriptionPlans[plan].features
        });

        await subscription.save();

        // Cancel any existing active subscription
        await Subscription.updateMany(
            { 
                doctorId, 
                status: 'active',
                _id: { $ne: subscription._id }
            },
            { status: 'cancelled' }
        );

        res.json({
            success: true,
            message: 'Subscription activated successfully',
            subscription
        });
    } catch (error) {
        console.error('Error subscribing to plan:', error);
        res.status(500).json({
            success: false,
            message: 'Error activating subscription'
        });
    }
};

exports.cancelSubscription = async (req, res) => {
    try {
        const doctorId = req.user.id;
        
        const subscription = await Subscription.findOne({
            doctorId,
            status: 'active',
            endDate: { $gte: new Date() }
        });
        
        if (!subscription) {
            return res.status(404).json({
                success: false,
                message: 'No active subscription found'
            });
        }

        subscription.status = 'cancelled';
        await subscription.save();

        res.json({
            success: true,
            message: 'Subscription cancelled successfully'
        });
    } catch (error) {
        console.error('Error cancelling subscription:', error);
        res.status(500).json({
            success: false,
            message: 'Error cancelling subscription'
        });
    }
};
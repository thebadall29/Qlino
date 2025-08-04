const Subscription = require('../models/Subscription');
const { isFeatureAvailable } = require('../config/subscriptionPlans');

const checkSubscription = (requiredFeature) => async (req, res, next) => {
    const featureToAccessMap = {
        'appointments': ['appointments'],
        'patients': ['patientManagement'],
        'chat': ['chat'],
        'photos': ['photos'],
        'todaysBookings': ['appointments'],
        'analytics': ['analytics']
    };

    const requiredFeatures = featureToAccessMap[requiredFeature] || [requiredFeature];
    try {
        const doctorId = req.user.id;

        // Find active subscription
        const subscription = await Subscription.findOne({
            doctorId,
            status: 'active',
            endDate: { $gte: new Date() }
        });

        // If no subscription exists, check if eligible for trial
        if (!subscription) {
            const existingSubscriptions = await Subscription.find({ doctorId });
            
            if (existingSubscriptions.length === 0) {
                // Create trial subscription for new doctors
                const trial = new Subscription({
                    doctorId,
                    plan: 'trial',
                    status: 'active',
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                    amount: 0,
                    features: ['appointments', 'patient_management', 'chat', 'photo_upload']
                });
                await trial.save();
                req.subscription = trial;
                return next();
            }

            return res.status(403).json({
                success: false,
                message: 'Active subscription required',
                requiresSubscription: true
            });
        }

        // Check if the required feature is available in the current plan
        if (requiredFeature && !isFeatureAvailable(subscription.plan, requiredFeature)) {
            return res.status(403).json({
                success: false,
                message: 'This feature is not available in your current plan',
                requiresUpgrade: true,
                currentPlan: subscription.plan
            });
        }

        req.subscription = subscription;
        next();
    } catch (error) {
        console.error('Subscription check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking subscription status'
        });
    }
};

module.exports = checkSubscription;

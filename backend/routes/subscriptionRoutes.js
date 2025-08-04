const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const subscriptionController = require('../controllers/subscriptionController');

// Get subscription status
router.get('/status', auth, subscriptionController.getSubscriptionStatus);

// Get available subscription plans
router.get('/plans', subscriptionController.getSubscriptionPlans);

// Check feature access
router.get('/check-feature/:feature', auth, subscriptionController.checkFeature);

// Start trial period
router.post('/trial', auth, subscriptionController.startTrial);

// Subscribe to plan
router.post('/subscribe', auth, subscriptionController.subscribeToPlan);

// Cancel subscription
router.post('/cancel', auth, subscriptionController.cancelSubscription);

module.exports = router;

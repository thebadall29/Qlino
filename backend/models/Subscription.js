const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    doctorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    plan: {
        type: String,
        enum: ['trial', 'monthly', 'semi_annual', 'annual'],
        default: 'trial'
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'cancelled'],
        default: 'active'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    amount: {
        type: Number,
        required: true
    },
    features: {
        all: {
            type: Boolean,
            default: false
        },
        appointments: {
            type: Boolean,
            default: true
        },
        patientManagement: {
            type: Boolean,
            default: true
        },
        chat: {
            type: Boolean,
            default: true
        },
        photos: {
            type: Boolean,
            default: false
        },
        analytics: {
            type: Boolean,
            default: false
        },
        priority: {
            type: Boolean,
            default: false
        }
    },
    paymentId: String,
    transactionId: String
});

// Add index for quick lookups
subscriptionSchema.index({ doctorId: 1, status: 1 });

// Add method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
    return this.status === 'active' && new Date() <= this.endDate;
};

// Add method to check if in trial period
subscriptionSchema.methods.isInTrial = function() {
    return this.plan === 'trial' && this.isActive();
};

// Method to check if subscription has access to a feature
subscriptionSchema.methods.hasFeatureAccess = function(feature) {
    return this.features.all === true || this.features[feature] === true;
};

// Static method to get active subscription
subscriptionSchema.statics.getActiveSubscription = function(doctorId) {
    return this.findOne({
        doctorId,
        status: 'active',
        endDate: { $gte: new Date() }
    });
};

// Add virtual property for remaining days
subscriptionSchema.virtual('remainingDays').get(function() {
    return Math.ceil((this.endDate - new Date()) / (1000 * 60 * 60 * 24));
});

// Include virtuals when converting to JSON
subscriptionSchema.set('toJSON', {
    virtuals: true,
    transform: function(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
    }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);

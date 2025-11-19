const User = require('../model/user');
const { RedemptionHistory } = require('../model/redemption');
const { Survey } = require('../model/survey');
const Payment = require('../model/payment');
const mongoose = require('mongoose');

// Get all users data
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build search query
    const searchQuery = {};
    if (search) {
      searchQuery.$or = [
        { fullname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { id: { $regex: search, $options: 'i' } },
        { instituition: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get total count
    const totalUsers = await User.countDocuments(searchQuery);
    
    // Get users with pagination and sorting
    const users = await User.find(searchQuery)
      .select('-password') // Exclude password field
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / parseInt(limit)),
          totalUsers,
          limit: parseInt(limit),
          hasNext: parseInt(page) < Math.ceil(totalUsers / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({
      status: "failure",
      code: 500,
      msg: "Internal server error"
    });
  }
};

// Get all redemption histories with filters
const getAllRedemptions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      status = '', 
      type = '', 
      network = '',
      userId = '',
      startDate = '',
      endDate = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter query
    const filterQuery = {};
    
    if (status && ['pending', 'successful', 'failed'].includes(status)) {
      filterQuery.status = status;
    }
    
    if (type && ['airtime', 'data'].includes(type)) {
      filterQuery.type = type;
    }
    
    if (network) {
      filterQuery.network = { $regex: network, $options: 'i' };
    }
    
    if (userId) {
      filterQuery.userId = userId;
    }
    
    // Date range filter
    if (startDate || endDate) {
      filterQuery.createdAt = {};
      if (startDate) {
        filterQuery.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filterQuery.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Get total count
    const totalRedemptions = await RedemptionHistory.countDocuments(filterQuery);
    
    // Get redemptions with pagination and sorting
    const redemptions = await RedemptionHistory.find(filterQuery)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: 'userId',
        select: 'fullname email id',
        model: 'User',
        localField: 'userId',
        foreignField: 'id'
      });
    
    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        redemptions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalRedemptions / parseInt(limit)),
          totalRedemptions,
          limit: parseInt(limit),
          hasNext: parseInt(page) < Math.ceil(totalRedemptions / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        },
        filters: {
          status,
          type,
          network,
          userId,
          startDate,
          endDate
        }
      }
    });
  } catch (error) {
    console.error('Error fetching redemption history:', error);
    res.status(500).json({
      status: "failure",
      code: 500,
      msg: "Internal server error"
    });
  }
};

// Get redemption statistics/counts
const getRedemptionStats = async (req, res) => {
  try {
    const { startDate = '', endDate = '', userId = '' } = req.query;
    
    // Build base filter query
    const baseFilter = {};
    
    if (userId) {
      baseFilter.userId = userId;
    }
    
    // Date range filter
    if (startDate || endDate) {
      baseFilter.createdAt = {};
      if (startDate) {
        baseFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        baseFilter.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Get counts for each status
    const [totalRedemptions, successfulCount, pendingCount, failedCount] = await Promise.all([
      RedemptionHistory.countDocuments(baseFilter),
      RedemptionHistory.countDocuments({ ...baseFilter, status: 'successful' }),
      RedemptionHistory.countDocuments({ ...baseFilter, status: 'pending' }),
      RedemptionHistory.countDocuments({ ...baseFilter, status: 'failed' })
    ]);
    
    // Get additional statistics
    const stats = await RedemptionHistory.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: null,
          totalPointsRedeemed: { $sum: '$pointsRedeemed' },
          totalValueRedeemed: { $sum: '$valueReceived' },
          avgPointsPerRedemption: { $avg: '$pointsRedeemed' },
          avgValuePerRedemption: { $avg: '$valueReceived' }
        }
      }
    ]);
    
    // Get breakdown by type
    const typeBreakdown = await RedemptionHistory.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalPoints: { $sum: '$pointsRedeemed' },
          totalValue: { $sum: '$valueReceived' }
        }
      }
    ]);
    
    // Get breakdown by network
    const networkBreakdown = await RedemptionHistory.aggregate([
      { $match: baseFilter },
      {
        $group: {
          _id: '$network',
          count: { $sum: 1 },
          totalPoints: { $sum: '$pointsRedeemed' },
          totalValue: { $sum: '$valueReceived' }
        }
      }
    ]);
    
    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        statusCounts: {
          total: totalRedemptions,
          successful: successfulCount,
          pending: pendingCount,
          failed: failedCount
        },
        overallStats: stats[0] || {
          totalPointsRedeemed: 0,
          totalValueRedeemed: 0,
          avgPointsPerRedemption: 0,
          avgValuePerRedemption: 0
        },
        typeBreakdown,
        networkBreakdown,
        filters: {
          userId,
          startDate,
          endDate
        }
      }
    });
  } catch (error) {
    console.error('Error fetching redemption stats:', error);
    res.status(500).json({
      status: "failure",
      code: 500,
      msg: "Internal server error"
    });
  }
};

// Get specific user's redemption history
const getUserRedemptionHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      page = 1, 
      limit = 50, 
      status = '', 
      type = '', 
      startDate = '',
      endDate = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Check if user exists
    const user = await User.findOne({ id: userId }).select('fullname email id pointBalance');
    if (!user) {
      return res.status(404).json({
        status: "failure",
        code: 404,
        msg: "User not found"
      });
    }
    
    // Build filter query
    const filterQuery = { userId };
    
    if (status && ['pending', 'successful', 'failed'].includes(status)) {
      filterQuery.status = status;
    }
    
    if (type && ['airtime', 'data'].includes(type)) {
      filterQuery.type = type;
    }
    
    // Date range filter
    if (startDate || endDate) {
      filterQuery.createdAt = {};
      if (startDate) {
        filterQuery.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filterQuery.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Get total count for this user
    const totalRedemptions = await RedemptionHistory.countDocuments(filterQuery);
    
    // Get user's redemptions with pagination and sorting
    const redemptions = await RedemptionHistory.find(filterQuery)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get user-specific stats
    const userStats = await RedemptionHistory.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalRedemptions: { $sum: 1 },
          totalPointsRedeemed: { $sum: '$pointsRedeemed' },
          totalValueRedeemed: { $sum: '$valueReceived' },
          successfulRedemptions: { 
            $sum: { $cond: [{ $eq: ['$status', 'successful'] }, 1, 0] }
          },
          pendingRedemptions: { 
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          failedRedemptions: { 
            $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
          }
        }
      }
    ]);
    
    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        user,
        redemptions,
        userStats: userStats[0] || {
          totalRedemptions: 0,
          totalPointsRedeemed: 0,
          totalValueRedeemed: 0,
          successfulRedemptions: 0,
          pendingRedemptions: 0,
          failedRedemptions: 0
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalRedemptions / parseInt(limit)),
          totalRedemptions,
          limit: parseInt(limit),
          hasNext: parseInt(page) < Math.ceil(totalRedemptions / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        },
        filters: {
          status,
          type,
          startDate,
          endDate
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user redemption history:', error);
    res.status(500).json({
      status: "failure",
      code: 500,
      msg: "Internal server error"
    });
  }
};

// Make user admin
const makeUserAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const { adminStatus } = req.body;

    // Validate adminStatus
    if (typeof adminStatus !== 'boolean') {
      return res.status(400).json({
        status: "failure",
        code: 400,
        msg: "adminStatus must be a boolean value"
      });
    }

    // Find and update user
    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({
        status: "failure",
        code: 404,
        msg: "User not found"
      });
    }

    user.admin = adminStatus;
    await user.save();

    res.status(200).json({
      status: "success",
      code: 200,
      msg: `User ${adminStatus ? 'granted' : 'revoked'} admin privileges successfully`,
      data: {
        userId: user.id,
        fullname: user.fullname,
        email: user.email,
        admin: user.admin
      }
    });
  } catch (error) {
    console.error('Error updating user admin status:', error);
    res.status(500).json({
      status: "failure",
      code: 500,
      msg: "Internal server error"
    });
  }
};

// Mark survey as paid
const markSurveyAsPaid = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { email } = req.body;

    // Validate required fields
    if (!email) {
      return res.status(400).json({
        status: "failure",
        code: 400,
        msg: "Email is required"
      });
    }

    // Find the survey
    const survey = await Survey.findById(surveyId).populate('user_id');
    if (!survey) {
      return res.status(404).json({
        status: "failure",
        code: 404,
        msg: "Survey not found"
      });
    }

    // Calculate the correct amount using base rate calculation
    const BASE_RATE = 3000;
    const QUESTION_RATE = 10;
    const PARTICIPANT_RATE = 20;

    const numQuestions = survey.questions.length;
    const numParticipants = survey.no_of_participants;
    
    const calculatedAmount = BASE_RATE + 
        (QUESTION_RATE * numQuestions) + 
        (PARTICIPANT_RATE * numParticipants);

    // Generate reference number
    const referenceNumber = `ADMIN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create payment record
    const payment = new Payment({
      userId: survey.user_id.id,
      referenceNumber: referenceNumber,
      amount: calculatedAmount,
      surveyId: surveyId,
      datePaid: new Date(),
      email: email,
      status: 'paid'
    });

    await payment.save();

    // Update survey payment status and calculated values
    survey.isPaid = true;
    survey.paymentAmount = calculatedAmount;
    survey.paymentDate = new Date();
    survey.amount_to_be_paid = calculatedAmount;
    
    // Calculate points per user
    const points_per_user = Math.ceil((QUESTION_RATE * numQuestions + PARTICIPANT_RATE * numParticipants) / numParticipants);
    survey.point_per_user = points_per_user;
    
    await survey.save();

    res.status(200).json({
      status: "success",
      code: 200,
      msg: "Survey marked as paid successfully",
      data: {
        surveyId: survey._id,
        surveyTitle: survey.title,
        amount: calculatedAmount,
        calculationBreakdown: {
          baseRate: BASE_RATE,
          questionsCost: QUESTION_RATE * numQuestions,
          participantsCost: PARTICIPANT_RATE * numParticipants,
          totalQuestions: numQuestions,
          totalParticipants: numParticipants,
          pointsPerUser: points_per_user
        },
        referenceNumber: referenceNumber,
        paymentDate: payment.datePaid,
        userEmail: email
      }
    });
  } catch (error) {
    console.error('Error marking survey as paid:', error);
    res.status(500).json({
      status: "failure",
      code: 500,
      msg: "Internal server error"
    });
  }
};

// Get all surveys with filters for admin
const getAllSurveysAdmin = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      userId = '',
      published = '',
      paid = '',
      startDate = '',
      endDate = '',
      minPoints = '',
      maxPoints = '',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build filter query
    const filterQuery = {};
    
    // Filter by user ID
    if (userId) {
      const user = await User.findOne({ id: userId });
      if (user) {
        filterQuery.user_id = user._id;
      }
    }
    
    // Filter by published status
    if (published !== '') {
      filterQuery.published = published === 'true';
    }
    
    // Date range filter
    if (startDate || endDate) {
      filterQuery.createdAt = {};
      if (startDate) {
        filterQuery.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filterQuery.createdAt.$lte = new Date(endDate);
      }
    }
    
    // Points range filter
    if (minPoints || maxPoints) {
      filterQuery.points = {};
      if (minPoints) {
        filterQuery.points.$gte = parseInt(minPoints);
      }
      if (maxPoints) {
        filterQuery.points.$lte = parseInt(maxPoints);
      }
    }
    
    // Search filter
    if (search) {
      filterQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get surveys without payment filter first
    let surveys = await Survey.find(filterQuery)
      .populate({
        path: 'user_id',
        select: 'fullname email id pointBalance'
      })
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 });
    
    // Get payment information for each survey and apply payment filter
    const surveysWithPayments = await Promise.all(
      surveys.map(async (survey) => {
        const payment = await Payment.findOne({ 
          surveyId: survey._id, 
          status: 'paid' 
        }).sort({ datePaid: -1 });
        
        const surveyObj = survey.toObject();
        
        // Calculate participant counts
        const filledCount = surveyObj.questions.reduce((count, question) => {
          return Math.max(count, question.answers ? question.answers.length : 0);
        }, 0);
        
        const remainingSpots = Math.max(0, surveyObj.no_of_participants - filledCount);
        
        return {
          ...surveyObj,
          filledCount,
          remainingSpots,
          isPaid: !!payment, // Set isPaid based on payment existence
          payment: payment ? {
            amount: payment.amount,
            datePaid: payment.datePaid,
            referenceNumber: payment.referenceNumber
          } : null
        };
      })
    );
    
    // Filter by payment status if specified
    let filteredSurveys = surveysWithPayments;
    if (paid !== '') {
      const isPaidFilter = paid === 'true';
      filteredSurveys = surveysWithPayments.filter(survey => survey.isPaid === isPaidFilter);
    }
    
    // Apply pagination to filtered results
    const totalSurveys = filteredSurveys.length;
    const paginatedSurveys = filteredSurveys.slice(skip, skip + parseInt(limit));
    
    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        surveys: paginatedSurveys,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalSurveys / parseInt(limit)),
          totalSurveys,
          limit: parseInt(limit),
          hasNext: parseInt(page) < Math.ceil(totalSurveys / parseInt(limit)),
          hasPrev: parseInt(page) > 1
        },
        filters: {
          userId,
          published,
          paid,
          startDate,
          endDate,
          minPoints,
          maxPoints,
          search
        }
      }
    });
  } catch (error) {
    console.error('Error fetching all surveys for admin:', error);
    res.status(500).json({
      status: "failure",
      code: 500,
      msg: "Internal server error"
    });
  }
};

// Unpublish survey
const unpublishSurvey = async (req, res) => {
  try {
    const { surveyId } = req.params;
    const { reason } = req.body;

    // Find the survey
    const survey = await Survey.findById(surveyId).populate('user_id');
    if (!survey) {
      return res.status(404).json({
        status: "failure",
        code: 404,
        msg: "Survey not found"
      });
    }

    // Check if survey is already unpublished
    if (!survey.published) {
      return res.status(400).json({
        status: "failure",
        code: 400,
        msg: "Survey is already unpublished"
      });
    }

    // Unpublish the survey
    survey.published = false;
    survey.unpublishedAt = new Date();
    survey.unpublishedBy = 'admin';
    survey.unpublishReason = reason || 'Unpublished by admin';
    
    await survey.save();

    res.status(200).json({
      status: "success",
      code: 200,
      msg: "Survey unpublished successfully",
      data: {
        surveyId: survey._id,
        title: survey.title,
        published: survey.published,
        unpublishedAt: survey.unpublishedAt,
        unpublishReason: survey.unpublishReason,
        owner: {
          id: survey.user_id.id,
          fullname: survey.user_id.fullname,
          email: survey.user_id.email
        }
      }
    });
  } catch (error) {
    console.error('Error unpublishing survey:', error);
    res.status(500).json({
      status: "failure",
      code: 500,
      msg: "Internal server error"
    });
  }
};

module.exports = {
  getAllUsers,
  getAllRedemptions,
  getRedemptionStats,
  getUserRedemptionHistory,
  makeUserAdmin,
  markSurveyAsPaid,
  getAllSurveysAdmin,
  unpublishSurvey
}; 
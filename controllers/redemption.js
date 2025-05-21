const User = require('../model/user');
const { RedemptionHistory } = require('../model/redemption');
const { StatusCodes } = require('http-status-codes');
const axios = require('axios');
const { generateID_users } = require('../middleware/helper');
const FormData = require('form-data');
const mongoose = require('mongoose');

/**
 * Get available data plans
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDataPlansHandler = async (req, res) => {
  try {
    // Fetch data plans from the API
    const response = await getDataPlans();
    
    // Return the transformed data plans
    return res.status(200).json({
      success: true,
      message: "Data plans fetched successfully",
      data: response
    });
  } catch (error) {
    console.error('Error fetching data plans:', error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch data plans",
      error: error.message
    });
  }
};

/**
 * Fetch and transform data plans from the API
 * @returns {Array} - Transformed data plans in the format expected by the frontend
 */
const getDataPlans = async () => {
  try {
    // Fetch data plans from the API
    const apiUrl = process.env.DATA_PLANS_API_URL || 'https://api.cardri.ng/api/v1/data/plans';
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Bearer ${process.env.CARDRI_API_KEY}`
      }
    });
    
    // Check if response is valid
    if (!response.data || !response.data) {
      throw new Error('Invalid response from data plans API');
    }
    
    const newPlans = response.data;
    const transformedPlans = [];
    
    // Process MTN plans
    if (newPlans.mtn && Array.isArray(newPlans.mtn)) {
      newPlans.mtn.forEach(plan => {
        transformedPlans.push({
          ...plan,
          network: "1", // MTN network identifier
          networkName: 'MTN'
        });
      });
    }
    
    // Process GLO plans
    if (newPlans.glo && Array.isArray(newPlans.glo)) {
      newPlans.glo.forEach(plan => {
        transformedPlans.push({
          ...plan,
          network: "4", // GLO network identifier
          networkName: 'GLO'
        });
      });
    }
    
    // Process Airtel plans
    if (newPlans.airtel && Array.isArray(newPlans.airtel)) {
      newPlans.airtel.forEach(plan => {
        transformedPlans.push({
          ...plan,
          network: "2", // Airtel network identifier
          networkName: 'Airtel'
        });
      });
    }
    
    // Process 9mobile plans
    if (newPlans['9mobile'] && Array.isArray(newPlans['9mobile'])) {
      newPlans['9mobile'].forEach(plan => {
        transformedPlans.push({
          ...plan,
          network: "3", // 9mobile network identifier
          networkName: '9mobile'
        });
      });
    }
    
    return transformedPlans;
  } catch (error) {
    console.error('Error in getDataPlans function:', error);
    throw error;
  }
};

// Redeem points for airtime
const redeemAirtime = async (req, res) => {
  try {
    // Get session from the request object and start transaction
    const session = req.dbSession;
    await req.startTransaction();
    
    const { amount, network, phoneNumber } = req.body;
    const userId = req.userId;

    // Validate request
    if (!amount || !network || !phoneNumber) {
      await req.abortTransaction();
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Please provide amount, network, and phone number"
      });
    }

    // Minimum amount validation
    if (amount < 50) {
      await req.abortTransaction();
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Minimum airtime amount is ₦50"
      });
    }

    // Find user within transaction
    const user = await User.findOne({ id: userId }).session(session);
    if (!user) {
      await req.abortTransaction();
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found"
      });
    }

    // Direct conversion - 1 point = 1 naira
    const pointsRequired = Number(amount);

    // Check if user has enough points
    if (user.pointBalance < pointsRequired) {
      await req.abortTransaction();
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Insufficient points balance"
      });
    }

    // Generate transaction reference
    const transactionRef = `AIR${generateID_users(12)}`;

    // Create redemption record within transaction
    const redemption = await RedemptionHistory.create(
      [{
        userId,
        type: "airtime",
        network,
        phoneNumber,
        pointsRedeemed: pointsRequired,
        valueReceived: amount,
        status: "pending",
        transactionReference: transactionRef
      }],
      { session }
    );

    // Deduct points from user within transaction
    user.pointBalance -= pointsRequired;
    await user.save({ session });

    // Make API call to purchase airtime
    try {
      const formData = new FormData();
      formData.append('amount', amount);
      formData.append('network', network);
      formData.append('phoneNumber', phoneNumber);
      formData.append('reference', transactionRef);

      const airtimeUrl = process.env.AIRTIME_API_URL || 'https://api.cardri.ng/api/v1/merchant/airtime/';
      const airtimeResponse = await axios.post(
        airtimeUrl, 
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${process.env.CARDRI_API_KEY}`
          }
        }
      );

      // Check API response
      if (airtimeResponse.data && airtimeResponse.status == 200 && airtimeResponse.data.status != false) {
        // Update redemption status to successful within transaction
        await RedemptionHistory.findByIdAndUpdate(
          redemption[0]._id,
          { status: "successful" },
          { session }
        );

        // Commit the transaction
        await req.commitTransaction();

        return res.status(StatusCodes.OK).json({
          success: true,
          message: "Airtime purchase successful",
          data: {
            phoneNumber,
            amount,
            pointsRedeemed: pointsRequired,
            transactionReference: transactionRef
          }
        });
      } else {
        // If API call failed, abort transaction (this automatically rolls back changes)
        await req.abortTransaction();

        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Airtime purchase failed",
          error: airtimeResponse.data || "Unknown error"
        });
      }
    } catch (apiError) {
      // If API call throws an error, abort transaction
      await req.abortTransaction();

      console.error("API Error:", apiError);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to process airtime purchase",
        error: apiError.message
      });
    }
  } catch (error) {
    // If any error occurs, transaction will be aborted by middleware
    console.error("Error redeeming airtime:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to redeem airtime",
      error: error.message
    });
  }
};

// Redeem points for data
const redeemData = async (req, res) => {
  try {
    // Get session from the request object and start transaction
    const session = req.dbSession;
    await req.startTransaction();
    
    const { planId, network, phoneNumber } = req.body;
    const userId = req.userId;

    // Validate request
    if (!planId || !network || !phoneNumber) {
      await req.abortTransaction();
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Please provide planId, network, and phone number"
      });
    }

    // Find user within transaction
    const user = await User.findOne({ id: userId }).session(session);
    if (!user) {
      await req.abortTransaction();
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "User not found"
      });
    }

    // Fetch current plans from API to get the price
    let plans;
    try {
      plans = await getDataPlans();
    } catch (error) {
      await req.abortTransaction();
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Failed to fetch data plans",
        error: error.message
      });
    }

    // Find the selected plan
    const selectedPlan = plans.find(plan => plan.planid === planId && plan.network === network);
    
    if (!selectedPlan) {
      await req.abortTransaction();
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Data plan not found or not available for selected network"
      });
    }

    // Direct conversion - 1 point = 1 naira
    const pointsRequired = Number(selectedPlan.price);

    // Check if user has enough points
    if (user.pointBalance < pointsRequired) {
      await req.abortTransaction();
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Insufficient points balance"
      });
    }

    // Generate transaction reference
    const transactionRef = `DATA${generateID_users(12)}`;

    // Create redemption record within transaction
    const redemption = await RedemptionHistory.create(
      [{
        userId,
        type: "data",
        network,
        phoneNumber,
        pointsRedeemed: pointsRequired,
        valueReceived: Number(selectedPlan.price),
        planName: selectedPlan.name,
        planId: selectedPlan.planid,
        status: "pending",
        transactionReference: transactionRef
      }],
      { session }
    );

    // Deduct points from user within transaction
    user.pointBalance -= pointsRequired;
    await user.save({ session });

    // Make API call to purchase data
    try {
      const formData = new FormData();
      formData.append('plan', planId);
      formData.append('network', network);
      formData.append('phoneNumber', phoneNumber);
      formData.append('reference', transactionRef);

      const dataUrl = process.env.DATA_PURCHASE_API_URL || 'https://api.cardri.ng/api/v1/merchant/data';
      const dataResponse = await axios.post(
        dataUrl, 
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${process.env.CARDRI_API_KEY}`
          }
        }
      );

      // Check API response
      if (dataResponse.data && dataResponse.status == 200 && dataResponse.data.status != false) {
        // Update redemption status to successful within transaction
        await RedemptionHistory.findByIdAndUpdate(
          redemption[0]._id,
          { status: "successful" },
          { session }
        );

        // Commit the transaction
        await req.commitTransaction();

        return res.status(StatusCodes.OK).json({
          success: true,
          message: "Data purchase successful",
          data: {
            phoneNumber,
            planName: selectedPlan.name,
            planSize: selectedPlan.plan,
            pointsRedeemed: pointsRequired,
            transactionReference: transactionRef
          }
        });
      } else {
        // If API call failed, abort transaction
        await req.abortTransaction();

        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Data purchase failed",
          error: dataResponse.data || "Unknown error"
        });
      }
    } catch (apiError) {
      // If API call throws an error, abort transaction
      await req.abortTransaction();

      console.error("API Error:", apiError);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to process data purchase",
        error: apiError.message
      });
    }
  } catch (error) {
    // If any error occurs, transaction will be aborted by middleware
    console.error("Error redeeming data plan:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to redeem data plan",
      error: error.message
    });
  }
};

// Get user's redemption history
const getRedemptionHistory = async (req, res) => {
  try {
    const userId = req.userId;
    console.log(userId)
    
    const history = await RedemptionHistory.find({ userId })
      .sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error("Error fetching redemption history:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch redemption history"
    });
  }
};

module.exports = {
  getDataPlansHandler,
  redeemAirtime,
  redeemData,
  getRedemptionHistory
}; 
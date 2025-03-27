const User = require('../model/user');
const { RedemptionHistory } = require('../model/redemption');
const { StatusCodes } = require('http-status-codes');
const axios = require('axios');
const { generateID_users } = require('../middleware/helper');
const FormData = require('form-data');
const mongoose = require('mongoose');

// Get all available data plans from cardri.ng API
const getDataPlans = async (req, res) => {
  try {
    // Fetch data plans directly from cardri.ng
    const response = await axios.get('https://api.cardri.ng/api/data/v1/plans');
    
    // Check if response is valid
    if (!response.data || !response.data.plans) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Failed to fetch data plans"
      });
    }

    // Return the data plans directly to the frontend
    res.status(StatusCodes.OK).json({
      success: true,
      data: response.data.plans
    });
  } catch (error) {
    console.error("Error fetching data plans:", error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Failed to fetch data plans from provider"
    });
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
    if (amount < 100) {
      await req.abortTransaction();
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: "Minimum airtime amount is ₦100"
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
      formData.append('phonenumber', phoneNumber);
      formData.append('reference', transactionRef);

      const airtimeResponse = await axios.post(
        'https://api.cardri.ng/api/merchant/airtime/', 
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${process.env.CARDRI_API_KEY}`
          }
        }
      );

      // Check API response
      if (airtimeResponse.data && airtimeResponse.data.success) {
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
    try {
      const plansResponse = await axios.get('https://api.cardri.ng/api/data/v1/plans');
      
      if (!plansResponse.data || !plansResponse.data.plans) {
        await req.abortTransaction();
        return res.status(StatusCodes.BAD_REQUEST).json({
          success: false,
          message: "Failed to fetch data plans"
        });
      }

      // Find the selected plan
      const selectedPlan = plansResponse.data.plans.find(plan => plan.planid === planId && plan.network === network);
      
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
        formData.append('phonenumber', phoneNumber);
        formData.append('reference', transactionRef);

        const dataResponse = await axios.post(
          'https://api.cardri.ng/api/merchant/data', 
          formData,
          {
            headers: {
              ...formData.getHeaders(),
              'Authorization': `Bearer ${process.env.CARDRI_API_KEY}`
            }
          }
        );

        // Check API response
        if (dataResponse.data && dataResponse.data.success) {
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
    } catch (plansError) {
      await req.abortTransaction();
      
      console.error("Error fetching plans:", plansError);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch current data plans",
        error: plansError.message
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
  getDataPlans,
  redeemAirtime,
  redeemData,
  getRedemptionHistory
}; 
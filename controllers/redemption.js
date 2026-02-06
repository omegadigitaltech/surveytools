const User = require('../model/user');
const { RedemptionHistory } = require('../model/redemption');
const { StatusCodes } = require('http-status-codes');
const axios = require('axios');
const { generateID_users } = require('../middleware/helper');
const FormData = require('form-data');
const mongoose = require('mongoose');
const { disburseTelecom } = require('../utils/redemption');

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


/**
 * Unified redemption handler for airtime or data
 * @param {Object} params
 * @param {string} params.userId
 * @param {"airtime" | "data"} params.type
 * @param {number} [params.amount] - for airtime
 * @param {string} [params.planId] - for data
 * @param {string} params.network
 * @param {string} params.phoneNumber
 * @param {Object} params.session - mongoose session
 * @returns {Promise<{ success: boolean, message: string, data?: any, statusCode?: number }>}
 */
async function redeemTelecom({
  userId,
  type,
  amount,
  planId,
  network,
  phoneNumber,
  session,
}) {
  let redemption;

  try {
    const user = await User.findOne({ id: userId }).session(session);
    if (!user) {
      return { success: false, message: "User not found", statusCode: 404 };
    }

    let pointsRequired;
    let valueReceived;
    let planDetails = null;

    if (type === "airtime") {
      if (!amount || amount < 100) {
        return { success: false, message: "Minimum airtime is ₦100", statusCode: 400 };
      }
      pointsRequired = Number(amount);
      valueReceived = amount;
    } else if (type === "data") {
      if (!planId) {
        return { success: false, message: "planId required for data", statusCode: 400 };
      }

      // Fetch plans (keep your getDataPlans or make it cached)
      const plans = await getDataPlans(); // assume this returns array
      const selected = plans.find(p => p.planid === planId && p.network === network);
      if (!selected) {
        return { success: false, message: "Invalid data plan", statusCode: 404 };
      }

      pointsRequired = Number(selected.price);
      valueReceived = Number(selected.price);
      planDetails = {
        name: selected.name,
        size: selected.plan || selected.size,
        planId: selected.planid,
      };
    } else {
      return { success: false, message: "Invalid type", statusCode: 400 };
    }

    if (user.pointBalance < pointsRequired) {
      return { success: false, message: "Insufficient points", statusCode: 400 };
    }

    const transactionRef = `${type.toUpperCase().slice(0, 4)}${generateID_users(12)}`;

    // Create redemption record first (persists even if API fails)
    redemption = await RedemptionHistory.create([{
      userId,
      type,
      network,
      phoneNumber,
      pointsRedeemed: pointsRequired,
      valueReceived,
      status: "pending",
      transactionReference: transactionRef,
      ...(type === "data" ? {
        planName: planDetails.name,
        planId: planDetails.planId,
      } : {}),
    }], { session });

    const redemptionId = redemption[0]._id;

    // Deduct points
    user.pointBalance -= pointsRequired;
    await user.save({ session });

    // Attempt disbursement via flexible adapter
    const telecomResult = await disburseTelecom({
      phone: phoneNumber,
      type,
      amount: type === "airtime" ? amount : undefined,
      productCode: type === "data" ? planId : undefined,
      network,
      reference: transactionRef,
    });

    if (telecomResult.success) {
      // Success → update status
      await RedemptionHistory.findByIdAndUpdate(redemptionId, {
        status: "successful",
      }, { session });

      return {
        success: true,
        message: `${type === "airtime" ? "Airtime" : "Data"} redeemed successfully`,
        data: {
          phoneNumber,
          ...(type === "airtime" ? { amount } : {
            planName: planDetails.name,
            planSize: planDetails.size,
          }),
          pointsRedeemed: pointsRequired,
          transactionReference: transactionRef,
          provider: telecomResult.provider,
        },
      };
    } else {
      // Failure → mark failed (but transaction still commits partial state if you want rollback → keep abort logic)
      await RedemptionHistory.findByIdAndUpdate(redemptionId, {
        status: "failed",
        errorMessage: telecomResult.message,
        errorData: telecomResult.data,
      }, { session });

      return {
        success: false,
        message: "Provider failed to deliver service",
        error: telecomResult.message,
        statusCode: 502, // Bad Gateway - upstream failure
      };
    }
  } catch (err) {
    console.error(`[${type.toUpperCase()}] Redemption error:`, err);

    if (redemption?._id) {
      await RedemptionHistory.findByIdAndUpdate(redemption._id, {
        status: "failed",
        errorMessage: err.message,
        errorData: err.response?.data,
      }, { session }).catch(console.error);
    }

    return {
      success: false,
      message: `Failed to redeem ${type}`,
      error: err.message,
      statusCode: 500,
    };
  }
}

// Controller wrappers (keep separate routes if you want)
const redeemAirtime = async (req, res) => {
  await req.startTransaction();
  try {
    const result = await redeemTelecom({
      userId: req.userId,
      type: "airtime",
      amount: req.body.amount,
      network: req.body.network,
      phoneNumber: req.body.phoneNumber,
      session: req.dbSession,
    });

    if (result.success) {
      await req.commitTransaction();
      return res.status(200).json(result);
    } else {
      await req.abortTransaction();
      return res.status(result.statusCode || 400).json(result);
    }
  } catch (err) {
    await req.abortTransaction();
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

const redeemData = async (req, res) => {
  await req.startTransaction();
  try {
    const result = await redeemTelecom({
      userId: req.userId,
      type: "data",
      planId: req.body.planId,
      network: req.body.network,
      phoneNumber: req.body.phoneNumber,
      session: req.dbSession,
    });

    if (result.success) {
      await req.commitTransaction();
      return res.status(200).json(result);
    } else {
      await req.abortTransaction();
      return res.status(result.statusCode || 400).json(result);
    }
  } catch (err) {
    await req.abortTransaction();
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
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
const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');

/**
 * Middleware to handle database transactions
 * 
 * This middleware creates a MongoDB session and attaches it to the request object.
 * Controllers can then use this session for transaction operations.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const withTransaction = async (req, res, next) => {
  // Start a new session
  const session = await mongoose.startSession();
  
  // Attach session to request object
  req.dbSession = session;
  
  // Add utility methods to request object
  req.startTransaction = async () => {
    session.startTransaction();
  };
  
  req.commitTransaction = async () => {
    if (session.inTransaction()) {
      await session.commitTransaction();
    }
  };
  
  req.abortTransaction = async () => {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
  };

  // Add cleanup method to response object
  res.on('finish', async () => {
    // Clean up session when response is sent
    if (session) {
      if (session.inTransaction()) {
        try {
          await session.abortTransaction();
        } catch (error) {
          console.error('Error aborting transaction:', error);
        }
      }
      session.endSession();
    }
  });

  try {
    await next();
  } catch (error) {
    // If an error occurs, abort any active transaction
    if (session && session.inTransaction()) {
      try {
        await session.abortTransaction();
      } catch (abortError) {
        console.error('Error aborting transaction after error:', abortError);
      }
    }
    
    // End the session
    if (session) {
      session.endSession();
    }
    
    // Pass the error to the next error handler
    next(error);
  }
};

/**
 * Wrapper function to handle transactions within a controller
 * 
 * This function wraps controller logic in a transaction block,
 * automatically handling commits and rollbacks.
 * 
 * @param {Function} controllerFn - The controller function to wrap with transaction handling
 * @returns {Function} - A new function that handles the transaction
 */
const transactionHandler = (controllerFn) => {
  return async (req, res, next) => {
    const session = await mongoose.startSession();
    
    try {
      let result;
      await session.withTransaction(async () => {
        // Execute the controller function with session attached to req
        req.dbSession = session;
        result = await controllerFn(req, res, next);
        return result;
      });
      
      return result;
    } catch (error) {
      console.error('Transaction error:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Transaction failed',
        error: error.message
      });
    } finally {
      session.endSession();
    }
  };
};

module.exports = {
  withTransaction,
  transactionHandler
}; 
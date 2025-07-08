import Subscription from "../models/subscription.js";

export const addSubscription = async (newSubscriptionData) => {
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { email: newSubscriptionData.email },
      {
        $set: {
          frequency: newSubscriptionData.frequency,
          notificationTypes: newSubscriptionData.notificationTypes,
          portfolioSymbols: newSubscriptionData.portfolioSymbols,
          status: "active",
        },
        $setOnInsert: {
          subscribedAt: new Date(),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );
    return subscription;
  } catch (error) {
    console.error("Error adding/updating subscription in MongoDB:", error);
    throw error;
  }
};
export const getSubscriptions = async () => {
  try {
    return await Subscription.find({ status: "active" });
  } catch (error) {
    console.error("Error fetching subscriptions from MongoDB:", error);
    throw error;
  }
};
export const removeSubscription = async (email) => {
  try {
    const result = await Subscription.deleteOne({ email });
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error removing subscription from MongoDB:", error);
    throw error;
  }
};

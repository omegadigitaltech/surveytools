require('dotenv').config();
const mongoose = require('mongoose');
const { UserMissionProgress, Mission } = require('./model/gamification');
const User = require('./model/user');

async function revert() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('Finding Peter Parker...');
    const peter = await User.findOne({ 
      $or: [
        { fullname: /peter parker/i },
        { name: /peter parker/i },
        { email: /peter/i },
        { email: 'peter@omegadigitaltechnologies.com' }
      ]
    });

    const dummyMission = await Mission.findOne({ title: 'First Step' });
    if (dummyMission) {
      if (peter) {
        console.log(`Found Peter Parker: ${peter._id} (${peter.email || peter.fullname})`);
        // Delete all progress for this dummy mission EXCEPT for Peter Parker
        const result = await UserMissionProgress.deleteMany({ 
          missionId: dummyMission._id,
          userId: { $ne: peter._id }
        });
        console.log(`Reverted! Deleted ${result.deletedCount} dummy mission progress entries from other users.`);
      } else {
        console.log('Peter Parker not found! Deleting dummy mission progress for ALL users to be safe.');
        const result = await UserMissionProgress.deleteMany({ 
          missionId: dummyMission._id
        });
        console.log(`Deleted ${result.deletedCount} dummy mission progress entries.`);
      }
    } else {
      console.log('Dummy mission "First Step" not found.');
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

revert();

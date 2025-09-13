const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');



const memberSchema = new Schema({
 
  userName: {type: String,required: true, unique: true},
  score: { type: Number, default: 0 }
});

const teamSchema = new Schema({
  teamName: { type: String, unique: true, required: true },
  teamLeader: { type: String, required: true},
  teamLeaderMail: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  members: [memberSchema],
  totalScore: { type: Number, default: 0 },
  rank: { type: Number, default: null },    
  role: { type: String, enum: ["user"], default: "user", immutable: true }
});

teamSchema.pre('save', async function (next) { 
    const user = this;
    if (user.isModified('password') || user.isNew) {
       
        const hash = await bcrypt.hash(user.password, 10);
        user.password = hash;
    }
    next();})




module.exports = mongoose.model('Team', teamSchema);

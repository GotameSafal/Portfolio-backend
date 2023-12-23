import mongoose from "mongoose";
export const connectDb = async () => {
  try {
   const {connection} =  await mongoose.connect(process.env.MONGOB_URI);
   console.log(`successfully connected to database with host ${connection.host}`)
  } catch (error) {
    console.log(`can't connect to database`)
    console.log(error);
  }
};

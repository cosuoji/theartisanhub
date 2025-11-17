import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export const verifyBVN = async (req, res) => {
  const { bvn } = req.body;
  if (!bvn) return res.status(400).json({ message: "BVN is required" });

    
  console.log("AppId:", process.env.DOJAH_APP_ID);
  console.log("Public Key:", process.env.DOJAH_PUBLIC_KEY);

  try {
    const response = await axios.get(
      `https://api.dojah.io/api/v1/kyc/bvn/full?bvn=${bvn}`,
      {
        headers: {
          "AppId": process.env.DOJAH_APP_ID,
          "Authorization": process.env.DOJAH_PUBLIC_KEY, // 👈 public key here
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("BVN Verification Error:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      message: "BVN verification failed",
      error: error.response?.data || error.message,
    });
  }
};


export const verifyNIN = async (req, res) => {
  const { nin } = req.body;

  if (!nin) {
    return res.status(400).json({ message: 'NIN is required' });
  }



  try {
    const response = await axios.post(
      'https://sandbox.dojah.io/api/v1/kyc/nin/verify',
      { nin },
      {
      headers: {
            'Content-Type': 'application/json',
            'AppId': process.env.DOJAH_APP_ID, // your sandbox App ID
            'Authorization': `Bearer ${process.env.DOJAH_SECRET_KEY}`, // ✅ Use Bearer instead of AppId
            },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error('NIN Verification Error:', error.response?.data || error.message);
    res
      .status(error.response?.status || 500)
      .json({
        message: 'NIN verification failed',
        error: error.response?.data || error.message,
      });
  }
};

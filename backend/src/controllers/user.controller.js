import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ENV } from "../libs/env.js";
import { sendEmail } from "../libs/email.js";
import User from "../models/User.js";

const generateToken = (id) => {
    return jwt.sign({ id }, ENV.JWT_SECRET, {
        expiresIn: "7d"
    });
};

export async function getAllUsers(_, res) {
    try {
        const users = await User.find().sort({ createdAt: -1 });

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users: ", error);
        
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getUserById(req, res) {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fething user by ID: ", error);
        
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getPersonnelStats(_, res) {
    try {
        const users = await User.find();
        
        let totalUsers = users.length;
        let totalMonthlyCost = 0;
        let totalWeeklyCost = 0;

        users.forEach(user => {
            const f = user.financials || {};
            const salary = f.salary || 0;
            const extras = (f.insurance || 0) + (f.benefits || 0) + (f.transport || 0) + (f.overtime || 0);
            
            if (f.salaryType === 'monthly') {
                totalMonthlyCost += salary + extras;
                totalWeeklyCost += (salary + extras) / 4; // Yaklaşık
            } else {
                totalWeeklyCost += salary + (extras / 4); 
                totalMonthlyCost += (salary * 4) + extras;
            }
        });

        res.status(200).json({
            totalUsers,
            totalMonthlyCost,
            totalWeeklyCost,
        });
    } catch (error) {
        console.error("Stats error:", error);

        res.status(500).json({ message: "İstatistikler alınamadı." });
    }
}

export async function createUser(req, res) {
    try {
        const { username, email, password, role, financials } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Lütfen tüm alanları doldurun." });
        }

        const newUser = new User({
            username,
            email,
            password,
            role: role || "personel",
            financials: financials || {}
        });

        const savedUser = await newUser.save();
        const token = generateToken(savedUser._id);

        res.status(201).json({ token, user: savedUser });
    } catch (error) {
        console.error("Error creating user: ", error);

        if (error.code === 11000) {
            return res.status(400).json({ message: "Username or email already exists" });
        }
        
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function updateUser(req, res) {
    try {
        const userId = req.params.id;
        let updateData = { ...req.body };

        if (!updateData.password || updateData.password.trim() === "") {
            delete updateData.password;
        } else {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true });

        if (!updatedUser) {
            return res.status(404).json({ message: "Kullanıcı bulunamadı" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating user: ", error);
        res.status(500).json({ message: "Sunucu hatası oluştu." });
    }
}

export async function deleteUser(req, res) {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user: ", error);
        
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function login(req, res) {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user._id);

        res.status(200).json({ token, user: {
            id: user._id,
            username: user.username,
            email: user.email
        } });
    } catch (error) {
        console.error("Error logging in user: ", error);
        
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function forgotPassword(req, res) {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "Bu e-posta adresine kayitli kullanici bulunamadi." });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        user.resetPasswordToken = otp;
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;
        await user.save();

        const emailTemplate = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #f8fafc;">
                <h2 style="color: #4f46e5; text-align: center;">Şifre Sıfırlama İsteği</h2>
                <p style="color: #334155; font-size: 16px;">Merhaba <b>${user.fullName || user.username}</b>,</p>
                <p style="color: #334155;">Hesabınızın şifresini sıfırlamak için bir istek aldık. Kodunuz aşağıdadır:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <span style="background-color: #4f46e5; color: white; padding: 10px 20px; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px;">
                        ${otp}
                    </span>
                </div>

                <p style="color: #64748b; font-size: 14px;">Bu kod 10 dakika boyunca geçerlidir. Eğer bu isteği siz yapmadıysanız, lütfen dikkate almayın.</p>
                <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 20px 0;">
                <p style="text-align: center; color: #94a3b8; font-size: 12px;">© 2026 SATRACKER</p>
            </div>
        `;

        await sendEmail(user.email, "Şifre Sıfırlama Kodu", emailTemplate);

        res.status(200).json({ message: "Doğrulama kodu e-posta adresinize gönderildi." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Bir hata oluştu." });
    }
}

export async function verifyOtp(req, res) {
    try {
        const { email, otp } = req.body;
        
        const user = await User.findOne({
            email,
            resetPasswordToken: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Kod hatalı veya süresi dolmuş." });
        }

        res.status(200).json({ message: "Kod doğrulandı." });
    } catch (error) {
        res.status(500).json({ message: "Bir hata oluştu." });
    }
}

export async function resetPassword(req, res) {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
             return res.status(404).json({ message: "Kullanıcı bulunamadı." });
        }

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: "Şifreniz başarıyla değiştirildi." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Bir hata oluştu." });
    }
}
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
};

const seedAdmin = async () => {
  await connectDB();

  // Directly insert admin bypassing the User model pre-save hook (which only handles student/mentor/employer)
  const adminEmail = 'admin@skillbridge.et';
  const existing = await mongoose.connection.collection('users').findOne({ email: adminEmail });

  if (existing) {
    console.log('Admin already exists:', adminEmail);
  } else {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    await mongoose.connection.collection('users').insertOne({
      name: 'Platform Admin',
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      isApproved: true,
      isBlocked: false,
      avatar: '',
      bio: 'Skill Bridge Ethiopia Platform Administrator',
      skills: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✅ Admin created successfully!');
    console.log('Email:', adminEmail);
    console.log('Password: Admin@123');
  }

  process.exit();
};

seedAdmin();
